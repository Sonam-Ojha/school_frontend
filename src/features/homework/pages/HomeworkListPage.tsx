import { BookOpenCheck, Plus } from 'lucide-react';
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

import { buildHomeworkColumns } from '../components/homeworkColumns';
import { HOMEWORK_PERMISSIONS, HOMEWORK_STATUS_OPTIONS } from '../constants';
import { useDeleteHomework, useHomeworkList } from '../hooks/useHomework';
import type { Homework } from '../types';

const FILTER_KEYS = ['class_id', 'section_id', 'subject_id', 'status', 'overdue'] as const;

export default function HomeworkListPage() {
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

  const { data, isLoading, isFetching, error } = useHomeworkList(table.queryParams);
  const deleteHomework = useDeleteHomework();
  const [pendingDelete, setPendingDelete] = useState<Homework | null>(null);

  const columns = buildHomeworkColumns({
    onView: (homework) => navigate(toPath(PATHS.homeworkDetail, { id: homework.id })),
    onEdit: (homework) => navigate(toPath(PATHS.homeworkEdit, { id: homework.id })),
    onDelete: setPendingDelete,
    canUpdate: hasPermission(HOMEWORK_PERMISSIONS.update),
    canDelete: hasPermission(HOMEWORK_PERMISSIONS.delete),
  });

  const hasSubmissions = (pendingDelete?.submitted_count ?? 0) > 0;

  return (
    <>
      <PageHeader
        title="Homework"
        description="What has been set, what has come in, and what it scored."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Homework' }]}
        actions={
          <Can permissions={[HOMEWORK_PERMISSIONS.create]}>
            <Button
              onClick={() => navigate(PATHS.homeworkCreate)}
              leftIcon={<Plus className="size-4" />}
            >
              Set homework
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
        onRowClick={(homework) => navigate(toPath(PATHS.homeworkDetail, { id: homework.id }))}
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
                  aria-label="Filter by status"
                  value={table.filters.status ?? ''}
                  options={HOMEWORK_STATUS_OPTIONS}
                  placeholder="Any status"
                  onChange={(event) => table.setFilter('status', event.target.value || undefined)}
                  className="h-9 w-auto min-w-32 text-sm"
                />
                <Select
                  aria-label="Overdue only"
                  value={table.filters.overdue ?? ''}
                  options={[{ label: 'Past due only', value: '1' }]}
                  placeholder="All dates"
                  onChange={(event) => table.setFilter('overdue', event.target.value || undefined)}
                  className="h-9 w-auto min-w-32 text-sm"
                />
              </>
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<BookOpenCheck className="size-6" />}
            title={table.hasActiveFilters ? 'No homework matches' : 'No homework set yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Set your first homework — attachments and marking come after.'
            }
            action={
              table.hasActiveFilters ? (
                <Button variant="outline" onClick={table.resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Can permissions={[HOMEWORK_PERMISSIONS.create]}>
                  <Button onClick={() => navigate(PATHS.homeworkCreate)}>Set homework</Button>
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
          deleteHomework.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteHomework.isPending}
        isDestructive
        title={hasSubmissions ? 'This homework has submissions' : 'Delete this homework?'}
        confirmLabel="Delete homework"
        message={
          pendingDelete ? (
            hasSubmissions ? (
              <>
                <strong>{pendingDelete.submitted_count}</strong> student
                {pendingDelete.submitted_count === 1 ? ' has' : 's have'} handed in work for{' '}
                <strong>{pendingDelete.title}</strong>, and {pendingDelete.graded_count} of those
                are graded. Deleting it removes their submissions and marks as well. Close it
                instead to stop new submissions while keeping the record.
              </>
            ) : (
              <>
                <strong>{pendingDelete.title}</strong> and its attachments will be removed. This
                cannot be undone.
              </>
            )
          ) : null
        }
      />
    </>
  );
}
