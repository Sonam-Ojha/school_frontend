import { LayoutGrid, Plus } from 'lucide-react';
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
import { Select } from '@/components/ui/Select';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { ClassFormModal } from '../components/ClassFormModal';
import { buildClassColumns } from '../components/classColumns';
import { CLASS_PERMISSIONS } from '../constants';
import { useClasses, useDeleteClass } from '../hooks/useClasses';
import type { SchoolClassSummary } from '../types';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export default function ClassListPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'level',
    defaultSortDir: 'asc',
    filterKeys: ['status'],
  });

  const { data, isLoading, isFetching, error } = useClasses(table.queryParams);
  const deleteClass = useDeleteClass();

  const formModal = useDisclosure();
  const [editing, setEditing] = useState<SchoolClassSummary | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SchoolClassSummary | null>(null);

  const openCreate = () => {
    setEditing(null);
    formModal.open();
  };

  const columns = buildClassColumns({
    onView: (schoolClass) => navigate(toPath(PATHS.classDetail, { id: schoolClass.id })),
    onEdit: (schoolClass) => {
      setEditing(schoolClass);
      formModal.open();
    },
    onDelete: setPendingDelete,
    canUpdate: hasPermission(CLASS_PERMISSIONS.update),
    canDelete: hasPermission(CLASS_PERMISSIONS.delete),
  });

  const blockedByStudents = (pendingDelete?.students_count ?? 0) > 0;

  return (
    <>
      <PageHeader
        title="Classes & sections"
        description="The academic structure students are admitted into and teachers are assigned to."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Classes' }]}
        actions={
          <Can permissions={[CLASS_PERMISSIONS.create]}>
            <Button onClick={openCreate} leftIcon={<Plus className="size-4" />}>
              New class
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
        onRowClick={(schoolClass) => navigate(toPath(PATHS.classDetail, { id: schoolClass.id }))}
        toolbar={
          <TableToolbar
            search={table.search}
            onSearchChange={table.setSearch}
            searchPlaceholder="Search classes…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            filters={
              <Select
                aria-label="Filter by status"
                value={table.filters.status ?? ''}
                options={STATUS_OPTIONS}
                placeholder="All classes"
                onChange={(event) => table.setFilter('status', event.target.value || undefined)}
                className="h-9 w-auto min-w-32 text-sm"
              />
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<LayoutGrid className="size-6" />}
            title={table.hasActiveFilters ? 'No classes match your filters' : 'No classes yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Create your classes before admitting students.'
            }
            action={
              table.hasActiveFilters ? (
                <Button variant="outline" onClick={table.resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Can permissions={[CLASS_PERMISSIONS.create]}>
                  <Button onClick={openCreate}>New class</Button>
                </Can>
              )
            }
          />
        }
      />

      <ClassFormModal
        // Remount per record so `defaultValues` are applied.
        key={editing?.id ?? 'create'}
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        schoolClass={editing}
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteClass.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteClass.isPending}
        isDestructive={!blockedByStudents}
        title={blockedByStudents ? 'This class still has students' : 'Delete this class?'}
        confirmLabel={blockedByStudents ? 'Try anyway' : 'Delete class'}
        message={
          pendingDelete ? (
            blockedByStudents ? (
              <>
                <strong>{pendingDelete.students_count}</strong> student
                {pendingDelete.students_count === 1 ? ' is' : 's are'} enrolled in{' '}
                <strong>{pendingDelete.name}</strong>. Move them to another class first, or mark
                this one inactive to keep their records intact.
              </>
            ) : (
              <>
                <strong>{pendingDelete.name}</strong> and its {pendingDelete.sections_count}{' '}
                section
                {pendingDelete.sections_count === 1 ? '' : 's'} will be removed. This cannot be
                undone.
              </>
            )
          ) : null
        }
      />
    </>
  );
}
