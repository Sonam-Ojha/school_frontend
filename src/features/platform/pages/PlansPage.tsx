import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { ALL_MODULES, MODULE_LABELS } from '@/features/saas/modules';

import { can, platformApi, platformKeys } from '../api';
import { announce, announceError, Field, fieldError, limitText, money } from '../components/shared';
import { usePlatformAuth } from '../store';
import type { PlanInput, PlatformPlan } from '../types';

const BLANK: PlanInput = {
  code: '',
  name: '',
  tagline: '',
  price_monthly: 0,
  price_yearly: 0,
  max_students: null,
  max_users: null,
  max_storage_mb: null,
  modules: [],
  features: [],
  is_featured: false,
  is_public: true,
  is_active: true,
  sort_order: 10,
};

/** `/superadmin/plans`: what the platform sells — prices, limits, and which modules each plan switches on. */
export default function PlansPage() {
  const user = usePlatformAuth((state) => state.user);
  const queryClient = useQueryClient();
  const plans = useQuery({ queryKey: platformKeys.plans(), queryFn: ({ signal }) => platformApi.plans(signal) });
  const [editing, setEditing] = useState<PlatformPlan | 'new' | null>(null);
  const [deleting, setDeleting] = useState<PlatformPlan | null>(null);
  const manage = can(user, 'plans.manage');

  const remove = useMutation({
    mutationFn: (plan: PlatformPlan) => platformApi.deletePlan(plan.id),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      setDeleting(null);
      void queryClient.invalidateQueries({ queryKey: platformKeys.all });
    },
    onError: (error) => {
      setDeleting(null);
      announceError(error);
    },
  });

  return (
    <div>
      <PageHeader
        title="Plans & pricing"
        description="Prices before GST, the limits of each plan, and the modules it switches on. A change applies to every school on the plan straight away."
        actions={manage ? <Button leftIcon={<Plus className="size-4" />} onClick={() => setEditing('new')}>New plan</Button> : undefined}
      />

      {plans.isPending ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-96" />
          ))}
        </div>
      ) : plans.isError ? (
        <Alert tone="danger">{plans.error.message}</Alert>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.data.map((plan) => (
            <Card key={plan.id} className={plan.is_featured ? 'ring-2 ring-brand-500' : undefined}>
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-500">{plan.tagline}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {plan.is_featured && <Badge tone="info">Featured</Badge>}
                    {!plan.is_public && <Badge>Hidden</Badge>}
                    {!plan.is_active && <Badge tone="danger">Retired</Badge>}
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {money(plan.price_monthly)}
                    <span className="text-sm font-normal text-slate-500"> / month</span>
                  </p>
                  <p className="text-sm text-slate-500">{money(plan.price_yearly)} / year</p>
                </div>
                <dl className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center text-xs">
                  <div>
                    <dt className="text-slate-500">Students</dt>
                    <dd className="font-semibold text-slate-900">{limitText(plan.max_students)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Users</dt>
                    <dd className="font-semibold text-slate-900">{limitText(plan.max_users)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Storage</dt>
                    <dd className="font-semibold text-slate-900">{plan.max_storage_mb === null ? 'Unlimited' : `${Math.round(plan.max_storage_mb / 1024)} GB`}</dd>
                  </div>
                </dl>
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Modules</p>
                  <ul className="space-y-1">
                    {ALL_MODULES.map((module) => (
                      <li key={module} className={`flex items-center gap-2 text-sm ${plan.modules.includes(module) ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                        <Check className={`size-4 ${plan.modules.includes(module) ? 'text-emerald-600' : 'text-slate-300'}`} aria-hidden />
                        {MODULE_LABELS[module]}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-slate-600">
                  <strong>{plan.schools_count}</strong> school{plan.schools_count === 1 ? '' : 's'} on this plan
                </p>
                {manage && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" leftIcon={<Pencil className="size-4" />} onClick={() => setEditing(plan)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" leftIcon={<Trash2 className="size-4" />} onClick={() => setDeleting(plan)} disabled={plan.schools_count > 0}>
                      Delete
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <PlanModal plan={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting)}
        title={`Delete the ${deleting?.name ?? ''} plan?`}
        message="Only a plan no school is on can be deleted. To stop selling a plan but keep its schools, edit it and untick “Available to new schools”."
        confirmLabel="Delete plan"
        isDestructive
        isLoading={remove.isPending}
      />
    </div>
  );
}

function PlanModal({ plan, onClose }: { plan: PlatformPlan | 'new' | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PlanInput>(BLANK);
  const [features, setFeatures] = useState('');

  useEffect(() => {
    if (plan === null) return;
    const source = plan === 'new' ? BLANK : plan;
    setForm({ ...BLANK, ...source });
    setFeatures(source.features.join('\n'));
  }, [plan]);

  const set = <K extends keyof PlanInput>(key: K, value: PlanInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const numberOrNull = (value: string): number | null => (value === '' ? null : Number(value));

  const save = useMutation({
    mutationFn: () => {
      const input = { ...form, features: features.split('\n').map((line) => line.trim()).filter(Boolean) };
      return plan === 'new' || plan === null ? platformApi.createPlan(input) : platformApi.updatePlan(plan.id, input);
    },
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      void queryClient.invalidateQueries({ queryKey: platformKeys.all });
      onClose();
    },
  });
  const error = (field: string) => fieldError(save.error, field);

  return (
    <Modal
      isOpen={plan !== null}
      onClose={onClose}
      title={plan === 'new' || plan === null ? 'New plan' : `Edit ${plan.name}`}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} isLoading={save.isPending}>
            Save plan
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {save.error && Object.keys((save.error as { errors?: object }).errors ?? {}).length === 0 && (
          <Alert tone="danger" className="sm:col-span-2">
            {save.error.message}
          </Alert>
        )}
        <Field label="Name" required error={error('name')}>
          <Input value={form.name} onChange={(event) => set('name', event.target.value)} />
        </Field>
        <Field label="Code" required error={error('code')} hint="Lower-case, e.g. growth">
          <Input value={form.code} onChange={(event) => set('code', event.target.value.toLowerCase())} />
        </Field>
        <Field label="Tagline" error={error('tagline')} className="sm:col-span-2">
          <Input value={form.tagline} onChange={(event) => set('tagline', event.target.value)} />
        </Field>
        <Field label="Monthly price (₹, before GST)" required error={error('price_monthly')}>
          <Input type="number" min={0} value={form.price_monthly} onChange={(event) => set('price_monthly', Number(event.target.value))} />
        </Field>
        <Field label="Yearly price (₹, before GST)" required error={error('price_yearly')}>
          <Input type="number" min={0} value={form.price_yearly} onChange={(event) => set('price_yearly', Number(event.target.value))} />
        </Field>
        <Field label="Student limit" error={error('max_students')} hint="Empty for unlimited">
          <Input type="number" min={1} value={form.max_students ?? ''} onChange={(event) => set('max_students', numberOrNull(event.target.value))} />
        </Field>
        <Field label="User (sign-in) limit" error={error('max_users')} hint="Empty for unlimited">
          <Input type="number" min={1} value={form.max_users ?? ''} onChange={(event) => set('max_users', numberOrNull(event.target.value))} />
        </Field>
        <Field label="Storage limit (MB)" error={error('max_storage_mb')} hint="Empty for unlimited">
          <Input type="number" min={100} value={form.max_storage_mb ?? ''} onChange={(event) => set('max_storage_mb', numberOrNull(event.target.value))} />
        </Field>
        <Field label="Display order" error={error('sort_order')}>
          <Input type="number" min={0} value={form.sort_order} onChange={(event) => set('sort_order', Number(event.target.value))} />
        </Field>
        <div className="space-y-2 sm:col-span-2">
          <p className="text-sm font-medium text-slate-700">Modules switched on</p>
          <p className="text-xs text-slate-500">
            Students, teachers, staff, admissions, attendance, timetable, homework, exams, fees, notices, reports and settings are in every plan.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ALL_MODULES.map((module) => (
              <Checkbox
                key={module}
                label={MODULE_LABELS[module]}
                checked={form.modules.includes(module)}
                onChange={(event) => set('modules', event.target.checked ? [...form.modules, module] : form.modules.filter((entry) => entry !== module))}
              />
            ))}
          </div>
          {error('modules') && <p className="text-xs font-medium text-red-600">{error('modules')}</p>}
        </div>
        <Field label="Features listed on the pricing page (one per line)" error={error('features')} className="sm:col-span-2">
          <Textarea rows={5} value={features} onChange={(event) => setFeatures(event.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-6 sm:col-span-2">
          <Checkbox label="Featured (“Most popular”)" checked={form.is_featured} onChange={(event) => set('is_featured', event.target.checked)} />
          <Checkbox label="Shown on the website" checked={form.is_public} onChange={(event) => set('is_public', event.target.checked)} />
          <Checkbox label="Available to new schools" checked={form.is_active} onChange={(event) => set('is_active', event.target.checked)} />
        </div>
      </div>
    </Modal>
  );
}
