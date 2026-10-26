import {
  Building2,
  CalendarDays,
  Check,
  CreditCard,
  Download,
  LifeBuoy,
  Lock,
  Mail,
  Phone,
  Receipt,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import type { Column } from '@/components/table/types';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatBytes, formatCurrency, formatDate } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { ChangePlanModal } from '../components/ChangePlanModal';
import { CycleToggle, formatRupees, highestStudentLimit, monthlyPrice, PlanCard, yearlySaving } from '../components/PlanCard';
import { UsageMeter } from '../components/UsageMeter';
import { useDownloadInvoice, usePayInvoice, usePlans, useSubscription } from '../hooks/useSubscription';
import { graceDaysLeft, INVOICE_BADGES, plural, STATE_BADGES } from '../labels';
import { ALL_MODULES, MODULE_LABELS } from '../modules';
import type { BillingCycle, PublicPlan, SchoolInvoice, Subscription } from '../types';

/** What the standing means, in a sentence, with the dates that matter. */
function standingText(subscription: Subscription): string {
  const left = subscription.days_left;
  switch (subscription.state) {
    case 'trial':
      return `Your free trial ends on ${formatDate(subscription.trial_ends_at)}${
        left !== null ? ` — ${left <= 0 ? 'today' : `${plural(left, 'day')} left`}` : ''
      }. Choose a plan to carry on without a break; paying early loses no trial days.`;
    case 'trial_expired':
      return `Your free trial ended on ${formatDate(subscription.trial_ends_at)}. The school is read-only until a plan is paid for — nothing has been deleted.`;
    case 'active':
      return subscription.current_period_end
        ? `Paid until ${formatDate(subscription.current_period_end)}${left !== null ? ` (${plural(Math.max(left, 0), 'day')} left)` : ''}. A renewal invoice is raised automatically before then.`
        : 'Your plan is active.';
    case 'past_due':
      return `Your paid period ended on ${formatDate(subscription.current_period_end)}. You have ${plural(
        graceDaysLeft(subscription) ?? 0,
        'day',
      )} of grace left to pay before the school turns read-only.`;
    case 'expired':
      return `Your subscription ended on ${formatDate(subscription.current_period_end)}. The school is read-only until the renewal is paid — nothing has been deleted.`;
    case 'suspended':
      return 'This school’s account is suspended. Please contact support to have it reactivated.';
    case 'cancelled':
      return 'This school’s subscription has been cancelled. Please contact support to restart it.';
  }
}

function PlanSummary({ subscription }: { subscription: Subscription }) {
  const badge = STATE_BADGES[subscription.state];
  const plan = subscription.plan;

  return (
    <Card className="lg:col-span-2">
      <CardBody className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Current plan</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-slate-900">{plan?.name ?? 'No plan'}</h2>
              <Badge tone={badge.tone} withDot>
                {badge.label}
              </Badge>
            </div>
            {plan && <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>}
          </div>
          {plan && (
            <div className="text-right">
              <p className="text-2xl font-semibold text-slate-900 tabular-nums">
                {formatRupees(subscription.billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly)}
              </p>
              <p className="text-xs text-slate-500">
                per {subscription.billing_cycle === 'yearly' ? 'year' : 'month'}, plus GST
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
          <p>{standingText(subscription)}</p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Included in this plan</p>
          <ul className="flex flex-wrap gap-2">
            {ALL_MODULES.map((module) => {
              const included = subscription.modules.includes(module);
              return (
                <li
                  key={module}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset',
                    included ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-50 text-slate-400 ring-slate-200',
                  )}
                  title={included ? 'Included' : 'Not on this plan — upgrade to unlock'}
                >
                  {included ? <Check className="size-3.5" aria-hidden /> : <Lock className="size-3.5" aria-hidden />}
                  {MODULE_LABELS[module]}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            Students, teachers, staff, fees, attendance, examinations, timetable, homework, SMS and email messages, reports and
            settings are part of every plan.
          </p>
        </div>

        {subscription.account_manager && (
          <div className="flex gap-3 rounded-lg bg-brand-50 px-4 py-3 text-sm text-slate-700">
            <UserRound className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
            <p>
              Your account manager is <span className="font-medium text-slate-900">{subscription.account_manager.name}</span> (
              <a href={`mailto:${subscription.account_manager.email}`} className="text-brand-700 hover:underline">
                {subscription.account_manager.email}
              </a>
              ). Support tickets you raise go straight to them.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function UsageCard({ subscription }: { subscription: Subscription }) {
  const { usage, limits } = subscription;
  const mb = (bytes: number) => formatBytes(bytes);

  return (
    <Card>
      <CardHeader title="Usage" description="Against what your plan allows." />
      <CardBody className="space-y-5">
        {usage ? (
          <>
            <UsageMeter label="Active students" used={usage.students} limit={limits.max_students} />
            <UsageMeter
              label="Sign-in accounts"
              used={usage.users}
              limit={limits.max_users}
              hint="Staff, parents and students who can sign in."
            />
            <UsageMeter
              label="File storage"
              used={usage.storage_bytes}
              limit={limits.max_storage_mb === null ? null : limits.max_storage_mb * 1024 * 1024}
              format={mb}
            />
            <dl className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
              <div>
                <dt className="text-slate-500">Teachers</dt>
                <dd className="font-semibold text-slate-900 tabular-nums">{usage.teachers.toLocaleString('en-IN')}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Other staff</dt>
                <dd className="font-semibold text-slate-900 tabular-nums">{usage.staff.toLocaleString('en-IN')}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="text-sm text-slate-500">Usage figures appear here a few minutes after the school is first opened.</p>
        )}
      </CardBody>
    </Card>
  );
}

function OpenInvoice({ subscription }: { subscription: Subscription }) {
  const invoice = subscription.open_invoice;
  const pay = usePayInvoice();
  const download = useDownloadInvoice();
  if (!invoice) return null;

  return (
    <Card className={cn('border-2', invoice.overdue ? 'border-red-200' : 'border-amber-200')}>
      <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              invoice.overdue ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600',
            )}
          >
            <Receipt className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-slate-900">
              Invoice {invoice.number} · {formatCurrency(invoice.balance_due)} {invoice.overdue ? 'overdue' : 'due'}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              {invoice.overdue ? 'Was due' : 'Due'} on {formatDate(invoice.due_date)}
              {invoice.balance_due < invoice.total && ` · ${formatCurrency(invoice.total - invoice.balance_due)} already paid`}
            </p>
            {!subscription.payments.online && subscription.payments.instructions && (
              <p className="mt-2 text-sm whitespace-pre-line text-slate-600">{subscription.payments.instructions}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            leftIcon={<Download className="size-4" />}
            isLoading={download.isPending}
            onClick={() => download.mutate(invoice)}
          >
            Invoice PDF
          </Button>
          {subscription.payments.online && (
            <Button leftIcon={<CreditCard className="size-4" />} isLoading={pay.isPending} onClick={() => pay.mutate(invoice.id)}>
              Pay {formatCurrency(invoice.balance_due)}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function ChangePlan({ subscription }: { subscription: Subscription }) {
  const plans = usePlans();
  const [cycle, setCycle] = useState<BillingCycle>(subscription.billing_cycle);
  const [choice, setChoice] = useState<PublicPlan | null>(null);
  const saving = useMemo(() => Math.max(0, ...(plans.data ?? []).map(yearlySaving)), [plans.data]);
  const blocked = subscription.state === 'suspended' || subscription.state === 'cancelled';
  const paying = subscription.state !== 'trial' && subscription.state !== 'trial_expired';

  return (
    <Card>
      <CardHeader
        title={subscription.state === 'trial' || subscription.state === 'trial_expired' ? 'Choose a plan' : 'Change plan'}
        description="Choosing a plan raises an invoice; the plan switches as soon as it is paid."
        actions={<CycleToggle value={cycle} onChange={setCycle} saving={saving} />}
      />
      <CardBody>
        {plans.isPending ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-80 w-full" />
            ))}
          </div>
        ) : plans.error ? (
          <Alert tone="danger">The plans could not be loaded. {plans.error.message}</Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.data.map((plan) => {
              const isCurrent = plan.id === subscription.plan?.id;
              const isSame = isCurrent && cycle === subscription.billing_cycle && paying;
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  cycle={cycle}
                  studentsAbove={highestStudentLimit(plans.data)}
                  label={isCurrent ? 'Your plan' : undefined}
                  selected={isCurrent}
                  action={
                    <Button
                      fullWidth
                      variant={isSame ? 'outline' : plan.is_featured ? 'primary' : 'secondary'}
                      disabled={isSame || blocked}
                      onClick={() => setChoice(plan)}
                    >
                      {isSame
                        ? 'Current plan'
                        : isCurrent
                          ? `Pay ${cycle === 'yearly' ? 'yearly' : 'monthly'} instead`
                          : paying
                            ? `Switch to ${plan.name} · ${formatRupees(monthlyPrice(plan, cycle))}/mo`
                            : `Choose ${plan.name}`}
                    </Button>
                  }
                />
              );
            })}
          </div>
        )}
      </CardBody>
      {choice && <ChangePlanModal subscription={subscription} plan={choice} cycle={cycle} onClose={() => setChoice(null)} />}
    </Card>
  );
}

function Invoices({ subscription }: { subscription: Subscription }) {
  const pay = usePayInvoice();
  const download = useDownloadInvoice();
  const invoices = subscription.invoices ?? [];

  const columns: Column<SchoolInvoice>[] = [
    {
      key: 'number',
      header: 'Invoice',
      cell: (invoice) => (
        <div>
          <p className="font-medium text-slate-900">{invoice.number}</p>
          <p className="text-xs text-slate-500">Issued {formatDate(invoice.issued_at)}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan & period',
      hideBelow: 'md',
      cell: (invoice) => (
        <div>
          <p className="text-slate-700">
            {invoice.plan_name} · {invoice.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'}
          </p>
          <p className="text-xs text-slate-500">
            {formatDate(invoice.period_start)} – {formatDate(invoice.period_end)}
          </p>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Amount',
      align: 'right',
      cell: (invoice) => (
        <div>
          <p className="font-medium text-slate-900 tabular-nums">{formatCurrency(invoice.total)}</p>
          <p className="text-xs text-slate-500">incl. {formatCurrency(invoice.tax)} GST</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (invoice) => {
        const badge = INVOICE_BADGES[invoice.status === 'open' && invoice.overdue ? 'overdue' : invoice.status];
        return (
          <div>
            <Badge tone={badge.tone}>{badge.label}</Badge>
            <p className="mt-1 text-xs text-slate-500">
              {invoice.status === 'paid'
                ? `Paid ${formatDate(invoice.paid_at)}`
                : invoice.status === 'open'
                  ? `Due ${formatDate(invoice.due_date)}`
                  : ''}
            </p>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (invoice) => (
        <div className="flex justify-end gap-1.5">
          {invoice.status === 'open' && subscription.payments.online && (
            <Button size="sm" onClick={() => pay.mutate(invoice.id)} isLoading={pay.isPending && pay.variables === invoice.id}>
              Pay
            </Button>
          )}
          {invoice.status !== 'void' && (
            <Button
              size="sm"
              variant="outline"
              iconOnly
              aria-label={`Download invoice ${invoice.number}`}
              title="Download PDF"
              leftIcon={<Download className="size-4" />}
              isLoading={download.isPending && download.variables?.id === invoice.id}
              onClick={() => download.mutate(invoice)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader title="Invoices" description="GST tax invoices for every period, ready to download." />
      <DataTable
        columns={columns}
        rows={invoices}
        emptyState={
          <EmptyState
            icon={<Receipt className="size-6" />}
            title="No invoices yet"
            description="Invoices appear here when a plan is chosen or renewed."
          />
        }
      />
    </Card>
  );
}

function SupportStrip({ subscription }: { subscription: Subscription }) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-slate-200 bg-white p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="flex items-center gap-2">
        <LifeBuoy className="size-4 shrink-0 text-brand-600" aria-hidden />
        Questions about your plan or an invoice?
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {subscription.support.email && (
          <a href={`mailto:${subscription.support.email}`} className="inline-flex items-center gap-1.5 hover:text-slate-900">
            <Mail className="size-4" aria-hidden />
            {subscription.support.email}
          </a>
        )}
        {subscription.support.phone && (
          <a href={`tel:${subscription.support.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-slate-900">
            <Phone className="size-4" aria-hidden />
            {subscription.support.phone}
          </a>
        )}
        <Link to={PATHS.support} className="font-medium text-brand-600 hover:underline">
          Raise a ticket
        </Link>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const subscription = useSubscription();
  const isDemo = useAuthStore((state) => state.user?.is_demo ?? false);

  return (
    <>
      <PageHeader
        title="Subscription & billing"
        description="Your plan, what it includes, usage against its limits, and your invoices."
        actions={
          <Link
            to={PATHS.support}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <LifeBuoy className="size-4" aria-hidden />
            Help & support
          </Link>
        }
      />

      {subscription.isPending ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 w-full lg:col-span-2" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : !subscription.data ? (
        <Card>
          <EmptyState
            icon={<Building2 className="size-6" />}
            title="No subscription details"
            description={
              subscription.error?.message && !subscription.error.message.includes('not found')
                ? subscription.error.message
                : 'This school is not run on a subscription, so there is nothing to bill. Plans and invoices appear here when the school is hosted on the platform.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {isDemo && (
            <Alert tone="info" title="Demo account">
              You are signed in with a shared demo account, so plan changes and support tickets are switched off. Everything
              else on this page is live.
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <PlanSummary subscription={subscription.data} />
            <UsageCard subscription={subscription.data} />
          </div>

          <OpenInvoice subscription={subscription.data} />
          <ChangePlan subscription={subscription.data} />
          <Invoices subscription={subscription.data} />
          <SupportStrip subscription={subscription.data} />

          {subscription.data.state !== 'active' && subscription.data.state !== 'trial' && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Sparkles className="size-3.5" aria-hidden />
              Your records are kept safe whatever the state of the subscription.
            </p>
          )}
        </div>
      )}
    </>
  );
}
