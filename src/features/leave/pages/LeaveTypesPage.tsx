import { CalendarRange, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { LeaveTypeFormModal } from '../components/LeaveTypeFormModal';
import { APPLICANT_TYPE_LABELS, LEAVE_PERMISSIONS } from '../constants';
import { useDeleteLeaveType, useLeaveTypes } from '../hooks/useLeave';
import type { LeaveType } from '../types';

/**
 * The kinds of leave the school recognises.
 *
 * Small, rarely edited, and the source of every rule the application form
 * enforces — which is why it is its own tab rather than a settings page
 * somewhere far away from the register it governs.
 */
export default function LeaveTypesPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(LEAVE_PERMISSIONS.update);
  const canDelete = hasPermission(LEAVE_PERMISSIONS.delete);

  const table = useTableQueryState({ defaultSortBy: 'name', defaultSortDir: 'asc' });
  const { data, isLoading, isFetching, error } = useLeaveTypes(table.queryParams);
  const removeType = useDeleteLeaveType();

  const typeForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editing, setEditing] = useState<LeaveType | null>(null);
  const [pendingDelete, setPendingDelete] = useState<LeaveType | null>(null);

  const columns: Column<LeaveType>[] = [
    {
      key: 'name',
      header: 'Type',
      sortable: true,
      cell: (type) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{type.name}</p>
          <p className="text-xs text-slate-500">
            <code>{type.code}</code> · {type.is_paid ? 'paid' : 'unpaid'}
          </p>
        </div>
      ),
    },
    {
      key: 'applies_to',
      header: 'Who may apply',
      cell: (type) => (
        <div className="flex flex-wrap gap-1">
          {type.applies_to.map((applicant) => (
            <Badge key={applicant} tone="neutral">
              {APPLICANT_TYPE_LABELS[applicant]}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'annual_quota',
      header: 'Quota',
      sortable: true,
      align: 'right',
      cell: (type) =>
        type.annual_quota === null ? (
          <span className="text-xs text-slate-400">None</span>
        ) : (
          <div>
            <p className="text-sm text-slate-800">{type.annual_quota}</p>
            <p className="text-xs whitespace-nowrap text-slate-500">days a year</p>
          </div>
        ),
    },
    {
      key: 'rules',
      header: 'Rules',
      hideBelow: 'lg',
      cell: (type) => {
        const rules = [
          type.requires_document ? 'document' : null,
          type.allows_backdated ? 'backdating allowed' : 'in advance only',
          type.max_consecutive_days === null
            ? null
            : `max ${type.max_consecutive_days} in a row`,
        ].filter(Boolean);

        return <p className="text-xs text-slate-600">{rules.join(' · ')}</p>;
      },
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      cell: (type) => (
        <Badge tone={type.is_active ? 'success' : 'neutral'} withDot>
          {type.is_active ? 'Available' : 'Retired'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (type) => (
        <div className="flex justify-end gap-1">
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${type.name}`}
              onClick={() => {
                setEditing(type);
                typeForm.open();
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
              // A type somebody has already applied for is history, not a row.
              disabled={type.applications_count > 0}
              title={
                type.applications_count > 0
                  ? `${type.applications_count} applications use it — retire it instead`
                  : `Delete ${type.name}`
              }
              aria-label={`Delete ${type.name}`}
              onClick={() => {
                setPendingDelete(type);
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
                searchPlaceholder="Name or code"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                actions={
                  <Can permissions={[LEAVE_PERMISSIONS.create]}>
                    <Button
                      onClick={() => {
                        setEditing(null);
                        typeForm.open();
                      }}
                      leftIcon={<Plus className="size-4" />}
                    >
                      Add leave type
                    </Button>
                  </Can>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<CalendarRange className="size-6" />}
                title="No leave types"
                description="Nobody can apply for leave until there is a kind of leave to apply for."
              />
            }
          />
        </CardBody>
      </Card>

      {typeForm.isOpen && (
        <LeaveTypeFormModal
          key={editing?.id ?? 'new'}
          isOpen={typeForm.isOpen}
          onClose={() => {
            typeForm.close();
            setEditing(null);
          }}
          leaveType={editing}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          removeType.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={removeType.isPending}
        isDestructive
        title={`Delete ${pendingDelete?.name ?? ''}?`}
        confirmLabel="Delete"
        message={
          pendingDelete && pendingDelete.applications_count > 0 ? (
            <Alert tone="warning">
              {pendingDelete.applications_count} applications use this type. Turn it off instead —
              that stops new requests without erasing the ones already decided.
            </Alert>
          ) : (
            'Nobody has used it, so nothing is lost.'
          )
        }
      />
    </>
  );
}
