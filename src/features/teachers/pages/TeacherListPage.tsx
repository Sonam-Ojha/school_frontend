import { UserPlus, Users } from 'lucide-react';
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

import { TeacherExportMenu } from '../components/TeacherExportMenu';
import { TEACHER_FILTER_KEYS, TeacherFilters } from '../components/TeacherFilters';
import { buildTeacherColumns } from '../components/teacherColumns';
import { TEACHER_PERMISSIONS } from '../constants';
import { useDeleteTeacher, useTeachers } from '../hooks/useTeachers';
import type { Teacher } from '../types';

export default function TeacherListPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'full_name',
    defaultSortDir: 'asc',
    filterKeys: [...TEACHER_FILTER_KEYS],
  });

  const { data, isLoading, isFetching, error } = useTeachers(table.queryParams);
  const deleteTeacher = useDeleteTeacher();
  const [pendingDelete, setPendingDelete] = useState<Teacher | null>(null);

  const columns = buildTeacherColumns({
    onView: (teacher) => navigate(toPath(PATHS.teacherProfile, { id: teacher.id })),
    onEdit: (teacher) => navigate(toPath(PATHS.teacherEdit, { id: teacher.id })),
    onDelete: setPendingDelete,
    canUpdate: hasPermission(TEACHER_PERMISSIONS.update),
    canDelete: hasPermission(TEACHER_PERMISSIONS.delete),
  });

  return (
    <>
      <PageHeader
        title="Teachers"
        description="Staff records, qualifications, subjects and class assignments."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Teachers' }]}
        actions={
          <Can permissions={[TEACHER_PERMISSIONS.create]}>
            <Button
              onClick={() => navigate(PATHS.teacherCreate)}
              leftIcon={<UserPlus className="size-4" />}
            >
              Add teacher
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
        onRowClick={(teacher) => navigate(toPath(PATHS.teacherProfile, { id: teacher.id }))}
        toolbar={
          <TableToolbar
            search={table.search}
            onSearchChange={table.setSearch}
            searchPlaceholder="Search name, employee ID or email…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            filters={<TeacherFilters table={table} />}
            actions={
              <Can permissions={[TEACHER_PERMISSIONS.export]}>
                <TeacherExportMenu
                  params={table.queryParams}
                  total={data?.meta.total}
                  hasActiveFilters={table.hasActiveFilters}
                />
              </Can>
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<Users className="size-6" />}
            title={table.hasActiveFilters ? 'No teachers match your filters' : 'No teachers yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Add your first teacher to get started.'
            }
            action={
              table.hasActiveFilters ? (
                <Button variant="outline" onClick={table.resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Can permissions={[TEACHER_PERMISSIONS.create]}>
                  <Button onClick={() => navigate(PATHS.teacherCreate)}>Add teacher</Button>
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
          deleteTeacher.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteTeacher.isPending}
        isDestructive
        title="Delete this teacher record?"
        confirmLabel="Delete record"
        message={
          pendingDelete ? (
            <>
              <strong>{pendingDelete.full_name}</strong> ({pendingDelete.employee_id}) will be
              removed, along with their qualifications, experience, subject and class assignments,
              and uploaded documents. This cannot be undone.
              {pendingDelete.class_teacher_of && (
                <>
                  <br />
                  <br />
                  They are currently class teacher of{' '}
                  <strong>{pendingDelete.class_teacher_of}</strong>, which will be left unassigned.
                </>
              )}
              <br />
              <br />
              To keep the record for reference, set the status to <strong>Resigned</strong> or{' '}
              <strong>Retired</strong> instead.
            </>
          ) : null
        }
      />
    </>
  );
}
