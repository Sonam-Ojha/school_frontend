import type { ToneName } from '@/types/common';

import type { Subscription, SubscriptionState, TicketCategory, TicketPriority, TicketStatus } from './types';

/** How each standing reads on a badge. */
export const STATE_BADGES: Record<SubscriptionState, { label: string; tone: ToneName }> = {
  trial: { label: 'Free trial', tone: 'info' },
  trial_expired: { label: 'Trial ended', tone: 'danger' },
  active: { label: 'Active', tone: 'success' },
  past_due: { label: 'Payment overdue', tone: 'warning' },
  expired: { label: 'Expired', tone: 'danger' },
  suspended: { label: 'Suspended', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export const INVOICE_BADGES: Record<'open' | 'paid' | 'void' | 'overdue', { label: string; tone: ToneName }> = {
  open: { label: 'Unpaid', tone: 'warning' },
  overdue: { label: 'Overdue', tone: 'danger' },
  paid: { label: 'Paid', tone: 'success' },
  void: { label: 'Cancelled', tone: 'neutral' },
};

export const TICKET_STATUS_BADGES: Record<TicketStatus, { label: string; tone: ToneName }> = {
  open: { label: 'Open', tone: 'info' },
  in_progress: { label: 'In progress', tone: 'info' },
  waiting: { label: 'Awaiting your reply', tone: 'warning' },
  resolved: { label: 'Resolved', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' },
};

export const TICKET_PRIORITY_BADGES: Record<TicketPriority, { label: string; tone: ToneName }> = {
  low: { label: 'Low', tone: 'neutral' },
  normal: { label: 'Normal', tone: 'neutral' },
  high: { label: 'High', tone: 'warning' },
  urgent: { label: 'Urgent', tone: 'danger' },
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  technical: 'Technical problem',
  billing: 'Billing & invoices',
  account: 'Accounts & access',
  feature: 'Feature request',
  other: 'Something else',
};

export const plural = (count: number, word: string): string => `${count} ${word}${count === 1 ? '' : 's'}`;

/** Days of grace left after the paid period ended, before the school turns read-only. */
export function graceDaysLeft(subscription: Pick<Subscription, 'state' | 'days_left' | 'grace_days'>): number | null {
  if (subscription.state !== 'past_due' || subscription.days_left === null) return null;
  return Math.max(0, subscription.grace_days + subscription.days_left);
}
