import { Building2, FileDown, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { formatCurrency } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { HostelFormModal } from '../components/HostelFormModal';
import {
  HIGH_OCCUPANCY_PERCENT,
  HOSTEL_PERMISSIONS,
  HOSTEL_TYPE_LABELS,
} from '../constants';
import { useDeleteHostel, useDownloadOccupancy, useHostels } from '../hooks/useHostel';
import type { Hostel } from '../types';

/** The blocks themselves — the container everything else hangs inside. */
export default function BlocksPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(HOSTEL_PERMISSIONS.update);
  const canDelete = hasPermission(HOSTEL_PERMISSIONS.delete);

  const { hostels, isLoading } = useHostels();
  const deleteHostel = useDeleteHostel();
  const downloadOccupancy = useDownloadOccupancy();

  const hostelForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editing, setEditing] = useState<Hostel | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Hostel | null>(null);

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <Skeleton key={index} className="h-56 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Can permissions={[HOSTEL_PERMISSIONS.create]}>
          <Button
            onClick={() => {
              setEditing(null);
              hostelForm.open();
            }}
            leftIcon={<Plus className="size-4" />}
          >
            Add hostel
          </Button>
        </Can>
      </div>

      {hostels.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Building2 className="size-6" />}
              title="No hostels"
              description="Add a block, then the rooms and beds inside it."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {hostels.map((hostel) => (
            <Card key={hostel.id}>
              <CardHeader
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    {hostel.name}
                    <Badge tone={hostel.type === 'boys' ? 'info' : 'warning'}>
                      {HOSTEL_TYPE_LABELS[hostel.type]}
                    </Badge>
                    {!hostel.is_active && <Badge tone="neutral">Closed</Badge>}
                  </span>
                }
                description={
                  <>
                    <code className="text-xs">{hostel.code}</code>
                    {hostel.warden_name
                      ? ` · Warden ${hostel.warden_name}${hostel.warden_phone ? ` · ${hostel.warden_phone}` : ''}`
                      : ' · No warden assigned'}
                  </>
                }
                actions={
                  <div className="flex gap-1">
                    <Can permissions={[HOSTEL_PERMISSIONS.print]}>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={`Download the occupancy sheet for ${hostel.name}`}
                        title="Occupancy sheet"
                        disabled={hostel.beds_count === 0}
                        onClick={() =>
                          downloadOccupancy.mutate({
                            hostelId: hostel.id,
                            hostelCode: hostel.code,
                          })
                        }
                      >
                        <FileDown className="size-4" />
                      </Button>
                    </Can>

                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={`Edit ${hostel.name}`}
                        onClick={() => {
                          setEditing(hostel);
                          hostelForm.open();
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
                        // A block with rooms in it is a building, not a row.
                        disabled={hostel.rooms_count > 0}
                        title={
                          hostel.rooms_count > 0
                            ? `${hostel.rooms_count} rooms are in this block`
                            : `Delete ${hostel.name}`
                        }
                        aria-label={`Delete ${hostel.name}`}
                        onClick={() => {
                          setPendingDelete(hostel);
                          deleteDialog.open();
                        }}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                }
              />

              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    ['Rooms', String(hostel.rooms_count)],
                    ['Beds', String(hostel.beds_count)],
                    ['Free', String(hostel.available_beds)],
                    ['Mess', formatCurrency(hostel.mess_charge)],
                  ].map(([label, value], index) => (
                    <div key={label}>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p
                        className={cn(
                          'mt-0.5 text-sm font-semibold',
                          index === 2 && hostel.available_beds === 0
                            ? 'text-amber-700'
                            : 'text-slate-900',
                        )}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <p className="text-xs font-medium text-slate-600">Occupancy</p>
                    <p className="text-xs text-slate-500">{hostel.occupancy_percent}%</p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full transition-[width] duration-300',
                        hostel.occupancy_percent >= HIGH_OCCUPANCY_PERCENT
                          ? 'bg-amber-500'
                          : 'bg-brand-500',
                      )}
                      style={{ width: `${hostel.occupancy_percent}%` }}
                    />
                  </div>
                </div>

                {hostel.address && (
                  <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                    {hostel.address}
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {hostelForm.isOpen && (
        <HostelFormModal
          key={editing?.id ?? 'new'}
          isOpen={hostelForm.isOpen}
          onClose={() => {
            hostelForm.close();
            setEditing(null);
          }}
          hostel={editing}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteHostel.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={deleteHostel.isPending}
        isDestructive
        title={`Delete ${pendingDelete?.name ?? 'this hostel'}?`}
        confirmLabel="Delete hostel"
        message={
          pendingDelete && pendingDelete.rooms_count > 0 ? (
            <Alert tone="warning">
              {pendingDelete.rooms_count} room
              {pendingDelete.rooms_count === 1 ? ' is' : 's are'} in this block. Remove them
              first, or close the block instead of deleting it.
            </Alert>
          ) : (
            'This cannot be undone.'
          )
        }
      />
    </div>
  );
}
