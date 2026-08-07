import { useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ReportChart } from '@/features/reports';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';

import { ActivityFeed } from '../components/ActivityFeed';
import { AlertPanel } from '../components/AlertPanel';
import { ListPanel } from '../components/ListPanel';
import { StatGrid } from '../components/StatCard';
import { VIEW_LABELS, viewForRoles } from '../constants';
import { useDashboard } from '../hooks/useDashboard';
import type { DashboardView } from '../types';

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}

/**
 * The landing screen, shaped by who is looking at it.
 *
 * One route rather than five: a user only ever holds one of these views, and
 * five URLs would be four `403`s waiting to be linked to. The *server* decides
 * which view from the signed-in user's roles — asking the client would be
 * asking it to authorise itself — and offers a switch only where somebody
 * genuinely holds more than one.
 */
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [preferred, setPreferred] = useState<DashboardView | undefined>();

  const { data, isLoading, isFetching, error } = useDashboard(preferred);

  // Known before the API answers, so the header does not flicker through a
  // wrong label on the way to the right one.
  const view = data?.view ?? viewForRoles(user?.roles ?? []);
  const switchable = (data?.available_views ?? []).length > 1;

  return (
    <>
      <PageHeader
        title={data?.greeting ?? (user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Dashboard')}
        description={
          data?.subject
            ? `${data.subject.student_name} · ${data.subject.class_name}${
                data.subject.section_name ? ` — ${data.subject.section_name}` : ''
              }`
            : `${VIEW_LABELS[view]} view`
        }
        actions={
          switchable && (
            <div
              role="group"
              aria-label="Switch dashboard"
              className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1"
            >
              {data?.available_views.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPreferred(option)}
                  aria-pressed={option === view}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    option === view
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  {VIEW_LABELS[option]}
                </button>
              ))}
            </div>
          )
        }
      />

      {error ? (
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load your dashboard">
              {error.message}
            </Alert>
          </CardBody>
        </Card>
      ) : isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <div className={cn('space-y-4', isFetching && 'opacity-60 transition-opacity')}>
          {data.subject && (
            <Card>
              <CardBody className="flex items-center gap-3">
                <Avatar
                  name={data.subject.student_name}
                  src={data.subject.photo_url}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {data.subject.student_name}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    <code>{data.subject.admission_no}</code> · {data.subject.class_name}
                    {data.subject.section_name ? ` — ${data.subject.section_name}` : ''}
                    {data.subject.relation ? ` · your ${data.subject.relation}` : ''}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          <StatGrid stats={data.stats} />

          <AlertPanel alerts={data.alerts} />

          {data.panels.length > 0 && (
            <div className={cn('grid gap-4', data.panels.length > 1 && 'lg:grid-cols-2')}>
              {data.panels.map((panel) => (
                <Card key={panel.key}>
                  <CardHeader
                    title={panel.title}
                    description={panel.description ?? undefined}
                  />
                  <CardBody>
                    <ReportChart
                      series={panel.series}
                      height={panel.series.chart === 'donut' ? 190 : 210}
                    />
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {data.lists.length > 0 && (
            <div className={cn('grid gap-4', data.lists.length > 1 && 'lg:grid-cols-2')}>
              {data.lists.map((list) => (
                <ListPanel key={list.key} list={list} />
              ))}
            </div>
          )}

          <ActivityFeed activities={data.activities} />
        </div>
      )}
    </>
  );
}
