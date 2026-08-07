import { ExternalLink, Radio, Smartphone, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import type { Column } from '@/components/table/types';
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
import { formatDateTime, formatNumber } from '@/lib/format';

import {
  CHANNEL_LABELS,
  CHANNEL_STATUS_LABELS,
  CHANNEL_STATUS_TONES,
  COMMUNICATION_PERMISSIONS,
  STALE_DEVICE_DAYS,
} from '../constants';
import { useChannels, usePurgeStaleDevices, usePushDevices } from '../hooks/useCommunication';
import type { PushDevice } from '../types';
import { useTableQueryState } from '@/hooks/useTableQueryState';

/**
 * Channel readiness, and the push registry behind it.
 *
 * Nothing here configures anything. SMTP and the SMS provider live in school
 * settings, which also owns the test-send; this screen says whether each
 * channel can send and links to where it is set up. Two places that both know
 * the SMTP password is one too many.
 *
 * "WhatsApp ready" and "push ready" mean what "biometric ready" means in
 * attendance: the registry, the delivery contract and the screens all exist
 * and work, and no vendor is bound.
 */
export default function ChannelsPage() {
  const { channels, isLoading } = useChannels();
  const table = useTableQueryState({ defaultSortBy: 'last_seen_at', defaultSortDir: 'desc' });
  const { data: devices, isLoading: devicesLoading } = usePushDevices(table.queryParams);
  const purgeDevices = usePurgeStaleDevices();
  const purgeDialog = useDisclosure();

  const staleCount = (devices?.data ?? []).filter((device) => device.is_stale).length;

  const deviceColumns: Column<PushDevice>[] = [
    {
      key: 'owner_name',
      header: 'Owner',
      sortable: true,
      cell: (device) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{device.owner_name}</p>
          <p className="truncate text-xs text-slate-500">{device.owner_type}</p>
        </div>
      ),
    },
    {
      key: 'platform',
      header: 'Platform',
      sortable: true,
      cell: (device) => <Badge tone="neutral">{device.platform}</Badge>,
    },
    {
      key: 'token_preview',
      header: 'Token',
      hideBelow: 'lg',
      cell: (device) => <code className="text-xs text-slate-500">{device.token_preview}</code>,
    },
    {
      key: 'app_version',
      header: 'App',
      hideBelow: 'xl',
      cell: (device) => device.app_version ?? '—',
    },
    {
      key: 'last_seen_at',
      header: 'Last seen',
      sortable: true,
      cell: (device) => (
        <div>
          <p className="text-sm whitespace-nowrap text-slate-800">
            {formatDateTime(device.last_seen_at)}
          </p>
          {device.is_stale && (
            <p className="text-xs whitespace-nowrap text-amber-700">probably uninstalled</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Channels"
          description="Whether each one can send right now. Credentials live in school settings."
        />

        <CardBody>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {channels.map((entry) => (
                <div
                  key={entry.channel}
                  className={cn(
                    'rounded-lg border p-3',
                    entry.status === 'ready'
                      ? 'border-slate-200'
                      : 'border-dashed border-slate-300 bg-slate-50',
                  )}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">
                      {CHANNEL_LABELS[entry.channel]}
                    </p>
                    <Badge tone={CHANNEL_STATUS_TONES[entry.status]} withDot>
                      {CHANNEL_STATUS_LABELS[entry.status]}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500">
                    {entry.detail ??
                      `${formatNumber(entry.sent_last_30_days)} sent in the last thirty days`}
                  </p>

                  {entry.registered_devices !== null && (
                    <p className="mt-1 text-xs text-slate-500">
                      {formatNumber(entry.registered_devices)} handsets registered
                    </p>
                  )}

                  {entry.configured_in === 'settings' && (
                    <Link
                      to={entry.channel === 'sms' ? PATHS.settingsSms : PATHS.settingsEmail}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-700 underline"
                    >
                      Set it up in settings
                      <ExternalLink className="size-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Alert tone="info">
        WhatsApp and push are wired the way attendance is wired for biometrics: the registry, the
        delivery contract and these screens all work, and no vendor is bound. A gateway pushes
        delivery receipts to the backend; nothing here talks to one directly.
      </Alert>

      <Card>
        <CardHeader
          title="Push registry"
          description="Handsets that have registered for notifications."
          actions={
            staleCount > 0 && (
              <Can permissions={[COMMUNICATION_PERMISSIONS.delete]}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={purgeDialog.open}
                  leftIcon={<Trash2 className="size-4" />}
                >
                  Clear {staleCount} stale
                </Button>
              </Can>
            )
          }
        />

        <CardBody className="p-0">
          <DataTable
            columns={deviceColumns}
            rows={devices?.data}
            meta={devices?.meta}
            isLoading={devicesLoading}
            sortBy={table.sortBy}
            sortDir={table.sortDir}
            onSort={table.toggleSort}
            onPageChange={table.setPage}
            onPerPageChange={table.setPerPage}
            toolbar={
              <TableToolbar
                search={table.search}
                onSearchChange={table.setSearch}
                searchPlaceholder="Owner name"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
              />
            }
            emptyState={
              <EmptyState
                icon={<Smartphone className="size-6" />}
                title="No handsets registered"
                description="Push notifications reach nobody until an app registers a token."
              />
            }
          />
        </CardBody>
      </Card>

      <ConfirmDialog
        isOpen={purgeDialog.isOpen}
        onClose={purgeDialog.close}
        onConfirm={() => purgeDevices.mutate(undefined, { onSuccess: purgeDialog.close })}
        isLoading={purgeDevices.isPending}
        isDestructive
        title="Clear stale tokens?"
        confirmLabel="Clear them"
        message={
          <p className="text-sm text-slate-600">
            {staleCount} handset{staleCount === 1 ? '' : 's'} have not been seen for{' '}
            {STALE_DEVICE_DAYS} days — almost certainly uninstalled apps. Clearing them stops
            push sends counting failures against people who no longer have the app.
          </p>
        }
      />

      {channels.length === 0 && !isLoading && (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Radio className="size-6" />}
              title="No channels"
              description="Nothing is configured."
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
