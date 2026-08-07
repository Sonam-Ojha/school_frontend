import { ExternalLink, IndianRupee, Receipt } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import type { Column } from '@/components/table/types';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';

import { HOSTEL_PERMISSIONS, MESS_PLAN_LABELS } from '../constants';
import {
  useChargeSummary,
  useCharges,
  useHostels,
  useRaiseCharges,
} from '../hooks/useHostel';
import type { HostelCharge } from '../types';

/** `YYYY-MM` for the month just gone, which is the one usually being billed. */
function lastMonth(): string {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7);
}

/**
 * Hostel charges.
 *
 * The hostel owns what a bed costs — rent from the room, mess from the block
 * and the plan. What has been billed and collected belongs to the fees
 * module, and this screen reads it rather than keeping a second ledger.
 * Collection happens on the fee desk, which is why there is a link out to it
 * and no payment form here.
 */
export default function FeesPage() {
  const navigate = useNavigate();

  const table = useTableQueryState({
    defaultSortBy: 'student_name',
    defaultSortDir: 'asc',
    filterKeys: ['hostel_id'],
  });

  const hostelId = table.filters.hostel_id ? Number(table.filters.hostel_id) : undefined;

  const query = useMemo(
    () => ({ ...table.queryParams, ...(hostelId ? { hostel_id: hostelId } : {}) }),
    [table.queryParams, hostelId],
  );

  const { data, isLoading, isFetching, error } = useCharges(query);
  const { data: summary, isLoading: summaryLoading } = useChargeSummary(hostelId);
  const { hostelOptions } = useHostels();
  const raiseCharges = useRaiseCharges();

  const raiseDialog = useDisclosure();
  const [month, setMonth] = useState(lastMonth());

  const alreadyRaised = summary?.billed_months.includes(month) ?? false;

  const columns: Column<HostelCharge>[] = [
    {
      key: 'student_name',
      header: 'Resident',
      sortable: true,
      cell: (charge) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{charge.student_name}</p>
          <p className="truncate text-xs text-slate-500">
            <code>{charge.admission_no}</code> · {charge.class_name}
          </p>
        </div>
      ),
    },
    {
      key: 'room_no',
      header: 'Bed',
      hideBelow: 'md',
      cell: (charge) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-900">
            {charge.room_no} · bed {charge.bed_no}
          </p>
          <p className="truncate text-xs text-slate-500">{charge.hostel_name}</p>
        </div>
      ),
    },
    {
      key: 'mess_plan',
      header: 'Mess',
      hideBelow: 'xl',
      cell: (charge) => MESS_PLAN_LABELS[charge.mess_plan],
    },
    {
      key: 'monthly_charge',
      header: 'Monthly',
      sortable: true,
      align: 'right',
      cell: (charge) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {formatCurrency(charge.monthly_charge)}
          </p>
          <p className="text-xs whitespace-nowrap text-slate-500">
            {formatCurrency(charge.room_rent)} + {formatCurrency(charge.mess_charge)}
          </p>
        </div>
      ),
    },
    {
      key: 'billed_amount',
      header: 'Billed',
      sortable: true,
      align: 'right',
      hideBelow: 'lg',
      cell: (charge) => (
        <div>
          <p className="text-sm text-slate-800">{formatCurrency(charge.billed_amount)}</p>
          <p className="text-xs whitespace-nowrap text-slate-500">
            {charge.months_billed} month{charge.months_billed === 1 ? '' : 's'}
          </p>
        </div>
      ),
    },
    {
      key: 'balance',
      header: 'Outstanding',
      sortable: true,
      align: 'right',
      cell: (charge) => (
        <span
          className={cn(
            'text-sm font-semibold',
            charge.balance > 0 ? 'text-red-700' : 'text-emerald-700',
          )}
        >
          {formatCurrency(charge.balance)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (charge) =>
        charge.balance > 0 ? (
          <Button
            variant="outline"
            size="sm"
            title="Collect on the fee desk"
            onClick={() =>
              navigate(`${PATHS.feeCollection}?student_id=${charge.student_id}`)
            }
            rightIcon={<ExternalLink className="size-3.5" />}
          >
            Collect
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      {summaryLoading || !summary ? (
        <Card>
          <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Hostel charges"
            description="Rent and mess, raised onto each resident's fee account."
            actions={
              <Can permissions={[HOSTEL_PERMISSIONS.create]}>
                <Button
                  size="sm"
                  disabled={!hostelId}
                  title={!hostelId ? 'Choose a block first' : undefined}
                  onClick={raiseDialog.open}
                  leftIcon={<Receipt className="size-4" />}
                >
                  Raise a month
                </Button>
              </Can>
            }
          />

          <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ['Residents', String(summary.residents)],
              ['Per month', formatCurrency(summary.monthly_total)],
              ['Collected', formatCurrency(summary.collected)],
              ['Outstanding', formatCurrency(summary.outstanding)],
            ].map(([label, value], index) => (
              <div key={label}>
                <p className="text-xs text-slate-500">{label}</p>
                <p
                  className={cn(
                    'mt-0.5 text-lg font-semibold',
                    index === 3 && summary.outstanding > 0 ? 'text-red-700' : 'text-slate-900',
                  )}
                >
                  {value}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <Alert tone="info">
        Charges are raised against the hostel fee head on each student's fee account — this
        screen shows what they cost and what is left owing, and collection happens on the fee
        desk. One ledger, one answer to what a family owes the school.
      </Alert>

      <Card>
        <CardBody className="p-0">
          <DataTable
            columns={columns}
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
                searchPlaceholder="Name or admission number"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <Select
                    aria-label="Filter by hostel"
                    value={table.filters.hostel_id ?? ''}
                    options={hostelOptions}
                    placeholder="All blocks"
                    onChange={(event) =>
                      table.setFilter('hostel_id', event.target.value || undefined)
                    }
                    className="w-52"
                  />
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<IndianRupee className="size-6" />}
                title="Nobody to charge"
                description="No student is currently resident, so there is nothing to bill."
              />
            }
          />
        </CardBody>
      </Card>

      <ConfirmDialog
        isOpen={raiseDialog.isOpen}
        onClose={raiseDialog.close}
        onConfirm={() => {
          if (!hostelId) return;
          raiseCharges.mutate(
            { hostel_id: hostelId, month },
            { onSuccess: () => raiseDialog.close() },
          );
        }}
        isLoading={raiseCharges.isPending}
        title="Raise this month's charges?"
        confirmLabel="Raise charges"
        message={
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Every current resident of this block is billed one month's rent and mess against
              the hostel fee head.
            </p>

            <div>
              <label
                htmlFor="hostel-charge-month"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Month
              </label>
              <Input
                id="hostel-charge-month"
                type="month"
                value={month}
                max={new Date().toISOString().slice(0, 7)}
                onChange={(event) => setMonth(event.target.value)}
                className="w-48"
              />
            </div>

            {alreadyRaised ? (
              <Alert tone="warning" title="Already raised">
                This month has been billed for this block. Raising it again would charge everybody
                twice, so it will be refused.
              </Alert>
            ) : (
              summary && (
                <Alert tone="info">
                  {summary.residents} resident{summary.residents === 1 ? '' : 's'} ·{' '}
                  {formatCurrency(summary.monthly_total)} in total.
                </Alert>
              )
            )}
          </div>
        }
      />
    </div>
  );
}
