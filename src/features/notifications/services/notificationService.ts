import { http } from '@/lib/axios';
import type { ApiResource, ListQueryParams, PaginatedResponse } from '@/types/api';

import type {
  AppNotification,
  NotificationPreferences,
  NotificationType,
  UnreadSummary,
} from '../types';

/**
 * Every endpoint here is implicitly scoped to the signed-in user.
 *
 * There is no `user_id` parameter anywhere on purpose: your notifications are
 * yours, and an API that accepted one would be an API somebody would
 * eventually pass somebody else's id to. That is also why the module has no
 * permission resource — you do not need a right to read what you were sent.
 */
export const notificationService = {
  async list(params: ListQueryParams = {}, signal?: AbortSignal) {
    const { data } = await http.get<PaginatedResponse<AppNotification>>('/notifications', {
      params,
      signal,
    });
    return data;
  },

  /** The bell: a count and the newest few, small enough to poll. */
  async unread(signal?: AbortSignal): Promise<UnreadSummary> {
    const { data } = await http.get<ApiResource<UnreadSummary>>('/notifications/unread', {
      signal,
    });
    return data.data;
  },

  /** Returns the recomputed count, so the badge cannot lag the list. */
  async markRead(id: number, read: boolean): Promise<UnreadSummary> {
    const { data } = await http.post<ApiResource<UnreadSummary>>(
      `/notifications/${id}/${read ? 'read' : 'unread'}`,
    );
    return data.data;
  },

  /** Optionally narrowed to one type — "clear the fee ones" is a real request. */
  async markAllRead(type?: NotificationType): Promise<UnreadSummary> {
    const { data } = await http.post<ApiResource<UnreadSummary>>(
      '/notifications/read-all',
      type ? { type } : {},
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await http.delete(`/notifications/${id}`);
  },

  /** Clears everything already read. Unread ones are never swept up. */
  async clearRead(): Promise<{ deleted: number }> {
    const { data } = await http.post<ApiResource<{ deleted: number }>>('/notifications/clear-read');
    return data.data;
  },

  async preferences(signal?: AbortSignal): Promise<NotificationPreferences> {
    const { data } = await http.get<ApiResource<NotificationPreferences>>(
      '/notifications/preferences',
      { signal },
    );
    return data.data;
  },

  async savePreferences(input: NotificationPreferences): Promise<NotificationPreferences> {
    const { data } = await http.put<ApiResource<NotificationPreferences>>(
      '/notifications/preferences',
      {
        digest_only: input.digest_only,
        items: input.items.map((item) => ({
          type: item.type,
          email: item.email,
          sms: item.sms,
        })),
      },
    );
    return data.data;
  },
};
