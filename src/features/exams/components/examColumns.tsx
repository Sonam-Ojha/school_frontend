import { Eye, Pencil, Trash2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';

import { EXAM_STATUS_LABELS, EXAM_STATUS_TONES, EXAM_TYPE_LABELS } from '../constants';
import type { Exam } from '../types';

interface ExamColumnOptions {
  onView: (exam: Exam) => void;
  onEdit: (exam: Exam) => void;
  onDelete: (exam: Exam) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

/** `8 / 12 marked` — how far the marks entry has actually got. */
function renderProgress(exam: Exam) {
  if (exam.papers_count === 0) {
    return <span className="text-xs text-amber-600">No papers</span>;
  }

  const outstanding = exam.papers_count - exam.marks_entered_papers;

  return (
    <div className="min-w-0 text-sm">
      <p className="text-slate-900">
        <span className="font-medium">{exam.marks_entered_papers}</span>
        <span className="text-slate-400"> / {exam.papers_count} marked</span>
      </p>
      {outstanding > 0 && (
        <p className="text-xs text-slate-500">{outstanding} still to enter</p>
      )}
    </div>
  );
}

export function buildExamColumns({
  onView,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: ExamColumnOptions): Column<Exam>[] {
  return [
    {
      key: 'name',
      header: 'Exam',
      sortable: true,
      cell: (exam) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{exam.name}</p>
          <p className="truncate text-xs text-slate-500">
            {EXAM_TYPE_LABELS[exam.type]} · {exam.academic_year_name}
          </p>
        </div>
      ),
    },
    {
      key: 'start_date',
      header: 'Dates',
      sortable: true,
      hideBelow: 'sm',
      cell: (exam) => (
        <div className="min-w-0 text-sm">
          <p className="text-slate-700">
            {exam.start_date === exam.end_date
              ? formatDate(exam.start_date)
              : `${formatDate(exam.start_date)} – ${formatDate(exam.end_date)}`}
          </p>
        </div>
      ),
    },
    {
      key: 'papers_count',
      header: 'Papers',
      sortable: true,
      align: 'right',
      hideBelow: 'md',
      cell: (exam) => exam.papers_count,
    },
    {
      key: 'classes_count',
      header: 'Classes',
      align: 'right',
      hideBelow: 'lg',
      cell: (exam) => exam.classes_count,
    },
    {
      key: 'progress',
      header: 'Marks',
      hideBelow: 'md',
      cell: (exam) => renderProgress(exam),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      hideBelow: 'sm',
      cell: (exam) => (
        <Badge tone={EXAM_STATUS_TONES[exam.status]}>{EXAM_STATUS_LABELS[exam.status]}</Badge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (exam) => (
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={`Open ${exam.name}`}
            onClick={() => onView(exam)}
            leftIcon={<Eye className="size-4" />}
          />
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${exam.name}`}
              onClick={() => onEdit(exam)}
              leftIcon={<Pencil className="size-4" />}
            />
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Delete ${exam.name}`}
              className={cn('text-red-600 hover:bg-red-50 hover:text-red-700')}
              onClick={() => onDelete(exam)}
              leftIcon={<Trash2 className="size-4" />}
            />
          )}
        </div>
      ),
    },
  ];
}
