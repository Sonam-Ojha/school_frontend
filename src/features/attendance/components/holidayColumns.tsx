import { Pencil, Trash2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/format';

import { HOLIDAY_SCOPE_LABELS, HOLIDAY_TYPE_LABELS, HOLIDAY_TYPE_TONES } from '../constants';
import type { Holiday } from '../types';

interface HolidayColumnOptions {
  onEdit: (holiday: Holiday) => void;
  onDelete: (holiday: Holiday) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

/** `12 Aug 2025` for one day, `12 – 16 Aug 2025` for a range. */
function renderDates(holiday: Holiday) {
  const isSingleDay = holiday.start_date === holiday.end_date;

  return (
    <div>
      <p className="text-sm text-slate-800">
        {isSingleDay
          ? formatDate(holiday.start_date)
          : `${formatDate(holiday.start_date)} – ${formatDate(holiday.end_date)}`}
      </p>
      {!isSingleDay && (
        <p className="text-xs text-slate-500">
          {holiday.days_count} day{holiday.days_count === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}

export function buildHolidayColumns({
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: HolidayColumnOptions): Column<Holiday>[] {
  return [
    {
      key: 'name',
      header: 'Holiday',
      sortable: true,
      cell: (holiday) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{holiday.name}</p>
          {holiday.description && (
            <p className="truncate text-xs text-slate-500">{holiday.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'start_date',
      header: 'Dates',
      sortable: true,
      cell: (holiday) => renderDates(holiday),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      hideBelow: 'md',
      cell: (holiday) => (
        <Badge tone={HOLIDAY_TYPE_TONES[holiday.type]}>{HOLIDAY_TYPE_LABELS[holiday.type]}</Badge>
      ),
    },
    {
      key: 'scope',
      header: 'Applies to',
      hideBelow: 'lg',
      cell: (holiday) => HOLIDAY_SCOPE_LABELS[holiday.scope],
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (holiday) => (
        <div className="flex items-center justify-end gap-0.5">
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${holiday.name}`}
              onClick={() => onEdit(holiday)}
              leftIcon={<Pencil className="size-4" />}
            />
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Delete ${holiday.name}`}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(holiday)}
              leftIcon={<Trash2 className="size-4" />}
            />
          )}
        </div>
      ),
    },
  ];
}
