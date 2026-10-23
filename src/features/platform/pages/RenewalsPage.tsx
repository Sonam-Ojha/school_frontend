import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatDateTime } from '@/lib/format';

import { can, platformApi, platformKeys } from '../api';
import { announce, announceError, daysLeftText, InvoiceStatusBadge, moneyExact, SchoolLink, StateBadge } from '../components/shared';
import { usePlatformAuth } from '../store';
import type { Reminder } from '../types';

const lastReminder = (reminders: Reminder[]): string =>
  reminders.length === 0 ? 'No reminder yet' : `Last reminder ${formatDateTime(reminders[reminders.length - 1]!.at)}${reminders[reminders.length - 1]!.sent ? '' : ' (logged, not emailed)'}`;

/** `/superadmin/renewals`: renewals coming up, trials ending, and overdue invoices — with reminders. */
export default function RenewalsPage() {
  const user = usePlatformAuth((state) => state.user);
  const queryClient = useQueryClient();
  const renewals = useQuery({ queryKey: platformKeys.renewals(), queryFn: ({ signal }) => platformApi.renewals(signal) });
  const meta = useQuery({ queryKey: platformKeys.meta(), queryFn: ({ signal }) => platformApi.meta(signal), staleTime: 10 * 60_000 });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: platformKeys.all });
  const remindInvoice = useMutation({ mutationFn: (id: number) => platformApi.remindInvoice(id), meta: { skipGlobalError: true }, onSuccess: (result) => { announce(result); refresh(); }, onError: announceError });
  const remindSchool = useMutation({ mutationFn: (id: number) => platformApi.remindSchool(id), meta: { skipGlobalError: true }, onSuccess: (result) => { announce(result); refresh(); }, onError: announceError });

  if (renewals.isPending) return <Skeleton className="h-96" />;
  if (renewals.isError) return <Alert tone="danger">{renewals.error.message}</Alert>;
  const { upcoming, trials, overdue } = renewals.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Renewals & reminders"
        description="Renewal invoices are raised automatically before each paid period ends; reminders go out 7 days before, on the due date, and every 5 days while overdue."
      />
      {meta.data && !meta.data.platform_mail && (
        <Alert tone="warning" title="Reminder emails are not being sent">
          Platform email (PLATFORM_SMTP_* in the server’s .env) is not set up, so reminders are logged and shown inside each school’s app, but not emailed.
        </Alert>
      )}

      <Card>
        <CardHeader title="Overdue invoices" description="Past their due date and not paid in full" />
        <CardBody className="p-0">
          {overdue.length === 0 ? (
            <p className="px-6 py-6 text-sm text-slate-500">Nothing is overdue.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {overdue.map((invoice) => (
                <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {invoice.number} · <SchoolLink school={invoice.school} />
                    </p>
                    <p className="text-xs text-slate-500">
                      Due {formatDate(invoice.due_date)} · {moneyExact(invoice.balance_due)} outstanding · {lastReminder(invoice.reminders)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <InvoiceStatusBadge invoice={invoice} />
                    {can(user, 'billing.manage') && (
                      <Button size="sm" variant="outline" leftIcon={<Mail className="size-4" />} onClick={() => remindInvoice.mutate(invoice.id)}>
                        Remind now
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Renewals in the next 45 days" />
        <CardBody className="p-0">
          {upcoming.length === 0 ? (
            <p className="px-6 py-6 text-sm text-slate-500">No renewals in the next 45 days.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map(({ school, renewal_invoice: invoice }) => (
                <li key={school.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
                  <div>
                    <SchoolLink school={school} />
                    <p className="text-xs text-slate-500">
                      {school.plan?.name} · {school.billing_cycle} · paid until {formatDate(school.current_period_end)} ({daysLeftText(school.subscription.days_left)})
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    {invoice ? (
                      <div className="flex items-center gap-2">
                        <span>
                          {invoice.number} · {moneyExact(invoice.total)}
                        </span>
                        <InvoiceStatusBadge invoice={invoice} />
                      </div>
                    ) : (
                      'Renewal invoice will be raised automatically'
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Free trials" />
        <CardBody className="p-0">
          {trials.length === 0 ? (
            <p className="px-6 py-6 text-sm text-slate-500">No school is on a trial.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {trials.map((school) => (
                <li key={school.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
                  <div>
                    <SchoolLink school={school} />
                    <p className="text-xs text-slate-500">
                      {school.contact_name} · {school.contact_phone} · {lastReminder(school.reminders)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StateBadge state={school.subscription.state} />
                    <span className="text-xs text-slate-500">{daysLeftText(school.subscription.days_left)}</span>
                    {can(user, 'schools.trial') && (
                      <Button size="sm" variant="outline" leftIcon={<Mail className="size-4" />} onClick={() => remindSchool.mutate(school.id)}>
                        Remind
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
