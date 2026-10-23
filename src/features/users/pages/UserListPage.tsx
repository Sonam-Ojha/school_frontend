import { Plus, UserCog } from 'lucide-react';
import { useState } from 'react';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { useRoleOptions } from '@/features/roles/hooks/useRoles';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';
import { ROLES, roleLabel } from '@/types/auth';

import { buildUserColumns } from '../components/userColumns';
import { UserFormModal } from '../components/UserFormModal';
import { USER_FILTER_KEYS, USER_PERMISSIONS, USER_STATUS_OPTIONS } from '../constants';
import { useDeleteUser, useUsers } from '../hooks/useUsers';
import type { UserAccount } from '../types';

/** `null` is closed, `'new'` is the create form, an account is that account's edit form. */
type FormTarget = UserAccount | 'new' | null;

export default function UserListPage() {
  const currentUser = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({ filterKeys: USER_FILTER_KEYS });
  const { data, isLoading, isFetching, error } = useUsers(table.queryParams);
  const roles = useRoleOptions();

  const deleteUser = useDeleteUser();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [pendingDelete, setPendingDelete] = useState<UserAccount | null>(null);

  const columns = buildUserColumns({
    onEdit: setFormTarget,
    onDelete: setPendingDelete,
    canUpdate: hasPermission(USER_PERMISSIONS.update),
    canDelete: hasPermission(USER_PERMISSIONS.delete),
    currentUserId: currentUser?.id ?? null,
    isSuperAdmin: currentUser?.roles.includes(ROLES.superAdmin) ?? false,
  });

  const roleOptions = (roles.data ?? []).map((role) => ({
    label: roleLabel(role.name),
    value: role.name,
  }));

  return (
    <>
      <PageHeader
        title="Users"
        description="Who can sign in, and which roles they hold."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Users' }]}
        actions={
          <Can permissions={[USER_PERMISSIONS.create]}>
            <Button onClick={() => setFormTarget('new')} leftIcon={<Plus className="size-4" />}>
              New user
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
            searchPlaceholder="Search by name or email…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            filters={
              <>
                <Select
                  aria-label="Filter by role"
                  value={table.filters.role ?? ''}
                  options={roleOptions}
                  placeholder="All roles"
                  onChange={(event) => table.setFilter('role', event.target.value || undefined)}
                  className="h-9 w-auto min-w-36 text-sm"
                />
                <Select
                  aria-label="Filter by status"
                  value={table.filters.status ?? ''}
                  options={USER_STATUS_OPTIONS}
                  placeholder="Any status"
                  onChange={(event) => table.setFilter('status', event.target.value || undefined)}
                  className="h-9 w-auto min-w-32 text-sm"
                />
              </>
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<UserCog className="size-6" />}
            title={table.hasActiveFilters ? 'No users match your filters' : 'No users yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Create an account for each person who needs to sign in.'
            }
            action={
              table.hasActiveFilters ? (
                <Button variant="outline" onClick={table.resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Can permissions={[USER_PERMISSIONS.create]}>
                  <Button onClick={() => setFormTarget('new')}>New user</Button>
                </Can>
              )
            }
          />
        }
      />

      {/* Keyed so each open starts from that account's values, not the last one's. */}
      {formTarget !== null && (
        <UserFormModal
          key={formTarget === 'new' ? 'new' : formTarget.id}
          isOpen
          onClose={() => setFormTarget(null)}
          user={formTarget === 'new' ? null : formTarget}
        />
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteUser.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteUser.isPending}
        isDestructive
        title="Delete this user?"
        confirmLabel="Delete user"
        message={
          pendingDelete ? (
            <>
              <strong>{pendingDelete.name}</strong> ({pendingDelete.email}) will no longer be able
              to sign in. To lock an account without losing it, deactivate it instead. This cannot
              be undone.
            </>
          ) : null
        }
      />
    </>
  );
}
