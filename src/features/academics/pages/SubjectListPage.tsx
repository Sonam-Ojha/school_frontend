import { BookOpen, Plus } from 'lucide-react';
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
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { AssignTeachersModal } from '../components/AssignTeachersModal';
import { SubjectFormModal } from '../components/SubjectFormModal';
import { buildSubjectColumns } from '../components/subjectColumns';
import { SUBJECT_PERMISSIONS } from '../constants';
import { useDeleteSubject, useSubjects } from '../hooks/useSubjects';
import type { Subject } from '../types';

const COMPONENT_OPTIONS = [
  { label: 'Has theory', value: 'theory' },
  { label: 'Has practical', value: 'practical' },
  { label: 'Both', value: 'both' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export default function SubjectListPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'name',
    defaultSortDir: 'asc',
    filterKeys: ['component', 'status', 'elective'],
  });

  const { data, isLoading, isFetching, error } = useSubjects(table.queryParams);
  const deleteSubject = useDeleteSubject();

  const formModal = useDisclosure();
  const assignModal = useDisclosure();
  const [editing, setEditing] = useState<Subject | null>(null);
  const [assigning, setAssigning] = useState<Subject | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Subject | null>(null);

  const openCreate = () => {
    setEditing(null);
    formModal.open();
  };

  const columns = buildSubjectColumns({
    onEdit: (subject) => {
      setEditing(subject);
      formModal.open();
    },
    onAssign: (subject) => {
      setAssigning(subject);
      assignModal.open();
    },
    onDelete: setPendingDelete,
    canUpdate: hasPermission(SUBJECT_PERMISSIONS.update),
    canDelete: hasPermission(SUBJECT_PERMISSIONS.delete),
  });

  const blockedByTeachers = (pendingDelete?.teachers_count ?? 0) > 0;

  return (
    <>
      <PageHeader
        title="Subjects"
        description="What is taught, how it is examined, and who is qualified to teach it."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Subjects' }]}
        actions={
          <Can permissions={[SUBJECT_PERMISSIONS.create]}>
            <Button onClick={openCreate} leftIcon={<Plus className="size-4" />}>
              New subject
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
            searchPlaceholder="Search name or code…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            filters={
              <>
                <Select
                  aria-label="Filter by component"
                  value={table.filters.component ?? ''}
                  options={COMPONENT_OPTIONS}
                  placeholder="Any component"
                  onChange={(event) =>
                    table.setFilter('component', event.target.value || undefined)
                  }
                  className="h-9 w-auto min-w-36 text-sm"
                />
                <Select
                  aria-label="Filter by type"
                  value={table.filters.elective ?? ''}
                  options={[
                    { label: 'Core', value: 'no' },
                    { label: 'Elective', value: 'yes' },
                  ]}
                  placeholder="Core & elective"
                  onChange={(event) => table.setFilter('elective', event.target.value || undefined)}
                  className="h-9 w-auto min-w-32 text-sm"
                />
                <Select
                  aria-label="Filter by status"
                  value={table.filters.status ?? ''}
                  options={STATUS_OPTIONS}
                  placeholder="All subjects"
                  onChange={(event) => table.setFilter('status', event.target.value || undefined)}
                  className="h-9 w-auto min-w-32 text-sm"
                />
              </>
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<BookOpen className="size-6" />}
            title={table.hasActiveFilters ? 'No subjects match your filters' : 'No subjects yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Create your subjects before building the timetable.'
            }
            action={
              table.hasActiveFilters ? (
                <Button variant="outline" onClick={table.resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Can permissions={[SUBJECT_PERMISSIONS.create]}>
                  <Button onClick={openCreate}>New subject</Button>
                </Can>
              )
            }
          />
        }
      />

      <SubjectFormModal
        // Remount per record so `defaultValues` are applied.
        key={editing?.id ?? 'create'}
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        subject={editing}
      />

      {assigning && (
        <AssignTeachersModal
          key={assigning.id}
          isOpen={assignModal.isOpen}
          onClose={assignModal.close}
          subject={assigning}
        />
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteSubject.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteSubject.isPending}
        isDestructive={!blockedByTeachers}
        title={blockedByTeachers ? 'This subject is still assigned' : 'Delete this subject?'}
        confirmLabel={blockedByTeachers ? 'Try anyway' : 'Delete subject'}
        message={
          pendingDelete ? (
            blockedByTeachers ? (
              <>
                <strong>{pendingDelete.teachers_count}</strong> teacher
                {pendingDelete.teachers_count === 1 ? ' is' : 's are'} assigned to{' '}
                <strong>{pendingDelete.name}</strong>. Unassign them first, or mark the subject
                inactive to keep the history intact.
              </>
            ) : (
              <>
                <strong>{pendingDelete.name}</strong> ({pendingDelete.code}) will be removed,
                along with its marks scheme. This cannot be undone.
              </>
            )
          ) : null
        }
      />
    </>
  );
}
