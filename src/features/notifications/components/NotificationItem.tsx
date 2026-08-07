import { Check, Mail, MessageSquare, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { relativeTime } from '@/lib/relativeTime';

import {
  DELIVERY_LABELS,
  DELIVERY_TONES,
  FALLBACK_TYPE_ICON,
  PRIORITY_TONES,
  TYPE_ICONS,
  TYPE_LABELS,
} from '../constants';
import type { AppNotification } from '../types';

const CHANNEL_ICONS = { email: Mail, sms: MessageSquare } as const;

interface NotificationItemProps {
  notification: AppNotification;
  /** Omitted in the bell, where the row is a link and nothing else. */
  onToggleRead?: (notification: AppNotification) => void;
  /** Reading on open is right in the bell and wrong in the history. */
  onOpen?: (notification: AppNotification) => void;
  /** The history shows how each copy went out; the bell has no room. */
  showDeliveries?: boolean;
  compact?: boolean;
}

/**
 * One notification.
 *
 * Unread is carried by weight and a dot rather than a colour alone — a colour
 * on its own is invisible to a good number of readers, and "have I seen this"
 * is the only question this row exists to answer.
 */
export function NotificationItem({
  notification,
  onToggleRead,
  onOpen,
  showDeliveries = false,
  compact = false,
}: NotificationItemProps) {
  const Icon = TYPE_ICONS[notification.type] ?? FALLBACK_TYPE_ICON;
  const unread = notification.read_at === null;

  const body = (
    <div className={cn('flex items-start gap-3', compact ? 'px-4 py-2.5' : 'px-4 py-3 sm:px-6')}>
      <span
        className={cn(
          'mt-0.5 shrink-0 rounded-lg p-1.5',
          unread ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400',
        )}
      >
        <Icon aria-hidden className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              'min-w-0 flex-1 text-sm',
              unread ? 'font-semibold text-slate-900' : 'text-slate-700',
            )}
          >
            {notification.title}
          </p>

          {unread && (
            <span
              aria-label="Unread"
              className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-600"
            />
          )}
        </div>

        <p className={cn('text-sm text-slate-500', compact && 'line-clamp-2')}>
          {notification.body}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <time
            dateTime={notification.created_at}
            className="text-xs whitespace-nowrap text-slate-400"
          >
            {relativeTime(notification.created_at)}
          </time>

          {!compact && (
            <span className="text-xs text-slate-400">· {TYPE_LABELS[notification.type]}</span>
          )}

          {notification.priority !== 'normal' && (
            <Badge tone={PRIORITY_TONES[notification.priority]}>{notification.priority}</Badge>
          )}

          {/*
            How the other copies went. In-app is never listed — every
            notification is in-app by definition, and saying so on every row
            would be noise.
          */}
          {showDeliveries &&
            notification.deliveries.map((delivery) => {
              const ChannelIcon = CHANNEL_ICONS[delivery.channel as 'email' | 'sms'];

              return (
                <span
                  key={delivery.channel}
                  title={delivery.detail ?? `${delivery.channel}: ${DELIVERY_LABELS[delivery.status]}`}
                  className="inline-flex items-center gap-1"
                >
                  {ChannelIcon && <ChannelIcon aria-hidden className="size-3 text-slate-400" />}
                  <Badge tone={DELIVERY_TONES[delivery.status]}>
                    {DELIVERY_LABELS[delivery.status]}
                  </Badge>
                </span>
              );
            })}
        </div>
      </div>

      {onToggleRead && (
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label={unread ? 'Mark as read' : 'Mark as unread'}
          title={unread ? 'Mark as read' : 'Mark as unread'}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleRead(notification);
          }}
        >
          {unread ? <Check className="size-4" /> : <Undo2 className="size-4 text-slate-400" />}
        </Button>
      )}
    </div>
  );

  if (!notification.action_url) {
    return <div className={cn(unread && 'bg-brand-50/30')}>{body}</div>;
  }

  return (
    <Link
      to={notification.action_url}
      onClick={() => onOpen?.(notification)}
      className={cn('block hover:bg-slate-50', unread && 'bg-brand-50/30 hover:bg-brand-50/60')}
    >
      {body}
    </Link>
  );
}
