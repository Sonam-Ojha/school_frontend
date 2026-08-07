import { History } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import { relativeTime } from '@/lib/relativeTime';
import type { ToneName } from '@/types/common';

import { ACTIVITY_ICONS, FALLBACK_ACTIVITY_ICON } from '../constants';
import type { ActivityEntry } from '../types';

const ICON_TONE: Record<ToneName, string> = {
  neutral: 'bg-slate-100 text-slate-500',
  info: 'bg-brand-50 text-brand-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
};

/**
 * What has happened lately.
 *
 * Assembled from the records the modules already write — a payment, an
 * admission, a leave decision, a published result. There is no activity
 * table: one would be a second place for the truth to live, and it would fall
 * silent the first time somebody wrote to a module without remembering to log
 * it here.
 */
export function ActivityFeed({ activities }: { activities: ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader
        title="Recent activity"
        description="Drawn from what the modules recorded — there is no separate log."
      />

      <CardBody>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
            <History className="size-6" />
            <p className="text-sm">Nothing has happened yet today.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {activities.map((entry) => {
              const Icon = ACTIVITY_ICONS[entry.kind] ?? FALLBACK_ACTIVITY_ICON;

              const body = (
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-0.5 shrink-0 rounded-lg p-1.5',
                      ICON_TONE[entry.tone ?? 'neutral'],
                    )}
                  >
                    <Icon aria-hidden className="size-3.5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900">{entry.title}</p>
                    {entry.detail && (
                      <p className="truncate text-xs text-slate-500">{entry.detail}</p>
                    )}
                  </div>

                  <time
                    dateTime={entry.at}
                    title={formatDateTime(entry.at)}
                    className="shrink-0 text-xs whitespace-nowrap text-slate-400"
                  >
                    {relativeTime(entry.at)}
                  </time>
                </div>
              );

              return (
                <li key={entry.id}>
                  {entry.to ? (
                    <Link to={entry.to} className="block rounded-lg hover:bg-slate-50">
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
