import { Eye, Pencil, Trash2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatNumber } from '@/lib/format';

import type { SchoolClassSummary } from '../types';

import { CapacityBar } from './CapacityBar';

interface ClassColumnOptions {
  onView: (schoolClass: SchoolClassSummary) => void;
  onEdit: (schoolClass: SchoolClassSummary) => void;
  onDelete: (schoolClass: SchoolClassSummary) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export function buildClassColumns({
  onView,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: ClassColumnOptions): Column<SchoolClassSummary>[] {
  return [
    {
      key: 'name',
      header: 'Class',
      sortable: true,
      cell: (schoolClass) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{schoolClass.name}</span>
          {!schoolClass.is_active && <Badge tone="neutral">Inactive</Badge>}
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      sortable: true,
      align: 'right',
      hideBelow: 'sm',
      cell: (schoolClass) => schoolClass.level,
    },
    {
      key: 'sections_count',
      header: 'Sections',
      sortable: true,
      align: 'right',
      hideBelow: 'md',
      cell: (schoolClass) =>
        schoolClass.sections_count > 0 ? (
          formatNumber(schoolClass.sections_count)
        ) : (
          // A class with no sections cannot take an admission yet.
          <span className="text-amber-600">None</span>
        ),
    },
    {
      key: 'students_count',
      header: 'Students',
      sortable: true,
      align: 'right',
      hideBelow: 'lg',
      cell: (schoolClass) => formatNumber(schoolClass.students_count),
    },
    {
      key: 'total_capacity',
      header: 'Occupancy',
      hideBelow: 'md',
      width: '14rem',
      cell: (schoolClass) =>
        schoolClass.total_capacity > 0 ? (
          <CapacityBar
            enrolled={schoolClass.students_count}
            capacity={schoolClass.total_capacity}
          />
        ) : (
          <span className="text-xs text-slate-400">No capacity set</span>
        ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (schoolClass) => (
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={`View ${schoolClass.name}`}
            onClick={() => onView(schoolClass)}
            leftIcon={<Eye className="size-4" />}
          />
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${schoolClass.name}`}
              onClick={() => onEdit(schoolClass)}
              leftIcon={<Pencil className="size-4" />}
            />
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Delete ${schoolClass.name}`}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(schoolClass)}
              leftIcon={<Trash2 className="size-4" />}
            />
          )}
        </div>
      ),
    },
  ];
}
