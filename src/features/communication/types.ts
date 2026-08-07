/**
 * Communication.
 *
 * Three records. A **template** is a reusable body with placeholders. A
 * **message** is one send: a channel or several, an audience, and what
 * happened to it. A **notice** is an item on the board, which may also be
 * announced — an announcement is a message raised from a notice, not a
 * fourth kind of thing.
 *
 * Nothing here configures a channel. SMTP credentials and the SMS provider
 * belong to the settings module, which also owns the test-send; this module
 * reads whether a channel is ready and uses it. Two places that both know the
 * SMTP password is one too many.
 *
 * Recipients are not a record either. Students, guardians, teachers and staff
 * are rosters that already exist, so an audience is a *query* over them —
 * which is why changing a class's roll changes who the next message reaches
 * without anybody re-picking names.
 */

export type Channel = 'sms' | 'email' | 'whatsapp' | 'push';

/**
 * `ready` can send now; `not_configured` has never been set up;
 * `disabled` is configured but switched off; `unavailable` is a channel this
 * deployment has no integration for at all.
 */
export type ChannelStatus = 'ready' | 'disabled' | 'not_configured' | 'unavailable';

export interface ChannelHealth {
  channel: Channel;
  status: ChannelStatus;
  /** What is wrong, when something is. Null when ready. */
  detail: string | null;
  /** Where it is configured, so the screen can link somewhere useful. */
  configured_in: 'settings' | 'communication' | null;
  /** Sends in the last thirty days, for a sense of whether it is live. */
  sent_last_30_days: number;
  /** Push only — handsets that have registered a token. */
  registered_devices: number | null;
}

// --- templates --------------------------------------------------------------

/**
 * WhatsApp will not carry a freeform message to somebody who has not written
 * first — every template has to be approved by Meta before it can be used.
 * The status is theirs to set, not the school's, which is why it is read-only
 * here and why an unapproved template cannot be sent.
 */
export type TemplateApproval = 'not_required' | 'pending' | 'approved' | 'rejected';

export type TemplateCategory =
  | 'attendance'
  | 'fees'
  | 'examination'
  | 'general'
  | 'emergency'
  | 'transport';

export interface MessageTemplate {
  id: number;
  name: string;
  /** Short code the send screen picks by. */
  code: string;
  channel: Channel;
  category: TemplateCategory;
  /** Email only. Null for every other channel. */
  subject: string | null;
  body: string;
  /** Placeholders found in the body, e.g. `student_name`. Derived, not stored. */
  placeholders: string[];
  approval: TemplateApproval;
  approval_note: string | null;
  is_active: boolean;
  /** SMS only — how many segments the body costs at its worst. */
  segments: number | null;
  created_at: string;
  updated_at: string;
}

// --- audiences --------------------------------------------------------------

export type AudienceType =
  | 'all_students'
  | 'all_guardians'
  | 'all_teachers'
  | 'all_staff'
  | 'class'
  | 'custom';

/**
 * Who a message goes to, as a query rather than a list.
 *
 * Resolved by the API at send time, so a message scheduled for tomorrow
 * reaches the class as it is tomorrow — not as it was when somebody drafted
 * it. `custom` is the exception: an explicit list of people.
 */
export interface Audience {
  type: AudienceType;
  class_id: number | null;
  section_id: number | null;
  /** `custom` only. Pairs of roster and id. */
  recipients: AudienceRecipient[];
}

export interface AudienceRecipient {
  roster: 'student' | 'guardian' | 'teacher' | 'staff';
  id: number;
  name: string;
  /** Phone for SMS and WhatsApp, address for email. */
  contact: string | null;
}

/** What an audience resolves to right now, for the count on the compose screen. */
export interface AudiencePreview {
  total: number;
  /** Reachable on each channel — a parent with no email is not an email. */
  reachable: Record<Channel, number>;
  /** People with no usable contact detail at all, worth naming before sending. */
  unreachable: number;
  sample: string[];
}

// --- messages ---------------------------------------------------------------

/**
 * `queued` is waiting for its scheduled time; `sending` is in flight;
 * `sent` has left; `partial` means at least one channel failed wholesale.
 */
export type MessageStatus = 'draft' | 'queued' | 'sending' | 'sent' | 'partial' | 'failed' | 'cancelled';

export interface ChannelDelivery {
  channel: Channel;
  /** People this channel could actually reach. */
  targeted: number;
  sent: number;
  delivered: number;
  failed: number;
  /** WhatsApp and push report reads; SMS and email do not. */
  read: number | null;
  /** SMS only — segments billed, which is what the invoice is. */
  segments: number | null;
  error: string | null;
}

export interface Message {
  id: number;
  /** What it is about, and the email subject when email is one of the channels. */
  subject: string;
  body: string;
  channels: Channel[];
  template_id: number | null;
  template_name: string | null;

  audience: Audience;
  audience_label: string;
  recipients_count: number;

  status: MessageStatus;
  /** Null for something sent immediately. */
  scheduled_at: string | null;
  sent_at: string | null;
  created_by: string | null;

  deliveries: ChannelDelivery[];
  /** Rolled up across the channels. */
  total_sent: number;
  total_delivered: number;
  total_failed: number;

  /** Set when the message was raised from a notice. */
  notice_id: number | null;
  created_at: string;
}

// --- notice board -----------------------------------------------------------

/**
 * `pending_approval` is a notice waiting for somebody with the right to
 * publish it — a board anybody can post to unreviewed is a board nobody
 * trusts.
 */
export type NoticeStatus = 'draft' | 'pending_approval' | 'published' | 'expired' | 'archived';

export type NoticePriority = 'normal' | 'important' | 'urgent';

export interface Notice {
  id: number;
  title: string;
  body: string;
  category: TemplateCategory;
  priority: NoticePriority;

  audience: Audience;
  audience_label: string;

  status: NoticeStatus;
  /** Pinned notices sit above the rest whatever their date. */
  is_pinned: boolean;
  publish_at: string;
  /** Null for a notice that stays up until somebody takes it down. */
  expires_at: string | null;

  /** Whether it is on the board *now* — derived from the dates and status. */
  is_live: boolean;

  published_by: string | null;
  published_at: string | null;
  approved_by: string | null;

  attachment_name: string | null;
  attachment_url: string | null;

  /** Messages raised from this notice — announcing it more than once is fine. */
  announcements_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// --- push registry ----------------------------------------------------------

export type DevicePlatform = 'android' | 'ios' | 'web';

/**
 * A handset that has registered for push.
 *
 * The token is the vendor's; this module only records which person it belongs
 * to and when it was last seen, so a stale token can be cleared out. Nothing
 * here talks to a push service — that is the backend's job, and the "ready"
 * half is that the registry and the delivery contract both exist.
 */
export interface PushDevice {
  id: number;
  owner_type: 'student' | 'guardian' | 'teacher' | 'staff';
  owner_id: number;
  owner_name: string;
  platform: DevicePlatform;
  /** Truncated for display — the full token never leaves the backend. */
  token_preview: string;
  app_version: string | null;
  last_seen_at: string;
  is_stale: boolean;
}

export interface CommunicationSummary {
  sent_last_30_days: number;
  scheduled: number;
  /** Notices on the board right now. */
  live_notices: number;
  awaiting_approval: number;
  channels: ChannelHealth[];
}
