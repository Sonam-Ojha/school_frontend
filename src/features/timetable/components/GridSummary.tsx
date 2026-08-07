import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

import { WEEKDAY_LABELS } from '../constants';
import type { TimetableSummary } from '../types';

interface GridSummaryProps {
  summary: TimetableSummary;
  /** What the load breakdown counts — `Subjects`, `Classes`. */
  loadLabel: string;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn('mt-0.5 text-lg font-semibold', tone ?? 'text-slate-900')}>{value}</p>
    </div>
  );
}

/**
 * The numbers above a grid.
 *
 * Identical for all three views because they are the same count of the same
 * slots — only the load breakdown means something different, and its heading
 * is the caller's to supply.
 */
export function GridSummary({ summary, loadLabel }: GridSummaryProps) {
  const filledPercent =
    summary.teaching_slots === 0
      ? 0
      : Math.round((summary.filled_slots / summary.teaching_slots) * 100);

  return (
    <Card className="print-hidden">
      <CardBody className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Teaching periods" value={String(summary.teaching_slots)} />
          <Stat label="Scheduled" value={String(summary.filled_slots)} />
          <Stat
            label="Free"
            value={String(summary.free_slots)}
            tone={summary.free_slots > 0 ? 'text-amber-700' : 'text-emerald-700'}
          />
          <Stat
            label="Busiest day"
            value={summary.busiest_day === null ? '—' : WEEKDAY_LABELS[summary.busiest_day]}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <p className="text-xs font-medium text-slate-600">Filled</p>
            <p className="text-xs text-slate-500">{filledPercent}%</p>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="bg-brand-500 h-full rounded-full transition-[width] duration-300"
              style={{ width: `${filledPercent}%` }}
            />
          </div>
        </div>

        {summary.load.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-slate-600">{loadLabel} per week</p>
            <div className="flex flex-wrap gap-1.5">
              {summary.load.map((entry) => (
                <Badge key={entry.key} tone="neutral">
                  {entry.label} · {entry.periods}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
