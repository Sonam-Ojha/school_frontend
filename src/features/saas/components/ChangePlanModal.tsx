import { ArrowDownRight, ArrowUpRight, CalendarClock } from 'lucide-react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/format';

import { useChangePlan } from '../hooks/useSubscription';
import type { BillingCycle, PublicPlan, Subscription } from '../types';

import { formatRupees } from './PlanCard';

const priceFor = (plan: PublicPlan, cycle: BillingCycle) => (cycle === 'yearly' ? plan.price_yearly : plan.price_monthly);
const perDay = (plan: PublicPlan, cycle: BillingCycle) => priceFor(plan, cycle) / (cycle === 'yearly' ? 365 : 30);

/** What happens when, in the same terms the API decides it. */
function timingOf(subscription: Subscription, plan: PublicPlan, cycle: BillingCycle) {
  const current = subscription.plan;
  if (subscription.state === 'trial') {
    return {
      icon: CalendarClock,
      text: `The paid period starts when your free trial ends on ${formatDate(subscription.trial_ends_at)}, so no trial days are lost.`,
    };
  }
  if (subscription.state === 'active' && current) {
    return perDay(plan, cycle) > perDay(current, subscription.billing_cycle)
      ? {
          icon: ArrowUpRight,
          text: `An upgrade starts as soon as the invoice is paid. The unused part of your ${current.name} plan is credited on the invoice.`,
        }
      : {
          icon: ArrowDownRight,
          text: `The change takes effect at your next renewal on ${formatDate(subscription.current_period_end)}. Until then nothing changes.`,
        };
  }
  return {
    icon: CalendarClock,
    text: 'Full access is restored as soon as the invoice is paid, and the new period starts that day.',
  };
}

interface ChangePlanModalProps {
  subscription: Subscription;
  plan: PublicPlan | null;
  cycle: BillingCycle;
  onClose: () => void;
}

/** Confirms a plan change. The change itself is an invoice: the plan switches once it is paid. */
export function ChangePlanModal({ subscription, plan, cycle, onClose }: ChangePlanModalProps) {
  const changePlan = useChangePlan();
  if (!plan) return null;

  const timing = timingOf(subscription, plan, cycle);
  const TimingIcon = timing.icon;
  const submit = () =>
    changePlan.mutate({ plan_id: plan.id, billing_cycle: cycle }, { onSuccess: onClose });

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="md"
      title={`Switch to ${plan.name}`}
      description={`Billed ${cycle === 'yearly' ? 'yearly' : 'monthly'}.`}
      closeOnOverlayClick={!changePlan.isPending}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={changePlan.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={changePlan.isPending}>
            Raise invoice
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-slate-700">
              {plan.name} · {cycle === 'yearly' ? '12 months' : '1 month'}
            </span>
            <span className="text-lg font-semibold text-slate-900 tabular-nums">{formatRupees(priceFor(plan, cycle))}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Plus GST. The invoice shows the tax and any credit in full.</p>
        </div>

        <div className="flex gap-3 text-sm text-slate-600">
          <TimingIcon className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
          <p>{timing.text}</p>
        </div>

        {subscription.open_invoice && (
          <Alert tone="warning">
            Invoice {subscription.open_invoice.number} is still unpaid. If it was raised by an earlier plan choice and nothing
            has been paid on it, it is cancelled and replaced by this one.
          </Alert>
        )}
      </div>
    </Modal>
  );
}
