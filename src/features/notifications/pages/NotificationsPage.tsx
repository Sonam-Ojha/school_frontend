import { Bell, CheckCheck, Settings2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Pagination } from '@/components/table/Pagination';
import { TableToolbar } from '@/components/table/TableToolbar';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';

import { NotificationItem } from '../components/NotificationItem';
import { PRIORITY_OPTIONS, READ_STATE_OPTIONS, TYPE_OPTIONS } from '../constants';
import {
  useClearReadNotifications,
  useMarkAllRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotifications,
} from '../hooks/useNotifications';
import type { NotificationType } from '../types';

/**
 * The full history.
 *
 * Not a `DataTable`: a notification is a message to read, not a row to sort
 * and click through to a detail page — it *is* its own detail. What it does
 * borrow is the toolbar, the filter state in the query string and the
 * pagination control, so a filtered history is a link somebody can send.
 */
export default function NotificationsPage() {
  const table = useTableQueryState({
    defaultSortBy: 'created_at',
    defaultSortDir: 'desc',
    filterKeys: ['type', 'priority', 'state'],
  });

  const { data, isLoading, isFetching, error } = useNotifications(table.queryParams);
  const { data: summary } = useUnreadNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();
  const clearRead = useClearReadNotifications();
  const clearDialog = useDisclosure();

  const unread = summary?.unread ?? 0;
  const filteredType = table.filters.type as NotificationType | undefined;

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Everything the school has told you, and how each one reached you."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Notifications' }]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={clearDialog.open}
              leftIcon={<Trash2 className="size-4" />}
            >
              Clear read
            </Button>

            {unread > 0 && (
              <Button
                isLoading={markAllRead.isPending}
                onClick={() => markAllRead.mutate(filteredType)}
                leftIcon={<CheckCheck className="size-4" />}
              >
                {filteredType ? 'Mark these read' : `Mark all ${unread} read`}
              </Button>
            )}

            <Link
              to={PATHS.notificationPreferences}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Settings2 className="size-4" />
              Preferences
            </Link>
          </>
        }
      />

      <Card>
        <CardBody className="p-0">
          <div className="border-b border-slate-200 p-4 sm:px-6">
            <TableToolbar
              search={table.search}
              onSearchChange={table.setSearch}
              searchPlaceholder="Search what you were told"
              hasActiveFilters={table.hasActiveFilters}
              onResetFilters={table.resetFilters}
              filters={
                <>
                  <Select
                    aria-label="Filter by state"
                    value={table.filters.state ?? ''}
                    options={READ_STATE_OPTIONS}
                    placeholder="Read and unread"
                    onChange={(event) => table.setFilter('state', event.target.value || undefined)}
                    className="w-44"
                  />
                  <Select
                    aria-label="Filter by kind"
                    value={table.filters.type ?? ''}
                    options={TYPE_OPTIONS}
                    placeholder="Everything"
                    onChange={(event) => table.setFilter('type', event.target.value || undefined)}
                    className="w-44"
                  />
                  <Select
                    aria-label="Filter by priority"
                    value={table.filters.priority ?? ''}
                    options={PRIORITY_OPTIONS}
                    placeholder="Any priority"
                    onChange={(event) =>
                      table.setFilter('priority', event.target.value || undefined)
                    }
                    className="w-36"
                  />
                </>
              }
            />
          </div>

          {error ? (
            <div className="p-4 sm:p-6">
              <Alert tone="danger" title="Could not load your notifications">
                {error.message}
              </Alert>
            </div>
          ) : isLoading ? (
            <div className="space-y-2 p-4 sm:p-6">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (data?.data.length ?? 0) === 0 ? (
            <div className="p-4 sm:p-6">
              <EmptyState
                icon={<Bell className="size-6" />}
                title="Nothing here"
                description={
                  table.hasActiveFilters
                    ? 'Nothing matches these filters.'
                    : 'The school has not had to tell you anything yet.'
                }
              />
            </div>
          ) : (
            <>
              <ul
                className={
                  isFetching ? 'divide-y divide-slate-100 opacity-60' : 'divide-y divide-slate-100'
                }
              >
                {data?.data.map((notification) => (
                  <li key={notification.id}>
                    <NotificationItem
                      notification={notification}
                      showDeliveries
                      onToggleRead={(entry) =>
                        markRead.mutate({ id: entry.id, read: entry.read_at === null })
                      }
                    />
                  </li>
                ))}
              </ul>

              {data?.meta && (
                <Pagination
                  meta={data.meta}
                  onPageChange={table.setPage}
                  onPerPageChange={table.setPerPage}
                />
              )}
            </>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        isOpen={clearDialog.isOpen}
        onClose={clearDialog.close}
        onConfirm={() => clearRead.mutate(undefined, { onSuccess: clearDialog.close })}
        isLoading={clearRead.isPending}
        isDestructive
        title="Clear everything you have read?"
        confirmLabel="Clear them"
        message="Unread notifications are left alone — only the ones you have already seen go. This cannot be undone."
      />
    </>
  );
}
