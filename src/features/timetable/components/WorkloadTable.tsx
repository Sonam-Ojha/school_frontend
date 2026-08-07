import { Users } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

import { MAX_PERIODS_PER_DAY } from '../constants';
import type { TeacherWorkload } from '../types';

interface WorkloadTableProps {
  rows: TeacherWorkload[] | undefined;
  isLoading: boolean;
  selectedTeacherId: number | null;
  onSelect: (row: TeacherWorkload) => void;
}

/**
 * Every teacher's week at a glance.
 *
 * The point of the table is the outliers: who is carrying thirty-four periods
 * while somebody else carries eleven, and who has seven lessons crammed into
 * one day. Both are visible only across the whole staff, which is why this
 * sits above the single-teacher grid rather than inside it.
 */
export function WorkloadTable({
  rows,
  isLoading,
  selectedTeacherId,
  onSelect,
}: WorkloadTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        icon={<Users className="size-6" />}
        title="No teaching staff"
        description="Add teachers before building the timetable."
      />
    );
  }

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-600 uppercase">
            <th scope="col" className="px-4 py-2 text-left">
              Teacher
            </th>
            <th scope="col" className="px-3 py-2 text-left">
              Subjects
            </th>
            <th scope="col" className="px-3 py-2 text-right">
              Classes
            </th>
            <th scope="col" className="px-3 py-2 text-right">
              Busiest day
            </th>
            <th scope="col" className="px-4 py-2 text-right">
              Periods / week
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const isSelected = row.teacher_id === selectedTeacherId;
            const isCrammed = row.busiest_day_periods > MAX_PERIODS_PER_DAY;

            return (
              <tr
                key={row.teacher_id}
                onClick={() => onSelect(row)}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(row);
                  }
                }}
                className={cn(
                  'cursor-pointer border-b border-slate-100 last:border-0',
                  'focus-visible:ring-brand-500 focus-visible:ring-2 focus-visible:outline-none',
                  isSelected ? 'bg-brand-50' : 'hover:bg-slate-50',
                )}
              >
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Avatar src={row.photo_url} name={row.teacher_name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{row.teacher_name}</p>
                      <p className="truncate text-xs text-slate-500">
                        <code>{row.employee_id}</code>
                      </p>
                    </div>
                  </div>
                </td>

                <td className="max-w-56 px-3 py-2">
                  <p className="truncate text-xs text-slate-600">
                    {row.subjects.length > 0 ? row.subjects.join(', ') : '—'}
                  </p>
                </td>

                <td className="px-3 py-2 text-right text-slate-700">{row.classes_count}</td>

                <td className="px-3 py-2 text-right">
                  <span className={cn('text-sm', isCrammed && 'font-semibold text-amber-700')}>
                    {row.busiest_day_periods}
                  </span>
                </td>

                <td className="px-4 py-2 text-right">
                  {row.is_overloaded ? (
                    <Badge tone="danger">
                      {row.periods_per_week} / {row.max_periods_per_week}
                    </Badge>
                  ) : (
                    <span className="text-sm font-medium text-slate-900">
                      {row.periods_per_week}
                      <span className="text-xs text-slate-400">
                        {' '}
                        / {row.max_periods_per_week}
                      </span>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
