import { Layers, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { toDateInputValue } from '@/lib/format';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { FeeStructureForm } from '../components/FeeStructureForm';
import { buildStructureColumns } from '../components/columns';
import { FEE_PERMISSIONS } from '../constants';
import {
  useCreateStructure,
  useDeleteStructure,
  useFeeStructure,
  useFeeStructures,
  useUpdateStructure,
} from '../hooks/useFeeCatalogue';
import type { FeeStructureInput } from '../schemas';
import type { FeeStructure, FeeStructureDetail } from '../types';

/** A blank structure with one line and one instalment already in place. */
function emptyStructure(): FeeStructureInput {
  return {
    name: '',
    academic_year_id: 0,
    class_id: 0,
    section_id: null,
    is_active: true,
    items: [{ fee_type_id: 0, amount: 0, frequency: 'annual' }],
    installments: [{ name: 'Instalment 1', due_date: toDateInputValue(new Date()), amount: 0 }],
  };
}

function toInput(structure: FeeStructureDetail): FeeStructureInput {
  return {
    name: structure.name,
    academic_year_id: structure.academic_year_id,
    class_id: structure.class_id,
    section_id: structure.section_id,
    is_active: structure.is_active,
    items: structure.items.map((item) => ({
      fee_type_id: item.fee_type_id,
      amount: item.amount,
      frequency: item.frequency,
    })),
    installments: structure.installments.map((installment) => ({
      name: installment.name,
      due_date: toDateInputValue(installment.due_date),
      amount: installment.amount,
    })),
  };
}

export function FeeStructuresPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({ defaultSortBy: 'name', defaultSortDir: 'asc' });
  const { data, isLoading, isFetching, error } = useFeeStructures(table.queryParams);
  const deleteStructure = useDeleteStructure();
  const [pendingDelete, setPendingDelete] = useState<FeeStructure | null>(null);

  const columns = buildStructureColumns({
    onView: (structure) => navigate(toPath(PATHS.feeStructureEdit, { id: structure.id })),
    onEdit: (structure) => navigate(toPath(PATHS.feeStructureEdit, { id: structure.id })),
    onDelete: setPendingDelete,
    canUpdate: hasPermission(FEE_PERMISSIONS.update),
    canDelete: hasPermission(FEE_PERMISSIONS.delete),
  });

  const inUse = (pendingDelete?.students_count ?? 0) > 0;

  return (
    <>
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
        onRowClick={(structure) => navigate(toPath(PATHS.feeStructureEdit, { id: structure.id }))}
        toolbar={
          <TableToolbar
            search={table.search}
            onSearchChange={table.setSearch}
            searchPlaceholder="Search structures…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            actions={
              <Can permissions={[FEE_PERMISSIONS.create]}>
                <Button
                  onClick={() => navigate(PATHS.feeStructureCreate)}
                  leftIcon={<Plus className="size-4" />}
                >
                  New structure
                </Button>
              </Can>
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<Layers className="size-6" />}
            title={table.hasActiveFilters ? 'No structures match' : 'No fee structures yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term.'
                : 'A class needs a structure before anything can be billed to its students.'
            }
            action={
              <Can permissions={[FEE_PERMISSIONS.create]}>
                <Button onClick={() => navigate(PATHS.feeStructureCreate)}>New structure</Button>
              </Can>
            }
          />
        }
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteStructure.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteStructure.isPending}
        isDestructive={!inUse}
        title={inUse ? 'This structure is assigned to students' : 'Delete this structure?'}
        confirmLabel={inUse ? 'Try anyway' : 'Delete structure'}
        message={
          pendingDelete ? (
            inUse ? (
              <>
                <strong>{pendingDelete.students_count}</strong> student
                {pendingDelete.students_count === 1 ? ' is' : 's are'} billed against{' '}
                <strong>{pendingDelete.name}</strong>. Deleting it would orphan their dues and
                receipts — mark it inactive instead.
              </>
            ) : (
              <>
                <strong>{pendingDelete.name}</strong> and its schedule will be removed. This
                cannot be undone.
              </>
            )
          ) : null
        }
      />
    </>
  );
}

export function FeeStructureCreatePage() {
  const navigate = useNavigate();
  const createStructure = useCreateStructure();

  return (
    <>
      <PageHeader
        title="New fee structure"
        description="Define the fee lines, then the instalments they fall due in."
        breadcrumbs={[
          { label: 'Fees', to: PATHS.feeStructures },
          { label: 'Structures', to: PATHS.feeStructures },
          { label: 'New' },
        ]}
      />

      <FeeStructureForm
        defaultValues={emptyStructure()}
        isPending={createStructure.isPending}
        submitLabel="Create structure"
        onCancel={() => navigate(PATHS.feeStructures)}
        onSubmit={(values, { onError }) =>
          createStructure.mutate(values, {
            onSuccess: () => navigate(PATHS.feeStructures, { replace: true }),
            onError,
          })
        }
      />
    </>
  );
}

export function FeeStructureEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: structure, isLoading, error } = useFeeStructure(id);
  const updateStructure = useUpdateStructure(Number(id));

  const breadcrumbs = [
    { label: 'Fees', to: PATHS.feeStructures },
    { label: 'Structures', to: PATHS.feeStructures },
    { label: structure?.name ?? 'Edit' },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Fee structure" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody className="space-y-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </CardBody>
        </Card>
      </>
    );
  }

  if (error || !structure) {
    return (
      <>
        <PageHeader title="Fee structure" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this structure">
              {error?.message ?? 'The structure no longer exists.'}
            </Alert>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate(PATHS.feeStructures)}
            >
              Back to structures
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={structure.name}
        description={`${structure.class_name} · ${structure.academic_year_name} · ${structure.students_count} student${structure.students_count === 1 ? '' : 's'} billed`}
        breadcrumbs={breadcrumbs}
      />

      {structure.students_count > 0 && (
        <Alert tone="warning" className="mb-4" title="Students are already billed against this">
          Changing the amounts or the schedule re-bills {structure.students_count} student
          {structure.students_count === 1 ? '' : 's'}. Payments already taken are unaffected, but
          their outstanding balances will change.
        </Alert>
      )}

      <FeeStructureForm
        // Remount per record so `defaultValues` are applied.
        key={structure.id}
        defaultValues={toInput(structure)}
        isPending={updateStructure.isPending}
        submitLabel="Save changes"
        requireDirty
        onCancel={() => navigate(PATHS.feeStructures)}
        onSubmit={(values, { onError }) =>
          updateStructure.mutate(values, {
            onSuccess: () => navigate(PATHS.feeStructures, { replace: true }),
            onError,
          })
        }
      />
    </>
  );
}
