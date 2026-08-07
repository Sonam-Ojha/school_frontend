import { Fingerprint, MapPin, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateTime } from '@/lib/format';

import { DEVICE_STATUS_LABELS, DEVICE_STATUS_TONES } from '../constants';
import { useBiometricDevices, useSyncDevice } from '../hooks/useDevices';

/**
 * Biometric readers and their health.
 *
 * Devices push punches to the backend on their own schedule; this screen
 * exists so someone can see a reader has gone quiet and pull its buffer
 * manually. Nothing is read from the device by the browser — that is the
 * backend's job, and the reason this is "biometric ready" rather than
 * "biometric capture".
 */
export function BiometricDevicesCard() {
  const { data: devices, isLoading, error } = useBiometricDevices();
  const syncDevice = useSyncDevice();
  const [syncingId, setSyncingId] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader
        title="Biometric devices"
        description="Fingerprint and face readers that push punches into attendance."
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
                        Last sync {formatDateTime(device.last_sync_at, 'never')}
                        {device.last_sync_count > 0 && ` · ${device.last_sync_count} punches`}
                      </span>
                    </p>

                    {device.error_message && (
                      <p className="mt-1 text-xs text-red-600">{device.error_message}</p>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 self-start sm:self-auto"
                  disabled={device.status === 'offline'}
                  isLoading={syncDevice.isPending && syncingId === device.id}
                  onClick={() => {
                    setSyncingId(device.id);
                    syncDevice.mutate(device.id, { onSettled: () => setSyncingId(null) });
                  }}
                  leftIcon={<RefreshCw className="size-4" />}
                >
                  Sync now
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<Fingerprint className="size-6" />}
            title="No devices registered"
            description="Register a reader from the device itself; it appears here once it first reports in."
          />
        )}
      </CardBody>
    </Card>
  );
}
