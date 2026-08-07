import { Pencil, Trash2, Users } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import type { Subject } from '../types';

interface SubjectColumnOptions {
  onEdit: (subject: Subject) => void;
  onAssign: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

/**
 * `100  Th 70 + Pr 30` — the split reads at a glance; a bare total hides it.
 *
 * A render helper rather than a component, so this file exports only the
 * column factory and Fast Refresh keeps working (same shape as the other
 * `*Columns.tsx` files).
 */
function renderMarks(subject: Subject) {
  const parts: string[] = [];
  if (subject.has_theory) parts.push(`Th ${subject.theory_max_marks}`);
  if (subject.has_practical) parts.push(`Pr ${subject.practical_max_marks}`);

  return (
    <div className="text-sm">
      <span className="font-medium text-slate-900">{subject.total_max_marks}</span>
      <span className="ml-1.5 text-xs text-slate-500">{parts.join(' + ')}</span>
    </div>
  );
}

export function buildSubjectColumns({
  onEdit,
  onAssign,
  onDelete,
  canUpdate,
  canDelete,
}: SubjectColumnOptions): Column<Subject>[] {
  return [
    {
      key: 'name',
      header: 'Subject',
      sortable: true,
      cell: (subject) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{subject.name}</span>
            {subject.is_elective && <Badge tone="info">Elective</Badge>}
            {!subject.is_active && <Badge tone="neutral">Inactive</Badge>}
          </div>
          {/* Code shows here on mobile, where its own column is hidden. */}
          <code className="text-xs text-slate-500 sm:hidden">{subject.code}</code>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      hideBelow: 'sm',
      cell: (subject) => <code className="text-xs text-slate-600">{subject.code}</code>,
    },
    {
      key: 'components',
      header: 'Components',
      hideBelow: 'md',
      cell: (subject) => (
        <div className="flex flex-wrap gap-1">
          {subject.has_theory && <Badge tone="neutral">Theory</Badge>}
          {subject.has_practical && <Badge tone="success">Practical</Badge>}
        </div>
      ),
    },
    {
      key: 'total_max_marks',
      header: 'Max marks',
      sortable: true,
      align: 'right',
      hideBelow: 'lg',
      cell: (subject) => renderMarks(subject),
    },
    {
      key: 'credits',
      header: 'Credits',
      sortable: true,
      align: 'right',
      hideBelow: 'md',
      cell: (subject) => subject.credits,
    },
    {
      key: 'teachers_count',
      header: 'Teachers',
      sortable: true,
      align: 'right',
      hideBelow: 'sm',
      cell: (subject) =>
        subject.teachers_count > 0 ? (
          subject.teachers_count
        ) : (
          // Nobody can teach it — worth surfacing before timetabling.
          <span className="text-amber-600">None</span>
        ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (subject) => (
        <div className="flex items-center justify-end gap-0.5">
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Assign teachers to ${subject.name}`}
              onClick={() => onAssign(subject)}
              leftIcon={<Users className="size-4" />}
            />
          )}
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${subject.name}`}
              onClick={() => onEdit(subject)}
              leftIcon={<Pencil className="size-4" />}
            />
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Delete ${subject.name}`}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(subject)}
              leftIcon={<Trash2 className="size-4" />}
            />
          )}
        </div>
      ),
    },
  ];
}
