import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LifeBuoy, Send } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';

import { can, platformApi, platformKeys } from '../api';
import {
  announce,
  announceError,
  PriorityBadge,
  SchoolLink,
  SELECT_CLASS,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TicketStatusBadge,
} from '../components/shared';
import { usePlatformAuth } from '../store';
import type { TicketPriority, TicketStatus } from '../types';

/** `/superadmin/tickets`: schools' support requests, and the conversation on each. */
export default function TicketsPage() {
  const user = usePlatformAuth((state) => state.user);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('active');
  const [selected, setSelected] = useState<number | null>(null);
  const [reply, setReply] = useState('');

  const params = filter ? { status: filter } : {};
  const tickets = useQuery({ queryKey: platformKeys.tickets(params), queryFn: ({ signal }) => platformApi.tickets(params, signal), refetchInterval: 30_000 });
  const team = useQuery({ queryKey: platformKeys.team(), queryFn: ({ signal }) => platformApi.team(signal), enabled: can(user, 'team.manage') });
  const ticket = tickets.data?.find((entry) => entry.id === selected) ?? tickets.data?.[0] ?? null;
  const manage = can(user, 'tickets.manage');

  const refresh = () => void queryClient.invalidateQueries({ queryKey: platformKeys.all });
  const send = useMutation({
    mutationFn: () => platformApi.replyTicket(ticket!.id, reply),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      setReply('');
      refresh();
    },
    onError: announceError,
  });
  const update = useMutation({
    mutationFn: (patch: { status?: TicketStatus; priority?: TicketPriority; assigned_to?: number | null }) => platformApi.updateTicket(ticket!.id, patch),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      refresh();
    },
    onError: announceError,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Support tickets" description="Raised by school admins from their app’s Help & Support page. Replies reach them there." />

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Card>
          <div className="border-b border-slate-200 p-3">
            <select className={SELECT_CLASS} value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter tickets">
              <option value="active">Open, in progress or waiting</option>
              <option value="">All tickets</option>
              {TICKET_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          {tickets.isPending ? (
            <Skeleton className="m-3 h-40" />
          ) : tickets.data && tickets.data.length > 0 ? (
            <ul className="max-h-[36rem] divide-y divide-slate-100 overflow-y-auto">
              {tickets.data.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(entry.id)}
                    className={cn('w-full px-4 py-3 text-left hover:bg-slate-50', ticket?.id === entry.id && 'bg-brand-50')}
                  >
                    <p className="text-xs text-slate-500">
                      {entry.number} · {entry.school?.name ?? 'Deleted school'}
                    </p>
                    <p className="truncate text-sm font-medium text-slate-900">{entry.subject}</p>
                    <div className="mt-1 flex gap-1.5">
                      <TicketStatusBadge status={entry.status} />
                      <PriorityBadge priority={entry.priority} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<LifeBuoy className="size-6" />} title="No tickets" description="Nothing needs an answer." />
          )}
        </Card>

        {ticket ? (
          <Card>
            <CardBody className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">
                    {ticket.number} · {ticket.category} · raised by {ticket.raised_by.name} ({ticket.raised_by.email})
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900">{ticket.subject}</h2>
                  <p className="text-sm">
                    <SchoolLink school={ticket.school} />
                  </p>
                </div>
                {manage && (
                  <div className="flex flex-wrap gap-2">
                    <select className={`${SELECT_CLASS} w-44`} value={ticket.status} onChange={(event) => update.mutate({ status: event.target.value as TicketStatus })} aria-label="Status">
                      {TICKET_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <select className={`${SELECT_CLASS} w-32`} value={ticket.priority} onChange={(event) => update.mutate({ priority: event.target.value as TicketPriority })} aria-label="Priority">
                      {TICKET_PRIORITIES.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                    {team.data && (
                      <select
                        className={`${SELECT_CLASS} w-44`}
                        value={ticket.assigned_to?.id ?? ''}
                        onChange={(event) => update.mutate({ assigned_to: event.target.value ? Number(event.target.value) : null })}
                        aria-label="Assigned to"
                      >
                        <option value="">Unassigned</option>
                        {team.data.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              <ol className="space-y-3">
                {ticket.messages.map((message) => (
                  <li key={message.id} className={cn('rounded-lg p-4 text-sm', message.from === 'platform' ? 'ml-8 bg-brand-50' : 'mr-8 bg-slate-50')}>
                    <p className="mb-1 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{message.author_name}</span>
                      {message.from === 'platform' ? ' (support)' : ''} · {formatDateTime(message.at)}
                    </p>
                    <p className="whitespace-pre-wrap text-slate-800">{message.body}</p>
                  </li>
                ))}
              </ol>

              {manage && ticket.status !== 'closed' ? (
                <div className="space-y-2">
                  <Textarea rows={4} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply to the school…" />
                  <div className="flex justify-end">
                    <Button onClick={() => send.mutate()} isLoading={send.isPending} disabled={reply.trim().length < 2} leftIcon={<Send className="size-4" />}>
                      Send reply
                    </Button>
                  </div>
                </div>
              ) : ticket.status === 'closed' ? (
                <Alert tone="neutral">This ticket is closed. Change its status to reply again.</Alert>
              ) : null}
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              <EmptyState icon={<LifeBuoy className="size-6" />} title="Choose a ticket" />
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
