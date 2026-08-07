import { BadgeCheck, IndianRupee, Ban } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import type { Column } from '@/components/table/types';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatCurrency, formatDate } from '@/lib/format';
import { sumAmounts } from '@/lib/money';
import { useAuthStore } from '@/store/authStore';
import { useTableQueryState } from '@/hooks/useTableQueryState';

import { FineModal } from '../components/FineModal';
import { LIBRARY_PERMISSIONS, MEMBER_TYPE_LABELS, MEMBER_TYPE_OPTIONS } from '../constants';
import { useLoans } from '../hooks/useLibrary';
import type { Loan } from '../types';

/**
 * Outstanding fines.
 *
 * A filtered reading of the loans rather than a ledger of its own — a fine is
 * something a loan has, not a record beside it, and a second table would be a
 * second thing to keep in step.
 */
export default function FinesPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canCollect = hasPermission(LIBRARY_PERMISSIONS.update);
  const canWaive = hasPermission(LIBRARY_PERMISSIONS.waiveFine);

  const table = useTableQueryState({
    defaultSortBy: 'fine_due',
    defaultSortDir: 'desc',
    filterKeys: ['member_type'],
  });

  // The server owns "what counts as outstanding" — this screen just asks for it.
  const params = useMemo(
    () => ({ ...table.queryParams, has_fine: '1' }),
    [table.queryParams],
  );
  const { data, isLoading, isFetching, error } = useLoans(params);

  const fineModal = useDisclosure();
  const [target, setTarget] = useState<{ loan: Loan; mode: 'pay' | 'waive' } | null>(null);

  const open = (loan: Loan, mode: 'pay' | 'waive') => {
    setTarget({ loan, mode });
    fineModal.open();
  };

  const pageTotal = sumAmounts((data?.data ?? []).map((loan) => loan.fine_due));

  const columns: Column<Loan>[] = [
    {
      key: 'member_name',
      header: 'Member',
      sortable: true,
      cell: (loan) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{loan.member_name}</p>
          <p className="truncate text-xs text-slate-500">
            <code>{loan.member_identifier}</code> · {MEMBER_TYPE_LABELS[loan.member_type]}
          </p>
        </div>
      ),
    },
    {
      key: 'book_title',
      header: 'Book',
      sortable: true,
      cell: (loan) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-900">{loan.book_title}</p>
          <p className="truncate text-xs text-slate-500">
            <code>{loan.accession_no}</code>
          </p>
        </div>
      ),
    },
    {
      key: 'due_on',
      header: 'Was due',
      sortable: true,
      hideBelow: 'md',
      cell: (loan) => (
        <div>
          <p className="text-sm whitespace-nowrap text-slate-800">{formatDate(loan.due_on)}</p>
          <p className="text-xs whitespace-nowrap text-red-600">
            {loan.days_overdue} day{loan.days_overdue === 1 ? '' : 's'} late
          </p>
        </div>
      ),
    },
    {
      key: 'returned_on',
      header: 'Returned',
      hideBelow: 'lg',
      cell: (loan) =>
        loan.returned_on ? (
          formatDate(loan.returned_on)
        ) : (
          <Badge tone="danger">Still out</Badge>
        ),
    },
    {
      key: 'fine_amount',
      header: 'Charged',
      align: 'right',
      hideBelow: 'lg',
      cell: (loan) => (
        <div>
          <p className="text-sm text-slate-700">{formatCurrency(loan.fine_amount)}</p>
          {(loan.fine_paid > 0 || loan.fine_waived > 0) && (
            <p className="text-xs whitespace-nowrap text-slate-500">
              {loan.fine_paid > 0 && `${formatCurrency(loan.fine_paid)} paid`}
              {loan.fine_paid > 0 && loan.fine_waived > 0 && ' · '}
              {loan.fine_waived > 0 && `${formatCurrency(loan.fine_waived)} waived`}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'fine_due',
      header: 'Outstanding',
      sortable: true,
      align: 'right',
      cell: (loan) => (
        <span className="text-sm font-semibold text-red-700">{formatCurrency(loan.fine_due)}</span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (loan) => (
        <div className="flex justify-end gap-1">
          {canCollect && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => open(loan, 'pay')}
              leftIcon={<BadgeCheck className="size-4" />}
            >
              Collect
            </Button>
          )}
          {canWaive && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Waive the fine for ${loan.member_name}`}
              title="Waive"
              onClick={() => open(loan, 'waive')}
            >
              <Ban className="size-4 text-slate-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {data && data.data.length > 0 && (
        <Alert tone="warning" title={`${formatCurrency(pageTotal)} outstanding on this page`}>
          Fines stop accruing the moment a book is returned, so an amount here is fixed unless
          the book is still out.
        </Alert>
      )}

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
                searchPlaceholder="Member or book"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <Select
                    aria-label="Filter by member type"
                    value={table.filters.member_type ?? ''}
                    options={MEMBER_TYPE_OPTIONS}
                    placeholder="Anyone"
                    onChange={(event) =>
                      table.setFilter('member_type', event.target.value || undefined)
                    }
                    className="w-36"
                  />
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<IndianRupee className="size-6" />}
                title="No fines outstanding"
                description="Nothing is owed to the library."
              />
            }
          />
        </CardBody>
      </Card>

      {target && fineModal.isOpen && (
        <FineModal
          isOpen={fineModal.isOpen}
          onClose={() => {
            fineModal.close();
            setTarget(null);
          }}
          loan={target.loan}
          mode={target.mode}
        />
      )}
    </div>
  );
}
