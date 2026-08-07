import type { Option, ToneName } from '@/types/common';

import type {
  AudienceType,
  Channel,
  ChannelStatus,
  MessageStatus,
  NoticePriority,
  NoticeStatus,
  TemplateApproval,
  TemplateCategory,
} from './types';

/**
 * Two resources, because they are two different acts.
 *
 * Pinning a notice to the board is not the same as pushing an SMS to nine
 * hundred parents at eleven at night, and schools routinely let somebody do
 * the first without the second. `notices.approve` is the right to publish to
 * the board; `communication.approve` is the right to release a broadcast.
 */
export const COMMUNICATION_PERMISSIONS = {
  read: 'communication.read',
  create: 'communication.create',
  update: 'communication.update',
  delete: 'communication.delete',
  export: 'communication.export',
  send: 'communication.approve',
} as const;

export const NOTICE_PERMISSIONS = {
  read: 'notices.read',
  create: 'notices.create',
  update: 'notices.update',
  delete: 'notices.delete',
  print: 'notices.print',
  publish: 'notices.approve',
} as const;

// --- channels ---------------------------------------------------------------

export const CHANNEL_LABELS: Record<Channel, string> = {
  sms: 'SMS',
  email: 'Email',
  whatsapp: 'WhatsApp',
  push: 'Push notification',
};

export const CHANNEL_OPTIONS: Option<Channel>[] = (Object.keys(CHANNEL_LABELS) as Channel[]).map(
  (channel) => ({ label: CHANNEL_LABELS[channel], value: channel }),
);

export const CHANNEL_STATUS_LABELS: Record<ChannelStatus, string> = {
  ready: 'Ready',
  disabled: 'Switched off',
  not_configured: 'Not set up',
  unavailable: 'Not available',
};

export const CHANNEL_STATUS_TONES: Record<ChannelStatus, ToneName> = {
  ready: 'success',
  disabled: 'warning',
  not_configured: 'neutral',
  unavailable: 'danger',
};

/**
 * Channels that will not carry a freeform message.
 *
 * WhatsApp requires a template approved by Meta before it will deliver to
 * somebody who has not written to the school first. Enforcing it here rather
 * than discovering it at the gateway is the difference between a form error
 * and nine hundred silent failures.
 */
export const TEMPLATE_ONLY_CHANNELS: Channel[] = ['whatsapp'];

/** Email is the only channel that carries a subject line of its own. */
export const SUBJECT_CHANNELS: Channel[] = ['email'];

// --- templates --------------------------------------------------------------

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  attendance: 'Attendance',
  fees: 'Fees',
  examination: 'Examinations',
  general: 'General',
  emergency: 'Emergency',
  transport: 'Transport',
};

export const TEMPLATE_CATEGORY_OPTIONS: Option<TemplateCategory>[] = (
  Object.keys(TEMPLATE_CATEGORY_LABELS) as TemplateCategory[]
).map((category) => ({ label: TEMPLATE_CATEGORY_LABELS[category], value: category }));

export const APPROVAL_LABELS: Record<TemplateApproval, string> = {
  not_required: 'No approval needed',
  pending: 'Awaiting approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const APPROVAL_TONES: Record<TemplateApproval, ToneName> = {
  not_required: 'neutral',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

// --- audiences --------------------------------------------------------------

export const AUDIENCE_LABELS: Record<AudienceType, string> = {
  all_students: 'Every student',
  all_guardians: 'Every guardian',
  all_teachers: 'Every teacher',
  all_staff: 'Every staff member',
  class: 'One class or section',
  custom: 'Chosen individually',
};

export const AUDIENCE_OPTIONS: Option<AudienceType>[] = (
  Object.keys(AUDIENCE_LABELS) as AudienceType[]
).map((type) => ({ label: AUDIENCE_LABELS[type], value: type }));

// --- messages ---------------------------------------------------------------

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  draft: 'Draft',
  queued: 'Scheduled',
  sending: 'Sending',
  sent: 'Sent',
  partial: 'Partly delivered',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export const MESSAGE_STATUS_TONES: Record<MessageStatus, ToneName> = {
  draft: 'neutral',
  queued: 'info',
  sending: 'info',
  sent: 'success',
  partial: 'warning',
  failed: 'danger',
  cancelled: 'neutral',
};

export const MESSAGE_STATUS_OPTIONS: Option<MessageStatus>[] = (
  Object.keys(MESSAGE_STATUS_LABELS) as MessageStatus[]
).map((status) => ({ label: MESSAGE_STATUS_LABELS[status], value: status }));

/** Statuses that are still changeable — anything else has left the building. */
export const EDITABLE_STATUSES: MessageStatus[] = ['draft', 'queued'];

// --- notices ----------------------------------------------------------------

export const NOTICE_STATUS_LABELS: Record<NoticeStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Awaiting approval',
  published: 'On the board',
  expired: 'Expired',
  archived: 'Archived',
};

export const NOTICE_STATUS_TONES: Record<NoticeStatus, ToneName> = {
  draft: 'neutral',
  pending_approval: 'warning',
  published: 'success',
  expired: 'neutral',
  archived: 'neutral',
};

export const NOTICE_STATUS_OPTIONS: Option<NoticeStatus>[] = (
  Object.keys(NOTICE_STATUS_LABELS) as NoticeStatus[]
).map((status) => ({ label: NOTICE_STATUS_LABELS[status], value: status }));

export const PRIORITY_LABELS: Record<NoticePriority, string> = {
  normal: 'Normal',
  important: 'Important',
  urgent: 'Urgent',
};

export const PRIORITY_TONES: Record<NoticePriority, ToneName> = {
  normal: 'neutral',
  important: 'warning',
  urgent: 'danger',
};

export const PRIORITY_OPTIONS: Option<NoticePriority>[] = (
  Object.keys(PRIORITY_LABELS) as NoticePriority[]
).map((priority) => ({ label: PRIORITY_LABELS[priority], value: priority }));

// --- policy -----------------------------------------------------------------

/**
 * A send this large is worth pausing over.
 *
 * Not a limit — schools legitimately message everybody — but the confirm
 * step says the number out loud, because "send" next to a list of nine
 * hundred people should not feel like saving a form.
 */
export const LARGE_AUDIENCE = 200;

/** Segments beyond this on one SMS is usually a mistake worth flagging. */
export const SEGMENT_WARNING = 3;

/** A push token unseen for this long is probably an uninstalled app. */
export const STALE_DEVICE_DAYS = 60;

export const MAX_SUBJECT_LENGTH = 150;
export const MAX_SMS_LENGTH = 1600;
export const MAX_BODY_LENGTH = 5000;
