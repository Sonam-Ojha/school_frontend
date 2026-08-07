import { Card, CardBody } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { ToneName } from '@/types/common';

import { formatValue } from '../format';
import type { ReportStat } from '../types';

const TONE_TEXT: Record<ToneName, string> = {
  neutral: 'text-slate-900',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
  info: 'text-brand-700',
};

/** The answer, before the chart that explains it and the table that proves it. */
export function ReportStats({ stats }: { stats: ReportStat[] }) {
  if (stats.length === 0) return null;

  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2',
        stats.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
      )}
    >
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardBody>
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p
              className={cn(
                'mt-0.5 truncate text-xl font-semibold',
                TONE_TEXT[stat.tone ?? 'neutral'],
              )}
            >
              {formatValue(stat.value, stat.format)}
            </p>
            {stat.hint && <p className="mt-0.5 truncate text-xs text-slate-400">{stat.hint}</p>}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
