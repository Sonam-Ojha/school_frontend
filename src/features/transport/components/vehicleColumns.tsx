import { Pencil, Trash2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import { ComplianceBadge } from './ComplianceBadge';
import { VEHICLE_STATUS_LABELS, VEHICLE_STATUS_TONES } from '../constants';
import type { Vehicle } from '../types';

interface VehicleColumnOptions {
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export function buildVehicleColumns({
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: VehicleColumnOptions): Column<Vehicle>[] {
  return [
    {
      key: 'name',
      header: 'Bus',
      sortable: true,
      cell: (vehicle) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{vehicle.name}</p>
          <p className="truncate text-xs text-slate-500">
            <code>{vehicle.registration_no}</code>
            {vehicle.model ? ` · ${vehicle.make ?? ''} ${vehicle.model}`.trimEnd() : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'driver_name',
      header: 'Driver',
      sortable: true,
      hideBelow: 'md',
      cell: (vehicle) =>
        vehicle.driver_name ? (
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-900">{vehicle.driver_name}</p>
            {vehicle.driver_phone && (
              <p className="truncate text-xs text-slate-500">{vehicle.driver_phone}</p>
            )}
          </div>
        ) : (
          <span className="text-xs text-amber-700">Nobody assigned</span>
        ),
    },
    {
      key: 'route_name',
      header: 'Route',
      hideBelow: 'lg',
      cell: (vehicle) =>
        vehicle.route_name ?? <span className="text-xs text-slate-400">Not on a route</span>,
    },
    {
      key: 'capacity',
      header: 'Seats',
      sortable: true,
      align: 'right',
      hideBelow: 'sm',
      cell: (vehicle) => vehicle.capacity,
    },
    {
      key: 'compliance',
      header: 'Papers',
      sortable: true,
      cell: (vehicle) => <ComplianceBadge status={vehicle.compliance} />,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      hideBelow: 'sm',
      cell: (vehicle) => (
        <Badge tone={VEHICLE_STATUS_TONES[vehicle.status]} withDot>
          {VEHICLE_STATUS_LABELS[vehicle.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (vehicle) => (
        <div className="flex justify-end gap-1">
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${vehicle.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(vehicle);
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
              aria-label={`Delete ${vehicle.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(vehicle);
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
