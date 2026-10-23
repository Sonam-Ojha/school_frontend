import { useQuery } from '@tanstack/react-query';
import { Activity, Search } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDateTime } from '@/lib/format';

import { platformApi, platformKeys } from '../api';
import { SchoolLink, SELECT_CLASS } from '../components/shared';
import type { PlatformActivity } from '../types';

const AREAS = [
  { value: '', label: 'Everything' },
  { value: 'school.', label: 'Schools' },
  { value: 'invoice.', label: 'Invoices' },
  { value: 'payment.', label: 'Payments' },
  { value: 'plan.', label: 'Plans' },
  { value: 'ticket.', label: 'Support tickets' },
  { value: 'lead.', label: 'Enquiries' },
  { value: 'team.', label: 'Team' },
  { value: 'auth.', label: 'Console sign-ins' },
  { value: 'settings.', label: 'Settings' },
];

const TONE: Record<PlatformActivity['actor_type'], 'info' | 'success' | 'neutral' | 'warning'> = {
  platform: 'info',
  school: 'success',
  website: 'warning',
  system: 'neutral',
};

/** `/superadmin/audit-logs`: who did what on the platform, when, and from where. */
export default function AuditLogPage() {
  const [area, setArea] = useState('');
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const params = { ...(area ? { action: area } : {}), ...(debounced ? { search: debounced } : {}), limit: 500 };
  const activity = useQuery({ queryKey: platformKeys.activity(params), queryFn: ({ signal }) => platformApi.activity(params, signal), placeholderData: (previous) => previous });

  const columns: Column<PlatformActivity>[] = [
    { key: 'at', header: 'When', width: '11rem', cell: (entry) => <span className="text-xs text-slate-600">{formatDateTime(entry.at)}</span> },
    {
      key: 'actor',
      header: 'Who',
      cell: (entry) => (
        <div>
          <p className="text-sm text-slate-800">{entry.actor}</p>
          <Badge tone={TONE[entry.actor_type]}>{entry.actor_type}</Badge>
        </div>
      ),
    },
    {
      key: 'detail',
      header: 'What',
      cell: (entry) => (
        <div>
          <p className="text-sm text-slate-800">{entry.detail}</p>
          <p className="font-mono text-xs text-slate-400">{entry.action}</p>
        </div>
      ),
    },
    { key: 'school', header: 'School', hideBelow: 'md', cell: (entry) => (entry.school_id ? <SchoolLink school={entry.school} /> : <span className="text-slate-400">—</span>) },
    { key: 'ip', header: 'IP address', hideBelow: 'lg', cell: (entry) => <span className="font-mono text-xs text-slate-500">{entry.ip ?? '—'}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit logs" description="Every change on the platform: schools onboarded or suspended, plans and prices, invoices, payments, support and sign-ins." />
      <Card>
        <DataTable<PlatformActivity>
          columns={columns}
          rows={activity.data}
          isLoading={activity.isPending}
          isFetching={activity.isFetching}
          error={activity.error}
          toolbar={
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
              <div className="sm:w-80">
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search who or what" leftIcon={<Search className="size-4" />} aria-label="Search the log" />
              </div>
              <select className={`${SELECT_CLASS} sm:w-56`} value={area} onChange={(event) => setArea(event.target.value)} aria-label="Area">
                {AREAS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          }
          emptyState={<EmptyState icon={<Activity className="size-6" />} title="Nothing matches" />}
        />
      </Card>
    </div>
  );
}
