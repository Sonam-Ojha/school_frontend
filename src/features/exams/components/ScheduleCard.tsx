import { CalendarClock, ClipboardEdit, MapPin, Plus, Send, Trash2, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { EXAM_PERMISSIONS } from '../constants';
import { usePublishSchedule, useRemovePaper } from '../hooks/useExams';
import type { ExamDetail, ExamPaper } from '../types';

import { PaperFormModal } from './PaperFormModal';

/** Papers grouped by date, each day's papers in start-time order. */
function groupByDate(papers: ExamPaper[]): [string, ExamPaper[]][] {
  const groups = new Map<string, ExamPaper[]>();

  for (const paper of papers) {
    groups.set(paper.exam_date, [...(groups.get(paper.exam_date) ?? []), paper]);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rows]) => [date, rows.sort((a, b) => a.start_time.localeCompare(b.start_time))]);
}

/**
 * The exam timetable.
 *
 * Grouped by day rather than listed flat, because that is how a timetable is
 * read — "what is on Tuesday" is the question, not "which papers exist".
 */
export function ScheduleCard({ exam }: { exam: ExamDetail }) {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(EXAM_PERMISSIONS.update);
  const canDelete = hasPermission(EXAM_PERMISSIONS.delete);

  const formModal = useDisclosure();
  const [editing, setEditing] = useState<ExamPaper | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ExamPaper | null>(null);

  const removePaper = useRemovePaper(exam.id);
  const publishSchedule = usePublishSchedule(exam.id);

  const days = useMemo(() => groupByDate(exam.papers), [exam.papers]);
  const isDraft = exam.status === 'draft';

  const openAdd = () => {
    setEditing(null);
    formModal.open();
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Timetable"
          description={`${exam.papers_count} paper${exam.papers_count === 1 ? '' : 's'} across ${exam.classes_count} class${exam.classes_count === 1 ? '' : 'es'}.`}
          actions={
            <Can permissions={[EXAM_PERMISSIONS.update]}>
              <>
                {isDraft && exam.papers.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={publishSchedule.isPending}
                    onClick={() => publishSchedule.mutate()}
                    leftIcon={<Send className="size-4" />}
                  >
                    Publish timetable
                  </Button>
                )}
                <Button size="sm" onClick={openAdd} leftIcon={<Plus className="size-4" />}>
                  Add paper
                </Button>
              </>
            </Can>
          }
        />

        <CardBody className="p-0">
          {exam.papers.length === 0 ? (
            <EmptyState
              icon={<CalendarClock className="size-6" />}
              title="No papers scheduled"
              description="Add a paper for each class-and-subject that sits this exam."
              action={
                <Can permissions={[EXAM_PERMISSIONS.update]}>
                  <Button onClick={openAdd}>Add the first paper</Button>
                </Can>
              }
            />
          ) : (
            <div className="divide-y divide-slate-200">
              {days.map(([date, papers]) => (
                <div key={date}>
                  <p className="bg-slate-50 px-4 py-2 text-xs font-semibold tracking-wide text-slate-600 uppercase sm:px-6">
                    {formatDate(date)}
                  </p>

                  <ul className="divide-y divide-slate-100">
                    {papers.map((paper) => (
                      <li
                        key={paper.id}
                        className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="w-14 shrink-0 text-sm font-medium text-slate-900">
                            {paper.start_time}
                          </span>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {paper.subject_name}
                              </p>
                              <Badge tone="neutral">{paper.subject_code}</Badge>
                              {paper.is_complete && <Badge tone="success">Marks in</Badge>}
                            </div>

                            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                              <span>
                                {paper.class_name}
                                {paper.section_name ? ` — ${paper.section_name}` : ' — all sections'}
                              </span>
                              <span>{paper.duration_minutes} min</span>
                              <span>
                                {paper.max_marks} marks · pass {paper.pass_marks}
                              </span>
                              {paper.room && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="size-3" aria-hidden />
                                  {paper.room}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <span
                            className={cn(
                              'text-xs',
                              paper.is_complete ? 'text-emerald-700' : 'text-slate-500',
                            )}
                          >
                            {paper.marks_entered}/{paper.students_count}
                          </span>

                          <Can permissions={[EXAM_PERMISSIONS.update]}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  toPath(PATHS.examMarks, { id: exam.id, paperId: paper.id }),
                                )
                              }
                              leftIcon={<ClipboardEdit className="size-4" />}
                            >
                              Marks
                            </Button>
                          </Can>

                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              iconOnly
                              aria-label={`Edit ${paper.subject_name} paper`}
                              onClick={() => {
                                setEditing(paper);
                                formModal.open();
                              }}
                              leftIcon={<Pencil className="size-4" />}
                            />
                          )}

                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              iconOnly
                              aria-label={`Remove ${paper.subject_name} paper`}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setPendingDelete(paper)}
                              leftIcon={<Trash2 className="size-4" />}
                            />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardBody>

        {isDraft && exam.papers.length > 0 && (
          <div className="border-t border-slate-200 px-4 py-3 sm:px-6">
            <Alert tone="info">
              This timetable is still a draft. Publish it so students and teachers can see when
              each paper falls.
            </Alert>
          </div>
        )}
      </Card>

      <PaperFormModal
        // Remount per record so `defaultValues` are applied.
        key={editing?.id ?? 'add'}
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        exam={exam}
        paper={editing}
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          removePaper.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={removePaper.isPending}
        isDestructive={(pendingDelete?.marks_entered ?? 0) === 0}
        title={
          pendingDelete && pendingDelete.marks_entered > 0
            ? 'This paper already has marks'
            : 'Remove this paper?'
        }
        confirmLabel={
          pendingDelete && pendingDelete.marks_entered > 0 ? 'Try anyway' : 'Remove paper'
        }
        message={
          pendingDelete ? (
            pendingDelete.marks_entered > 0 ? (
              <>
                <strong>{pendingDelete.marks_entered}</strong> mark
                {pendingDelete.marks_entered === 1 ? ' has' : 's have'} been entered for{' '}
                {pendingDelete.subject_name} ({pendingDelete.class_name}). Removing the paper
                deletes them and changes every affected student&apos;s result.
              </>
            ) : (
              <>
                The {pendingDelete.subject_name} paper for {pendingDelete.class_name} will be
                removed from the timetable.
              </>
            )
          ) : null
        }
      />
    </>
  );
}
