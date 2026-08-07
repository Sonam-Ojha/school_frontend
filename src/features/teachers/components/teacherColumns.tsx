import { Eye, Pencil, Trash2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/format';

import { EMPLOYMENT_TYPE_LABELS, STATUS_LABELS, STATUS_TONES } from '../constants';
import type { Teacher } from '../types';

interface TeacherColumnOptions {
  onView: (teacher: Teacher) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export function buildTeacherColumns({
  onView,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: TeacherColumnOptions): Column<Teacher>[] {
  return [
    {
      key: 'full_name',
      header: 'Teacher',
      sortable: true,
      cell: (teacher) => (
        <div className="flex items-center gap-3">
          <Avatar name={teacher.full_name} src={teacher.photo_url} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{teacher.full_name}</p>
            {/* Designation shows here on mobile, where its column is hidden. */}
            <p className="truncate text-xs text-slate-500 md:hidden">{teacher.designation}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'employee_id',
      header: 'Employee ID',
      sortable: true,
      hideBelow: 'sm',
      cell: (teacher) => <code className="text-xs text-slate-600">{teacher.employee_id}</code>,
    },
    {
      key: 'designation',
      header: 'Designation',
      sortable: true,
      hideBelow: 'md',
      cell: (teacher) => (
        <div className="min-w-0">
          <p className="truncate text-slate-800">{teacher.designation}</p>
          {teacher.department && (
            <p className="truncate text-xs text-slate-500">{teacher.department}</p>
          )}
        </div>
      ),
    },
    {
      key: 'subjects_count',
      header: 'Subjects',
      sortable: true,
      align: 'right',
      hideBelow: 'lg',
      cell: (teacher) => teacher.subjects_count || '—',
    },
    {
      key: 'class_teacher_of',
      header: 'Class teacher',
      hideBelow: 'xl',
      cell: (teacher) =>
        teacher.class_teacher_of ?? <span className="text-slate-400">—</span>,
    },
    {
      key: 'experience_years',
      header: 'Experience',
      sortable: true,
      align: 'right',
      hideBelow: 'xl',
      cell: (teacher) =>
        teacher.experience_years > 0 ? `${teacher.experience_years} yr` : 'Fresher',
    },
    {
      key: 'joining_date',
      header: 'Joined',
      sortable: true,
      hideBelow: 'lg',
      cell: (teacher) => formatDate(teacher.joining_date),
    },
    {
      key: 'employment_type',
      header: 'Type',
      hideBelow: 'xl',
      cell: (teacher) => EMPLOYMENT_TYPE_LABELS[teacher.employment_type],
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      hideBelow: 'sm',
      cell: (teacher) => (
        <Badge tone={STATUS_TONES[teacher.status]}>{STATUS_LABELS[teacher.status]}</Badge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (teacher) => (
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={`View ${teacher.full_name}`}
            onClick={() => onView(teacher)}
            leftIcon={<Eye className="size-4" />}
          />
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${teacher.full_name}`}
              onClick={() => onEdit(teacher)}
              leftIcon={<Pencil className="size-4" />}
            />
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Delete ${teacher.full_name}`}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(teacher)}
              leftIcon={<Trash2 className="size-4" />}
            />
          )}
        </div>
      ),
    },
  ];
}
