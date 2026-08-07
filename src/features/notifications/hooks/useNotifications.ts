import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import { UNREAD_POLL_INTERVAL } from '../constants';
import { notificationService } from '../services/notificationService';
import type { NotificationPreferences, NotificationType, UnreadSummary } from '../types';

export const notificationKeys = {
  ...createResourceKeys('notifications'),
  unread: () => ['notifications', 'unread'] as const,
  preferences: () => ['notifications', 'preferences'] as const,
};

export function useNotifications(params: ListQueryParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: ({ signal }) => notificationService.list(params, signal),
    placeholderData: (previous) => previous,
  });
}

/**
 * The bell.
 *
 * Polled rather than pushed: a websocket for a number that changes a few
 * times an hour is a connection to keep alive, authenticate and reconnect for
 * very little. The query is tiny by design, and `skipGlobalError` keeps a
 * dropped poll from raising a toast about something already being retried.
 */
export function useUnreadNotifications() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: ({ signal }) => notificationService.unread(signal),
    refetchInterval: UNREAD_POLL_INTERVAL,
    refetchOnWindowFocus: true,
    meta: { skipGlobalError: true },
  });
}

/**
 * Every write returns the recomputed summary, which is written straight into
 * the cache — so the badge changes the instant something is read rather than
 * waiting for the next poll to notice.
 */
function useNotificationMutation<TInput>(
  mutationFn: (input: TInput) => Promise<UnreadSummary>,
  onDone?: (summary: UnreadSummary) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (summary) => {
      queryClient.setQueryData(notificationKeys.unread(), summary);
      await queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      onDone?.(summary);
    },
  });
}

export function useMarkNotificationRead() {
  return useNotificationMutation(({ id, read }: { id: number; read: boolean }) =>
    notificationService.markRead(id, read),
  );
}

export function useMarkAllRead() {
  return useNotificationMutation(
    (type: NotificationType | undefined) => notificationService.markAllRead(type),
    () => toast.success('Marked as read'),
  );
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useClearReadNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.clearRead(),
    onSuccess: async ({ deleted }) => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success(
        deleted === 0 ? 'Nothing to clear' : `Cleared ${deleted} read notifications`,
        deleted === 0 ? 'Everything here is still unread.' : undefined,
      );
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: ({ signal }) => notificationService.preferences(signal),
  });
}

export function useSavePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NotificationPreferences) => notificationService.savePreferences(input),
    onSuccess: (saved) => {
      queryClient.setQueryData(notificationKeys.preferences(), saved);
      toast.success('Preferences saved', 'They apply to the next notification raised.');
    },
  });
}
