import { AlertTriangle, Clock, Lock, Receipt, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/format';

import { useIsSchoolAdmin, useSubscription } from '../hooks/useSubscription';
import { graceDaysLeft, plural } from '../labels';
import type { Subscription } from '../types';

type Tone = 'info' | 'warning' | 'danger';

interface Notice {
  /** Changes when the situation does, so a dismissed notice comes back when there is news. */
  key: string;
  tone: Tone;
  icon: typeof Clock;
  text: string;
  action?: string;
  dismissible: boolean;
}

const TONES: Record<Tone, string> = {
  info: 'border-brand-200 bg-brand-50 text-brand-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-red-200 bg-red-50 text-red-900',
};

const ICON_TONES: Record<Tone, string> = {
  info: 'text-brand-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
};

/** What, if anything, the signed-in person should be told about the school's subscription. */
function noticeFor(subscription: Subscription, isAdmin: boolean): Notice | null {
  const { state, days_left: daysLeft, open_invoice: invoice } = subscription;

  if (state === 'trial_expired' || state === 'expired') {
    return {
      key: `read-only:${state}`,
      tone: 'danger',
      icon: Lock,
      text: isAdmin
        ? state === 'trial_expired'
          ? 'Your free trial has ended, so the school is read-only: records can be viewed but not changed. Choose a plan to carry on.'
          : 'Your subscription has ended, so the school is read-only: records can be viewed but not changed. Pay the renewal invoice to carry on.'
        : 'The school’s subscription has ended, so records can be viewed but not changed. Please ask your School Admin to renew it.',
      action: isAdmin ? (state === 'trial_expired' ? 'Choose a plan' : 'Renew now') : undefined,
      dismissible: false,
    };
  }

  if (!isAdmin) return null;

  if (state === 'past_due') {
    const grace = graceDaysLeft(subscription) ?? 0;
    return {
      key: `past-due:${invoice?.id ?? 'none'}`,
      tone: 'warning',
      icon: AlertTriangle,
      text: `Your subscription ended on ${formatDate(subscription.current_period_end)}. ${
        invoice ? `Pay invoice ${invoice.number} (${formatCurrency(invoice.balance_due)}) ` : 'Renew '
      }within ${plural(grace, 'day')} to keep full access — after that the school turns read-only.`,
      action: invoice ? 'Pay now' : 'Renew now',
      dismissible: false,
    };
  }

  if (state === 'trial' && daysLeft !== null) {
    return {
      key: `trial:${daysLeft <= 3 ? 'ending' : 'running'}`,
      tone: daysLeft <= 3 ? 'warning' : 'info',
      icon: Clock,
      text:
        daysLeft <= 0
          ? 'Your free trial ends today. Choose a plan to keep everything running without a break.'
          : `Free trial: ${plural(daysLeft, 'day')} left (until ${formatDate(subscription.trial_ends_at)}). Choose a plan to keep everything running without a break.`,
      action: invoice ? 'Pay invoice' : 'Choose a plan',
      dismissible: daysLeft > 3,
    };
  }

  if (state === 'active' && invoice && daysLeft !== null && daysLeft <= 7) {
    return {
      key: `renewal:${invoice.id}`,
      tone: 'info',
      icon: Receipt,
      text: `Your plan renews on ${formatDate(subscription.current_period_end)}. Invoice ${invoice.number} for ${formatCurrency(
        invoice.balance_due,
      )} is due by ${formatDate(invoice.due_date)}.`,
      action: 'View invoice',
      dismissible: true,
    };
  }

  return null;
}

const DISMISSED_KEY = 'school-erp.subscription-notice';

/** Dismissal lasts for this browser session; storage may be unavailable, which only means it comes back. */
function readDismissed(): string | null {
  try {
    return window.sessionStorage.getItem(DISMISSED_KEY);
  } catch {
    return null;
  }
}

function writeDismissed(key: string): void {
  try {
    window.sessionStorage.setItem(DISMISSED_KEY, key);
  } catch {
    /* not remembered: harmless */
  }
}

/**
 * A strip above every page about the school's subscription: the trial
 * running out, a payment overdue, or the school gone read-only. Billing
 * details are for the School Admin; everybody is told when changes are paused.
 */
export function SubscriptionBanner() {
  const subscription = useSubscription();
  const isAdmin = useIsSchoolAdmin();
  const [dismissed, setDismissed] = useState<string | null>(readDismissed);

  if (!subscription.data) return null;
  const notice = noticeFor(subscription.data, isAdmin);
  if (!notice || (notice.dismissible && dismissed === notice.key)) return null;

  const Icon = notice.icon;
  const dismiss = () => {
    setDismissed(notice.key);
    writeDismissed(notice.key);
  };

  return (
    <div
      role={notice.tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 border-b px-4 py-2.5 text-sm sm:items-center sm:px-6 lg:px-8', TONES[notice.tone])}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0 sm:mt-0', ICON_TONES[notice.tone])} aria-hidden />
      <p className="min-w-0 flex-1">{notice.text}</p>
      {notice.action && (
        <Link
          to={PATHS.subscription}
          className="shrink-0 rounded-md bg-white/70 px-3 py-1 text-xs font-semibold ring-1 ring-current/20 hover:bg-white"
        >
          {notice.action}
        </Link>
      )}
      {notice.dismissible && (
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
          aria-label="Dismiss this notice"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
