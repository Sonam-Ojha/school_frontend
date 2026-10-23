import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Ban,
  CalendarPlus,
  Download,
  ExternalLink,
  LogIn,
  Mail,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { schoolSessionKey } from '@/config/constants';
import { MODULE_LABELS } from '@/features/saas/modules';
import { formatDate, formatDateTime, formatNumber, toDateInputValue } from '@/lib/format';

import { can, platformApi, platformKeys } from '../api';
import { InvoiceModal, PaymentModal } from '../components/BillingModals';
import {
  announce,
  announceError,
  daysLeftText,
  Field,
  fieldError,
  InvoiceStatusBadge,
  limitText,
  methodLabel,
  money,
  moneyExact,
  PriorityBadge,
  RuntimeBadge,
  SELECT_CLASS,
  StateBadge,
  storage,
  TicketStatusBadge,
} from '../components/shared';
import { usePlatformAuth } from '../store';
import type { PlatformInvoice, PlatformSchool, SchoolPatch } from '../types';

/** `/superadmin/schools/:id`: one school's profile, subscription, limits, billing, tickets and log. */
export default function SchoolDetailPage() {
  const { id } = useParams();
  const schoolId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = usePlatformAuth((state) => state.user);

  const detail = useQuery({
    queryKey: platformKeys.school(schoolId),
    queryFn: ({ signal }) => platformApi.school(schoolId, signal),
    refetchInterval: 20_000,
  });
  const plans = useQuery({ queryKey: platformKeys.plans(), queryFn: ({ signal }) => platformApi.plans(signal) });

  const [invoiceFor, setInvoiceFor] = useState<PlatformSchool | null>(null);
  const [paying, setPaying] = useState<PlatformInvoice | null>(null);
  const [suspending, setSuspending] = useState(false);
  const [reason, setReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [trialDays, setTrialDays] = useState('7');

  const refresh = () => void queryClient.invalidateQueries({ queryKey: platformKeys.all });
  const useAction = <T,>(run: () => Promise<{ message: string; data: T }>) =>
    useMutation({
      mutationFn: run,
      meta: { skipGlobalError: true },
      onSuccess: (result) => {
        announce(result);
        refresh();
      },
      onError: announceError,
    });

  const suspend = useMutation({
    mutationFn: () => platformApi.suspendSchool(schoolId, reason),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      setSuspending(false);
      setReason('');
      refresh();
    },
  });
  const activate = useAction(() => platformApi.activateSchool(schoolId));
  const restart = useAction(() => platformApi.restartSchool(schoolId));
  const remind = useAction(() => platformApi.remindSchool(schoolId));
  const extend = useAction(() => platformApi.extendTrial(schoolId, Number(trialDays)));
  const remove = useMutation({
    mutationFn: () => platformApi.deleteSchool(schoolId, confirm),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      refresh();
      navigate('/schools');
    },
  });
  const impersonate = useMutation({
    mutationFn: () => platformApi.impersonate(schoolId),
    meta: { skipGlobalError: true },
    onError: announceError,
    onSuccess: (result) => {
      announce(result);
      // The school's app reads its session from its own key and checks it with the school.
      try {
        window.localStorage.setItem(
          schoolSessionKey(result.data.code),
          JSON.stringify({ state: { user: null, token: result.data.token, remember: true }, version: 0 }),
        );
      } catch {
        /* storage disabled: the school will ask for a sign-in */
      }
      window.open(`/${result.data.code}/dashboard`, '_blank', 'noopener');
    },
  });

  if (detail.isPending) return <Skeleton className="h-96" />;
  if (detail.isError) return <Alert tone="danger">{detail.error.message}</Alert>;

  const { school, invoices, payments, tickets, activity } = detail.data;
  const blocked = school.status === 'suspended' || school.status === 'cancelled';

  return (
    <div className="space-y-6">
      <PageHeader
        title={school.name}
        description={`/${school.code} · ${[school.city, school.region].filter(Boolean).join(', ') || 'No address'} · joined ${formatDate(school.created_at)}`}
        breadcrumbs={[{ label: 'Schools', to: '/schools' }, { label: school.name }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <a
              href={`/${school.code}/login`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink className="size-4" aria-hidden /> Open sign-in page
            </a>
            {can(user, 'schools.impersonate') && (
              <Button onClick={() => impersonate.mutate()} isLoading={impersonate.isPending} disabled={blocked} leftIcon={<LogIn className="size-4" />}>
                Login as School Admin
              </Button>
            )}
          </div>
        }
      />

      {school.suspended_reason && (
        <Alert tone="danger" title="Suspended">
          {school.suspended_reason}
        </Alert>
      )}
      {school.runtime.error && school.runtime.status !== 'running' && (
        <Alert tone="warning" title="Server problem">
          {school.runtime.error}
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Subscription</p>
            <div className="mt-2 flex items-center gap-2">
              <StateBadge state={school.subscription.state} />
              <span className="text-xs text-slate-500">{daysLeftText(school.subscription.days_left)}</span>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              {school.plan?.name ?? 'No plan'} · {school.billing_cycle} · {money(school.mrr)}/mo
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Students</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {formatNumber(school.usage?.students ?? 0)}
              <span className="text-base font-normal text-slate-400"> / {limitText(school.limits.max_students)}</span>
            </p>
            <p className="text-xs text-slate-500">
              {formatNumber(school.usage?.teachers ?? 0)} teachers · {formatNumber(school.usage?.staff ?? 0)} staff
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Users & storage</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatNumber(school.usage?.users ?? 0)} <span className="text-sm font-normal text-slate-400">/ {limitText(school.limits.max_users)} logins</span>
            </p>
            <p className="text-xs text-slate-500">
              {storage(school.usage?.storage_bytes)} of {school.limits.max_storage_mb === null ? 'unlimited' : storage(school.limits.max_storage_mb * 1024 * 1024)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Server</p>
            <div className="mt-2 flex items-center gap-2">
              <RuntimeBadge status={school.runtime.status} />
              {school.runtime.started_at && <span className="text-xs text-slate-500">since {formatDateTime(school.runtime.started_at)}</span>}
            </div>
            <p className="mt-2 font-mono text-xs text-slate-500">tables {school.seed === 'existing' ? 'imported' : `#${school.id}`}</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <SchoolForm key={school.updated_at} school={school} plans={plans.data ?? []} canEdit={can(user, 'schools.update')} />

          <Card>
            <CardHeader
              title="Invoices"
              description="GST invoices for this school. Renewal invoices are raised automatically before each period ends."
              actions={
                can(user, 'billing.manage') ? (
                  <Button size="sm" leftIcon={<Plus className="size-4" />} onClick={() => setInvoiceFor(school)}>
                    Raise invoice
                  </Button>
                ) : undefined
              }
            />
            <CardBody className="p-0">
              <InvoiceTable invoices={invoices} onPay={can(user, 'billing.manage') ? setPaying : undefined} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Payment history" />
            <CardBody className="p-0">
              {payments.length === 0 ? (
                <p className="px-6 py-6 text-sm text-slate-500">No payments yet.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-3 text-slate-500">{formatDate(payment.paid_on)}</td>
                        <td className="px-6 py-3 text-slate-700">{payment.invoice_number}</td>
                        <td className="px-6 py-3 text-slate-700">{methodLabel(payment.method)}</td>
                        <td className="px-6 py-3 text-xs text-slate-500">{payment.reference}</td>
                        <td className="px-6 py-3 text-right font-medium text-slate-900">{moneyExact(payment.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Actions" />
            <CardBody className="space-y-3">
              {school.status === 'trial' && can(user, 'schools.trial') && (
                <div className="flex items-end gap-2">
                  <Field label="Extend trial by (days)" className="flex-1">
                    <Input type="number" min={1} max={90} value={trialDays} onChange={(event) => setTrialDays(event.target.value)} />
                  </Field>
                  <Button variant="outline" onClick={() => extend.mutate()} isLoading={extend.isPending} leftIcon={<CalendarPlus className="size-4" />}>
                    Extend
                  </Button>
                </div>
              )}
              {school.status === 'trial' && can(user, 'schools.trial') && (
                <Button variant="outline" fullWidth onClick={() => remind.mutate()} isLoading={remind.isPending} leftIcon={<Mail className="size-4" />}>
                  Send trial reminder
                </Button>
              )}
              {can(user, 'schools.restart') && (
                <Button variant="outline" fullWidth onClick={() => restart.mutate()} isLoading={restart.isPending} leftIcon={<RotateCcw className="size-4" />}>
                  Restart school server
                </Button>
              )}
              {can(user, 'schools.suspend') &&
                (blocked ? (
                  <Button fullWidth onClick={() => activate.mutate()} isLoading={activate.isPending} leftIcon={<ShieldCheck className="size-4" />}>
                    Reactivate school
                  </Button>
                ) : (
                  <Button variant="danger" fullWidth onClick={() => setSuspending(true)} leftIcon={<Ban className="size-4" />}>
                    Suspend school
                  </Button>
                ))}
              {can(user, 'schools.delete') && (
                <Button variant="ghost" fullWidth className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleting(true)} leftIcon={<Trash2 className="size-4" />}>
                  Delete school and all data
                </Button>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Plan modules" description="Switched on by the plan" />
            <CardBody className="flex flex-wrap gap-2">
              {Object.entries(MODULE_LABELS).map(([key, label]) => (
                <Badge key={key} tone={school.modules.includes(key as never) ? 'success' : 'neutral'}>
                  {school.modules.includes(key as never) ? '✓ ' : ''}
                  {label}
                </Badge>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Support tickets" />
            <CardBody className="p-0">
              {tickets.length === 0 ? (
                <p className="px-6 py-6 text-sm text-slate-500">No tickets from this school.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {tickets.map((ticket) => (
                    <li key={ticket.id} className="px-6 py-3">
                      <p className="text-sm font-medium text-slate-900">
                        {ticket.number} · {ticket.subject}
                      </p>
                      <div className="mt-1 flex gap-2">
                        <TicketStatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Activity" />
            <CardBody className="max-h-96 overflow-y-auto p-0">
              <ul className="divide-y divide-slate-100">
                {activity.map((entry) => (
                  <li key={entry.id} className="px-6 py-3">
                    <p className="text-sm text-slate-800">{entry.detail}</p>
                    <p className="text-xs text-slate-500">
                      {entry.actor} · {formatDateTime(entry.at)}
                    </p>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>

      <InvoiceModal school={invoiceFor} plans={plans.data ?? []} onClose={() => setInvoiceFor(null)} />
      <PaymentModal invoice={paying} onClose={() => setPaying(null)} />

      <Modal
        isOpen={suspending}
        onClose={() => setSuspending(false)}
        title={`Suspend ${school.name}?`}
        description="Its users are signed out of everything and cannot sign in until it is reactivated. Its data is kept."
        footer={
          <>
            <Button variant="outline" onClick={() => setSuspending(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => suspend.mutate()} isLoading={suspend.isPending}>
              Suspend
            </Button>
          </>
        }
      >
        <Field label="Reason (shown to the school)" required error={fieldError(suspend.error, 'reason')}>
          <Textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Invoice INV/2026-27/0012 is 30 days overdue." />
        </Field>
      </Modal>

      <Modal
        isOpen={deleting}
        onClose={() => setDeleting(false)}
        title={`Delete ${school.name}?`}
        description="Every student, teacher, fee, exam and file of this school is deleted for good. Invoices are kept for the books. This cannot be undone."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleting(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => remove.mutate()} isLoading={remove.isPending} disabled={confirm !== school.code}>
              Delete for good
            </Button>
          </>
        }
      >
        <Field label={`Type ${school.code} to confirm`} error={fieldError(remove.error, 'confirm') ?? (remove.error?.message ?? null)}>
          <Input value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        </Field>
      </Modal>
    </div>
  );
}

function InvoiceTable({ invoices, onPay }: { invoices: PlatformInvoice[]; onPay?: (invoice: PlatformInvoice) => void }) {
  if (invoices.length === 0) return <p className="px-6 py-6 text-sm text-slate-500">No invoices yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
          <tr>
            <th className="px-6 py-3">Invoice</th>
            <th className="px-6 py-3">Period</th>
            <th className="px-6 py-3 text-right">Total</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="px-6 py-3">
                <p className="font-medium text-slate-900">{invoice.number}</p>
                <p className="text-xs text-slate-500">
                  {invoice.plan_name} · due {formatDate(invoice.due_date)}
                </p>
              </td>
              <td className="px-6 py-3 text-xs text-slate-600">
                {formatDate(invoice.period_start)} – {formatDate(invoice.period_end)}
              </td>
              <td className="px-6 py-3 text-right font-medium text-slate-900">{moneyExact(invoice.total)}</td>
              <td className="px-6 py-3">
                <InvoiceStatusBadge invoice={invoice} />
              </td>
              <td className="px-6 py-3 text-right whitespace-nowrap">
                <Button variant="ghost" size="sm" onClick={() => void platformApi.downloadInvoice(invoice).catch(announceError)} leftIcon={<Download className="size-4" />}>
                  PDF
                </Button>
                {onPay && invoice.status === 'open' && (
                  <Button variant="outline" size="sm" onClick={() => onPay(invoice)}>
                    Record payment
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The school's details, plan, dates, limits and demo switches, editable by Sales and the owner. */
function SchoolForm({ school, plans, canEdit }: { school: PlatformSchool; plans: Array<{ id: number; name: string }>; canEdit: boolean }) {
  const queryClient = useQueryClient();
  const initial = (): SchoolPatch => ({
    name: school.name,
    contact_name: school.contact_name,
    contact_email: school.contact_email,
    contact_phone: school.contact_phone,
    address: school.address,
    city: school.city,
    region: school.region,
    gstin: school.gstin,
    custom_domain: school.custom_domain ?? '',
    plan_id: school.plan?.id,
    billing_cycle: school.billing_cycle,
    trial_ends_at: school.trial_ends_at ? toDateInputValue(school.trial_ends_at) : null,
    current_period_end: school.current_period_end ? toDateInputValue(school.current_period_end) : null,
    limits_override: school.limits_override,
    demo_login: school.demo_login,
    simulate: school.simulate,
    notes: school.notes,
  });
  const [form, setForm] = useState<SchoolPatch>(initial);
  useEffect(() => setForm(initial()), [school.updated_at]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof SchoolPatch>(key: K, value: SchoolPatch[K]) => setForm((current) => ({ ...current, [key]: value }));
  const setLimit = (key: 'max_students' | 'max_users' | 'max_storage_mb', value: string) =>
    setForm((current) => ({
      ...current,
      limits_override: {
        max_students: current.limits_override?.max_students ?? null,
        max_users: current.limits_override?.max_users ?? null,
        max_storage_mb: current.limits_override?.max_storage_mb ?? null,
        [key]: value === '' ? null : Number(value),
      },
    }));

  const save = useMutation({
    mutationFn: () => platformApi.updateSchool(school.id, form),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      void queryClient.invalidateQueries({ queryKey: platformKeys.all });
    },
  });
  const error = (field: string) => fieldError(save.error, field);

  return (
    <Card>
      <CardHeader
        title="School profile & subscription"
        actions={
          canEdit ? (
            <Button size="sm" onClick={() => save.mutate()} isLoading={save.isPending} leftIcon={<Save className="size-4" />}>
              Save changes
            </Button>
          ) : undefined
        }
      />
      <CardBody>
        <fieldset disabled={!canEdit} className="grid gap-4 sm:grid-cols-2">
          {save.error && Object.keys((save.error as { errors?: object }).errors ?? {}).length === 0 && (
            <Alert tone="danger" className="sm:col-span-2">
              {save.error.message}
            </Alert>
          )}
          <Field label="School name" error={error('name')}>
            <Input value={form.name ?? ''} onChange={(event) => set('name', event.target.value)} />
          </Field>
          <Field label="Custom domain" error={error('custom_domain')} hint="Point its DNS at the platform, e.g. erp.greenwood.edu.in">
            <Input value={form.custom_domain ?? ''} onChange={(event) => set('custom_domain', event.target.value)} placeholder="erp.school.edu.in" />
          </Field>
          <Field label="Contact name" error={error('contact_name')}>
            <Input value={form.contact_name ?? ''} onChange={(event) => set('contact_name', event.target.value)} />
          </Field>
          <Field label="Contact phone" error={error('contact_phone')}>
            <Input value={form.contact_phone ?? ''} onChange={(event) => set('contact_phone', event.target.value)} />
          </Field>
          <Field label="Contact email (invoices and reminders)" error={error('contact_email')}>
            <Input type="email" value={form.contact_email ?? ''} onChange={(event) => set('contact_email', event.target.value)} />
          </Field>
          <Field label="GSTIN" error={error('gstin')}>
            <Input value={form.gstin ?? ''} onChange={(event) => set('gstin', event.target.value.toUpperCase())} />
          </Field>
          <Field label="Address" error={error('address')}>
            <Input value={form.address ?? ''} onChange={(event) => set('address', event.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" error={error('city')}>
              <Input value={form.city ?? ''} onChange={(event) => set('city', event.target.value)} />
            </Field>
            <Field label="State" error={error('region')}>
              <Input value={form.region ?? ''} onChange={(event) => set('region', event.target.value)} />
            </Field>
          </div>
          <Field label="Plan" error={error('plan_id')}>
            <select className={SELECT_CLASS} value={form.plan_id ?? ''} onChange={(event) => set('plan_id', Number(event.target.value))}>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Billing cycle" error={error('billing_cycle')}>
            <select className={SELECT_CLASS} value={form.billing_cycle} onChange={(event) => set('billing_cycle', event.target.value as 'monthly' | 'yearly')}>
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
            </select>
          </Field>
          {school.status === 'trial' && (
            <Field label="Trial ends" error={error('trial_ends_at')}>
              <Input type="date" value={form.trial_ends_at ?? ''} onChange={(event) => set('trial_ends_at', event.target.value || null)} />
            </Field>
          )}
          <Field label="Paid until" error={error('current_period_end')} hint="Normally set by payments">
            <Input type="date" value={form.current_period_end ?? ''} onChange={(event) => set('current_period_end', event.target.value || null)} />
          </Field>
          <div className="space-y-2 sm:col-span-2">
            <p className="text-sm font-medium text-slate-700">Limits for this school (empty uses the plan’s)</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={`Students (plan: ${limitText(school.limits.max_students)})`} error={error('limits_override.max_students')}>
                <Input type="number" min={1} value={form.limits_override?.max_students ?? ''} onChange={(event) => setLimit('max_students', event.target.value)} />
              </Field>
              <Field label="Sign-in users" error={error('limits_override.max_users')}>
                <Input type="number" min={1} value={form.limits_override?.max_users ?? ''} onChange={(event) => setLimit('max_users', event.target.value)} />
              </Field>
              <Field label="Storage (MB)" error={error('limits_override.max_storage_mb')}>
                <Input type="number" min={100} value={form.limits_override?.max_storage_mb ?? ''} onChange={(event) => setLimit('max_storage_mb', event.target.value)} />
              </Field>
            </div>
          </div>
          <div className="space-y-3 sm:col-span-2">
            <Checkbox
              label="One-click demo accounts on its sign-in page"
              checked={Boolean(form.demo_login)}
              onChange={(event) => set('demo_login', event.target.checked)}
            />
            <Checkbox
              label="Simulate SMS, WhatsApp, GPS and devices (demonstration only)"
              checked={Boolean(form.simulate)}
              onChange={(event) => set('simulate', event.target.checked)}
            />
          </div>
          <Field label="Internal notes" error={error('notes')} className="sm:col-span-2">
            <Textarea rows={3} value={form.notes ?? ''} onChange={(event) => set('notes', event.target.value)} />
          </Field>
        </fieldset>
      </CardBody>
    </Card>
  );
}
