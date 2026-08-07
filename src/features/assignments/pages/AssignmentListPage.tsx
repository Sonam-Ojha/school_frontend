import { ClipboardList, Plus } from 'lucide-react';
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
import { useClassOptions, useSubjectOptions } from '@/features/academics/hooks/useAcademics';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { buildAssignmentColumns } from '../components/assignmentColumns';
import {
  ASSIGNMENT_PERMISSIONS,
  ASSIGNMENT_STATUS_OPTIONS,
  ASSIGNMENT_TYPE_OPTIONS,
} from '../constants';
import { useAssignmentList, useDeleteAssignment } from '../hooks/useAssignments';
import type { Assignment } from '../types';

const FILTER_KEYS = [
  'class_id',
  'section_id',
  'subject_id',
  'type',
  'status',
  'marks_published',
] as const;

export default function AssignmentListPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'due_date',
    defaultSortDir: 'desc',
    filterKeys: [...FILTER_KEYS],
  });

  const selectedClassId = table.filters.class_id ? Number(table.filters.class_id) : null;
  const { classOptions, sectionOptions } = useClassOptions(selectedClassId);
  const { subjectOptions } = useSubjectOptions();

  const { data, isLoading, isFetching, error } = useAssignmentList(table.queryParams);
  const deleteAssignment = useDeleteAssignment();
  const [pendingDelete, setPendingDelete] = useState<Assignment | null>(null);

  const columns = buildAssignmentColumns({
    onView: (assignment) => navigate(toPath(PATHS.assignmentDetail, { id: assignment.id })),
    onEdit: (assignment) => navigate(toPath(PATHS.assignmentEdit, { id: assignment.id })),
    onDelete: setPendingDelete,
    canUpdate: hasPermission(ASSIGNMENT_PERMISSIONS.update),
    canDelete: hasPermission(ASSIGNMENT_PERMISSIONS.delete),
  });

  const hasSubmissions = (pendingDelete?.submitted_count ?? 0) > 0;
  const marksPublished = Boolean(pendingDelete?.marks_published_at);

  return (
    <>
      <PageHeader
        title="Assignments"
        description="Coursework that counts — set, submitted, evaluated and published."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Assignments' }]}
        actions={
          <Can permissions={[ASSIGNMENT_PERMISSIONS.create]}>
            <Button
              onClick={() => navigate(PATHS.assignmentCreate)}
              leftIcon={<Plus className="size-4" />}
            >
              Set assignment
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
        onRowClick={(assignment) => navigate(toPath(PATHS.assignmentDetail, { id: assignment.id }))}
        toolbar={
          <TableToolbar
            search={table.search}
            onSearchChange={table.setSearch}
            searchPlaceholder="Search by title…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            filters={
              <>
                <Select
                  aria-label="Filter by class"
                  value={table.filters.class_id ?? ''}
                  options={classOptions}
                  placeholder="All classes"
                  onChange={(event) => {
                    table.setFilter('class_id', event.target.value || undefined);
                    table.setFilter('section_id', undefined);
                  }}
                  className="h-9 w-auto min-w-32 text-sm"
                />
                <Select
                  aria-label="Filter by section"
                  value={table.filters.section_id ?? ''}
                  options={sectionOptions}
                  placeholder="All sections"
                  disabled={sectionOptions.length === 0}
                  onChange={(event) =>
                    table.setFilter('section_id', event.target.value || undefined)
                  }
                  className="h-9 w-auto min-w-28 text-sm"
                />
                <Select
                  aria-label="Filter by subject"
                  value={table.filters.subject_id ?? ''}
                  options={subjectOptions}
                  placeholder="All subjects"
                  onChange={(event) =>
                    table.setFilter('subject_id', event.target.value || undefined)
                  }
                  className="h-9 w-auto min-w-36 text-sm"
                />
                <Select
                  aria-label="Filter by kind of work"
                  value={table.filters.type ?? ''}
                  options={ASSIGNMENT_TYPE_OPTIONS}
                  placeholder="Any kind"
                  onChange={(event) => table.setFilter('type', event.target.value || undefined)}
                  className="h-9 w-auto min-w-32 text-sm"
                />
                <Select
                  aria-label="Filter by status"
                  value={table.filters.status ?? ''}
                  options={ASSIGNMENT_STATUS_OPTIONS}
                  placeholder="Any status"
                  onChange={(event) => table.setFilter('status', event.target.value || undefined)}
                  className="h-9 w-auto min-w-32 text-sm"
                />
                <Select
                  aria-label="Filter by marks published"
                  value={table.filters.marks_published ?? ''}
                  options={[
                    { label: 'Marks published', value: '1' },
                    { label: 'Marks not published', value: '0' },
                  ]}
                  placeholder="Any marks state"
                  onChange={(event) =>
                    table.setFilter('marks_published', event.target.value || undefined)
                  }
                  className="h-9 w-auto min-w-44 text-sm"
                />
              </>
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<ClipboardList className="size-6" />}
            title={table.hasActiveFilters ? 'No assignments match' : 'No assignments set yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Set your first assignment — the marking scheme, files and evaluation come after.'
            }
            action={
              table.hasActiveFilters ? (
                <Button variant="outline" onClick={table.resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Can permissions={[ASSIGNMENT_PERMISSIONS.create]}>
                  <Button onClick={() => navigate(PATHS.assignmentCreate)}>Set assignment</Button>
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
          deleteAssignment.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteAssignment.isPending}
        isDestructive
        title={marksPublished ? 'These marks have been published' : 'Delete this assignment?'}
        confirmLabel="Delete assignment"
        message={
          pendingDelete ? (
            marksPublished ? (
              <>
                Marks for <strong>{pendingDelete.title}</strong> are already part of{' '}
                {pendingDelete.students_count} students’ internal assessment, worth{' '}
                {pendingDelete.weightage_percent}%. Deleting it removes those marks from their
                record. Close it instead to keep the record while stopping new work.
              </>
            ) : hasSubmissions ? (
              <>
                <strong>{pendingDelete.submitted_count}</strong> student
                {pendingDelete.submitted_count === 1 ? ' has' : 's have'} handed in work for{' '}
                <strong>{pendingDelete.title}</strong>, and {pendingDelete.evaluated_count} of those
                are evaluated. Deleting it removes their submissions and marks as well.
              </>
            ) : (
              <>
                <strong>{pendingDelete.title}</strong>, its marking scheme and its attachments will
                be removed. This cannot be undone.
              </>
            )
          ) : null
        }
      />
    </>
  );
}
