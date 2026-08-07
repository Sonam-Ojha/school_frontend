import { FileSpreadsheet, Plus } from 'lucide-react';
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
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { buildExamColumns } from '../components/examColumns';
import { EXAM_PERMISSIONS, EXAM_STATUS_OPTIONS, EXAM_TYPE_OPTIONS } from '../constants';
import { useDeleteExam, useExams } from '../hooks/useExams';
import type { Exam } from '../types';

export default function ExamListPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'start_date',
    defaultSortDir: 'desc',
    filterKeys: ['type', 'status'],
  });

  const { data, isLoading, isFetching, error } = useExams(table.queryParams);
  const deleteExam = useDeleteExam();
  const [pendingDelete, setPendingDelete] = useState<Exam | null>(null);

  const columns = buildExamColumns({
    onView: (exam) => navigate(toPath(PATHS.examDetail, { id: exam.id })),
    onEdit: (exam) => navigate(toPath(PATHS.examEdit, { id: exam.id })),
    onDelete: setPendingDelete,
    canUpdate: hasPermission(EXAM_PERMISSIONS.update),
    canDelete: hasPermission(EXAM_PERMISSIONS.delete),
  });

  const hasMarks = (pendingDelete?.marks_entered_papers ?? 0) > 0;

  return (
    <>
      <PageHeader
        title="Examinations"
        description="Schedules, marks entry, results and report cards."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Examinations' }]}
        actions={
          <Can permissions={[EXAM_PERMISSIONS.create]}>
            <Button
              onClick={() => navigate(PATHS.examCreate)}
              leftIcon={<Plus className="size-4" />}
            >
              New exam
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
        onRowClick={(exam) => navigate(toPath(PATHS.examDetail, { id: exam.id }))}
        toolbar={
          <TableToolbar
            search={table.search}
            onSearchChange={table.setSearch}
            searchPlaceholder="Search exams…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            filters={
              <>
                <Select
                  aria-label="Filter by type"
                  value={table.filters.type ?? ''}
                  options={EXAM_TYPE_OPTIONS}
                  placeholder="All types"
                  onChange={(event) => table.setFilter('type', event.target.value || undefined)}
                  className="h-9 w-auto min-w-36 text-sm"
                />
                <Select
                  aria-label="Filter by status"
                  value={table.filters.status ?? ''}
                  options={EXAM_STATUS_OPTIONS}
                  placeholder="Any status"
                  onChange={(event) => table.setFilter('status', event.target.value || undefined)}
                  className="h-9 w-auto min-w-40 text-sm"
                />
              </>
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<FileSpreadsheet className="size-6" />}
            title={table.hasActiveFilters ? 'No exams match' : 'No exams yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Create an exam, schedule its papers, then enter marks.'
            }
            action={
              table.hasActiveFilters ? (
                <Button variant="outline" onClick={table.resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Can permissions={[EXAM_PERMISSIONS.create]}>
                  <Button onClick={() => navigate(PATHS.examCreate)}>New exam</Button>
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
          deleteExam.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteExam.isPending}
        isDestructive
        title={hasMarks ? 'This exam has marks entered' : 'Delete this exam?'}
        confirmLabel="Delete exam"
        message={
          pendingDelete ? (
            hasMarks ? (
              <>
                Marks have been entered for <strong>{pendingDelete.marks_entered_papers}</strong>{' '}
                of {pendingDelete.papers_count} papers in{' '}
                <strong>{pendingDelete.name}</strong>. Deleting the exam removes its timetable,
                every mark and every result derived from them. This cannot be undone.
              </>
            ) : (
              <>
                <strong>{pendingDelete.name}</strong> and its {pendingDelete.papers_count} paper
                {pendingDelete.papers_count === 1 ? '' : 's'} will be removed. This cannot be
                undone.
              </>
            )
          ) : null
        }
      />
    </>
  );
}
