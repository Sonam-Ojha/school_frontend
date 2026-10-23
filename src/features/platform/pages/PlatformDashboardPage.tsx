import { useQuery } from '@tanstack/react-query';
import { Building2, IndianRupee, Inbox, LifeBuoy, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { BarChart, LineChart } from '@/components/charts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatDateTime, formatNumber } from '@/lib/format';

import { platformApi, platformKeys } from '../api';
import { daysLeftText, money, SchoolLink, StatCard, StateBadge, stateLabel } from '../components/shared';
import type { PlatformSchool } from '../types';

/** `/superadmin/dashboard`: how the business is doing, and what needs attention today. */
export default function PlatformDashboardPage() {
  const overview = useQuery({
    queryKey: platformKeys.overview(),
    queryFn: ({ signal }) => platformApi.overview(signal),
    refetchInterval: 60_000,
  });

  if (overview.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }
  if (overview.isError) return <Alert tone="danger">The dashboard could not be loaded. {overview.error.message}</Alert>;

  const data = overview.data;
  const states = Object.entries(data.schools.by_state).filter(([, count]) => count > 0);
  const total = Math.max(1, data.schools.total);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Schools, revenue and usage across the whole platform." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="brand"
          label="Monthly recurring revenue"
          value={money(data.revenue.mrr)}
          hint={`${money(data.revenue.arr)} a year`}
          icon={<TrendingUp className="size-5" />}
        />
        <StatCard
          label="Schools"
          value={formatNumber(data.schools.total)}
          hint={`${data.schools.by_state.active ?? 0} paying · ${data.schools.by_state.trial ?? 0} on trial · ${data.schools.running} online`}
          icon={<Building2 className="size-5" />}
        />
        <StatCard
          label="Students managed"
          value={formatNumber(data.usage.students)}
          hint={`${formatNumber(data.usage.teachers)} teachers · ${formatNumber(data.usage.staff)} staff · ${formatNumber(data.usage.users)} logins`}
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Collected this month"
          value={money(data.revenue.collected_this_month)}
          hint={data.revenue.outstanding > 0 ? `${money(data.revenue.outstanding)} outstanding · ${data.revenue.overdue_invoices} overdue` : 'Nothing outstanding'}
          icon={<IndianRupee className="size-5" />}
        />
      </div>

      {(data.new_leads > 0 || data.open_tickets > 0) && (
        <div className="flex flex-wrap gap-3">
          {data.new_leads > 0 && (
            <Link to="/enquiries" className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100">
              <Inbox className="size-4" aria-hidden />
              {data.new_leads} new enquir{data.new_leads === 1 ? 'y' : 'ies'} waiting
            </Link>
          )}
          {data.open_tickets > 0 && (
            <Link to="/tickets" className="flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-900 ring-1 ring-brand-200 hover:bg-brand-100">
              <LifeBuoy className="size-4" aria-hidden />
              {data.open_tickets} open support ticket{data.open_tickets === 1 ? '' : 's'}
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Revenue collected" description="Payments received, month by month" />
          <CardBody>
            <BarChart
              series={[{ label: 'Revenue', data: data.monthly.map((month) => ({ label: month.label, value: month.revenue })) }]}
              format={money}
              axisFormat={(value) => (value >= 1000 ? `₹${Math.round(value / 1000)}k` : `₹${value}`)}
              height={240}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Schools by status" />
          <CardBody className="space-y-3">
            {states.map(([state, count]) => (
              <div key={state}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{stateLabel(state as never)}</span>
                  <span className="font-semibold text-slate-900">{count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(count / total) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-3">
              {data.plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between py-1 text-sm">
                  <span className="text-slate-600">
                    {plan.name} <span className="text-slate-400">· {plan.schools}</span>
                  </span>
                  <span className="font-medium text-slate-900">{money(plan.mrr)}/mo</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="New schools" description="Sign-ups per month" />
          <CardBody>
            <LineChart
              series={[{ label: 'New schools', data: data.monthly.map((month) => ({ label: month.label, value: month.signups })) }]}
              format={(value) => formatNumber(value)}
              height={220}
            />
          </CardBody>
        </Card>
        <SchoolList
          title="Trials ending soon"
          description="Follow these up before they lapse"
          empty="No trials end in the next two weeks."
          schools={data.trials_ending}
          detail={(school) => daysLeftText(school.subscription.days_left)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SchoolList
          title="Renewals in the next 30 days"
          description="Renewal invoices are raised automatically"
          empty="No renewals are due in the next 30 days."
          schools={data.renewals_due}
          detail={(school) => `Paid until ${formatDate(school.current_period_end)}`}
        />
        <Card>
          <CardHeader title="Recent activity" actions={<Link to="/audit-logs" className="text-sm font-medium text-brand-600 hover:underline">Audit logs</Link>} />
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {data.recent_activity.map((entry) => (
                <li key={entry.id} className="px-6 py-3">
                  <p className="text-sm text-slate-900">
                    {entry.detail}
                    {entry.school && (
                      <>
                        {' '}· <SchoolLink school={entry.school} />
                      </>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {entry.actor} · {formatDateTime(entry.at)}
                  </p>
                </li>
              ))}
              {data.recent_activity.length === 0 && <li className="px-6 py-8 text-center text-sm text-slate-500">Nothing has happened yet.</li>}
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Newest schools" actions={<Link to="/schools" className="text-sm font-medium text-brand-600 hover:underline">All schools</Link>} />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">School</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Students</th>
                  <th className="px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recent_schools.map((school) => (
                  <tr key={school.id}>
                    <td className="px-6 py-3">
                      <SchoolLink school={school} />
                      <p className="text-xs text-slate-500">
                        /{school.code} · {school.city || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-3 text-slate-700">{school.plan?.name ?? '—'}</td>
                    <td className="px-6 py-3">
                      <StateBadge state={school.subscription.state} />
                    </td>
                    <td className="px-6 py-3 text-right text-slate-700">{formatNumber(school.usage?.students ?? null)}</td>
                    <td className="px-6 py-3 text-slate-500">{formatDate(school.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function SchoolList({
  title,
  description,
  empty,
  schools,
  detail,
}: {
  title: string;
  description: string;
  empty: string;
  schools: PlatformSchool[];
  detail: (school: PlatformSchool) => string;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody className="p-0">
        {schools.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">{empty}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {schools.map((school) => (
              <li key={school.id} className="flex items-center justify-between gap-3 px-6 py-3">
                <div className="min-w-0">
                  <SchoolLink school={school} />
                  <p className="truncate text-xs text-slate-500">
                    {school.plan?.name ?? 'No plan'} · {school.contact_name} · {school.contact_phone}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <StateBadge state={school.subscription.state} />
                  <p className="mt-1 text-xs text-slate-500">{detail(school)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
