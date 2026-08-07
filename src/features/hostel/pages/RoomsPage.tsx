import { BedDouble, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { HostelStats } from '../components/HostelStats';
import { RoomFormModal } from '../components/RoomFormModal';
import { buildRoomColumns } from '../components/roomColumns';
import { HOSTEL_PERMISSIONS, ROOM_STATUS_LABELS, ROOM_TYPE_OPTIONS } from '../constants';
import { useDeleteRoom, useHostels, useRoom, useRooms } from '../hooks/useHostel';
import type { HostelRoom, RoomStatus } from '../types';

const STATUS_OPTIONS = (Object.keys(ROOM_STATUS_LABELS) as RoomStatus[]).map((status) => ({
  label: ROOM_STATUS_LABELS[status],
  value: status,
}));

export default function RoomsPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'room_no',
    defaultSortDir: 'asc',
    filterKeys: ['hostel_id', 'type', 'status'],
  });

  const { data, isLoading, isFetching, error } = useRooms(table.queryParams);
  const { hostelOptions } = useHostels();
  const deleteRoom = useDeleteRoom();

  const roomForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HostelRoom | null>(null);

  // The form needs the beds; the table row is the summary shape.
  const { data: editing } = useRoom(editingId ?? undefined);

  const columns = buildRoomColumns({
    onEdit: (room) => {
      setEditingId(room.id);
      roomForm.open();
    },
    onDelete: (room) => {
      setPendingDelete(room);
      deleteDialog.open();
    },
    canUpdate: hasPermission(HOSTEL_PERMISSIONS.update),
    canDelete: hasPermission(HOSTEL_PERMISSIONS.delete),
  });

  return (
    <div className="space-y-4">
      <HostelStats />

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
            onRowClick={(room) => navigate(toPath(PATHS.hostelRoomDetail, { id: room.id }))}
            toolbar={
              <TableToolbar
                search={table.search}
                onSearchChange={table.setSearch}
                searchPlaceholder="Room number"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <>
                    <Select
                      aria-label="Filter by hostel"
                      value={table.filters.hostel_id ?? ''}
                      options={hostelOptions}
                      placeholder="All blocks"
                      onChange={(event) =>
                        table.setFilter('hostel_id', event.target.value || undefined)
                      }
                      className="w-52"
                    />
                    <Select
                      aria-label="Filter by room type"
                      value={table.filters.type ?? ''}
                      options={ROOM_TYPE_OPTIONS}
                      placeholder="Any type"
                      onChange={(event) =>
                        table.setFilter('type', event.target.value || undefined)
                      }
                      className="w-36"
                    />
                    <Select
                      aria-label="Filter by status"
                      value={table.filters.status ?? ''}
                      options={STATUS_OPTIONS}
                      placeholder="Any status"
                      onChange={(event) =>
                        table.setFilter('status', event.target.value || undefined)
                      }
                      className="w-40"
                    />
                  </>
                }
                actions={
                  <Can permissions={[HOSTEL_PERMISSIONS.create]}>
                    <Button
                      onClick={() => {
                        setEditingId(null);
                        roomForm.open();
                      }}
                      leftIcon={<Plus className="size-4" />}
                    >
                      Add room
                    </Button>
                  </Can>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<BedDouble className="size-6" />}
                title="No rooms"
                description={
                  table.hasActiveFilters
                    ? 'Nothing matches these filters.'
                    : 'Add a block first, then the rooms inside it.'
                }
              />
            }
          />
        </CardBody>
      </Card>

      {roomForm.isOpen && (editingId === null || editing) && (
        <RoomFormModal
          key={editingId ?? 'new'}
          isOpen={roomForm.isOpen}
          onClose={() => {
            roomForm.close();
            setEditingId(null);
          }}
          room={editingId === null ? null : (editing ?? null)}
          defaultHostelId={
            table.filters.hostel_id ? Number(table.filters.hostel_id) : null
          }
          onCreated={(room) => navigate(toPath(PATHS.hostelRoomDetail, { id: room.id }))}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteRoom.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={deleteRoom.isPending}
        isDestructive
        title={`Delete room ${pendingDelete?.room_no ?? ''}?`}
        confirmLabel="Delete room"
        message={
          pendingDelete && pendingDelete.occupied_beds > 0 ? (
            <Alert tone="warning">
              {pendingDelete.occupied_beds} bed
              {pendingDelete.occupied_beds === 1 ? ' is' : 's are'} occupied. Move those residents
              first.
            </Alert>
          ) : (
            'Its beds go with it. This cannot be undone.'
          )
        }
      />
    </div>
  );
}
