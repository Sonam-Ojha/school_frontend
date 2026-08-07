import { Pencil, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
import { formatCurrency } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { ComponentFormModal } from '../components/ComponentFormModal';
import {
  CALCULATION_LABELS,
  COMPONENT_TYPE_LABELS,
  COMPONENT_TYPE_OPTIONS,
  COMPONENT_TYPE_TONES,
  PAYROLL_PERMISSIONS,
} from '../constants';
import { useComponents, useDeleteComponent } from '../hooks/usePayroll';
import type { SalaryComponent } from '../types';

/**
 * The allowance and deduction catalogue.
 *
 * Defined once here and applied to many salaries — the same structure the fee
 * types have. A rate changed here reprices every salary using it, which is
 * the point of having a catalogue at all.
 */
export default function ComponentsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(PAYROLL_PERMISSIONS.update);
  const canDelete = hasPermission(PAYROLL_PERMISSIONS.delete);

  const table = useTableQueryState({
    defaultSortBy: 'sort_order',
    defaultSortDir: 'asc',
    filterKeys: ['type'],
  });

  const { data, isLoading, isFetching, error } = useComponents(table.queryParams);
  const deleteComponent = useDeleteComponent();

  const componentForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editing, setEditing] = useState<SalaryComponent | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SalaryComponent | null>(null);

  const nextSortOrder =
    (data?.data ?? []).reduce((highest, entry) => Math.max(highest, entry.sort_order), 0) + 1;

  const columns: Column<SalaryComponent>[] = [
    {
      key: 'name',
      header: 'Component',
      sortable: true,
      cell: (component) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">
            {component.name}
            {component.is_statutory && (
              <Badge tone="info" className="ml-2">
                Statutory
              </Badge>
            )}
          </p>
          <p className="truncate text-xs text-slate-500">
            <code>{component.code}</code>
            {!component.is_active && ' · retired'}
          </p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      cell: (component) => (
        <Badge tone={COMPONENT_TYPE_TONES[component.type]}>
          {COMPONENT_TYPE_LABELS[component.type]}
        </Badge>
      ),
    },
    {
      key: 'calculation',
      header: 'Worked out as',
      hideBelow: 'md',
      cell: (component) => (
        <div>
          <p className="text-sm text-slate-800">{CALCULATION_LABELS[component.calculation]}</p>
          <p className="text-xs text-slate-500">
            {component.calculation === 'fixed'
              ? formatCurrency(component.value)
              : `${component.value}%`}
          </p>
        </div>
      ),
    },
    {
      key: 'affects_pf',
      header: 'PF wages',
      hideBelow: 'xl',
      align: 'center',
      cell: (component) =>
        component.type === 'earning' ? (
          <Badge tone={component.affects_pf ? 'warning' : 'neutral'}>
            {component.affects_pf ? 'Counts' : 'Excluded'}
          </Badge>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: 'structures_count',
      header: 'In use on',
      sortable: true,
      align: 'right',
      cell: (component) => (
        <span className="text-sm text-slate-700">
          {component.structures_count}{' '}
          <span className="text-xs text-slate-400">
            salar{component.structures_count === 1 ? 'y' : 'ies'}
          </span>
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (component) => (
        <div className="flex justify-end gap-1">
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${component.name}`}
              onClick={() => {
                setEditing(component);
                componentForm.open();
              }}
            >
              <Pencil className="size-4" />
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              // A statutory line is not this school's to remove.
              disabled={component.is_statutory || component.structures_count > 0}
              title={
                component.is_statutory
                  ? 'Statutory components cannot be deleted'
                  : component.structures_count > 0
                    ? 'In use on a salary'
                    : `Delete ${component.name}`
              }
              aria-label={`Delete ${component.name}`}
              onClick={() => {
                setPendingDelete(component);
                deleteDialog.open();
              }}
            >
              <Trash2 className="size-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Alert tone="info" className="mb-4">
        PF, ESI and professional tax are computed by statute — they appear on every payslip that
        attracts them and are not listed as optional deductions on a salary.
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
                searchPlaceholder="Name or code"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <Select
                    aria-label="Filter by type"
                    value={table.filters.type ?? ''}
                    options={COMPONENT_TYPE_OPTIONS}
                    placeholder="Everything"
                    onChange={(event) =>
                      table.setFilter('type', event.target.value || undefined)
                    }
                    className="w-40"
                  />
                }
                actions={
                  <Can permissions={[PAYROLL_PERMISSIONS.create]}>
                    <Button
                      onClick={() => {
                        setEditing(null);
                        componentForm.open();
                      }}
                      leftIcon={<Plus className="size-4" />}
                    >
                      Add component
                    </Button>
                  </Can>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<SlidersHorizontal className="size-6" />}
                title="No components"
                description="Add the allowances and deductions this school pays."
              />
            }
          />
        </CardBody>
      </Card>

      {componentForm.isOpen && (
        <ComponentFormModal
          key={editing?.id ?? 'new'}
          isOpen={componentForm.isOpen}
          onClose={() => {
            componentForm.close();
            setEditing(null);
          }}
          component={editing}
          nextSortOrder={nextSortOrder}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteComponent.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={deleteComponent.isPending}
        isDestructive
        title={`Delete ${pendingDelete?.name ?? 'this component'}?`}
        confirmLabel="Delete component"
        message="It disappears from the catalogue. Payslips already issued keep it."
      />
    </>
  );
}
