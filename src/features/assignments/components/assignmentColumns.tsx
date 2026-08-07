import { Eye, ListChecks, Paperclip, Pencil, Trash2, TriangleAlert } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';

import {
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_TONES,
  ASSIGNMENT_TYPE_LABELS,
} from '../constants';
import type { Assignment } from '../types';

interface AssignmentColumnOptions {
  onView: (assignment: Assignment) => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

/** `18 / 30 in · 12 evaluated` — the numbers a teacher actually scans for. */
function renderProgress(assignment: Assignment) {
  if (assignment.status === 'draft') {
    return <span className="text-xs text-slate-400">Not published</span>;
  }

  const outstanding = assignment.students_count - assignment.submitted_count;
  const awaiting = assignment.submitted_count - assignment.evaluated_count;

  return (
    <div className="min-w-0 text-sm">
      <p className="text-slate-900">
        <span className="font-medium">{assignment.submitted_count}</span>
        <span className="text-slate-400"> / {assignment.students_count} in</span>
      </p>
      <p className="text-xs text-slate-500">
        {awaiting > 0 ? `${awaiting} to evaluate` : `${assignment.evaluated_count} evaluated`}
        {outstanding > 0 && (
          <span className={cn(assignment.is_overdue && 'text-amber-700')}>
            {' '}
            · {outstanding} outstanding
          </span>
        )}
      </p>
    </div>
  );
}

export function buildAssignmentColumns({
  onView,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: AssignmentColumnOptions): Column<Assignment>[] {
  return [
    {
      key: 'title',
      header: 'Assignment',
      sortable: true,
      cell: (assignment) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{assignment.title}</span>
            <Badge tone="neutral">{ASSIGNMENT_TYPE_LABELS[assignment.type]}</Badge>
            {assignment.has_rubric && (
              <span
                className="flex items-center gap-0.5 text-xs text-slate-400"
                title="Marked against a rubric"
              >
                <ListChecks className="size-3" aria-hidden />
              </span>
            )}
            {assignment.attachments_count > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-slate-400">
                <Paperclip className="size-3" aria-hidden />
                {assignment.attachments_count}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-slate-500">
            {assignment.subject_name} ({assignment.subject_code})
            {` · ${assignment.class_name}${assignment.section_name ? ` — ${assignment.section_name}` : ''}`}
          </p>
        </div>
      ),
    },
    {
      key: 'teacher_name',
      header: 'Set by',
      sortable: true,
      hideBelow: 'xl',
      cell: (assignment) => assignment.teacher_name,
    },
    {
      key: 'due_date',
      header: 'Due',
      sortable: true,
      hideBelow: 'sm',
      cell: (assignment) => (
        <div className="min-w-0">
          <p className={cn('text-sm', assignment.is_overdue ? 'text-amber-700' : 'text-slate-700')}>
            {formatDate(assignment.due_date)}
            {assignment.is_overdue && (
              <TriangleAlert className="ml-1 inline size-3.5" aria-label="Past due" />
            )}
          </p>
          <p className="text-xs text-slate-500">set {formatDate(assignment.assigned_date)}</p>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Submissions',
      hideBelow: 'md',
      cell: (assignment) => renderProgress(assignment),
    },
    {
      key: 'max_marks',
      header: 'Marks',
      sortable: true,
      align: 'right',
      hideBelow: 'lg',
      cell: (assignment) => (
        <div className="text-sm">
          <p className="text-slate-900">{assignment.max_marks}</p>
          <p className="text-xs text-slate-500">{assignment.weightage_percent}% weight</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      hideBelow: 'sm',
      cell: (assignment) => (
        <div className="space-y-1">
          <Badge tone={ASSIGNMENT_STATUS_TONES[assignment.status]}>
            {ASSIGNMENT_STATUS_LABELS[assignment.status]}
          </Badge>
          {/* Evaluated but unreleased is the state a teacher forgets they are in. */}
          {assignment.status !== 'draft' && (
            <p className="text-xs text-slate-500">
              {assignment.marks_published_at ? 'Marks published' : 'Marks not published'}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (assignment) => (
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={`Open ${assignment.title}`}
            onClick={() => onView(assignment)}
            leftIcon={<Eye className="size-4" />}
          />
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${assignment.title}`}
              onClick={() => onEdit(assignment)}
              leftIcon={<Pencil className="size-4" />}
            />
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Delete ${assignment.title}`}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(assignment)}
              leftIcon={<Trash2 className="size-4" />}
            />
          )}
        </div>
      ),
    },
  ];
}
