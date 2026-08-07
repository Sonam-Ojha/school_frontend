/** Public surface of the notifications module. */

export { NotificationBell } from './components/NotificationBell';
export { NotificationItem } from './components/NotificationItem';

export {
  BADGE_CAP,
  BELL_PREVIEW_SIZE,
  DELIVERY_LABELS,
  DELIVERY_TONES,
  FALLBACK_TYPE_ICON,
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
  PRIORITY_TONES,
  READ_STATE_OPTIONS,
  TYPE_ICONS,
  TYPE_LABELS,
  TYPE_OPTIONS,
  UNREAD_POLL_INTERVAL,
} from './constants';

export {
  notificationKeys,
  useClearReadNotifications,
  useDeleteNotification,
  useMarkAllRead,
  useMarkNotificationRead,
  useNotificationPreferences,
  useNotifications,
  useSavePreferences,
  useUnreadNotifications,
} from './hooks/useNotifications';

export { notificationService } from './services/notificationService';

export type {
  AppNotification,
  DeliveryStatus,
  NotificationDelivery,
  NotificationPreference,
  NotificationPreferences,
  NotificationPriority,
  NotificationType,
  UnreadSummary,
} from './types';
