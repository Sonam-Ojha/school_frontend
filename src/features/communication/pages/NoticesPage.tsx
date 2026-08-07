import { Pin, PinOff, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import type { Column } from '@/components/table/types';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { formatDate } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { NoticeFormModal } from '../components/NoticeFormModal';
import {
  NOTICE_PERMISSIONS,
  NOTICE_STATUS_LABELS,
  NOTICE_STATUS_OPTIONS,
  NOTICE_STATUS_TONES,
  PRIORITY_LABELS,
  PRIORITY_TONES,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_OPTIONS,
} from '../constants';
import { useDeleteNotice, useNotices, usePublishNotice } from '../hooks/useCommunication';
import type { Notice } from '../types';

export default function NoticesPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canPublish = hasPermission(NOTICE_PERMISSIONS.publish);
  const canDelete = hasPermission(NOTICE_PERMISSIONS.delete);

  const table = useTableQueryState({
    defaultSortBy: 'publish_at',
    defaultSortDir: 'desc',
    filterKeys: ['status', 'category'],
  });

  const { data, isLoading, isFetching, error } = useNotices(table.queryParams);
  const publishNotice = usePublishNotice();
  const deleteNotice = useDeleteNotice();

  const noticeForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [pendingDelete, setPendingDelete] = useState<Notice | null>(null);

  const columns: Column<Notice>[] = [
    {
      key: 'title',
      header: 'Notice',
      sortable: true,
      cell: (notice) => (
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate font-medium text-slate-900">
            {notice.is_pinned && <Pin className="size-3.5 shrink-0 text-amber-600" aria-label="Pinned" />}
            {notice.title}
          </p>
          <p className="truncate text-xs text-slate-500">
            {TEMPLATE_CATEGORY_LABELS[notice.category]} · {notice.audience_label}
          </p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      hideBelow: 'lg',
      cell: (notice) => (
        <Badge tone={PRIORITY_TONES[notice.priority]}>{PRIORITY_LABELS[notice.priority]}</Badge>
      ),
    },
    {
      key: 'publish_at',
      header: 'On the board',
      sortable: true,
      hideBelow: 'md',
      cell: (notice) => (
        <div>
          <p className="text-sm whitespace-nowrap text-slate-800">
            {formatDate(notice.publish_at)}
          </p>
          <p className="text-xs whitespace-nowrap text-slate-500">
            {notice.expires_at ? `until ${formatDate(notice.expires_at)}` : 'no end date'}
          </p>
        </div>
      ),
    },
    {
      key: 'announcements_count',
      header: 'Announced',
      align: 'right',
      hideBelow: 'xl',
      cell: (notice) =>
        notice.announcements_count > 0 ? (
          <span className="text-sm text-slate-700">{notice.announcements_count}×</span>
        ) : (
          <span className="text-xs text-slate-400">not yet</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (notice) => (
        <div>
          <Badge tone={NOTICE_STATUS_TONES[notice.status]} withDot>
            {NOTICE_STATUS_LABELS[notice.status]}
          </Badge>
          {notice.status === 'published' && !notice.is_live && (
            <p className="mt-0.5 text-xs whitespace-nowrap text-slate-500">not up yet</p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (notice) => (
        <div className="flex justify-end gap-1">
          {canPublish && notice.status === 'pending_approval' && (
            <Button
              variant="outline"
              size="sm"
              isLoading={publishNotice.isPending}
              onClick={(event) => {
                event.stopPropagation();
                publishNotice.mutate(notice.id);
              }}
            >
              Publish
            </Button>
          )}

          {canDelete && notice.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                setPendingDelete(notice);
                deleteDialog.open();
              }}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
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
            onRowClick={(notice) =>
              navigate(toPath(PATHS.communicationNoticeDetail, { id: notice.id }))
            }
            toolbar={
              <TableToolbar
                search={table.search}
                onSearchChange={table.setSearch}
                searchPlaceholder="Title or body"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <>
                    <Select
                      aria-label="Filter by status"
                      value={table.filters.status ?? ''}
                      options={NOTICE_STATUS_OPTIONS}
                      placeholder="Any status"
                      onChange={(event) =>
                        table.setFilter('status', event.target.value || undefined)
                      }
                      className="w-44"
                    />
                    <Select
                      aria-label="Filter by category"
                      value={table.filters.category ?? ''}
                      options={TEMPLATE_CATEGORY_OPTIONS}
                      placeholder="Any category"
                      onChange={(event) =>
                        table.setFilter('category', event.target.value || undefined)
                      }
                      className="w-40"
                    />
                  </>
                }
                actions={
                  <Can permissions={[NOTICE_PERMISSIONS.create]}>
                    <Button onClick={noticeForm.open} leftIcon={<Plus className="size-4" />}>
                      New notice
                    </Button>
                  </Can>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<PinOff className="size-6" />}
                title="Nothing on the board"
                description={
                  table.hasActiveFilters
                    ? 'Nothing matches these filters.'
                    : 'Post the first notice.'
                }
              />
            }
          />
        </CardBody>
      </Card>

      {noticeForm.isOpen && (
        <NoticeFormModal
          isOpen={noticeForm.isOpen}
          onClose={noticeForm.close}
          onCreated={(notice) =>
            navigate(toPath(PATHS.communicationNoticeDetail, { id: notice.id }))
          }
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteNotice.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={deleteNotice.isPending}
        isDestructive
        title={`Delete “${pendingDelete?.title ?? ''}”?`}
        confirmLabel="Delete notice"
        message={
          <Alert tone="info">
            It is still a draft, so nobody has seen it. A published notice is archived rather
            than deleted.
          </Alert>
        }
      />
    </>
  );
}
