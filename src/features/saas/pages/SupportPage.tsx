import { LifeBuoy, Mail, MessagesSquare, Phone, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import type { Column } from '@/components/table/types';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/format';
import { relativeTime } from '@/lib/relativeTime';
import { useAuthStore } from '@/store/authStore';

import { NewTicketModal } from '../components/NewTicketModal';
import { useSubscription, useTickets } from '../hooks/useSubscription';
import { TICKET_CATEGORY_LABELS, TICKET_PRIORITY_BADGES, TICKET_STATUS_BADGES } from '../labels';
import type { SupportTicket } from '../types';

const columns: Column<SupportTicket>[] = [
  {
    key: 'subject',
    header: 'Ticket',
    cell: (ticket) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">{ticket.subject}</p>
        <p className="text-xs text-slate-500">
          {ticket.number} · {TICKET_CATEGORY_LABELS[ticket.category]}
        </p>
      </div>
    ),
  },
  {
    key: 'priority',
    header: 'Priority',
    hideBelow: 'md',
    cell: (ticket) => <Badge tone={TICKET_PRIORITY_BADGES[ticket.priority].tone}>{TICKET_PRIORITY_BADGES[ticket.priority].label}</Badge>,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (ticket) => (
      <Badge tone={TICKET_STATUS_BADGES[ticket.status].tone} withDot>
        {TICKET_STATUS_BADGES[ticket.status].label}
      </Badge>
    ),
  },
  {
    key: 'messages',
    header: 'Replies',
    hideBelow: 'lg',
    align: 'center',
    cell: (ticket) => <span className="text-slate-600 tabular-nums">{ticket.messages.length - 1}</span>,
  },
  {
    key: 'updated',
    header: 'Last update',
    hideBelow: 'sm',
    cell: (ticket) => (
      <span className="text-slate-600" title={formatDateTime(ticket.last_message_at)}>
        {relativeTime(ticket.last_message_at)}
      </span>
    ),
  },
];

/** The School Admin's line to the platform's support team. */
export default function SupportPage() {
  const navigate = useNavigate();
  const tickets = useTickets();
  const subscription = useSubscription();
  const isDemo = useAuthStore((state) => state.user?.is_demo ?? false);
  const [creating, setCreating] = useState(false);
  const support = subscription.data?.support;
  const priority = Boolean(support?.priority);
  const accountManager = subscription.data?.account_manager ?? null;
  const waiting = (tickets.data ?? []).filter((ticket) => ticket.status === 'waiting').length;

  return (
    <>
      <PageHeader
        title="Help & support"
        description="Raise a ticket with the platform team and follow the conversation here."
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={() => setCreating(true)} disabled={isDemo}>
            New ticket
          </Button>
        }
      />

      <div className="space-y-6">
        {isDemo && (
          <Alert tone="info" title="Demo account">
            Tickets cannot be raised from a shared demo account. Sign in as the school’s own administrator to contact support.
          </Alert>
        )}
        {waiting > 0 && (
          <Alert tone="warning">
            The support team is waiting for your reply on {waiting === 1 ? 'one ticket' : `${waiting} tickets`}.
          </Alert>
        )}

        {accountManager && (
          <Alert tone="info" title="Your account manager">
            {accountManager.name} (
            <a href={`mailto:${accountManager.email}`} className="font-medium underline">
              {accountManager.email}
            </a>
            ) looks after your school. New tickets go straight to them.
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-card border border-slate-200 bg-white p-4">
            <MessagesSquare className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
            <div className="text-sm">
              <p className="font-medium text-slate-900">
                Tickets{priority && <span className="ml-1.5 align-middle"><Badge tone="info">Priority support</Badge></span>}
              </p>
              <p className="text-slate-500">
                {priority
                  ? 'Your plan includes priority support: your open tickets go to the top of the support team’s queue.'
                  : 'Best for anything that needs a record — answered within one working day.'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-card border border-slate-200 bg-white p-4">
            <Mail className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
            <div className="min-w-0 text-sm">
              <p className="font-medium text-slate-900">Email</p>
              {support?.email ? (
                <a href={`mailto:${support.email}`} className="break-all text-brand-600 hover:underline">
                  {support.email}
                </a>
              ) : (
                <p className="text-slate-500">Use a ticket.</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-card border border-slate-200 bg-white p-4">
            <Phone className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
            <div className="text-sm">
              <p className="font-medium text-slate-900">Phone</p>
              {support?.phone ? (
                <a href={`tel:${support.phone.replace(/\s/g, '')}`} className="text-brand-600 hover:underline">
                  {support.phone}
                </a>
              ) : (
                <p className="text-slate-500">Use a ticket.</p>
              )}
              <p className="text-xs text-slate-500">Mon–Sat, 10 am – 6 pm</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader title="Your tickets" description="Newest activity first." />
          <DataTable
            columns={columns}
            rows={tickets.data}
            isLoading={tickets.isPending}
            error={tickets.error}
            onRowClick={(ticket) => navigate(toPath(PATHS.supportTicket, { id: ticket.id }))}
            emptyState={
              <EmptyState
                icon={<LifeBuoy className="size-6" />}
                title="No tickets yet"
                description="When something is not working, or you need a hand, raise a ticket and the team will answer here."
                action={
                  !isDemo && (
                    <Button leftIcon={<Plus className="size-4" />} onClick={() => setCreating(true)}>
                      New ticket
                    </Button>
                  )
                }
              />
            }
          />
        </Card>
      </div>

      <NewTicketModal
        isOpen={creating}
        onClose={() => setCreating(false)}
        onCreated={(ticket) => navigate(toPath(PATHS.supportTicket, { id: ticket.id }))}
      />
    </>
  );
}
