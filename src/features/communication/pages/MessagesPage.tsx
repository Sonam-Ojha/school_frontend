import { FileSpreadsheet, MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { cn } from '@/lib/cn';
import { formatDateTime, formatNumber } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { CommunicationStats } from '../components/CommunicationStats';
import { ComposeModal } from '../components/ComposeModal';
import {
  CHANNEL_LABELS,
  CHANNEL_OPTIONS,
  COMMUNICATION_PERMISSIONS,
  EDITABLE_STATUSES,
  MESSAGE_STATUS_LABELS,
  MESSAGE_STATUS_OPTIONS,
  MESSAGE_STATUS_TONES,
} from '../constants';
import { useCancelMessage, useExportMessages, useMessages } from '../hooks/useCommunication';
import type { Message } from '../types';

export default function MessagesPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canSend = hasPermission(COMMUNICATION_PERMISSIONS.send);

  const table = useTableQueryState({
    defaultSortBy: 'created_at',
    defaultSortDir: 'desc',
    filterKeys: ['status', 'channel'],
  });

  const { data, isLoading, isFetching, error } = useMessages(table.queryParams);
  const cancelMessage = useCancelMessage();
  const exportMessages = useExportMessages();

  const compose = useDisclosure();
  const cancelDialog = useDisclosure();
  const [pendingCancel, setPendingCancel] = useState<Message | null>(null);

  const columns: Column<Message>[] = [
    {
      key: 'subject',
      header: 'Message',
      sortable: true,
      cell: (message) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{message.subject}</p>
          <p className="truncate text-xs text-slate-500">
            {message.audience_label}
            {message.template_name ? ` · ${message.template_name}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'channels',
      header: 'Channels',
      hideBelow: 'md',
      cell: (message) => (
        <div className="flex flex-wrap gap-1">
          {message.channels.map((channel) => (
            <Badge key={channel} tone="neutral">
              {CHANNEL_LABELS[channel]}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'recipients_count',
      header: 'Recipients',
      sortable: true,
      align: 'right',
      cell: (message) => formatNumber(message.recipients_count),
    },
    {
      key: 'total_delivered',
      header: 'Delivered',
      align: 'right',
      hideBelow: 'lg',
      cell: (message) => {
        if (message.total_sent === 0) return <span className="text-xs text-slate-400">—</span>;

        return (
          <div>
            <p className="text-sm font-medium text-slate-900">
              {formatNumber(message.total_delivered)}
            </p>
            {message.total_failed > 0 && (
              <p className="text-xs whitespace-nowrap text-red-600">
                {formatNumber(message.total_failed)} failed
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'sent_at',
      header: 'When',
      sortable: true,
      hideBelow: 'xl',
      cell: (message) => (
        <span className="text-sm whitespace-nowrap text-slate-700">
          {message.sent_at
            ? formatDateTime(message.sent_at)
            : message.scheduled_at
              ? formatDateTime(message.scheduled_at)
              : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (message) => (
        <Badge tone={MESSAGE_STATUS_TONES[message.status]} withDot>
          {MESSAGE_STATUS_LABELS[message.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (message) =>
        // Only something still waiting can be stopped — a message already
        // gone cannot be recalled.
        canSend && EDITABLE_STATUSES.includes(message.status) ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              setPendingCancel(message);
              cancelDialog.open();
            }}
          >
            Cancel
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <CommunicationStats />

      <Card>
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            rows={data?.data}
            meta={data?.meta}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            sortBy={table.sortBy}
            sortDir={table.sortDir}
            onSort={table.toggleSort}
            onPageChange={table.setPage}
            onPerPageChange={table.setPerPage}
            onRowClick={(message) =>
              navigate(toPath(PATHS.communicationMessageDetail, { id: message.id }))
            }
            toolbar={
              <TableToolbar
                search={table.search}
                onSearchChange={table.setSearch}
                searchPlaceholder="Subject or audience"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <>
                    <Select
                      aria-label="Filter by status"
                      value={table.filters.status ?? ''}
                      options={MESSAGE_STATUS_OPTIONS}
                      placeholder="Any status"
                      onChange={(event) =>
                        table.setFilter('status', event.target.value || undefined)
                      }
                      className="w-40"
                    />
                    <Select
                      aria-label="Filter by channel"
                      value={table.filters.channel ?? ''}
                      options={CHANNEL_OPTIONS}
                      placeholder="Any channel"
                      onChange={(event) =>
                        table.setFilter('channel', event.target.value || undefined)
                      }
                      className="w-44"
                    />
                  </>
                }
                actions={
                  <>
                    <Can permissions={[COMMUNICATION_PERMISSIONS.export]}>
                      <Button
                        variant="outline"
                        isLoading={exportMessages.isPending}
                        onClick={() =>
                          exportMessages.mutate({ params: table.queryParams, format: 'excel' })
                        }
                        leftIcon={<FileSpreadsheet className="size-4" />}
                      >
                        Export
                      </Button>
                    </Can>

                    <Can permissions={[COMMUNICATION_PERMISSIONS.send]}>
                      <Button onClick={compose.open} leftIcon={<Send className="size-4" />}>
                        New message
                      </Button>
                    </Can>
                  </>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<MessageSquare className="size-6" />}
                title="Nothing sent yet"
                description={
                  table.hasActiveFilters
                    ? 'Nothing matches these filters.'
                    : 'Compose a message to reach students, guardians or staff.'
                }
              />
            }
          />
        </CardBody>
      </Card>

      {compose.isOpen && <ComposeModal isOpen={compose.isOpen} onClose={compose.close} />}

      <ConfirmDialog
        isOpen={cancelDialog.isOpen}
        onClose={cancelDialog.close}
        onConfirm={() => {
          if (!pendingCancel) return;
          cancelMessage.mutate(pendingCancel.id, {
            onSuccess: () => {
              cancelDialog.close();
              setPendingCancel(null);
            },
          });
        }}
        isLoading={cancelMessage.isPending}
        isDestructive
        title="Cancel this message?"
        confirmLabel="Cancel it"
        cancelLabel="Leave it queued"
        message={
          <p className={cn('text-sm text-slate-600')}>
            It is scheduled for{' '}
            {pendingCancel?.scheduled_at ? formatDateTime(pendingCancel.scheduled_at) : 'sending'}{' '}
            and reaches {formatNumber(pendingCancel?.recipients_count ?? 0)} people. Cancelling
            stops it going out at all.
          </p>
        }
      />
    </div>
  );
}
