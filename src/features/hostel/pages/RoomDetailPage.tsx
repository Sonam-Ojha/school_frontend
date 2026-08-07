import { ArrowLeft, Pencil, Plus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatCurrency } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { AllocateBedModal } from '../components/AllocateBedModal';
import { AddBedsModal, EditBedModal } from '../components/BedFormModals';
import { BedGrid } from '../components/BedGrid';
import { RoomFormModal } from '../components/RoomFormModal';
import { VacateModal } from '../components/VacateModal';
import {
  HOSTEL_PERMISSIONS,
  HOSTEL_TYPE_LABELS,
  ROOM_STATUS_LABELS,
  ROOM_STATUS_TONES,
  ROOM_TYPE_LABELS,
} from '../constants';
import { useRemoveBed, useRoom } from '../hooks/useHostel';
import type { Bed } from '../types';

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const roomId = Number(id);

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(HOSTEL_PERMISSIONS.update);
  const canDelete = hasPermission(HOSTEL_PERMISSIONS.delete);

  const { data: room, isLoading, error } = useRoom(id);
  const removeBed = useRemoveBed(roomId);

  const roomForm = useDisclosure();
  const bedsForm = useDisclosure();
  const editBedForm = useDisclosure();
  const allocateForm = useDisclosure();
  const vacateDialog = useDisclosure();
  const deleteDialog = useDisclosure();

  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Bed | null>(null);
  const [vacating, setVacating] = useState<Bed | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <Card>
        <CardBody>
          <Alert tone="danger" title="Could not load this room">
            {error?.message ?? 'It no longer exists.'}
          </Alert>
          <Button variant="outline" className="mt-4" onClick={() => navigate(PATHS.hostelRooms)}>
            Back to rooms
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title={`Room ${room.room_no}`}
        description={`${room.hostel_name} · ${HOSTEL_TYPE_LABELS[room.hostel_type]} block · floor ${room.floor}`}
        breadcrumbs={[
          { label: 'Hostel', to: PATHS.hostelRooms },
          { label: `Room ${room.room_no}` },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate(PATHS.hostelRooms)}
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Back
            </Button>

            <Can permissions={[HOSTEL_PERMISSIONS.update]}>
              <Button
                variant="outline"
                onClick={roomForm.open}
                leftIcon={<Pencil className="size-4" />}
              >
                Edit room
              </Button>
            </Can>

            <Can permissions={[HOSTEL_PERMISSIONS.create]}>
              <Button
                disabled={room.available_beds === 0 || room.status !== 'available'}
                title={
                  room.available_beds === 0
                    ? 'Every bed is taken'
                    : room.status !== 'available'
                      ? `This room is ${ROOM_STATUS_LABELS[room.status].toLowerCase()}`
                      : undefined
                }
                onClick={allocateForm.open}
                leftIcon={<UserPlus className="size-4" />}
              >
                Allocate a bed
              </Button>
            </Can>
          </>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-4">
        {[
          ['Type', ROOM_TYPE_LABELS[room.type]],
          ['Beds', `${room.available_beds} free of ${room.beds_count}`],
          ['Rent', `${formatCurrency(room.monthly_rent)} per bed`],
          ['Facilities',
            [room.has_ac ? 'AC' : null, room.has_attached_bath ? 'Attached bath' : null]
              .filter(Boolean)
              .join(' · ') || '—'],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardBody>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {room.status !== 'available' && room.status !== 'full' && (
        <Alert tone="warning" title={ROOM_STATUS_LABELS[room.status]} className="mb-4">
          No new residents can be allocated to this room while it is in this state.
        </Alert>
      )}

      <Card>
        <CardHeader
          title="Beds"
          description="A bed is what gets allocated — a room is only where the beds are."
          actions={
            <div className="flex items-center gap-2">
              <Badge tone={ROOM_STATUS_TONES[room.status]} withDot>
                {ROOM_STATUS_LABELS[room.status]}
              </Badge>
              <Can permissions={[HOSTEL_PERMISSIONS.create]}>
                <Button size="sm" onClick={bedsForm.open} leftIcon={<Plus className="size-4" />}>
                  Add beds
                </Button>
              </Can>
            </div>
          }
        />

        <CardBody>
          <BedGrid
            beds={room.beds}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onEdit={(bed) => {
              setEditingBed(bed);
              editBedForm.open();
            }}
            onDelete={(bed) => {
              setPendingDelete(bed);
              deleteDialog.open();
            }}
            onVacate={(bed) => {
              setVacating(bed);
              vacateDialog.open();
            }}
          />

          {room.notes && (
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
              {room.notes}
            </p>
          )}
        </CardBody>
      </Card>

      {roomForm.isOpen && (
        <RoomFormModal isOpen={roomForm.isOpen} onClose={roomForm.close} room={room} />
      )}

      {bedsForm.isOpen && (
        <AddBedsModal isOpen={bedsForm.isOpen} onClose={bedsForm.close} room={room} />
      )}

      {editBedForm.isOpen && editingBed && (
        <EditBedModal
          isOpen={editBedForm.isOpen}
          onClose={() => {
            editBedForm.close();
            setEditingBed(null);
          }}
          room={room}
          bed={editingBed}
        />
      )}

      {allocateForm.isOpen && (
        <AllocateBedModal
          isOpen={allocateForm.isOpen}
          onClose={allocateForm.close}
          defaultHostelId={room.hostel_id}
        />
      )}

      {vacateDialog.isOpen && vacating?.occupant && (
        <VacateModal
          isOpen={vacateDialog.isOpen}
          onClose={() => {
            vacateDialog.close();
            setVacating(null);
          }}
          allocationId={vacating.occupant.allocation_id}
          studentName={vacating.occupant.student_name}
          location={`Room ${room.room_no}, bed ${vacating.bed_no}`}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          removeBed.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={removeBed.isPending}
        isDestructive
        title={`Remove bed ${pendingDelete?.bed_no ?? ''}?`}
        confirmLabel="Remove bed"
        message="The room's bed count drops by one. This cannot be undone."
      />
    </>
  );
}
