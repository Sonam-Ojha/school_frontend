import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

import { platformApi, platformKeys } from '../api';
import type { NewSchoolInput, PlatformPlan, PlatformSchool } from '../types';
import { announce, Field, fieldError, SELECT_CLASS } from './shared';

const EMPTY: NewSchoolInput = {
  name: '',
  code: '',
  address: '',
  city: '',
  region: '',
  gstin: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  admin_password: '',
  plan_id: 0,
  billing_cycle: 'yearly',
  status: 'trial',
  trial_days: 14,
  seed: 'clean',
  demo_login: false,
  simulate: false,
};

const slug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');

/** Onboarding a school from the console: its details, plan, first admin and starting data. */
export function NewSchoolModal({
  isOpen,
  onClose,
  plans,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  plans: PlatformPlan[];
  onCreated: (school: PlatformSchool) => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<NewSchoolInput>(EMPTY);
  const [codeTouched, setCodeTouched] = useState(false);
  const meta = useQuery({ queryKey: platformKeys.meta(), queryFn: ({ signal }) => platformApi.meta(signal), staleTime: 10 * 60_000 });

  const set = <K extends keyof NewSchoolInput>(key: K, value: NewSchoolInput[K]) => setForm((current) => ({ ...current, [key]: value }));

  const create = useMutation({
    mutationFn: () => platformApi.createSchool({ ...form, plan_id: form.plan_id || plans.find((plan) => plan.is_featured)?.id || plans[0]?.id || 0 }),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      void queryClient.invalidateQueries({ queryKey: platformKeys.all });
      setForm(EMPTY);
      setCodeTouched(false);
      onClose();
      onCreated(result.data);
    },
  });
  const error = (field: string) => fieldError(create.error, field);
  const planId = form.plan_id || plans.find((plan) => plan.is_featured)?.id || plans[0]?.id || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={create.isPending ? () => undefined : onClose}
      title="Onboard a new school"
      description="The school gets its own private database, roles and an administrator account. It is ready to sign in to as soon as this finishes."
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button onClick={() => create.mutate()} isLoading={create.isPending}>
            {create.isPending ? 'Setting up the school…' : 'Create school'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {create.error && !Object.keys((create.error as { errors?: object }).errors ?? {}).length && (
          <Alert tone="danger">{create.error.message}</Alert>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="School name" required error={error('name')} className="sm:col-span-2">
            <Input
              value={form.name}
              onChange={(event) => {
                set('name', event.target.value);
                if (!codeTouched) set('code', slug(event.target.value));
              }}
              placeholder="Greenwood International School"
            />
          </Field>
          <Field label="School address (code)" required error={error('code')} hint={`Opens at ${window.location.host}/${form.code || 'code'}`}>
            <Input
              value={form.code}
              onChange={(event) => {
                setCodeTouched(true);
                set('code', event.target.value.toLowerCase().replace(/\s/g, ''));
              }}
              placeholder="greenwood"
            />
          </Field>
          <Field label="GSTIN" error={error('gstin')} hint="Printed on its invoices, if registered">
            <Input value={form.gstin} onChange={(event) => set('gstin', event.target.value.toUpperCase())} placeholder="29ABCDE1234F1Z5" />
          </Field>
          <Field label="Address" error={error('address')} className="sm:col-span-2">
            <Input value={form.address} onChange={(event) => set('address', event.target.value)} />
          </Field>
          <Field label="City" required error={error('city')}>
            <Input value={form.city} onChange={(event) => set('city', event.target.value)} />
          </Field>
          <Field label="State" error={error('region')} hint="Decides CGST + SGST or IGST">
            <select className={SELECT_CLASS} value={form.region} onChange={(event) => set('region', event.target.value)}>
              <option value="">Choose…</option>
              {(meta.data?.gst_states ?? []).map((state) => (
                <option key={state.code} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
          </Field>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <h3 className="text-sm font-semibold text-slate-900 sm:col-span-2">School administrator</h3>
          <Field label="Name" required error={error('contact_name')}>
            <Input value={form.contact_name} onChange={(event) => set('contact_name', event.target.value)} />
          </Field>
          <Field label="Phone" required error={error('contact_phone')}>
            <Input value={form.contact_phone} onChange={(event) => set('contact_phone', event.target.value)} />
          </Field>
          <Field label="Email (their sign-in)" required error={error('contact_email')}>
            <Input type="email" value={form.contact_email} onChange={(event) => set('contact_email', event.target.value)} />
          </Field>
          <Field label="Password" required error={error('admin_password')} hint="8+ characters with a letter and a number">
            <Input type="text" value={form.admin_password} onChange={(event) => set('admin_password', event.target.value)} autoComplete="new-password" />
          </Field>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <h3 className="text-sm font-semibold text-slate-900 sm:col-span-2">Subscription</h3>
          <Field label="Plan" required error={error('plan_id')}>
            <select className={SELECT_CLASS} value={planId} onChange={(event) => set('plan_id', Number(event.target.value))}>
              {plans
                .filter((plan) => plan.is_active)
                .map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — ₹{plan.price_monthly.toLocaleString('en-IN')}/mo, ₹{plan.price_yearly.toLocaleString('en-IN')}/yr
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Billing cycle">
            <select className={SELECT_CLASS} value={form.billing_cycle} onChange={(event) => set('billing_cycle', event.target.value as 'monthly' | 'yearly')}>
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
            </select>
          </Field>
          <Field label="Start as" hint={form.status === 'active' ? 'The first invoice is raised automatically.' : undefined}>
            <select className={SELECT_CLASS} value={form.status} onChange={(event) => set('status', event.target.value as 'trial' | 'active')}>
              <option value="trial">Free trial</option>
              <option value="active">Paying customer</option>
            </select>
          </Field>
          {form.status === 'trial' && (
            <Field label="Trial length (days)" error={error('trial_days')}>
              <Input type="number" min={1} max={365} value={form.trial_days} onChange={(event) => set('trial_days', Number(event.target.value))} />
            </Field>
          )}
          <Field label="Starting data" className="sm:col-span-2">
            <select className={SELECT_CLASS} value={form.seed} onChange={(event) => set('seed', event.target.value as NewSchoolInput['seed'])}>
              <option value="clean">Empty — the school adds its own classes and students</option>
              <option value="demo">Small sample school — to explore with</option>
              <option value="showcase">Full presentation school — every module filled (takes a few minutes)</option>
            </select>
          </Field>
          <div className="space-y-3 sm:col-span-2">
            <Checkbox
              label="One-click demo accounts on its sign-in page"
              description="For a demonstration school only: anybody can sign in as any role."
              checked={form.demo_login}
              onChange={(event) => set('demo_login', event.target.checked)}
            />
            <Checkbox
              label="Simulate SMS, WhatsApp, GPS and biometric devices"
              description="For a demonstration school only: deliveries and readings are invented."
              checked={form.simulate}
              onChange={(event) => set('simulate', event.target.checked)}
            />
          </div>
        </section>
      </div>
    </Modal>
  );
}
