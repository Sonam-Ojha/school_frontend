import { Eye, IdCard, Pencil, Trash2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ageFrom, formatDate } from '@/lib/format';

import { STATUS_LABELS, STATUS_TONES } from '../constants';
import type { Student } from '../types';

interface StudentColumnOptions {
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onIdCard: (student: Student) => void;
  onDelete: (student: Student) => void;
  canUpdate: boolean;
  canDelete: boolean;
  canPrint: boolean;
}

export function buildStudentColumns({
  onView,
  onEdit,
  onIdCard,
  onDelete,
  canUpdate,
  canDelete,
  canPrint,
}: StudentColumnOptions): Column<Student>[] {
  return [
    {
      key: 'full_name',
      header: 'Student',
      sortable: true,
      cell: (student) => (
        <div className="flex items-center gap-3">
          <Avatar name={student.full_name} src={student.photo_url} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{student.full_name}</p>
            {/* Class shows here on mobile, where its own column is hidden. */}
            <p className="truncate text-xs text-slate-500 md:hidden">
              {student.class_name}
              {student.section_name ? ` — ${student.section_name}` : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'admission_no',
      header: 'Admission no.',
      sortable: true,
      hideBelow: 'sm',
      cell: (student) => <code className="text-xs text-slate-600">{student.admission_no}</code>,
    },
    {
      key: 'class_name',
      header: 'Class',
      sortable: true,
      sortKey: 'class_id',
      hideBelow: 'md',
      cell: (student) =>
        student.section_name ? `${student.class_name} — ${student.section_name}` : student.class_name,
    },
    {
      key: 'roll_no',
      header: 'Roll no.',
      align: 'right',
      hideBelow: 'xl',
      cell: (student) => student.roll_no ?? '—',
    },
    {
      key: 'date_of_birth',
      header: 'Age',
      sortable: true,
      align: 'right',
      hideBelow: 'xl',
      cell: (student) => {
        const age = ageFrom(student.date_of_birth);
        return age === null ? '—' : `${age}`;
      },
    },
    {
      key: 'primary_guardian_name',
      header: 'Primary contact',
      hideBelow: 'lg',
      cell: (student) =>
        student.primary_guardian_name ? (
          <div className="min-w-0">
            <p className="truncate text-slate-800">{student.primary_guardian_name}</p>
            <p className="truncate text-xs text-slate-500">{student.primary_guardian_phone}</p>
          </div>
        ) : (
          <span className="text-slate-400">Not recorded</span>
        ),
    },
    {
      key: 'admission_date',
      header: 'Admitted',
      sortable: true,
      hideBelow: 'xl',
      cell: (student) => formatDate(student.admission_date),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      hideBelow: 'sm',
      cell: (student) => (
        <Badge tone={STATUS_TONES[student.status]}>{STATUS_LABELS[student.status]}</Badge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (student) => (
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={`View ${student.full_name}`}
            onClick={() => onView(student)}
            leftIcon={<Eye className="size-4" />}
          />
          {canPrint && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`ID card for ${student.full_name}`}
              onClick={() => onIdCard(student)}
              leftIcon={<IdCard className="size-4" />}
            />
          )}
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${student.full_name}`}
              onClick={() => onEdit(student)}
              leftIcon={<Pencil className="size-4" />}
            />
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Delete ${student.full_name}`}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(student)}
              leftIcon={<Trash2 className="size-4" />}
            />
          )}
        </div>
      ),
    },
  ];
}
