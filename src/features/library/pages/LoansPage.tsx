import { FileSpreadsheet, ScrollText } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { ReturnModal } from '../components/ReturnModal';
import { buildLoanColumns } from '../components/loanColumns';
import {
  LIBRARY_PERMISSIONS,
  LOAN_STATUS_OPTIONS,
  MEMBER_TYPE_OPTIONS,
} from '../constants';
import { useExportLoans, useLoans, useRenewLoan } from '../hooks/useLibrary';
import type { Loan } from '../types';

/** Every loan the library has ever made, filtered down to the one being asked about. */
export default function LoansPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'due_on',
    defaultSortDir: 'asc',
    filterKeys: ['status', 'member_type', 'overdue'],
  });

  const { data, isLoading, isFetching, error } = useLoans(table.queryParams);
  const exportLoans = useExportLoans();
  const renewLoan = useRenewLoan();

  const returnModal = useDisclosure();
  const [returning, setReturning] = useState<Loan | null>(null);

  const columns = buildLoanColumns({
    canUpdate: hasPermission(LIBRARY_PERMISSIONS.update),
    onRenew: (loan) => renewLoan.mutate({ loan_id: loan.id, remarks: '' }),
    onReturn: (loan) => {
      setReturning(loan);
      returnModal.open();
    },
  });

  return (
    <>
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
                searchPlaceholder="Book, member or accession number"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <>
                    <Select
                      aria-label="Filter by status"
                      value={table.filters.status ?? ''}
                      options={LOAN_STATUS_OPTIONS}
                      placeholder="Any status"
                      onChange={(event) =>
                        table.setFilter('status', event.target.value || undefined)
                      }
                      className="w-40"
                    />
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
                    <Select
                      aria-label="Filter overdue loans"
                      value={table.filters.overdue ?? ''}
                      options={[{ label: 'Overdue only', value: '1' }]}
                      placeholder="All loans"
                      onChange={(event) =>
                        table.setFilter('overdue', event.target.value || undefined)
                      }
                      className="w-36"
                    />
                  </>
                }
                actions={
                  <Can permissions={[LIBRARY_PERMISSIONS.export]}>
                    <Button
                      variant="outline"
                      isLoading={exportLoans.isPending}
                      onClick={() =>
                        exportLoans.mutate({ params: table.queryParams, format: 'excel' })
                      }
                      leftIcon={<FileSpreadsheet className="size-4" />}
                    >
                      Export
                    </Button>
                  </Can>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<ScrollText className="size-6" />}
                title="No loans"
                description={
                  table.hasActiveFilters
                    ? 'Nothing matches these filters.'
                    : 'Nothing has been issued yet.'
                }
              />
            }
          />
        </CardBody>
      </Card>

      {returning && returnModal.isOpen && (
        <ReturnModal
          isOpen={returnModal.isOpen}
          onClose={() => {
            returnModal.close();
            setReturning(null);
          }}
          loan={returning}
        />
      )}
    </>
  );
}
