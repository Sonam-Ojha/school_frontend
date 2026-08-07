import { Scale } from 'lucide-react';

import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import type { Column } from '@/components/table/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/cn';
import { useTableQueryState } from '@/hooks/useTableQueryState';

import { APPLICANT_TYPE_LABELS, APPLICANT_TYPE_OPTIONS, LOW_BALANCE_RATIO } from '../constants';
import { useBalances } from '../hooks/useLeave';
import type { LeaveBalance } from '../types';

/** One entitlement, small enough to sit several to a cell. */
function EntitlementChip({
  code,
  available,
  quota,
}: {
  code: string;
  available: number | null;
  quota: number | null;
}) {
  if (quota === null) {
    return (
      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">{code}</span>
    );
  }

  const low = (available ?? 0) <= quota * LOW_BALANCE_RATIO;

  return (
    <span
      className={cn(
        'rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
        (available ?? 0) <= 0
          ? 'bg-red-50 text-red-700'
          : low
            ? 'bg-amber-50 text-amber-700'
            : 'bg-emerald-50 text-emerald-700',
      )}
      title={`${available} of ${quota} days left`}
    >
      {code} {available}/{quota}
    </span>
  );
}

const COLUMNS: Column<LeaveBalance>[] = [
  {
    key: 'applicant_name',
    header: 'Person',
    sortable: true,
    cell: (balance) => (
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar name={balance.applicant_name} src={balance.photo_url} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{balance.applicant_name}</p>
          <p className="truncate text-xs text-slate-500">
            {APPLICANT_TYPE_LABELS[balance.applicant_type]}
            {balance.applicant_detail ? ` · ${balance.applicant_detail}` : ''}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: 'entitlements',
    header: 'By type',
    cell: (balance) =>
      balance.entitlements.length === 0 ? (
        <span className="text-xs text-slate-400">No entitlement</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {balance.entitlements.map((entry) => (
            <EntitlementChip
              key={entry.leave_type_id}
              code={entry.leave_type_code}
              available={entry.available}
              quota={entry.quota}
            />
          ))}
        </div>
      ),
  },
  {
    key: 'total_taken',
    header: 'Taken',
    sortable: true,
    align: 'right',
    hideBelow: 'md',
    cell: (balance) => <span className="text-sm text-slate-800">{balance.total_taken}</span>,
  },
  {
    key: 'total_pending',
    header: 'Awaiting',
    sortable: true,
    align: 'right',
    hideBelow: 'md',
    cell: (balance) =>
      balance.total_pending > 0 ? (
        <Badge tone="warning">{balance.total_pending}</Badge>
      ) : (
        <span className="text-sm text-slate-400">—</span>
      ),
  },
  {
    key: 'total_available',
    header: 'Left',
    sortable: true,
    align: 'right',
    cell: (balance) => (
      <div>
        <p
          className={cn(
            'text-sm font-semibold',
            balance.total_available <= 0 ? 'text-red-700' : 'text-slate-900',
          )}
        >
          {balance.total_available}
        </p>
        <p className="text-xs whitespace-nowrap text-slate-500">of {balance.total_quota}</p>
      </div>
    ),
  },
];

/**
 * What everybody has left.
 *
 * Pending days are already deducted — a balance that ignored them would let
 * somebody file thirty days across ten requests with every one looking
 * affordable.
 */
export default function BalancesPage() {
  const table = useTableQueryState({
    defaultSortBy: 'applicant_name',
    defaultSortDir: 'asc',
    filterKeys: ['applicant_type'],
  });

  const { data, isLoading, isFetching, error } = useBalances(table.queryParams);

  return (
    <Card>
      <CardBody className="p-0">
        <DataTable
          columns={COLUMNS}
          rows={data?.data}
          meta={data?.meta}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          sortBy={table.sortBy}
          sortDir={table.sortDir}
          onSort={table.toggleSort}
          onPageChange={table.setPage}
          onPerPageChange={table.setPerPage}
          toolbar={
            <TableToolbar
              search={table.search}
              onSearchChange={table.setSearch}
              searchPlaceholder="Name or identifier"
              hasActiveFilters={table.hasActiveFilters}
              onResetFilters={table.resetFilters}
              filters={
                <Select
                  aria-label="Filter by applicant"
                  value={table.filters.applicant_type ?? ''}
                  options={APPLICANT_TYPE_OPTIONS}
                  placeholder="Everybody"
                  onChange={(event) =>
                    table.setFilter('applicant_type', event.target.value || undefined)
                  }
                  className="w-40"
                />
              }
            />
          }
          emptyState={
            <EmptyState
              icon={<Scale className="size-6" />}
              title="No balances"
              description={
                table.hasActiveFilters
                  ? 'Nobody matches these filters.'
                  : 'Add a leave type with an annual quota and balances appear here.'
              }
            />
          }
        />
      </CardBody>
    </Card>
  );
}
