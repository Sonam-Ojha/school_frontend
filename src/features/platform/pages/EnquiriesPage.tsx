import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Inbox, Mail, Phone, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { formatDate, formatNumber } from '@/lib/format';

import { can, platformApi, platformKeys } from '../api';
import { announce, announceError, LEAD_STATUSES, LeadStatusBadge, SchoolLink, SELECT_CLASS } from '../components/shared';
import { usePlatformAuth } from '../store';
import type { LeadStatus, PlatformLead } from '../types';

/** `/superadmin/enquiries`: demo requests from the website, worked through by Sales. */
export default function EnquiriesPage() {
  const user = usePlatformAuth((state) => state.user);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<LeadStatus | ''>('');
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [deleting, setDeleting] = useState<PlatformLead | null>(null);
  const manage = can(user, 'leads.manage');

  const leads = useQuery({ queryKey: platformKeys.leads(), queryFn: ({ signal }) => platformApi.leads(signal), refetchInterval: 60_000 });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: platformKeys.all });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: { status?: LeadStatus; notes?: string } }) => platformApi.updateLead(id, patch),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      refresh();
    },
    onError: announceError,
  });
  const remove = useMutation({
    mutationFn: (lead: PlatformLead) => platformApi.deleteLead(lead.id),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      setDeleting(null);
      refresh();
    },
    onError: announceError,
  });

  const rows = (leads.data ?? []).filter((lead) => !filter || lead.status === filter);
  const counts = Object.fromEntries(LEAD_STATUSES.map((status) => [status.value, (leads.data ?? []).filter((lead) => lead.status === status.value).length]));

  return (
    <div className="space-y-6">
      <PageHeader title="Enquiries" description="“Book a demo” requests from the website. Move each one along as you follow it up." />

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={filter === '' ? 'primary' : 'outline'} onClick={() => setFilter('')}>
          All ({leads.data?.length ?? 0})
        </Button>
        {LEAD_STATUSES.map((status) => (
          <Button key={status.value} size="sm" variant={filter === status.value ? 'primary' : 'outline'} onClick={() => setFilter(status.value)}>
            {status.label} ({counts[status.value] ?? 0})
          </Button>
        ))}
      </div>

      {leads.isPending ? (
        <Skeleton className="h-64" />
      ) : rows.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState icon={<Inbox className="size-6" />} title="No enquiries here" />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((lead) => (
            <Card key={lead.id}>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{lead.school_name}</h3>
                    <p className="text-sm text-slate-600">
                      {lead.name}
                      {lead.city ? ` · ${lead.city}` : ''}
                      {lead.students ? ` · ${formatNumber(lead.students)} students` : ''}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(lead.created_at)}
                      {lead.assigned_to ? ` · ${lead.assigned_to.name}` : ''}
                    </p>
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-brand-700 hover:underline">
                    <Mail className="size-4" aria-hidden /> {lead.email}
                  </a>
                  <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 text-brand-700 hover:underline">
                    <Phone className="size-4" aria-hidden /> {lead.phone}
                  </a>
                </div>
                {lead.message && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{lead.message}</p>}
                {lead.school && (
                  <p className="text-sm text-slate-600">
                    Became <SchoolLink school={lead.school} />
                  </p>
                )}
                {manage ? (
                  <div className="space-y-2">
                    <Textarea
                      rows={2}
                      value={notes[lead.id] ?? lead.notes}
                      onChange={(event) => setNotes((current) => ({ ...current, [lead.id]: event.target.value }))}
                      placeholder="Notes: calls, demo date, what they need…"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        className={`${SELECT_CLASS} w-48`}
                        value={lead.status}
                        onChange={(event) => update.mutate({ id: lead.id, patch: { status: event.target.value as LeadStatus } })}
                        aria-label="Status"
                      >
                        {LEAD_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={(notes[lead.id] ?? lead.notes) === lead.notes}
                        onClick={() => update.mutate({ id: lead.id, patch: { notes: notes[lead.id] ?? lead.notes } })}
                      >
                        Save notes
                      </Button>
                      <Button size="sm" variant="ghost" iconOnly aria-label="Delete enquiry" leftIcon={<Trash2 className="size-4" />} onClick={() => setDeleting(lead)} />
                    </div>
                  </div>
                ) : (
                  lead.notes && <p className="text-sm text-slate-600">Notes: {lead.notes}</p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting)}
        title="Delete this enquiry?"
        message={`The enquiry from ${deleting?.school_name ?? ''} will be removed.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={remove.isPending}
      />
    </div>
  );
}
