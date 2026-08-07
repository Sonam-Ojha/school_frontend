import { cn } from '@/lib/cn';

import { STATUS_LABELS } from '../constants';
import type { AttendanceStatus, AttendanceSummary } from '../types';

const DOT_CLASSES: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-500',
  absent: 'bg-red-500',
  late: 'bg-amber-500',
  half_day: 'bg-brand-500',
  leave: 'bg-slate-400',
};

const ORDER: AttendanceStatus[] = ['present', 'absent', 'late', 'half_day', 'leave'];

/**
 * Live tally above the sheet.
 *
 * Unmarked is called out separately from absent — the two are constantly
 * confused, and submitting a sheet where forty rows were simply never touched
 * is the failure this is here to prevent.
 */
export function AttendanceSummaryBar({ summary }: { summary: AttendanceSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-200 px-4 py-3 sm:px-6">
      {ORDER.map((status) => (
        <span key={status} className="flex items-center gap-1.5 text-sm">
          <span className={cn('size-2 rounded-full', DOT_CLASSES[status])} aria-hidden />
          <span className="text-slate-500">{STATUS_LABELS[status]}</span>
          <span className="font-semibold text-slate-900">{summary[status]}</span>
        </span>
      ))}

      <span className="ml-auto flex items-center gap-1.5 text-sm">
        <span className="text-slate-500">Unmarked</span>
        <span
          className={cn(
            'font-semibold',
            summary.unmarked > 0 ? 'text-amber-600' : 'text-slate-900',
          )}
        >
          {summary.unmarked}
        </span>
        <span className="text-slate-400">of {summary.total}</span>
      </span>
    </div>
  );
}
