import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

import type { BillingCycle, PublicPlan } from '../types';

const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const formatRupees = (amount: number): string => rupees.format(amount);

/** What a plan costs per month on the chosen cycle (yearly is shown as its monthly equivalent). */
export function monthlyPrice(plan: PublicPlan, cycle: BillingCycle): number {
  return cycle === 'yearly' ? Math.round(plan.price_yearly / 12) : plan.price_monthly;
}

/** The yearly saving against paying monthly, as a whole percentage. */
export function yearlySaving(plan: PublicPlan): number {
  const full = plan.price_monthly * 12;
  return full > 0 ? Math.max(0, Math.round(((full - plan.price_yearly) / full) * 100)) : 0;
}

interface PlanCardProps {
  plan: PublicPlan;
  cycle: BillingCycle;
  /** Highlighted as chosen (sign-up, plan change). */
  selected?: boolean;
  onSelect?: () => void;
  /** Replaces the default call to action. */
  action?: ReactNode;
  /** Shown above the name, e.g. "Current plan". */
  label?: string;
}

/** One plan as the pricing page, the sign-up form and the billing page show it. */
export function PlanCard({ plan, cycle, selected = false, onSelect, action, label }: PlanCardProps) {
  const interactive = Boolean(onSelect);
  const Wrapper = interactive ? 'button' : 'div';

  return (
    <Wrapper
      {...(interactive ? { type: 'button' as const, onClick: onSelect, 'aria-pressed': selected } : {})}
      className={cn(
        'relative flex h-full flex-col rounded-card border bg-white p-6 text-left shadow-card transition-colors',
        plan.is_featured ? 'border-brand-300' : 'border-slate-200',
        interactive && 'hover:border-brand-400 focus-visible:outline-2 focus-visible:outline-brand-500',
        selected && 'border-brand-600 ring-2 ring-brand-600',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          {label && <p className="mb-1 text-xs font-semibold tracking-wide text-brand-600 uppercase">{label}</p>}
          <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
        </div>
        {plan.is_featured && <Badge tone="info">Most popular</Badge>}
      </div>
      <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight text-slate-900">
          {formatRupees(monthlyPrice(plan, cycle))}
        </span>
        <span className="text-sm text-slate-500">/ month</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {cycle === 'yearly'
          ? `${formatRupees(plan.price_yearly)} billed yearly${yearlySaving(plan) > 0 ? ` · save ${yearlySaving(plan)}%` : ''}`
          : 'Billed monthly, plus GST'}
      </p>

      <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
        {plan.max_students === null
          ? 'Unlimited students'
          : `Up to ${formatNumber(plan.max_students)} active students`}
      </p>

      <ul className="mt-4 flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2 text-sm text-slate-600">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {action && <div className="mt-6">{action}</div>}
    </Wrapper>
  );
}

interface CycleToggleProps {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  /** Largest yearly saving across the plans shown, for the label. */
  saving?: number;
}

export function CycleToggle({ value, onChange, saving = 0 }: CycleToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-sm font-medium" role="radiogroup">
      {(['monthly', 'yearly'] as const).map((cycle) => (
        <button
          key={cycle}
          type="button"
          role="radio"
          aria-checked={value === cycle}
          onClick={() => onChange(cycle)}
          className={cn(
            'rounded-md px-4 py-1.5 transition-colors',
            value === cycle ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900',
          )}
        >
          {cycle === 'monthly' ? 'Monthly' : `Yearly${saving > 0 ? ` (save ${saving}%)` : ''}`}
        </button>
      ))}
    </div>
  );
}
