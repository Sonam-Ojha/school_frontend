import { DoorOpen, Plus, Printer } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { GridSummary } from '../components/GridSummary';
import { RoomFormModal } from '../components/RoomFormModal';
import { SlotCell } from '../components/SlotCell';
import { WeeklyGrid } from '../components/WeeklyGrid';
import { buildRoomColumns } from '../components/roomColumns';
import { ROOM_PERMISSIONS, ROOM_TYPE_OPTIONS, TIMETABLE_PERMISSIONS } from '../constants';
import { useDeleteRoom, useRoomGrid, useRooms } from '../hooks/useTimetable';
import type { Room } from '../types';

/**
 * The room register, and what each room is holding.
 *
 * Allocation is not a record of its own — it is the slots that name the room,
 * which is why the utilisation figures move the moment a lesson does.
 */
export default function RoomAllocationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({ defaultSortBy: 'name', defaultSortDir: 'asc', filterKeys: ['type'] });
  const { data, isLoading, isFetching, error } = useRooms(table.queryParams);

  const selectedRoomId = Number(searchParams.get('room_id')) || null;
  const { data: grid, isLoading: gridLoading } = useRoomGrid(selectedRoomId);

  const deleteRoom = useDeleteRoom();
  const roomForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editing, setEditing] = useState<Room | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Room | null>(null);

  const selectRoom = (room: Room) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        // Clicking the open room's button again closes its grid.
        if (Number(next.get('room_id')) === room.id) next.delete('room_id');
        else next.set('room_id', String(room.id));
        return next;
      },
      { replace: true },
    );
  };

  const columns = buildRoomColumns({
    onViewGrid: selectRoom,
    onEdit: (room) => {
      setEditing(room);
      roomForm.open();
    },
    onDelete: (room) => {
      setPendingDelete(room);
      deleteDialog.open();
    },
    canUpdate: hasPermission(ROOM_PERMISSIONS.update),
    canDelete: hasPermission(ROOM_PERMISSIONS.delete),
    selectedRoomId,
  });

  return (
    <div className="space-y-4">
      <Card className="print-hidden">
        <CardHeader
          title="Rooms"
          description="Every space a lesson can be allocated to, and how hard each is working."
          actions={
            <Can permissions={[ROOM_PERMISSIONS.create]}>
              <Button
                onClick={() => {
                  setEditing(null);
                  roomForm.open();
                }}
                leftIcon={<Plus className="size-4" />}
              >
                Add room
              </Button>
            </Can>
          }
        />

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
                searchPlaceholder="Search by name or code"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <Select
                    aria-label="Filter by room type"
                    value={table.filters.type ?? ''}
                    options={ROOM_TYPE_OPTIONS}
                    placeholder="All types"
                    onChange={(event) => table.setFilter('type', event.target.value || undefined)}
                    className="w-44"
                  />
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<DoorOpen className="size-6" />}
                title="No rooms"
                description="Add the classrooms, labs and halls lessons can be held in."
              />
            }
          />
        </CardBody>
      </Card>

      {selectedRoomId !== null &&
        (gridLoading ? (
          <Card>
            <CardBody className="space-y-2">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-11 w-full" />
              ))}
            </CardBody>
          </Card>
        ) : grid ? (
          <>
            <GridSummary summary={grid.summary} loadLabel="Classes" />

            <Card>
              <CardHeader
                title={grid.title}
                description={grid.subtitle}
                className="print-hidden"
                actions={
                  <Can permissions={[TIMETABLE_PERMISSIONS.print]}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      leftIcon={<Printer className="size-4" />}
                    >
                      Print
                    </Button>
                  </Can>
                }
              />

              <CardBody className="p-0 sm:p-2">
                <div className="print-target">
                  <h2 className="hidden text-base font-semibold text-slate-900 print:block">
                    {grid.title}
                  </h2>

                  <WeeklyGrid
                    grid={grid}
                    renderCell={(slot) => <SlotCell slot={slot} scope="room" />}
                  />
                </div>
              </CardBody>
            </Card>
          </>
        ) : null)}

      <RoomFormModal
        isOpen={roomForm.isOpen}
        onClose={() => {
          roomForm.close();
          setEditing(null);
        }}
        room={editing}
      />

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
        title={`Delete ${pendingDelete?.name ?? 'this room'}?`}
        confirmLabel="Delete room"
        message={
          pendingDelete && pendingDelete.allocated_periods > 0 ? (
            <Alert tone="warning">
              {pendingDelete.allocated_periods} period
              {pendingDelete.allocated_periods === 1 ? ' is' : 's are'} allocated to it. Clear
              those lessons first, or mark the room unavailable instead.
            </Alert>
          ) : (
            'This cannot be undone.'
          )
        }
      />
    </div>
  );
}
