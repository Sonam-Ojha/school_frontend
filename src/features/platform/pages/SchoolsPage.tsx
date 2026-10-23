import { useQuery } from '@tanstack/react-query';
import { Building2, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import type { Column } from '@/components/table/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatNumber } from '@/lib/format';

import { can, platformApi, platformKeys } from '../api';
import { NewSchoolModal } from '../components/NewSchoolModal';
import { daysLeftText, money, RuntimeBadge, SELECT_CLASS, StateBadge } from '../components/shared';
import { usePlatformAuth } from '../store';
import type { PlatformSchool } from '../types';

const STATUS_FILTERS = [
  { value: '', label: 'Every status' },
  { value: 'trial', label: 'On trial' },
  { value: 'active', label: 'Paying' },
  { value: 'attention', label: 'Needs attention' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'cancelled', label: 'Cancelled' },
];

/** `/superadmin/schools`: every school on the platform. */
export default function SchoolsPage() {
  const navigate = useNavigate();
  const user = usePlatformAuth((state) => state.user);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [planId, setPlanId] = useState('');
  const [creating, setCreating] = useState(false);
  const debounced = useDebounce(search, 300);

  const params = {
    ...(debounced ? { search: debounced } : {}),
    ...(status ? { status } : {}),
    ...(planId ? { plan_id: Number(planId) } : {}),
  };
  const schools = useQuery({
    queryKey: platformKeys.schools(params),
    queryFn: ({ signal }) => platformApi.schools(params, signal),
    placeholderData: (previous) => previous,
    refetchInterval: 30_000,
  });
  const plans = useQuery({ queryKey: platformKeys.plans(), queryFn: ({ signal }) => platformApi.plans(signal) });

  const columns: Column<PlatformSchool>[] = [
    {
      key: 'name',
      header: 'School',
      cell: (school) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{school.name}</p>
          <p className="text-xs text-slate-500">
            /{school.code} · {school.city || '—'}
            {school.custom_domain ? ` · ${school.custom_domain}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      hideBelow: 'md',
      cell: (school) => (
        <div>
          <p className="text-slate-700">{school.plan?.name ?? '—'}</p>
          <p className="text-xs text-slate-500">{school.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Subscription',
      cell: (school) => (
        <div>
          <StateBadge state={school.subscription.state} />
          <p className="mt-1 text-xs text-slate-500">{daysLeftText(school.subscription.days_left)}</p>
        </div>
      ),
    },
    {
      key: 'students',
      header: 'Students',
      align: 'right',
      hideBelow: 'sm',
      cell: (school) => (
        <span className="text-slate-700">
          {formatNumber(school.usage?.students ?? null)}
          {school.limits.max_students !== null && <span className="text-slate-400"> / {formatNumber(school.limits.max_students)}</span>}
        </span>
      ),
    },
    { key: 'mrr', header: 'MRR', align: 'right', hideBelow: 'lg', cell: (school) => money(school.mrr) },
    { key: 'runtime', header: 'Server', hideBelow: 'lg', cell: (school) => <RuntimeBadge status={school.runtime.status} /> },
    { key: 'created_at', header: 'Joined', hideBelow: 'xl', cell: (school) => formatDate(school.created_at) },
  ];

  return (
    <div>
      <PageHeader
        title="Schools"
        description="Every school on the platform: its plan, subscription, size and server."
        actions={
          can(user, 'schools.create') ? (
            <Button leftIcon={<Plus className="size-4" />} onClick={() => setCreating(true)}>
              Onboard school
            </Button>
          ) : undefined
        }
      />

      <Card>
        <DataTable<PlatformSchool>
          columns={columns}
          rows={schools.data}
          isLoading={schools.isPending}
          isFetching={schools.isFetching}
          error={schools.error}
          onRowClick={(school) => navigate(`/schools/${school.id}`)}
          toolbar={
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row">
              <div className="md:w-80">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, code, city or contact"
                  leftIcon={<Search className="size-4" />}
                  aria-label="Search schools"
                />
              </div>
              <select className={`${SELECT_CLASS} md:w-48`} value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Status">
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select className={`${SELECT_CLASS} md:w-48`} value={planId} onChange={(event) => setPlanId(event.target.value)} aria-label="Plan">
                <option value="">Every plan</option>
                {(plans.data ?? []).map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
          }
          emptyState={<EmptyState icon={<Building2 className="size-6" />} title="No schools match" description="Clear the filters, or onboard a school." />}
        />
      </Card>

      <NewSchoolModal isOpen={creating} onClose={() => setCreating(false)} plans={plans.data ?? []} onCreated={(school) => navigate(`/schools/${school.id}`)} />
    </div>
  );
}
