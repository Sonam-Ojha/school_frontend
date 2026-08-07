import { z } from 'zod';

import { optionalText } from '@/lib/validation';

import { smsCost } from './composition';
import {
  MAX_BODY_LENGTH,
  MAX_SMS_LENGTH,
  MAX_SUBJECT_LENGTH,
  SUBJECT_CHANNELS,
  TEMPLATE_ONLY_CHANNELS,
} from './constants';

/**
 * Communication validation.
 *
 * Transform-free like every other module: optional numbers are held as
 * strings and converted in the service.
 */

const channelEnum = z.enum(['sms', 'email', 'whatsapp', 'push'], {
  invalid_type_error: 'Choose a channel',
});

const audienceSchema = z.object({
  type: z.enum(
    ['all_students', 'all_guardians', 'all_teachers', 'all_staff', 'class', 'custom'],
    { invalid_type_error: 'Choose who this goes to' },
  ),
  class_id: z.number().int().positive().nullable(),
  section_id: z.number().int().positive().nullable(),
  recipient_ids: z.array(z.number().int().positive()),
});

export const templateSchema = z
  .object({
    name: z.string().min(3, 'Template name is required').max(80, 'Name is too long'),
    code: z
      .string()
      .min(2, 'A short code is required')
      .max(20, 'Code is too long')
      .regex(/^[A-Za-z0-9_-]+$/, 'Use letters, numbers, hyphens and underscores'),
    channel: channelEnum,
    category: z.enum(
      ['attendance', 'fees', 'examination', 'general', 'emergency', 'transport'],
      { invalid_type_error: 'Choose a category' },
    ),
    subject: optionalText(MAX_SUBJECT_LENGTH, 'Subject is too long'),
    body: z.string().min(5, 'Write the message').max(MAX_BODY_LENGTH, 'Message is too long'),
    is_active: z.boolean(),
  })
  .refine((data) => !SUBJECT_CHANNELS.includes(data.channel) || data.subject.trim().length > 0, {
    message: 'An email needs a subject line',
    path: ['subject'],
  })
  .refine((data) => data.channel !== 'sms' || data.body.length <= MAX_SMS_LENGTH, {
    message: `An SMS cannot exceed ${MAX_SMS_LENGTH} characters`,
    path: ['body'],
  });

/**
 * A send.
 *
 * The channel rules are checked here as well as at the API, because a
 * WhatsApp broadcast rejected at the gateway is nine hundred silent failures
 * rather than a form error.
 */
export const messageSchema = z
  .object({
    subject: z.string().min(3, 'Say what this is about').max(MAX_SUBJECT_LENGTH, 'Subject is too long'),
    body: z.string().min(5, 'Write the message').max(MAX_BODY_LENGTH, 'Message is too long'),
    channels: z.array(channelEnum).min(1, 'Choose at least one channel'),
    template_id: z.number().int().positive().nullable(),
    audience: audienceSchema,
    /** Blank sends now; a date and time queues it. */
    scheduled_at: z.string(),
  })
  .refine(
    (data) =>
      !data.channels.some((channel) => TEMPLATE_ONLY_CHANNELS.includes(channel)) ||
      data.template_id !== null,
    {
      message: 'WhatsApp will only carry an approved template — choose one',
      path: ['template_id'],
    },
  )
  .refine((data) => !data.channels.includes('sms') || smsCost(data.body).segments <= 10, {
    message: 'That is more than ten SMS segments — shorten it',
    path: ['body'],
  })
  .refine(
    (data) => data.audience.type !== 'class' || data.audience.class_id !== null,
    { message: 'Choose a class', path: ['audience'] },
  )
  .refine(
    (data) => data.audience.type !== 'custom' || data.audience.recipient_ids.length > 0,
    { message: 'Choose at least one recipient', path: ['audience'] },
  )
  .refine(
    (data) => data.scheduled_at === '' || new Date(data.scheduled_at) > new Date(),
    { message: 'A scheduled send has to be in the future', path: ['scheduled_at'] },
  );

export const noticeSchema = z
  .object({
    title: z.string().min(3, 'A title is required').max(150, 'Title is too long'),
    body: z.string().min(10, 'Write the notice').max(MAX_BODY_LENGTH, 'Notice is too long'),
    category: z.enum(
      ['attendance', 'fees', 'examination', 'general', 'emergency', 'transport'],
      { invalid_type_error: 'Choose a category' },
    ),
    priority: z.enum(['normal', 'important', 'urgent'], {
      invalid_type_error: 'Choose a priority',
    }),
    audience: audienceSchema,
    publish_at: z.string().min(1, 'A publish date is required'),
    /** Blank leaves it up until somebody takes it down. */
    expires_at: z.string(),
    is_pinned: z.boolean(),
  })
  .refine(
    (data) => data.expires_at === '' || data.expires_at > data.publish_at,
    { message: 'It cannot expire before it goes up', path: ['expires_at'] },
  );

/** Raising a message from a notice. The body comes from the notice itself. */
export const announceSchema = z
  .object({
    notice_id: z.number().int().positive(),
    channels: z.array(channelEnum).min(1, 'Choose at least one channel'),
    template_id: z.number().int().positive().nullable(),
  })
  .refine(
    (data) =>
      !data.channels.some((channel) => TEMPLATE_ONLY_CHANNELS.includes(channel)) ||
      data.template_id !== null,
    {
      message: 'WhatsApp will only carry an approved template — choose one',
      path: ['template_id'],
    },
  );

export type TemplateInput = z.infer<typeof templateSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type NoticeInput = z.infer<typeof noticeSchema>;
export type AnnounceInput = z.infer<typeof announceSchema>;
export type AudienceInput = z.infer<typeof audienceSchema>;
