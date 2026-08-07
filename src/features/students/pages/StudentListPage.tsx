import { GraduationCap, UserPlus } from 'lucide-react';
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

import { ExportMenu } from '../components/ExportMenu';
import { STUDENT_FILTER_KEYS, StudentFilters } from '../components/StudentFilters';
import { buildStudentColumns } from '../components/studentColumns';
import { STUDENT_PERMISSIONS } from '../constants';
import { useDeleteStudent } from '../hooks/useStudentMutations';
import { useStudents } from '../hooks/useStudents';
import type { Student } from '../types';

export default function StudentListPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'admission_no',
    defaultSortDir: 'desc',
    filterKeys: [...STUDENT_FILTER_KEYS],
  });

  const { data, isLoading, isFetching, error } = useStudents(table.queryParams);
  const deleteStudent = useDeleteStudent();
  const [pendingDelete, setPendingDelete] = useState<Student | null>(null);

  const columns = buildStudentColumns({
    onView: (student) => navigate(toPath(PATHS.studentProfile, { id: student.id })),
    onEdit: (student) => navigate(toPath(PATHS.studentEdit, { id: student.id })),
    onIdCard: (student) => navigate(toPath(PATHS.studentIdCard, { id: student.id })),
    onDelete: setPendingDelete,
    canUpdate: hasPermission(STUDENT_PERMISSIONS.update),
    canDelete: hasPermission(STUDENT_PERMISSIONS.delete),
    canPrint: hasPermission(STUDENT_PERMISSIONS.print),
  });

  return (
    <>
      <PageHeader
        title="Students"
        description="Admissions, profiles and records for every enrolled student."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Students' }]}
        actions={
          <Can permissions={[STUDENT_PERMISSIONS.create]}>
            <Button
              onClick={() => navigate(PATHS.studentAdmission)}
              leftIcon={<UserPlus className="size-4" />}
            >
              New admission
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
        onRowClick={(student) => navigate(toPath(PATHS.studentProfile, { id: student.id }))}
        toolbar={
          <TableToolbar
            search={table.search}
            onSearchChange={table.setSearch}
            searchPlaceholder="Search name, admission no. or phone…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            filters={<StudentFilters table={table} />}
            actions={
              <Can permissions={[STUDENT_PERMISSIONS.export]}>
                <ExportMenu
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
            icon={<GraduationCap className="size-6" />}
            title={table.hasActiveFilters ? 'No students match your filters' : 'No students yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Admit your first student to get started.'
            }
            action={
              table.hasActiveFilters ? (
                <Button variant="outline" onClick={table.resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Can permissions={[STUDENT_PERMISSIONS.create]}>
                  <Button onClick={() => navigate(PATHS.studentAdmission)}>New admission</Button>
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
          deleteStudent.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteStudent.isPending}
        isDestructive
        title="Delete this student record?"
        confirmLabel="Delete record"
        message={
          pendingDelete ? (
            <>
              <strong>{pendingDelete.full_name}</strong> ({pendingDelete.admission_no}) will be
              removed, along with their guardians, medical record and uploaded documents. This
              cannot be undone.
              <br />
              <br />
              To keep the record for reference, set the status to{' '}
              <strong>Transferred</strong> or <strong>Graduated</strong> instead.
            </>
          ) : null
        }
      />
    </>
  );
}
