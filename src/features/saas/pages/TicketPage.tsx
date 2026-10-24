import { CheckCircle2, LifeBuoy, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import { relativeTime } from '@/lib/relativeTime';
import { useAuthStore } from '@/store/authStore';

import { useCloseTicket, useReplyToTicket, useTicket } from '../hooks/useSubscription';
import { TICKET_CATEGORY_LABELS, TICKET_PRIORITY_BADGES, TICKET_STATUS_BADGES } from '../labels';
import type { SupportTicket } from '../types';

function Thread({ ticket }: { ticket: SupportTicket }) {
  return (
    <ol className="space-y-4">
      {ticket.messages.map((message) => {
        const fromSchool = message.from === 'school';
        return (
          <li key={message.id} className={cn('flex gap-3', fromSchool && 'flex-row-reverse')}>
            {fromSchool ? (
              <Avatar name={message.author_name} size="sm" />
            ) : (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <LifeBuoy className="size-4" aria-hidden />
              </span>
            )}
            <div className={cn('max-w-[min(42rem,85%)]', fromSchool && 'text-right')}>
              <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">{message.author_name}</span> ·{' '}
                <time dateTime={message.at} title={formatDateTime(message.at)}>
                  {relativeTime(message.at)}
                </time>
              </p>
              <div
                className={cn(
                  'mt-1 rounded-2xl px-4 py-2.5 text-left text-sm whitespace-pre-line',
                  fromSchool ? 'rounded-tr-sm bg-brand-600 text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-slate-800',
                )}
              >
                {message.body}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function TicketPage() {
  const id = Number(useParams().id);
  const ticket = useTicket(Number.isInteger(id) ? id : 0);
  const reply = useReplyToTicket(id);
  const close = useCloseTicket(id);
  const isDemo = useAuthStore((state) => state.user?.is_demo ?? false);
  const [body, setBody] = useState('');
  const [confirmingClose, setConfirmingClose] = useState(false);

  const send = (event: FormEvent) => {
    event.preventDefault();
    if (body.trim().length < 2) return;
    reply.mutate(body.trim(), { onSuccess: () => setBody('') });
  };

  const data = ticket.data;
  const breadcrumbs = [{ label: 'Help & support', to: PATHS.support }, { label: data?.number ?? 'Ticket' }];

  if (ticket.isPending) {
    return (
      <>
        <PageHeader title="Support ticket" breadcrumbs={breadcrumbs} />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PageHeader title="Support ticket" breadcrumbs={breadcrumbs} />
        <Alert tone="danger">{ticket.error?.message ?? 'This ticket could not be loaded.'}</Alert>
      </>
    );
  }

  const status = TICKET_STATUS_BADGES[data.status];
  const closed = data.status === 'closed';

  return (
    <>
      <PageHeader
        title={data.subject}
        breadcrumbs={breadcrumbs}
        description={`${data.number} · ${TICKET_CATEGORY_LABELS[data.category]} · raised by ${data.raised_by.name} on ${formatDateTime(data.created_at)}`}
        actions={
          !closed &&
          !isDemo && (
            <Button variant="outline" leftIcon={<CheckCircle2 className="size-4" />} onClick={() => setConfirmingClose(true)}>
              Close ticket
            </Button>
          )
        }
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={status.tone} withDot>
            {status.label}
          </Badge>
          <Badge tone={TICKET_PRIORITY_BADGES[data.priority].tone}>{TICKET_PRIORITY_BADGES[data.priority].label} priority</Badge>
          {data.resolved_at && (
            <span className="text-xs text-slate-500">
              {closed ? 'Closed' : 'Resolved'} {formatDateTime(data.resolved_at)}
            </span>
          )}
        </div>

        <Card>
          <CardBody className="bg-slate-50/60">
            <Thread ticket={data} />
          </CardBody>
        </Card>

        {isDemo ? (
          <Alert tone="info">Replies cannot be sent from a shared demo account.</Alert>
        ) : (
          <Card>
            <CardBody>
              <form onSubmit={send} className="space-y-3">
                <label htmlFor="ticket-reply" className="text-sm font-medium text-slate-700">
                  {closed ? 'Reply to reopen this ticket' : 'Your reply'}
                </label>
                <Textarea
                  id="ticket-reply"
                  rows={4}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Write to the support team…"
                  maxLength={5000}
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">The team is notified at once.</p>
                  <Button
                    type="submit"
                    leftIcon={<Send className="size-4" />}
                    isLoading={reply.isPending}
                    disabled={body.trim().length < 2}
                  >
                    Send reply
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmingClose}
        onClose={() => setConfirmingClose(false)}
        onConfirm={() => close.mutate(undefined, { onSuccess: () => setConfirmingClose(false) })}
        title="Close this ticket?"
        message="Close it once your problem is solved. You can reopen it later by replying."
        confirmLabel="Close ticket"
        isLoading={close.isPending}
      />
    </>
  );
}
