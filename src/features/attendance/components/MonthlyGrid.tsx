import { CalendarX } from 'lucide-react';

import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';

import { STATUS_CELL_CLASSES, STATUS_INITIALS, STATUS_LABELS } from '../constants';
import type { MonthlyReport } from '../types';

/** Days in a month, without pulling in a date library. */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Attendance below this is worth flagging on the report. */
const LOW_ATTENDANCE_PERCENT = 75;

/**
 * Person × day grid for one month.
 *
 * Wide by nature — 31 columns plus totals — so it scrolls horizontally inside
 * its own container with the name column pinned, rather than pushing the page
 * sideways.
 */
export function MonthlyGrid({ report }: { report: MonthlyReport }) {
  const totalDays = daysInMonth(report.year, report.month);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const nonWorking = new Set(report.non_working_days);

  if (report.rows.length === 0) {
    return (
      <EmptyState
        icon={<CalendarX className="size-6" />}
        title="No records for this month"
        description="Nobody matched the selected filters, or attendance has not been taken yet."
      />
    );
  }

  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th
              scope="col"
              className="sticky left-0 z-10 min-w-48 bg-slate-50 px-4 py-2 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase"
            >
              Name
            </th>

            {days.map((day) => (
              <th
                key={day}
                scope="col"
                className={cn(
                  'w-7 px-0 py-2 text-center text-[11px] font-semibold',
                  // Weekends and holidays are greyed so a blank cell there
                  // reads as "not a working day", not "nobody marked it".
                  nonWorking.has(day) ? 'bg-slate-100 text-slate-400' : 'text-slate-600',
                )}
              >
                {day}
              </th>
            ))}

            {(['P', 'A', 'V', '%'] as const).map((label) => (
              <th
                key={label}
                scope="col"
                className="w-12 px-1 py-2 text-center text-[11px] font-semibold text-slate-600"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {report.rows.map((row) => {
            const isLow = row.attendance_percent < LOW_ATTENDANCE_PERCENT;

            return (
              <tr key={row.person_id} className="border-b border-slate-100 last:border-0">
                <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-1.5 text-left font-normal">
                  <p className="truncate text-sm text-slate-900">{row.person_name}</p>
                  <p className="truncate text-xs text-slate-500">
                    <code>{row.identifier}</code>
                    {row.group_label ? ` · ${row.group_label}` : ''}
                  </p>
                </th>

                {days.map((day) => {
                  const status = row.days[day] ?? null;

                  return (
                    <td key={day} className="p-0.5 text-center">
                      <span
                        title={status ? STATUS_LABELS[status] : undefined}
                        className={cn(
                          'flex size-6 items-center justify-center rounded text-[11px] font-semibold',
                          status
                            ? STATUS_CELL_CLASSES[status]
                            : nonWorking.has(day)
                              ? 'bg-slate-100'
                              : 'bg-slate-50 text-slate-300',
                        )}
                      >
                        {status ? STATUS_INITIALS[status] : nonWorking.has(day) ? '' : '·'}
                      </span>
                    </td>
                  );
                })}

                <td className="px-1 text-center text-xs font-medium text-emerald-700">
                  {row.present_days}
                </td>
                <td className="px-1 text-center text-xs font-medium text-red-700">
                  {row.absent_days}
                </td>
                <td className="px-1 text-center text-xs font-medium text-slate-600">
                  {row.leave_days}
                </td>
                <td
                  className={cn(
                    'px-1 text-center text-xs font-semibold',
                    isLow ? 'text-red-700' : 'text-slate-900',
                  )}
                >
                  {row.attendance_percent}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
