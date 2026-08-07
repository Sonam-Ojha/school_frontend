import { Pencil, Trash2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';

import { ROOM_STATUS_LABELS, ROOM_STATUS_TONES, ROOM_TYPE_LABELS } from '../constants';
import type { HostelRoom } from '../types';

interface RoomColumnOptions {
  onEdit: (room: HostelRoom) => void;
  onDelete: (room: HostelRoom) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

/** Free beds as a fraction — "2 of 4" is what a warden needs, not "50%". */
function renderBeds(room: HostelRoom) {
  if (room.beds_count === 0) {
    return <span className="text-xs text-amber-700">No beds</span>;
  }

  const none = room.available_beds === 0;

  return (
    <div>
      <p className={cn('text-sm font-semibold', none ? 'text-slate-500' : 'text-emerald-700')}>
        {room.available_beds}
        <span className="text-xs font-normal text-slate-400"> of {room.beds_count}</span>
      </p>
      <p className="text-xs whitespace-nowrap text-slate-500">
        {none ? 'full' : `${room.available_beds} free`}
      </p>
    </div>
  );
}

export function buildRoomColumns({
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: RoomColumnOptions): Column<HostelRoom>[] {
  return [
    {
      key: 'room_no',
      header: 'Room',
      sortable: true,
      cell: (room) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{room.room_no}</p>
          <p className="truncate text-xs text-slate-500">
            {room.hostel_name} · floor {room.floor}
          </p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      hideBelow: 'md',
      cell: (room) => (
        <div>
          <p className="text-sm text-slate-800">{ROOM_TYPE_LABELS[room.type]}</p>
          <p className="text-xs text-slate-500">
            {[room.has_ac ? 'AC' : null, room.has_attached_bath ? 'attached bath' : null]
              .filter(Boolean)
              .join(' · ') || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'monthly_rent',
      header: 'Rent',
      sortable: true,
      align: 'right',
      hideBelow: 'lg',
      cell: (room) => (
        <div>
          <p className="text-sm text-slate-800">{formatCurrency(room.monthly_rent)}</p>
          <p className="text-xs text-slate-500">per bed</p>
        </div>
      ),
    },
    {
      key: 'available_beds',
      header: 'Beds',
      sortable: true,
      align: 'right',
      cell: renderBeds,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (room) => (
        <Badge tone={ROOM_STATUS_TONES[room.status]} withDot>
          {ROOM_STATUS_LABELS[room.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (room) => (
        <div className="flex justify-end gap-1">
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit room ${room.room_no}`}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(room);
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
              // A room with residents in it is not a row to delete.
              disabled={room.occupied_beds > 0}
              title={
                room.occupied_beds > 0
                  ? `${room.occupied_beds} beds are occupied`
                  : `Delete room ${room.room_no}`
              }
              aria-label={`Delete room ${room.room_no}`}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(room);
              }}
            >
              <Trash2 className="size-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];
}
