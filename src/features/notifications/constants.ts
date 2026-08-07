import {
  BedDouble,
  BookOpenCheck,
  Bus,
  CalendarCheck,
  CalendarOff,
  ClipboardList,
  FileSpreadsheet,
  Library,
  Megaphone,
  Settings,
  UserCircle,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import type { Option, ToneName } from '@/types/common';

import type { NotificationPriority, NotificationType } from './types';

export const TYPE_LABELS: Record<NotificationType, string> = {
  fee: 'Fees',
  attendance: 'Attendance',
  leave: 'Leave',
  exam: 'Examinations',
  homework: 'Homework',
  assignment: 'Assignments',
  library: 'Library',
  transport: 'Transport',
  payroll: 'Payroll',
  notice: 'Notices',
  account: 'Your account',
  system: 'System',
};

export const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  fee: Wallet,
  attendance: CalendarCheck,
  leave: CalendarOff,
  exam: FileSpreadsheet,
  homework: BookOpenCheck,
  assignment: ClipboardList,
  library: Library,
  transport: Bus,
  payroll: Wallet,
  notice: Megaphone,
  account: UserCircle,
  system: Settings,
};

/** Where a type this build has not heard of lands, rather than rendering blank. */
export const FALLBACK_TYPE_ICON: LucideIcon = BedDouble;

export const TYPE_OPTIONS: Option<NotificationType>[] = (
  Object.keys(TYPE_LABELS) as NotificationType[]
).map((type) => ({ label: TYPE_LABELS[type], value: type }));

export const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  normal: 'Normal',
  important: 'Important',
  urgent: 'Urgent',
};

export const PRIORITY_TONES: Record<NotificationPriority, ToneName> = {
  normal: 'neutral',
  important: 'warning',
  urgent: 'danger',
};

export const PRIORITY_OPTIONS: Option<NotificationPriority>[] = (
  Object.keys(PRIORITY_LABELS) as NotificationPriority[]
).map((priority) => ({ label: PRIORITY_LABELS[priority], value: priority }));

export const READ_STATE_OPTIONS: Option<string>[] = [
  { label: 'Unread', value: 'unread' },
  { label: 'Read', value: 'read' },
];

export const DELIVERY_TONES: Record<string, ToneName> = {
  sent: 'success',
  pending: 'warning',
  failed: 'danger',
  skipped: 'neutral',
};

export const DELIVERY_LABELS: Record<string, string> = {
  sent: 'Sent',
  pending: 'Queued',
  failed: 'Failed',
  skipped: 'Not sent',
};

/**
 * How often the bell asks.
 *
 * Thirty seconds is often enough that a notification feels prompt and rare
 * enough that a school of nine hundred is not hammering the API for a number
 * that changes a few times an hour. The query is deliberately tiny — a count
 * and the newest few — so the poll costs almost nothing.
 */
export const UNREAD_POLL_INTERVAL = 30_000;

/** Notifications the bell shows before it stops being a preview. */
export const BELL_PREVIEW_SIZE = 6;

/** Past this the badge reads "99+" — an exact count stops being information. */
export const BADGE_CAP = 99;
