import { HardHat, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { STAFF_FILTER_KEYS, StaffFilters } from '../components/StaffFilters';
import { buildStaffColumns } from '../components/staffColumns';
import { STAFF_PERMISSIONS, STAFF_TYPE_LABELS } from '../constants';
import { useDeleteStaff, useStaffList } from '../hooks/useStaff';
import type { StaffMember } from '../types';

export default function StaffListPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'full_name',
    defaultSortDir: 'asc',
    filterKeys: [...STAFF_FILTER_KEYS],
  });

  const { data, isLoading, isFetching, error } = useStaffList(table.queryParams);
  const deleteStaff = useDeleteStaff();
  const [pendingDelete, setPendingDelete] = useState<StaffMember | null>(null);

  const columns = buildStaffColumns({
    onView: (member) => navigate(toPath(PATHS.staffProfile, { id: member.id })),
    onEdit: (member) => navigate(toPath(PATHS.staffEdit, { id: member.id })),
    onDelete: setPendingDelete,
    canUpdate: hasPermission(STAFF_PERMISSIONS.update),
    canDelete: hasPermission(STAFF_PERMISSIONS.delete),
  });

  return (
    <>
      <PageHeader
        title="Staff"
        description="Non-teaching staff — accounts, front desk, library, transport, housekeeping and security."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Staff' }]}
        actions={
          <Can permissions={[STAFF_PERMISSIONS.create]}>
            <Button
              onClick={() => navigate(PATHS.staffCreate)}
              leftIcon={<UserPlus className="size-4" />}
            >
              Add staff
            </Button>
          </Can>
        }
      />

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
        onRowClick={(member) => navigate(toPath(PATHS.staffProfile, { id: member.id }))}
        toolbar={
          <TableToolbar
            search={table.search}
            onSearchChange={table.setSearch}
            searchPlaceholder="Search name, employee ID or phone…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            filters={<StaffFilters table={table} />}
          />
        }
        emptyState={
          <EmptyState
            icon={<HardHat className="size-6" />}
            title={table.hasActiveFilters ? 'No staff match your filters' : 'No staff yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Add your first staff member to get started.'
            }
            action={
              table.hasActiveFilters ? (
                <Button variant="outline" onClick={table.resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Can permissions={[STAFF_PERMISSIONS.create]}>
                  <Button onClick={() => navigate(PATHS.staffCreate)}>Add staff</Button>
                </Can>
              )
            }
          />
        }
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteStaff.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteStaff.isPending}
        isDestructive
        title="Delete this staff record?"
        confirmLabel="Delete record"
        message={
          pendingDelete ? (
            <>
              <strong>{pendingDelete.full_name}</strong> ({pendingDelete.employee_id} —{' '}
              {STAFF_TYPE_LABELS[pendingDelete.staff_type]}) will be removed, along with their
              uploaded documents. This cannot be undone.
              <br />
              <br />
              To keep the record for reference, set the status to <strong>Resigned</strong> or{' '}
              <strong>Terminated</strong> instead.
            </>
          ) : null
        }
      />
    </>
  );
}
