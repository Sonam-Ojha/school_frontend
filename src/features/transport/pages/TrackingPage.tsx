import { Plus, Radio, RadioTower, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';

import { GpsDeviceModal } from '../components/GpsDeviceModal';
import { GpsKeyDialog } from '../components/GpsKeyDialog';
import { RouteProgress } from '../components/RouteProgress';
import {
  GPS_STATUS_LABELS,
  GPS_STATUS_TONES,
  TRACKING_POLL_MS,
  TRANSPORT_PERMISSIONS,
} from '../constants';
import {
  useGpsDevices,
  useRemoveGpsDevice,
  useRoute,
  useVehiclePositions,
} from '../hooks/useTransport';
import type { GpsDevice, RegisteredGpsDevice, VehiclePosition } from '../types';

/**
 * Live tracking.
 *
 * A tracker — or a phone running a tracking app — reports its position to the
 * server by itself, identified by the key it was given when it was registered
 * here. This screen polls for what has arrived, every {@link TRACKING_POLL_MS}.
 * A bus whose tracker has never reported is not listed: nothing is drawn that
 * was not sent, unless the server is running with its demonstration switch on.
 */
export default function TrackingPage() {
  const { data: positions, isLoading, dataUpdatedAt } = useVehiclePositions();
  const { data: devices } = useGpsDevices();
  const removeDevice = useRemoveGpsDevice();

  const deviceForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editing, setEditing] = useState<GpsDevice | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GpsDevice | null>(null);
  const [issued, setIssued] = useState<RegisteredGpsDevice | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const rows = positions ?? [];
  const offline = rows.filter((position) => position.status === 'offline');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Where the buses are"
          description={
            dataUpdatedAt
              ? `Updated ${formatDateTime(new Date(dataUpdatedAt))} · refreshes every ${TRACKING_POLL_MS / 1000}s`
              : 'Waiting for the first fix…'
          }
          actions={
            <Can permissions={[TRANSPORT_PERMISSIONS.create]}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(null);
                  deviceForm.open();
                }}
                leftIcon={<Plus className="size-4" />}
              >
                Register a tracker
              </Button>
            </Can>
          }
        />
      </Card>

      {offline.length > 0 && (
        <Alert
          tone="warning"
          title={`${offline.length} bus${offline.length === 1 ? '' : 'es'} not reporting`}
        >
          {offline.map((position) => position.vehicle_name).join(', ')} — the tracker has stopped
          sending. The bus may still be running; the fix is not.
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<RadioTower className="size-6" />}
              title="Nothing to track yet"
              description="Register a tracker against a bus, and its position will appear here."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((position) => (
            <VehicleCard
              key={position.vehicle_id}
              position={position}
              isExpanded={expanded === position.vehicle_id}
              onToggle={() =>
                setExpanded(expanded === position.vehicle_id ? null : position.vehicle_id)
              }
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader
          title="Trackers"
          description="The devices fitted to the fleet."
        />
        <CardBody className={(devices ?? []).length === 0 ? undefined : 'p-0'}>
          {(devices ?? []).length === 0 ? (
            <EmptyState
              icon={<Radio className="size-6" />}
              title="No trackers registered"
              description="Register a device against a bus to start receiving positions."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {(devices ?? []).map((device) => (
                <li key={device.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      <code>{device.imei}</code>
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {device.provider}
                      {device.sim_number ? ` · ${device.sim_number}` : ''}
                      {device.vehicle_registration
                        ? ` · ${device.vehicle_registration}`
                        : ' · not fitted'}
                    </p>
                  </div>

                  <Badge tone={GPS_STATUS_TONES[device.status]} withDot>
                    {GPS_STATUS_LABELS[device.status]}
                  </Badge>

                  <Can permissions={[TRANSPORT_PERMISSIONS.update]}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(device);
                        deviceForm.open();
                      }}
                    >
                      Edit
                    </Button>
                  </Can>

                  <Can permissions={[TRANSPORT_PERMISSIONS.delete]}>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label={`Remove tracker ${device.imei}`}
                      onClick={() => {
                        setPendingDelete(device);
                        deleteDialog.open();
                      }}
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </Can>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {deviceForm.isOpen && (
        <GpsDeviceModal
          key={editing?.id ?? 'new'}
          isOpen={deviceForm.isOpen}
          onClose={() => {
            deviceForm.close();
            setEditing(null);
          }}
          device={editing}
          onKeyIssued={setIssued}
        />
      )}

      <GpsKeyDialog device={issued} onClose={() => setIssued(null)} />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          removeDevice.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={removeDevice.isPending}
        isDestructive
        title="Remove this tracker?"
        confirmLabel="Remove tracker"
        message="The bus stops appearing on the live view. Its position history is kept."
      />

      {/* Unused here, but keeps the expanded-card lookup honest about routes. */}
      <span className="sr-only" aria-hidden />
    </div>
  );
}

/** One bus, with its run drawn underneath when opened. */
function VehicleCard({
  position,
  isExpanded,
  onToggle,
}: {
  position: VehiclePosition;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  // Only fetched once somebody opens the card — the strip needs the stops,
  // and pulling every route's stops for a fleet view would be wasteful.
  const { data: route } = useRoute(isExpanded && position.route_id ? position.route_id : undefined);

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{position.vehicle_name}</p>
            <p className="truncate text-xs text-slate-500">
              <code>{position.registration_no}</code>
              {position.route_name ? ` · ${position.route_name}` : ' · not on a route'}
              {position.driver_name ? ` · ${position.driver_name}` : ''}
            </p>
          </div>

          <Badge tone={GPS_STATUS_TONES[position.status]} withDot>
            {GPS_STATUS_LABELS[position.status]}
          </Badge>
        </div>

        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Speed</dt>
            <dd className="font-medium text-slate-900">{Math.round(position.speed_kmph)} km/h</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">On board</dt>
            <dd className="font-medium text-slate-900">{position.students_on_board}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Last fix</dt>
            <dd
              className={cn(
                'text-xs',
                position.is_stale ? 'font-medium text-amber-700' : 'text-slate-600',
              )}
            >
              {position.is_stale ? 'stale' : formatDateTime(position.recorded_at)}
            </dd>
          </div>
        </dl>

        {position.route_id && (
          <Button variant="ghost" size="sm" fullWidth onClick={onToggle}>
            {isExpanded ? 'Hide the run' : 'Show the run'}
          </Button>
        )}

        {isExpanded && route && <RouteProgress stops={route.stops} position={position} />}

        <p className="text-[11px] text-slate-400">
          {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)} · heading{' '}
          {Math.round(position.heading_degrees)}°
        </p>
      </CardBody>
    </Card>
  );
}
