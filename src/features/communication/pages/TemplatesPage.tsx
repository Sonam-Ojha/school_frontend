import { Pencil, Plus, StickyNote, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
import { useAuthStore } from '@/store/authStore';

import { TemplateFormModal } from '../components/TemplateFormModal';
import {
  APPROVAL_LABELS,
  APPROVAL_TONES,
  CHANNEL_LABELS,
  CHANNEL_OPTIONS,
  COMMUNICATION_PERMISSIONS,
  SEGMENT_WARNING,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_OPTIONS,
} from '../constants';
import { useDeleteTemplate, useTemplates } from '../hooks/useCommunication';
import type { MessageTemplate } from '../types';

export default function TemplatesPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(COMMUNICATION_PERMISSIONS.update);
  const canDelete = hasPermission(COMMUNICATION_PERMISSIONS.delete);

  const table = useTableQueryState({
    defaultSortBy: 'name',
    defaultSortDir: 'asc',
    filterKeys: ['channel', 'category'],
  });

  const { data, isLoading, isFetching, error } = useTemplates(table.queryParams);
  const deleteTemplate = useDeleteTemplate();

  const templateForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editing, setEditing] = useState<MessageTemplate | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MessageTemplate | null>(null);

  const columns: Column<MessageTemplate>[] = [
    {
      key: 'name',
      header: 'Template',
      sortable: true,
      cell: (template) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{template.name}</p>
          <p className="truncate text-xs text-slate-500">
            <code>{template.code}</code>
            {!template.is_active && ' · retired'}
          </p>
        </div>
      ),
    },
    {
      key: 'channel',
      header: 'Channel',
      sortable: true,
      cell: (template) => <Badge tone="neutral">{CHANNEL_LABELS[template.channel]}</Badge>,
    },
    {
      key: 'category',
      header: 'Category',
      hideBelow: 'lg',
      cell: (template) => TEMPLATE_CATEGORY_LABELS[template.category],
    },
    {
      key: 'placeholders',
      header: 'Placeholders',
      hideBelow: 'xl',
      cell: (template) =>
        template.placeholders.length === 0 ? (
          <span className="text-xs text-slate-400">none</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {template.placeholders.slice(0, 3).map((key) => (
              <code key={key} className="text-[11px] text-slate-600">
                {key}
              </code>
            ))}
            {template.placeholders.length > 3 && (
              <span className="text-[11px] text-slate-400">
                +{template.placeholders.length - 3}
              </span>
            )}
          </div>
        ),
    },
    {
      key: 'segments',
      header: 'Cost',
      align: 'right',
      hideBelow: 'md',
      cell: (template) =>
        template.segments === null ? (
          <span className="text-xs text-slate-400">—</span>
        ) : (
          <span
            className={
              template.segments > SEGMENT_WARNING
                ? 'text-sm font-medium text-amber-700'
                : 'text-sm text-slate-700'
            }
          >
            {template.segments} seg
          </span>
        ),
    },
    {
      key: 'approval',
      header: 'Approval',
      sortable: true,
      cell: (template) => (
        <Badge tone={APPROVAL_TONES[template.approval]} withDot>
          {APPROVAL_LABELS[template.approval]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (template) => (
        <div className="flex justify-end gap-1">
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${template.name}`}
              onClick={() => {
                setEditing(template);
                templateForm.open();
              }}
            >
              <Pencil className="size-4" />
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Delete ${template.name}`}
              onClick={() => {
                setPendingDelete(template);
                deleteDialog.open();
              }}
            >
              <Trash2 className="size-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Alert tone="info" className="mb-4">
        WhatsApp templates have to be approved by Meta before they can be sent — the status here
        is theirs, not the school's, and an unapproved template will not appear on the compose
        screen.
      </Alert>

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
            toolbar={
              <TableToolbar
                search={table.search}
                onSearchChange={table.setSearch}
                searchPlaceholder="Name, code or body"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <>
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
                  <Can permissions={[COMMUNICATION_PERMISSIONS.create]}>
                    <Button
                      onClick={() => {
                        setEditing(null);
                        templateForm.open();
                      }}
                      leftIcon={<Plus className="size-4" />}
                    >
                      Add template
                    </Button>
                  </Can>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<StickyNote className="size-6" />}
                title="No templates"
                description="Write the messages this school sends over and over."
              />
            }
          />
        </CardBody>
      </Card>

      {templateForm.isOpen && (
        <TemplateFormModal
          key={editing?.id ?? 'new'}
          isOpen={templateForm.isOpen}
          onClose={() => {
            templateForm.close();
            setEditing(null);
          }}
          template={editing}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteTemplate.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={deleteTemplate.isPending}
        isDestructive
        title={`Delete ${pendingDelete?.name ?? 'this template'}?`}
        confirmLabel="Delete template"
        message="Messages already sent with it keep their text. This cannot be undone."
      />
    </>
  );
}
