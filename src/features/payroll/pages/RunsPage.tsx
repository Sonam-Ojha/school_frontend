import { CalendarRange, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import type { Column } from '@/components/table/types';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { formatCurrency, formatDate } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { PayrollStats } from '../components/PayrollStats';
import { RunFormModal } from '../components/RunFormModal';
import { PAYROLL_PERMISSIONS, RUN_STATUS_LABELS, RUN_STATUS_OPTIONS, RUN_STATUS_TONES } from '../constants';
import { useDeleteRun, useRuns } from '../hooks/usePayroll';
import type { PayrollRun } from '../types';

export default function RunsPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canDelete = hasPermission(PAYROLL_PERMISSIONS.delete);

  const table = useTableQueryState({
    defaultSortBy: 'month',
    defaultSortDir: 'desc',
    filterKeys: ['status'],
  });

  const { data, isLoading, isFetching, error } = useRuns(table.queryParams);
  const deleteRun = useDeleteRun();

  const runForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [pendingDelete, setPendingDelete] = useState<PayrollRun | null>(null);

  const columns: Column<PayrollRun>[] = [
    {
      key: 'month',
      header: 'Month',
      sortable: true,
      cell: (run) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{run.month}</p>
          {run.notes && <p className="truncate text-xs text-slate-500">{run.notes}</p>}
        </div>
      ),
    },
    {
      key: 'employees_count',
      header: 'Employees',
      sortable: true,
      align: 'right',
      cell: (run) => run.employees_count,
    },
    {
      key: 'gross_total',
      header: 'Gross',
      sortable: true,
      align: 'right',
      hideBelow: 'md',
      cell: (run) => formatCurrency(run.gross_total),
    },
    {
      key: 'deductions_total',
      header: 'Deductions',
      align: 'right',
      hideBelow: 'lg',
      cell: (run) => formatCurrency(run.deductions_total),
    },
    {
      key: 'net_total',
      header: 'Net payable',
      sortable: true,
      align: 'right',
      cell: (run) => (
        <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
          {formatCurrency(run.net_total)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (run) => (
        <div>
          <Badge tone={RUN_STATUS_TONES[run.status]} withDot>
            {RUN_STATUS_LABELS[run.status]}
          </Badge>
          {run.paid_at && (
            <p className="mt-0.5 text-xs whitespace-nowrap text-slate-500">
              {formatDate(run.paid_at)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (run) =>
        // Only an untouched run can be deleted — once it is costed, it is a
        // record of what people were told they would be paid.
        canDelete && run.status === 'draft' ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              setPendingDelete(run);
              deleteDialog.open();
            }}
          >
            Delete
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <PayrollStats />

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
            onRowClick={(run) => navigate(toPath(PATHS.payrollRunDetail, { id: run.id }))}
            toolbar={
              <TableToolbar
                search={table.search}
                onSearchChange={table.setSearch}
                searchPlaceholder="Month"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <Select
                    aria-label="Filter by status"
                    value={table.filters.status ?? ''}
                    options={RUN_STATUS_OPTIONS}
                    placeholder="Any status"
                    onChange={(event) =>
                      table.setFilter('status', event.target.value || undefined)
                    }
                    className="w-40"
                  />
                }
                actions={
                  <Can permissions={[PAYROLL_PERMISSIONS.create]}>
                    <Button onClick={runForm.open} leftIcon={<Plus className="size-4" />}>
                      Open a month
                    </Button>
                  </Can>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<CalendarRange className="size-6" />}
                title="No payroll runs"
                description="Open a month to cost it against the salaries on file."
              />
            }
          />
        </CardBody>
      </Card>

      {runForm.isOpen && (
        <RunFormModal
          isOpen={runForm.isOpen}
          onClose={runForm.close}
          onCreated={(run) => navigate(toPath(PATHS.payrollRunDetail, { id: run.id }))}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteRun.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={deleteRun.isPending}
        isDestructive
        title={`Delete the ${pendingDelete?.month ?? ''} payroll?`}
        confirmLabel="Delete payroll"
        message={
          <Alert tone="info">
            Nothing has been costed yet, so nothing is lost. A processed run cannot be deleted.
          </Alert>
        }
      />
    </div>
  );
}
