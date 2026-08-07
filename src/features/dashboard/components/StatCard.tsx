import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardBody } from '@/components/ui/Card';
import { formatValue } from '@/features/reports';
import { cn } from '@/lib/cn';
import type { ToneName } from '@/types/common';

import { STAT_ICONS } from '../constants';
import type { DashboardStat } from '../types';

const VALUE_TONE: Record<ToneName, string> = {
  neutral: 'text-slate-900',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
  info: 'text-brand-700',
};

const ICON_TONE: Record<ToneName, string> = {
  neutral: 'bg-slate-100 text-slate-500',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
  info: 'bg-brand-50 text-brand-600',
};

/**
 * One headline figure.
 *
 * The value goes through the reports module's `formatValue`, so a rupee on
 * the dashboard is written exactly as it is on a report — one decision, not
 * two. What this adds over a report's stat is an icon and somewhere to go: a
 * number nobody can act on is a number that belongs in a report instead.
 */
export function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = STAT_ICONS[stat.icon];
  const tone = stat.tone ?? 'neutral';

  const body = (
    <CardBody className="flex items-start gap-3">
      <span className={cn('rounded-lg p-2', ICON_TONE[tone])}>
        <Icon className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-slate-500">{stat.label}</p>
        <p className={cn('mt-0.5 truncate text-2xl font-semibold', VALUE_TONE[tone])}>
          {formatValue(stat.value, stat.format)}
        </p>
        {stat.hint && <p className="mt-0.5 truncate text-xs text-slate-400">{stat.hint}</p>}
      </div>

      {stat.to && (
        <ArrowRight
          aria-hidden
          className="mt-1 size-4 shrink-0 text-slate-300 transition-colors group-hover:text-brand-600"
        />
      )}
    </CardBody>
  );

  if (!stat.to) return <Card>{body}</Card>;

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <Link to={stat.to} className="block rounded-card focus-visible:outline-none">
        {body}
      </Link>
    </Card>
  );
}

export function StatGrid({ stats }: { stats: DashboardStat[] }) {
  if (stats.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.key} stat={stat} />
      ))}
    </div>
  );
}
