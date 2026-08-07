import { Plus, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';
import { roleLabel } from '@/types/auth';

import { buildRoleColumns } from '../components/roleColumns';
import { ROLE_PERMISSIONS } from '../constants';
import { useDeleteRole } from '../hooks/useRoleMutations';
import { useRoles } from '../hooks/useRoles';
import type { Role } from '../types';

export default function RoleListPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({ defaultSortBy: 'name', defaultSortDir: 'asc' });
  const { data, isLoading, isFetching, error } = useRoles(table.queryParams);

  const deleteRole = useDeleteRole();
  const [pendingDelete, setPendingDelete] = useState<Role | null>(null);

  const columns = buildRoleColumns({
    onEdit: (role) => navigate(toPath(PATHS.roleEdit, { id: role.id })),
    onDelete: setPendingDelete,
    canUpdate: hasPermission(ROLE_PERMISSIONS.update),
    canDelete: hasPermission(ROLE_PERMISSIONS.delete),
  });

  return (
    <>
      <PageHeader
        title="Roles"
        description="Define what each type of user is allowed to do."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Roles' }]}
        actions={
          <Can permissions={[ROLE_PERMISSIONS.create]}>
            <Button
              onClick={() => navigate(PATHS.roleCreate)}
              leftIcon={<Plus className="size-4" />}
            >
              New role
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
        toolbar={
          <TableToolbar
            search={table.search}
            onSearchChange={table.setSearch}
            searchPlaceholder="Search roles…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
          />
        }
        emptyState={
          <EmptyState
            icon={<ShieldCheck className="size-6" />}
            title={table.hasActiveFilters ? 'No roles match your search' : 'No roles yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term.'
                : 'Run the backend role seeder, or create your first role.'
            }
            action={
              table.hasActiveFilters ? (
                <Button variant="outline" onClick={table.resetFilters}>
                  Clear search
                </Button>
              ) : (
                <Can permissions={[ROLE_PERMISSIONS.create]}>
                  <Button onClick={() => navigate(PATHS.roleCreate)}>New role</Button>
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
          deleteRole.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteRole.isPending}
        isDestructive
        title="Delete this role?"
        confirmLabel="Delete role"
        message={
          pendingDelete ? (
            <>
              <strong>{roleLabel(pendingDelete.name)}</strong> will be removed.
              {pendingDelete.users_count > 0 && (
                <>
                  {' '}
                  {pendingDelete.users_count} user
                  {pendingDelete.users_count === 1 ? '' : 's'} currently hold this role and will
                  lose the permissions it grants.
                </>
              )}{' '}
              This cannot be undone.
            </>
          ) : null
        }
      />
    </>
  );
}
