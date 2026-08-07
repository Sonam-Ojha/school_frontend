import { CalendarOff } from 'lucide-react';
import type { ReactNode } from 'react';

import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import { formatTime, formatTimeRange } from '@/lib/time';

import { WEEKDAY_LABELS, WEEKDAY_SHORT } from '../constants';
import type { Period, TimetableGrid, TimetableSlot, Weekday } from '../types';

export interface WeeklyGridProps {
  grid: TimetableGrid;
  /**
   * Renders one cell. Receives null where nothing is scheduled, so a free
   * period can be drawn as an invitation to fill it or as plain empty space
   * depending on who is looking.
   */
  renderCell: (slot: TimetableSlot | null, period: Period, day: Weekday) => ReactNode;
  /** Omit for a read-only grid — a teacher's own week, or a printed copy. */
  onCellClick?: (period: Period, day: Weekday, slot: TimetableSlot | null) => void;
  className?: string;
}

const slotKey = (day: Weekday, periodId: number) => `${day}|${periodId}`;

/**
 * Periods × weekdays, for any timetable.
 *
 * The class, teacher and room views differ only in what a cell says, so they
 * share this component and pass a `renderCell` — three copies of a grid would
 * be three places for the break rows, the sticky first column and the print
 * layout to drift apart.
 *
 * Two layouts, one data source: a real grid from `md` up, and a day-by-day
 * list below it. A six-column grid scrolled sideways on a phone is legible to
 * nobody, and a student checking tomorrow's lessons is on a phone.
 */
export function WeeklyGrid({ grid, renderCell, onCellClick, className }: WeeklyGridProps) {
  const { periods, days, slots } = grid;

  const byCell = new Map<string, TimetableSlot>();
  for (const slot of slots) byCell.set(slotKey(slot.day_of_week, slot.period_id), slot);

  if (periods.length === 0) {
    return (
      <EmptyState
        icon={<CalendarOff className="size-6" />}
        title="No periods defined"
        description="Set up the daily period grid before building a timetable."
      />
    );
  }

  const isInteractive = onCellClick !== undefined;

  return (
    <div className={className}>
      {/* Grid layout — the printable one. */}
      <div className="scrollbar-thin hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            {grid.title} timetable, periods by weekday
          </caption>

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th
                scope="col"
                className="sticky left-0 z-10 w-36 bg-slate-50 px-3 py-2 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase"
              >
                Period
              </th>

              {days.map((day) => (
                <th
                  key={day}
                  scope="col"
                  className="px-2 py-2 text-center text-xs font-semibold tracking-wide text-slate-600 uppercase"
                >
                  <span className="lg:hidden">{WEEKDAY_SHORT[day]}</span>
                  <span className="hidden lg:inline">{WEEKDAY_LABELS[day]}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {periods.map((period) => (
              <tr key={period.id} className="border-b border-slate-100 last:border-0">
                <th
                  scope="row"
                  className={cn(
                    'sticky left-0 z-10 px-3 py-2 text-left align-middle font-normal',
                    period.is_break ? 'bg-amber-50' : 'bg-white',
                  )}
                >
                  <p className="text-sm font-medium text-slate-900">{period.name}</p>
                  <p className="text-xs whitespace-nowrap text-slate-500">
                    {formatTimeRange(period.start_time, period.end_time)}
                  </p>
                </th>

                {/*
                  A break is the same for every day, so it spans the week as one
                  band rather than repeating an identical cell six times.
                */}
                {period.is_break ? (
                  <td
                    colSpan={days.length}
                    className="bg-amber-50 px-3 py-2 text-center text-xs font-medium tracking-wide text-amber-800 uppercase"
                  >
                    {period.name}
                  </td>
                ) : (
                  days.map((day) => {
                    const slot = byCell.get(slotKey(day, period.id)) ?? null;

                    return (
                      <td key={day} className="p-1 align-top">
                        {isInteractive ? (
                          <button
                            type="button"
                            onClick={() => onCellClick(period, day, slot)}
                            aria-label={
                              slot
                                ? `${slot.subject_name}, ${WEEKDAY_LABELS[day]} ${period.name}. Edit.`
                                : `Free — ${WEEKDAY_LABELS[day]} ${period.name}. Add a lesson.`
                            }
                            className={cn(
                              'block w-full rounded-md border px-2 py-1.5 text-left transition-colors',
                              'focus-visible:ring-brand-500 focus-visible:ring-2 focus-visible:outline-none',
                              slot
                                ? 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40'
                                : 'border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50/40',
                            )}
                          >
                            {renderCell(slot, period, day)}
                          </button>
                        ) : (
                          <div
                            className={cn(
                              'rounded-md border px-2 py-1.5',
                              slot ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200',
                            )}
                          >
                            {renderCell(slot, period, day)}
                          </div>
                        )}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Day-by-day list — the small-screen reading of the same slots. */}
      <div className="space-y-4 md:hidden">
        {days.map((day) => (
          <section key={day}>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">{WEEKDAY_LABELS[day]}</h3>

            <ul className="space-y-1.5">
              {periods.map((period) => {
                const slot = byCell.get(slotKey(day, period.id)) ?? null;

                return (
                  <li key={period.id}>
                    <div
                      className={cn(
                        'flex items-start gap-3 rounded-md border px-3 py-2',
                        period.is_break
                          ? 'border-amber-200 bg-amber-50'
                          : slot
                            ? 'border-slate-200 bg-white'
                            : 'border-dashed border-slate-200',
                      )}
                    >
                      <div className="w-16 shrink-0">
                        <p className="text-xs font-medium text-slate-900">{period.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {formatTime(period.start_time)}
                        </p>
                      </div>

                      <div className="min-w-0 flex-1">
                        {period.is_break ? (
                          <p className="text-xs font-medium tracking-wide text-amber-800 uppercase">
                            {period.name}
                          </p>
                        ) : isInteractive ? (
                          <button
                            type="button"
                            onClick={() => onCellClick(period, day, slot)}
                            className="w-full text-left"
                          >
                            {renderCell(slot, period, day)}
                          </button>
                        ) : (
                          renderCell(slot, period, day)
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
