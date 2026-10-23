import { Fingerprint, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateTime } from '@/lib/format';

import { ATTENDANCE_PERMISSIONS, DEVICE_STATUS_LABELS, DEVICE_STATUS_TONES } from '../constants';
import { useBiometricDevices, useDeleteDevice } from '../hooks/useDevices';
import type { BiometricDevice, RegisteredDevice } from '../types';

import { DeviceFormModal } from './DeviceFormModal';
import { DeviceKeyDialog } from './DeviceKeyDialog';

/**
 * Attendance readers and their health.
 *
 * A reader sends its scans to the server by itself, as they happen; nothing
 * is read from the device by the browser. This screen is where a reader is
 * registered — scans from one that is not are refused — and where somebody
 * can see that a reader has gone quiet, or that people are scanning under
 * numbers the school does not know.
 */
export function BiometricDevicesCard() {
  const { data: devices, isLoading, error } = useBiometricDevices();
  const deleteDevice = useDeleteDevice();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BiometricDevice | null>(null);
  const [removing, setRemoving] = useState<BiometricDevice | null>(null);
  const [issued, setIssued] = useState<RegisteredDevice | null>(null);

  const openForm = (device: BiometricDevice | null) => {
    setEditing(device);
    setFormOpen(true);
  };

  return (
    <Card>
      <CardHeader
        title="Biometric devices"
        description="Fingerprint, face and card readers that send their scans into attendance."
        actions={
          <Can permissions={[ATTENDANCE_PERMISSIONS.approve]}>
            <Button size="sm" onClick={() => openForm(null)} leftIcon={<Plus className="size-4" />}>
              Register a reader
            </Button>
          </Can>
        }
      />

      <CardBody className="p-0">
        {error ? (
          <div className="p-4 sm:p-6">
            <Alert tone="danger" title="Could not load devices">
              {error.message}
            </Alert>
          </div>
        ) : isLoading ? (
          <ul className="divide-y divide-slate-100">
            {Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-4 sm:px-6">
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </li>
            ))}
          </ul>
        ) : devices && devices.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {devices.map((device) => (
              <li
                key={device.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Fingerprint className="size-4" aria-hidden />
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">{device.name}</p>
                      <Badge tone={DEVICE_STATUS_TONES[device.status]}>
                        {DEVICE_STATUS_LABELS[device.status]}
                      </Badge>
                    </div>

                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                      <code>{device.serial_number}</code>
                      {device.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" aria-hidden />
                          {device.location}
                        </span>
                      )}
                      <span>
                        Last heard from {formatDateTime(device.last_sync_at, 'never')}
                        {device.last_sync_count > 0 && ` · ${device.last_sync_count} scans`}
                      </span>
                    </p>

                    {device.error_message && (
                      <p className="mt-1 text-xs text-red-600">{device.error_message}</p>
                    )}
                    {device.unknown_ids && device.unknown_ids.length > 0 && (
                      <p className="mt-1 text-xs text-amber-700">
                        Scans from numbers nobody is enrolled under: {device.unknown_ids.join(', ')}.
                        Enrol people under their admission number or employee ID.
                      </p>
                    )}
                  </div>
                </div>

                <Can permissions={[ATTENDANCE_PERMISSIONS.approve]}>
                  <div className="flex shrink-0 items-center gap-1 self-start sm:self-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label={`Edit ${device.name}`}
                      onClick={() => openForm(device)}
                      leftIcon={<Pencil className="size-4" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label={`Remove ${device.name}`}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setRemoving(device)}
                      leftIcon={<Trash2 className="size-4" />}
                    />
                  </div>
                </Can>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<Fingerprint className="size-6" />}
            title="No readers registered"
            description="Register each reader here with its serial number, then point the reader at this server. Its scans are refused until it is registered."
          />
        )}
      </CardBody>

      {formOpen && (
        <DeviceFormModal
          isOpen
          device={editing}
          onClose={() => setFormOpen(false)}
          onKeyIssued={setIssued}
        />
      )}

      <DeviceKeyDialog device={issued} onClose={() => setIssued(null)} />

      <ConfirmDialog
        isOpen={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) deleteDevice.mutate(removing.id, { onSettled: () => setRemoving(null) });
        }}
        title="Remove this reader?"
        message={
          <>
            Scans from <strong>{removing?.name}</strong> will be refused from now on. Attendance it
            has already recorded stays as it is.
          </>
        }
        confirmLabel="Remove"
        isDestructive
        isLoading={deleteDevice.isPending}
      />
    </Card>
  );
}
