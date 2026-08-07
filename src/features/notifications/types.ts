import type { Channel } from '@/features/communication/types';

/**
 * Notifications.
 *
 * Deliberately **not** the communication module, and the line between them is
 * the whole design. Communication is a person composing an outbound broadcast
 * — "send this SMS to Class 8 parents" — with an audience, a template and an
 * approval step. A notification is the *system* telling *one* person that
 * something happened to them: their leave was approved, a fee fell due, their
 * homework was marked. Nobody writes one; they are raised by the modules that
 * caused them.
 *
 * That difference is why this module has read/unread state, a bell and a
 * per-user inbox, and why communication has an audience picker and a segment
 * counter. Merging them would give one screen that does neither job.
 *
 * What *is* shared is delivery: an email notification goes out over the same
 * SMTP settings a bulk email does, and this module reads that channel's
 * readiness rather than checking it again.
 */

/** The module that raised it — drives the icon and where "open" goes. */
export type NotificationType =
  | 'fee'
  | 'attendance'
  | 'leave'
  | 'exam'
  | 'homework'
  | 'assignment'
  | 'library'
  | 'transport'
  | 'payroll'
  | 'notice'
  | 'account'
  | 'system';

/**
 * How loudly it should arrive.
 *
 * `urgent` is the only level allowed to interrupt — a bus breakdown, a
 * closure. Everything else waits in the bell. A system where three quarters
 * of notifications are urgent is a system whose bell nobody reads.
 */
export type NotificationPriority = 'normal' | 'important' | 'urgent';

/**
 * Per-channel outcome for one notification.
 *
 * Recorded rather than derived: an email that bounced last Tuesday must keep
 * saying so after the address is corrected, and "we tried and it failed" is a
 * different thing from "we never tried".
 */
export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export interface NotificationDelivery {
  channel: Channel;
  status: DeliveryStatus;
  /** Why it failed or was skipped. Null when it went. */
  detail: string | null;
  sent_at: string | null;
}

export interface AppNotification {
  id: number;
  type: NotificationType;
  priority: NotificationPriority;

  title: string;
  body: string;

  /** Where to go when it is opened. Null for a notification with no screen. */
  action_url: string | null;
  action_label: string | null;

  /** Null until it is read — the timestamp *is* the read flag, so there is no way to disagree. */
  read_at: string | null;
  created_at: string;

  /**
   * In-app is not listed here.
   *
   * Every notification is in-app by definition — that is what the record
   * *is*. These are the copies pushed out over other channels, and a
   * notification with none simply waited in the bell.
   */
  deliveries: NotificationDelivery[];
}

/** The bell. Polled, so it stays deliberately small. */
export interface UnreadSummary {
  unread: number;
  /** Broken down so the bell can show what kind of attention is wanted. */
  by_type: Partial<Record<NotificationType, number>>;
  /** Unread and urgent — the badge turns red for these alone. */
  urgent: number;
  /** The newest few, so opening the bell needs no second request. */
  latest: AppNotification[];
}

/**
 * What a user wants, per type.
 *
 * In-app cannot be switched off: a record of what the school told you is not
 * a preference, and a user who muted "fee due" and then missed one would be
 * right to say nobody told them. Email and SMS are opt-in per type, which is
 * the only place a preference belongs.
 */
export interface NotificationPreference {
  type: NotificationType;
  label: string;
  description: string;
  email: boolean;
  sms: boolean;
  /** False where this deployment has no such channel — the row renders disabled. */
  email_available: boolean;
  sms_available: boolean;
}

export interface NotificationPreferences {
  /** A single switch for somebody who wants none of it out of hours. */
  digest_only: boolean;
  items: NotificationPreference[];
}
