import { Eye, Paperclip, Pencil, Trash2, TriangleAlert } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';

import { HOMEWORK_STATUS_LABELS, HOMEWORK_STATUS_TONES } from '../constants';
import type { Homework } from '../types';

interface HomeworkColumnOptions {
  onView: (homework: Homework) => void;
  onEdit: (homework: Homework) => void;
  onDelete: (homework: Homework) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

/** `12 / 30 graded` — the two numbers a teacher actually scans for. */
function renderProgress(homework: Homework) {
  if (homework.status === 'draft') {
    return <span className="text-xs text-slate-400">Not published</span>;
  }

  const outstanding = homework.students_count - homework.submitted_count;

  return (
    <div className="min-w-0 text-sm">
      <p className="text-slate-900">
        <span className="font-medium">{homework.submitted_count}</span>
        <span className="text-slate-400"> / {homework.students_count} in</span>
      </p>
      <p className="text-xs text-slate-500">
        {homework.graded_count} graded
        {outstanding > 0 && (
          <span className={cn(homework.is_overdue && 'text-amber-700')}>
            {' '}
            · {outstanding} outstanding
          </span>
        )}
      </p>
    </div>
  );
}

export function buildHomeworkColumns({
  onView,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: HomeworkColumnOptions): Column<Homework>[] {
  return [
    {
      key: 'title',
      header: 'Homework',
      sortable: true,
      cell: (homework) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{homework.title}</span>
            {homework.attachments_count > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-slate-400">
                <Paperclip className="size-3" aria-hidden />
                {homework.attachments_count}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-slate-500">
            {homework.subject_name} ({homework.subject_code})
            {` · ${homework.class_name}${homework.section_name ? ` — ${homework.section_name}` : ''}`}
          </p>
        </div>
      ),
    },
    {
      key: 'teacher_name',
      header: 'Set by',
      sortable: true,
      hideBelow: 'xl',
      cell: (homework) => homework.teacher_name,
    },
    {
      key: 'due_date',
      header: 'Due',
      sortable: true,
      hideBelow: 'sm',
      cell: (homework) => (
        <div className="min-w-0">
          <p className={cn('text-sm', homework.is_overdue ? 'text-amber-700' : 'text-slate-700')}>
            {formatDate(homework.due_date)}
            {homework.is_overdue && (
              <TriangleAlert className="ml-1 inline size-3.5" aria-label="Past due" />
            )}
          </p>
          <p className="text-xs text-slate-500">set {formatDate(homework.assigned_date)}</p>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Submissions',
      hideBelow: 'md',
      cell: (homework) => renderProgress(homework),
    },
    {
      key: 'max_marks',
      header: 'Out of',
      sortable: true,
      align: 'right',
      hideBelow: 'lg',
      cell: (homework) => homework.max_marks,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      hideBelow: 'sm',
      cell: (homework) => (
        <Badge tone={HOMEWORK_STATUS_TONES[homework.status]}>
          {HOMEWORK_STATUS_LABELS[homework.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (homework) => (
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={`Open ${homework.title}`}
            onClick={() => onView(homework)}
            leftIcon={<Eye className="size-4" />}
          />
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${homework.title}`}
              onClick={() => onEdit(homework)}
              leftIcon={<Pencil className="size-4" />}
            />
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Delete ${homework.title}`}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(homework)}
              leftIcon={<Trash2 className="size-4" />}
            />
          )}
        </div>
      ),
    },
  ];
}
