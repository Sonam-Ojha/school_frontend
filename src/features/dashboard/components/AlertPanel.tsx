import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardBody } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { ToneName } from '@/types/common';

import { ALERT_ICON } from '../constants';
import type { DashboardAlert } from '../types';

const TONE: Record<ToneName, { border: string; icon: string; title: string }> = {
  neutral: { border: 'border-slate-200', icon: 'text-slate-500', title: 'text-slate-900' },
  info: { border: 'border-brand-200 bg-brand-50/40', icon: 'text-brand-600', title: 'text-brand-900' },
  success: { border: 'border-emerald-200 bg-emerald-50/40', icon: 'text-emerald-600', title: 'text-emerald-900' },
  warning: { border: 'border-amber-200 bg-amber-50/50', icon: 'text-amber-600', title: 'text-amber-900' },
  danger: { border: 'border-red-200 bg-red-50/50', icon: 'text-red-600', title: 'text-red-900' },
};

/**
 * What needs doing.
 *
 * Sorted by urgency across modules rather than grouped by module: somebody
 * opening the dashboard wants the worst thing first, and whether it came from
 * payroll or transport is not what makes it worst. Nothing appears here
 * without somewhere to go — an alert you cannot act on is a worry, not a task.
 */
export function AlertPanel({ alerts }: { alerts: DashboardAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <Card>
      <CardBody className="space-y-2">
        {alerts.map((alert) => {
          const tone = TONE[alert.tone];

          const inner = (
            <div className={cn('flex items-start gap-3 rounded-lg border p-3', tone.border)}>
              <ALERT_ICON aria-hidden className={cn('mt-0.5 size-4 shrink-0', tone.icon)} />

              <div className="min-w-0 flex-1">
                <p className={cn('text-sm font-medium', tone.title)}>{alert.title}</p>
                <p className="text-sm text-slate-600">{alert.detail}</p>
              </div>

              {alert.to && (
                <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand-700 group-hover:underline">
                  {alert.action_label ?? 'Open'}
                  <ArrowRight aria-hidden className="size-3.5" />
                </span>
              )}
            </div>
          );

          return alert.to ? (
            <Link key={alert.key} to={alert.to} className="group block">
              {inner}
            </Link>
          ) : (
            <div key={alert.key}>{inner}</div>
          );
        })}
      </CardBody>
    </Card>
  );
}
