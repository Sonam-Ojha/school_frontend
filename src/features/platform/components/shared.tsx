import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import type { SubscriptionState } from '@/features/saas/types';
import { ApiError } from '@/lib/apiError';
import { cn } from '@/lib/cn';
import { toast } from '@/store/toastStore';
import type { ToneName } from '@/types/common';

import type { LeadStatus, PlatformInvoice, RuntimeStatus, SchoolRef, TicketPriority, TicketStatus } from '../types';

const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const rupeesExact = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const money = (amount: number | null | undefined): string => (amount === null || amount === undefined ? '—' : rupees.format(amount));
export const moneyExact = (amount: number | null | undefined): string =>
  amount === null || amount === undefined ? '—' : rupeesExact.format(amount);

export const storage = (bytes: number | null | undefined): string => {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
};

export const limitText = (value: number | null, unit = ''): string => (value === null ? 'Unlimited' : `${value.toLocaleString('en-IN')}${unit}`);

const STATE: Record<SubscriptionState, { label: string; tone: ToneName }> = {
  trial: { label: 'Trial', tone: 'info' },
  trial_expired: { label: 'Trial ended', tone: 'danger' },
  active: { label: 'Active', tone: 'success' },
  past_due: { label: 'Payment due', tone: 'warning' },
  expired: { label: 'Expired', tone: 'danger' },
  suspended: { label: 'Suspended', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export const stateLabel = (state: SubscriptionState): string => STATE[state]?.label ?? state;

export function StateBadge({ state }: { state: SubscriptionState }) {
  const entry = STATE[state] ?? { label: state, tone: 'neutral' as const };
  return (
    <Badge tone={entry.tone} withDot>
      {entry.label}
    </Badge>
  );
}

const RUNTIME: Record<RuntimeStatus, { label: string; tone: ToneName }> = {
  running: { label: 'Online', tone: 'success' },
  starting: { label: 'Starting', tone: 'info' },
  stopped: { label: 'Sleeping', tone: 'neutral' },
  failed: { label: 'Failed', tone: 'danger' },
};

export function RuntimeBadge({ status }: { status: RuntimeStatus }) {
  const entry = RUNTIME[status];
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

export function InvoiceStatusBadge({ invoice }: { invoice: Pick<PlatformInvoice, 'status' | 'overdue' | 'amount_paid'> }) {
  if (invoice.status === 'paid') return <Badge tone="success">Paid</Badge>;
  if (invoice.status === 'void') return <Badge tone="neutral">Void</Badge>;
  if (invoice.overdue) return <Badge tone="danger">Overdue</Badge>;
  return invoice.amount_paid > 0 ? <Badge tone="warning">Part-paid</Badge> : <Badge tone="warning">Open</Badge>;
}

export const LEAD_STATUSES: Array<{ value: LeadStatus; label: string; tone: ToneName }> = [
  { value: 'new', label: 'New', tone: 'info' },
  { value: 'contacted', label: 'Contacted', tone: 'warning' },
  { value: 'demo_scheduled', label: 'Demo scheduled', tone: 'warning' },
  { value: 'won', label: 'Won', tone: 'success' },
  { value: 'lost', label: 'Lost', tone: 'neutral' },
];

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const entry = LEAD_STATUSES.find((candidate) => candidate.value === status) ?? LEAD_STATUSES[0]!;
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

export const TICKET_STATUSES: Array<{ value: TicketStatus; label: string; tone: ToneName }> = [
  { value: 'open', label: 'Open', tone: 'info' },
  { value: 'in_progress', label: 'In progress', tone: 'warning' },
  { value: 'waiting', label: 'Waiting on school', tone: 'neutral' },
  { value: 'resolved', label: 'Resolved', tone: 'success' },
  { value: 'closed', label: 'Closed', tone: 'neutral' },
];

export const TICKET_PRIORITIES: Array<{ value: TicketPriority; label: string; tone: ToneName }> = [
  { value: 'low', label: 'Low', tone: 'neutral' },
  { value: 'normal', label: 'Normal', tone: 'info' },
  { value: 'high', label: 'High', tone: 'warning' },
  { value: 'urgent', label: 'Urgent', tone: 'danger' },
];

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const entry = TICKET_STATUSES.find((candidate) => candidate.value === status) ?? TICKET_STATUSES[0]!;
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const entry = TICKET_PRIORITIES.find((candidate) => candidate.value === priority) ?? TICKET_PRIORITIES[1]!;
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

export function SchoolLink({ school }: { school: SchoolRef | null }) {
  if (!school) return <span className="text-slate-400">Deleted school</span>;
  return (
    <Link to={`/schools/${school.id}`} className="font-medium text-slate-900 hover:text-brand-700 hover:underline">
      {school.name}
    </Link>
  );
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: 'default' | 'brand';
}

export function StatCard({ label, value, hint, icon, tone = 'default' }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-card border p-5 shadow-card',
        tone === 'brand' ? 'border-brand-700 bg-brand-600 text-white' : 'border-slate-200 bg-white',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn('text-sm', tone === 'brand' ? 'text-brand-100' : 'text-slate-500')}>{label}</p>
        {icon && <span className={tone === 'brand' ? 'text-brand-100' : 'text-slate-400'}>{icon}</span>}
      </div>
      <p className={cn('mt-2 text-2xl font-semibold tracking-tight', tone === 'brand' ? 'text-white' : 'text-slate-900')}>{value}</p>
      {hint && <p className={cn('mt-1 text-xs', tone === 'brand' ? 'text-brand-100' : 'text-slate-500')}>{hint}</p>}
    </div>
  );
}

/** "12 days left", "ends today", "3 days ago". */
export function daysLeftText(days: number | null): string {
  if (days === null) return '—';
  if (days === 0) return 'ends today';
  return days > 0 ? `${days} day${days === 1 ? '' : 's'} left` : `${-days} day${days === -1 ? '' : 's'} ago`;
}

export const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank transfer (NEFT/IMPS/RTGS)' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'razorpay', label: 'Razorpay (online)' },
];

export const methodLabel = (method: string): string => PAYMENT_METHODS.find((entry) => entry.value === method)?.label ?? method;

/** A labelled field with its server error, for the console's forms. */
export function Field({
  label,
  error,
  hint,
  children,
  className,
  required,
}: {
  label: string;
  error?: string | null;
  hint?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error ? (
        <span role="alert" className="block text-xs font-medium text-red-600">
          {error}
        </span>
      ) : hint ? (
        <span className="block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}

/** The first server message for a field, from a 422. */
export function fieldError(error: unknown, field: string): string | null {
  return error instanceof ApiError ? (error.errors[field]?.[0] ?? null) : null;
}

/** Shows the server's own sentence for what happened. */
export function announce(result: { message: string }): void {
  toast.success(result.message);
}

export function announceError(error: unknown): void {
  toast.error('Not done', error instanceof Error ? error.message : 'Something went wrong.');
}

export const SELECT_CLASS =
  'block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none';
