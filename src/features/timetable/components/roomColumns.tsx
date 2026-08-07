import { CalendarRange, Pencil, Trash2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

import { HIGH_UTILISATION_PERCENT, ROOM_TYPE_LABELS, ROOM_TYPE_TONES } from '../constants';
import type { Room } from '../types';

interface RoomColumnOptions {
  onViewGrid: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  canUpdate: boolean;
  canDelete: boolean;
  selectedRoomId: number | null;
}

/** Where the room is, from whichever of building and floor is recorded. */
function locationOf(room: Room): string {
  const parts = [room.building, room.floor === null ? null : `Floor ${room.floor}`];
  const known = parts.filter((part): part is string => Boolean(part));
  return known.length > 0 ? known.join(' · ') : '—';
}

export function buildRoomColumns({
  onViewGrid,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
  selectedRoomId,
}: RoomColumnOptions): Column<Room>[] {
  return [
    {
      key: 'name',
      header: 'Room',
      sortable: true,
      cell: (room) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{room.name}</p>
          <p className="truncate text-xs text-slate-500">
            <code>{room.code}</code>
            {!room.is_active && ' · unavailable'}
          </p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      hideBelow: 'sm',
      cell: (room) => <Badge tone={ROOM_TYPE_TONES[room.type]}>{ROOM_TYPE_LABELS[room.type]}</Badge>,
    },
    {
      key: 'building',
      header: 'Location',
      hideBelow: 'lg',
      cell: locationOf,
    },
    {
      key: 'capacity',
      header: 'Seats',
      sortable: true,
      align: 'right',
      hideBelow: 'sm',
      cell: (room) => room.capacity,
    },
    {
      key: 'utilisation_percent',
      header: 'Used',
      sortable: true,
      align: 'right',
      cell: (room) => (
        <div>
          <p
            className={cn(
              'text-sm font-semibold',
              room.utilisation_percent >= HIGH_UTILISATION_PERCENT
                ? 'text-amber-700'
                : 'text-slate-900',
            )}
          >
            {room.utilisation_percent}%
          </p>
          <p className="text-xs whitespace-nowrap text-slate-500">
            {room.allocated_periods} period{room.allocated_periods === 1 ? '' : 's'}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (room) => (
        <div className="flex justify-end gap-1">
          <Button
            variant={selectedRoomId === room.id ? 'secondary' : 'ghost'}
            size="sm"
            iconOnly
            aria-label={`Show the weekly allocation for ${room.name}`}
            onClick={() => onViewGrid(room)}
          >
            <CalendarRange className="size-4" />
          </Button>

          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${room.name}`}
              onClick={() => onEdit(room)}
            >
              <Pencil className="size-4" />
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Delete ${room.name}`}
              onClick={() => onDelete(room)}
            >
              <Trash2 className="size-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];
}
