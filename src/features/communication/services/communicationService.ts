import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type {
  ApiResource,
  CollectionResponse,
  ListQueryParams,
  PaginatedResponse,
} from '@/types/api';

import type { AnnounceInput, AudienceInput, MessageInput, NoticeInput, TemplateInput } from '../schemas';
import type {
  AudiencePreview,
  ChannelHealth,
  CommunicationSummary,
  Message,
  MessageTemplate,
  Notice,
  PushDevice,
} from '../types';

const templateCrud = createCrudService<MessageTemplate>('/communication/templates');
const noticeCrud = createCrudService<Notice>('/communication/notices');

const nullable = (value: string): string | null => value.trim() || null;

const toAudiencePayload = (audience: AudienceInput) => ({
  type: audience.type,
  class_id: audience.type === 'class' ? audience.class_id : null,
  section_id: audience.type === 'class' ? audience.section_id : null,
  recipient_ids: audience.type === 'custom' ? audience.recipient_ids : [],
});

const toTemplatePayload = (input: TemplateInput) => ({
  name: input.name.trim(),
  code: input.code.trim().toUpperCase(),
  channel: input.channel,
  category: input.category,
  // Only email carries a subject; sending one for SMS would be a field the
  // channel has nowhere to put.
  subject: input.channel === 'email' ? nullable(input.subject) : null,
  body: input.body,
  is_active: input.is_active,
});

export const communicationService = {
  // --- channels ---

  /**
   * Whether each channel can send right now.
   *
   * Read rather than configured: SMTP and the SMS provider are the settings
   * module's, and this module only asks whether they are ready.
   */
  async channels(signal?: AbortSignal): Promise<ChannelHealth[]> {
    const { data } = await http.get<CollectionResponse<ChannelHealth>>(
      '/communication/channels',
      { signal },
    );
    return data.data;
  },

  async pushDevices(params: ListQueryParams = {}, signal?: AbortSignal) {
    const { data } = await http.get<PaginatedResponse<PushDevice>>(
      '/communication/push/devices',
      { params, signal },
    );
    return data;
  },

  /** Clears tokens nobody has used in months — an uninstalled app's leftovers. */
  async purgeStaleDevices(): Promise<{ removed: number }> {
    const { data } = await http.post<ApiResource<{ removed: number }>>(
      '/communication/push/devices/purge',
    );
    return data.data;
  },

  // --- templates ---

  listTemplates: templateCrud.list,

  async templates(signal?: AbortSignal): Promise<MessageTemplate[]> {
    const { data } = await http.get<CollectionResponse<MessageTemplate>>(
      '/communication/templates',
      { params: { per_page: 'all' }, signal },
    );
    return data.data;
  },

  async createTemplate(input: TemplateInput): Promise<MessageTemplate> {
    const { data } = await http.post<ApiResource<MessageTemplate>>(
      '/communication/templates',
      toTemplatePayload(input),
    );
    return data.data;
  },

  async updateTemplate(id: number, input: TemplateInput): Promise<MessageTemplate> {
    const { data } = await http.put<ApiResource<MessageTemplate>>(
      `/communication/templates/${id}`,
      toTemplatePayload(input),
    );
    return data.data;
  },

  removeTemplate: templateCrud.remove,

  // --- audiences ---

  /**
   * What an audience resolves to right now.
   *
   * Asked as the compose screen is filled in, so the count and the number of
   * people with no phone are known before anybody presses send rather than
   * after.
   */
  async previewAudience(
    audience: AudienceInput,
    signal?: AbortSignal,
  ): Promise<AudiencePreview> {
    const { data } = await http.post<ApiResource<AudiencePreview>>(
      '/communication/audience/preview',
      toAudiencePayload(audience),
      { signal },
    );
    return data.data;
  },

  // --- messages ---

  async messages(params: ListQueryParams = {}, signal?: AbortSignal) {
    const { data } = await http.get<PaginatedResponse<Message>>('/communication/messages', {
      params,
      signal,
    });
    return data;
  },

  async message(id: number | string, signal?: AbortSignal): Promise<Message> {
    const { data } = await http.get<ApiResource<Message>>(`/communication/messages/${id}`, {
      signal,
    });
    return data.data;
  },

  /**
   * Send, or queue for later.
   *
   * One endpoint for both: a scheduled send is the same act with a time on
   * it, and splitting them would be two code paths that had to stay in step
   * about who a message reaches.
   */
  async send(input: MessageInput): Promise<Message> {
    const { data } = await http.post<ApiResource<Message>>('/communication/messages', {
      subject: input.subject.trim(),
      body: input.body,
      channels: input.channels,
      template_id: input.template_id,
      audience: toAudiencePayload(input.audience),
      scheduled_at: nullable(input.scheduled_at),
    });
    return data.data;
  },

  /** Stops something queued. A message already gone cannot be recalled. */
  async cancel(id: number): Promise<Message> {
    const { data } = await http.post<ApiResource<Message>>(
      `/communication/messages/${id}/cancel`,
    );
    return data.data;
  },

  async removeMessage(id: number): Promise<void> {
    await http.delete(`/communication/messages/${id}`);
  },

  async exportMessages(params: ListQueryParams, format: 'pdf' | 'excel'): Promise<void> {
    await downloadFile(
      '/communication/messages/export',
      timestampedFilename('message-log', format === 'excel' ? 'xlsx' : 'pdf'),
      { params: { ...params, format } },
    );
  },

  // --- notice board ---

  listNotices: noticeCrud.list,

  async notice(id: number | string, signal?: AbortSignal): Promise<Notice> {
    const { data } = await http.get<ApiResource<Notice>>(`/communication/notices/${id}`, {
      signal,
    });
    return data.data;
  },

  async createNotice(input: NoticeInput): Promise<Notice> {
    const { data } = await http.post<ApiResource<Notice>>('/communication/notices', {
      title: input.title.trim(),
      body: input.body,
      category: input.category,
      priority: input.priority,
      audience: toAudiencePayload(input.audience),
      publish_at: input.publish_at,
      expires_at: nullable(input.expires_at),
      is_pinned: input.is_pinned,
    });
    return data.data;
  },

  async updateNotice(id: number, input: NoticeInput): Promise<Notice> {
    const { data } = await http.put<ApiResource<Notice>>(`/communication/notices/${id}`, {
      title: input.title.trim(),
      body: input.body,
      category: input.category,
      priority: input.priority,
      audience: toAudiencePayload(input.audience),
      publish_at: input.publish_at,
      expires_at: nullable(input.expires_at),
      is_pinned: input.is_pinned,
    });
    return data.data;
  },

  removeNotice: noticeCrud.remove,

  /** Submits a draft for somebody with the right to put it on the board. */
  async submitNotice(id: number): Promise<Notice> {
    const { data } = await http.post<ApiResource<Notice>>(
      `/communication/notices/${id}/submit`,
    );
    return data.data;
  },

  async publishNotice(id: number): Promise<Notice> {
    const { data } = await http.post<ApiResource<Notice>>(
      `/communication/notices/${id}/publish`,
    );
    return data.data;
  },

  async archiveNotice(id: number): Promise<Notice> {
    const { data } = await http.post<ApiResource<Notice>>(
      `/communication/notices/${id}/archive`,
    );
    return data.data;
  },

  /**
   * Announce a notice — raise a message from it.
   *
   * The body comes from the notice, so the board and the broadcast cannot
   * say different things, and a notice may legitimately be announced more
   * than once (a reminder is an announcement too).
   */
  async announce(input: AnnounceInput): Promise<Message> {
    const { data } = await http.post<ApiResource<Message>>(
      `/communication/notices/${input.notice_id}/announce`,
      { channels: input.channels, template_id: input.template_id },
    );
    return data.data;
  },

  async downloadNotice(notice: Notice): Promise<void> {
    await downloadFile(
      `/communication/notices/${notice.id}/print`,
      `notice-${notice.id}.pdf`,
    );
  },

  async summary(signal?: AbortSignal): Promise<CommunicationSummary> {
    const { data } = await http.get<ApiResource<CommunicationSummary>>(
      '/communication/summary',
      { signal },
    );
    return data.data;
  },
};

export type { ListQueryParams };
