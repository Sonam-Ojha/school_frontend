import { Bell, CheckCheck, Settings2 } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useDismiss } from '@/hooks/useDismiss';
import { cn } from '@/lib/cn';

import { BADGE_CAP, BELL_PREVIEW_SIZE } from '../constants';
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useUnreadNotifications,
} from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

/**
 * The bell in the top bar.
 *
 * Polls a deliberately tiny endpoint — a count and the newest few — so
 * opening it needs no second request and the poll itself costs almost
 * nothing. The badge turns red only for *urgent* unread items: a bell that is
 * always red is a bell nobody looks at.
 */
export function NotificationBell() {
  const { isOpen, close, toggle } = useDisclosure();
  const containerRef = useRef<HTMLDivElement>(null);
  useDismiss(isOpen, containerRef, close);

  const { data, isLoading } = useUnreadNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  const unread = data?.unread ?? 0;
  const urgent = (data?.urgent ?? 0) > 0;
  const latest = (data?.latest ?? []).slice(0, BELL_PREVIEW_SIZE);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={
          unread === 0 ? 'Notifications' : `Notifications, ${unread} unread`
        }
        className={cn(
          'relative flex size-10 items-center justify-center rounded-lg text-slate-500 transition-colors',
          'hover:bg-slate-100 hover:text-slate-900',
          isOpen && 'bg-slate-100 text-slate-900',
        )}
      >
        <Bell className="size-5" />

        {unread > 0 && (
          <span
            aria-hidden
            className={cn(
              'absolute top-1 right-0.5 min-w-4 rounded-full px-1 text-[10px] leading-4 font-semibold text-white',
              urgent ? 'bg-red-600' : 'bg-brand-600',
            )}
          >
            {unread > BADGE_CAP ? `${BADGE_CAP}+` : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-40 mt-2 w-[22rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-overlay sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <p className="text-sm font-semibold text-slate-900">
              Notifications
              {unread > 0 && <span className="ml-1.5 text-slate-400">({unread})</span>}
            </p>

            {unread > 0 && (
              <Button
                variant="ghost"
                size="sm"
                isLoading={markAllRead.isPending}
                onClick={() => markAllRead.mutate(undefined)}
                leftIcon={<CheckCheck className="size-4" />}
              >
                Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : latest.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-slate-400">
                <Bell className="size-6" />
                <p className="text-sm">Nothing new.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {latest.map((notification) => (
                  <li key={notification.id}>
                    <NotificationItem
                      notification={notification}
                      compact
                      // Opening a notification is reading it — that is what
                      // opening means, and asking twice is a chore.
                      onOpen={() => {
                        close();
                        if (notification.read_at === null) {
                          markRead.mutate({ id: notification.id, read: true });
                        }
                      }}
                      onToggleRead={(entry) =>
                        markRead.mutate({ id: entry.id, read: entry.read_at === null })
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2">
            <Link
              to={PATHS.notifications}
              onClick={close}
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              See everything
            </Link>

            <Link
              to={PATHS.notificationPreferences}
              onClick={close}
              aria-label="Notification preferences"
              title="Notification preferences"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Settings2 className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
