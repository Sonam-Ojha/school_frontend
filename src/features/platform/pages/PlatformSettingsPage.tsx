import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';

import { platformApi, platformKeys } from '../api';
import { announce, Field, fieldError, SELECT_CLASS } from '../components/shared';
import type { PlatformSettings } from '../types';

/** `/superadmin/settings`: white-label branding, the company on invoices, GST, trials, reminders, and your password. */
export default function PlatformSettingsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: platformKeys.settings(), queryFn: ({ signal }) => platformApi.settings(signal) });
  const meta = useQuery({ queryKey: platformKeys.meta(), queryFn: ({ signal }) => platformApi.meta(signal), staleTime: 10 * 60_000 });
  const [form, setForm] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    if (settings.data) setForm(settings.data);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: () => platformApi.updateSettings(form!),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      void queryClient.invalidateQueries({ queryKey: platformKeys.all });
    },
  });
  const error = (field: string) => fieldError(save.error, field);

  if (settings.isPending || !form) return <Skeleton className="h-96" />;
  if (settings.isError) return <Alert tone="danger">{settings.error.message}</Alert>;

  const set = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => setForm((current) => (current ? { ...current, [key]: value } : current));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="How the platform presents itself and bills its schools."
        actions={
          <Button onClick={() => save.mutate()} isLoading={save.isPending} leftIcon={<Save className="size-4" />}>
            Save settings
          </Button>
        }
      />
      {save.error && Object.keys((save.error as { errors?: object }).errors ?? {}).length === 0 && <Alert tone="danger">{save.error.message}</Alert>}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="White-label branding" description="Shown on the website, the console and every school’s sign-in page." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand name" required error={error('brand_name')}>
              <Input value={form.brand_name} onChange={(event) => set('brand_name', event.target.value)} />
            </Field>
            <Field label="Brand colour" required error={error('brand_color')}>
              <div className="flex gap-2">
                <input type="color" value={form.brand_color} onChange={(event) => set('brand_color', event.target.value)} className="h-10 w-14 rounded border border-slate-300" aria-label="Pick colour" />
                <Input value={form.brand_color} onChange={(event) => set('brand_color', event.target.value)} />
              </div>
            </Field>
            <Field label="Logo address" error={error('brand_logo_url')} hint="A full https:// link to a PNG or SVG" className="sm:col-span-2">
              <Input value={form.brand_logo_url} onChange={(event) => set('brand_logo_url', event.target.value)} placeholder="https://…/logo.png" />
            </Field>
            <Field label="Support email" error={error('support_email')}>
              <Input type="email" value={form.support_email} onChange={(event) => set('support_email', event.target.value)} />
            </Field>
            <Field label="Support phone" error={error('support_phone')}>
              <Input value={form.support_phone} onChange={(event) => set('support_phone', event.target.value)} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Company on invoices (GST)" description="Same state as a school: CGST + SGST. Another state: IGST." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" required error={error('company_name')}>
              <Input value={form.company_name} onChange={(event) => set('company_name', event.target.value)} />
            </Field>
            <Field label="State" error={error('company_state')}>
              <select className={SELECT_CLASS} value={form.company_state} onChange={(event) => set('company_state', event.target.value)}>
                <option value="">Choose…</option>
                {(meta.data?.gst_states ?? []).map((state) => (
                  <option key={state.code} value={state.name}>
                    {state.name} ({state.code})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Address" error={error('company_address')} className="sm:col-span-2">
              <Input value={form.company_address} onChange={(event) => set('company_address', event.target.value)} />
            </Field>
            <Field label="GSTIN" error={error('gstin')}>
              <Input value={form.gstin} onChange={(event) => set('gstin', event.target.value.toUpperCase())} placeholder="09ABCDE1234F1Z5" />
            </Field>
            <Field label="PAN" error={error('pan')}>
              <Input value={form.pan} onChange={(event) => set('pan', event.target.value.toUpperCase())} placeholder="ABCDE1234F" />
            </Field>
            <Field label="GST rate (%)" required error={error('tax_percent')}>
              <Input type="number" min={0} max={40} value={form.tax_percent} onChange={(event) => set('tax_percent', Number(event.target.value))} />
            </Field>
            <Field label="SAC code" required error={error('sac_code')}>
              <Input value={form.sac_code} onChange={(event) => set('sac_code', event.target.value)} />
            </Field>
            <Field label="Invoice prefix" required error={error('invoice_prefix')} hint="INV gives INV/2026-27/0001">
              <Input value={form.invoice_prefix} onChange={(event) => set('invoice_prefix', event.target.value.toUpperCase())} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Trials, renewals and reminders" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Free trial (days)" required error={error('trial_days')}>
              <Input type="number" min={1} max={365} value={form.trial_days} onChange={(event) => set('trial_days', Number(event.target.value))} />
            </Field>
            <Field label="Grace after a period ends (days)" required error={error('grace_days')} hint="Full access while payment is late, then read-only">
              <Input type="number" min={0} max={90} value={form.grace_days} onChange={(event) => set('grace_days', Number(event.target.value))} />
            </Field>
            <Field label="Raise renewal invoices (days before)" required error={error('renewal_notice_days')}>
              <Input type="number" min={1} max={90} value={form.renewal_notice_days} onChange={(event) => set('renewal_notice_days', Number(event.target.value))} />
            </Field>
            <Field label="Days to pay an invoice" required error={error('invoice_due_days')}>
              <Input type="number" min={0} max={120} value={form.invoice_due_days} onChange={(event) => set('invoice_due_days', Number(event.target.value))} />
            </Field>
            <div className="sm:col-span-2">
              <Checkbox
                label="Schools can sign up on the website"
                description="Off: only the platform team can onboard new schools."
                checked={form.signup_enabled}
                onChange={(event) => set('signup_enabled', event.target.checked)}
              />
            </div>
            <Field label="Offline payment instructions" error={error('payment_instructions')} hint="Printed on invoices and shown on the school’s Subscription page" className="sm:col-span-2">
              <Textarea rows={3} value={form.payment_instructions} onChange={(event) => set('payment_instructions', event.target.value)} />
            </Field>
            {meta.data && (
              <div className="space-y-1 text-xs text-slate-500 sm:col-span-2">
                <p>Online payments (Razorpay): {meta.data.online_payments ? 'switched on' : 'not set up (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)'}</p>
                <p>Reminder emails: {meta.data.platform_mail ? 'switched on' : 'not set up (PLATFORM_SMTP_*)'}</p>
              </div>
            )}
          </CardBody>
        </Card>

        <PasswordCard />
      </div>
    </div>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const change = useMutation({
    mutationFn: () => platformApi.changePassword({ current_password: current, password: next, password_confirmation: confirm }),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      setCurrent('');
      setNext('');
      setConfirm('');
    },
  });
  const error = (field: string) => fieldError(change.error, field);

  return (
    <Card>
      <CardHeader title="Your password" />
      <CardBody className="space-y-4">
        <Field label="Current password" error={error('current_password')}>
          <Input type="password" value={current} onChange={(event) => setCurrent(event.target.value)} autoComplete="current-password" />
        </Field>
        <Field label="New password" error={error('password')} hint="8+ characters with a letter and a number">
          <Input type="password" value={next} onChange={(event) => setNext(event.target.value)} autoComplete="new-password" />
        </Field>
        <Field label="Repeat the new password" error={error('password_confirmation')}>
          <Input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" />
        </Field>
        <Button variant="outline" onClick={() => change.mutate()} isLoading={change.isPending} leftIcon={<KeyRound className="size-4" />}>
          Change password
        </Button>
      </CardBody>
    </Card>
  );
}
