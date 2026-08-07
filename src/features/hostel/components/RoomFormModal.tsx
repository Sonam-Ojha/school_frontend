import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';

import { BEDS_FOR_ROOM_TYPE, ROOM_STATUS_OPTIONS, ROOM_TYPE_OPTIONS } from '../constants';
import { useCreateRoom, useHostels, useUpdateRoom } from '../hooks/useHostel';
import { roomSchema, type RoomInput } from '../schemas';
import type { HostelRoomDetail, RoomType } from '../types';

const FIELDS = [
  'hostel_id', 'room_no', 'floor', 'type', 'monthly_rent',
  'has_ac', 'has_attached_bath', 'status', 'notes',
] as const;

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to add. */
  room?: HostelRoomDetail | null;
  /** Preselected when adding from a filtered list. */
  defaultHostelId?: number | null;
  onCreated?: (room: HostelRoomDetail) => void;
}

export function RoomFormModal({
  isOpen,
  onClose,
  room = null,
  defaultHostelId = null,
  onCreated,
}: RoomFormModalProps) {
  const isEdit = room !== null;

  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom(room?.id ?? 0);
  const mutation = isEdit ? updateRoom : createRoom;

  const { hostelOptions, isLoading: hostelsLoading } = useHostels();

  const form = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: room
      ? {
          hostel_id: room.hostel_id,
          room_no: room.room_no,
          floor: room.floor,
          type: room.type,
          monthly_rent: room.monthly_rent,
          has_ac: room.has_ac,
          has_attached_bath: room.has_attached_bath,
          // `full` is derived from the beds, so it is never a form value.
          status: room.status === 'full' ? 'available' : room.status,
          notes: room.notes ?? '',
        }
      : {
          hostel_id: defaultHostelId ?? 0,
          room_no: '',
          floor: 0,
          type: 'double',
          monthly_rent: 0,
          has_ac: false,
          has_attached_bath: true,
          status: 'available',
          notes: '',
        },
  });

  const type = form.watch('type');
  const status = form.watch('status');

  // Warn rather than block: a room can legitimately hold fewer beds than its
  // type suggests while it is being furnished.
  const suggestedBeds = BEDS_FOR_ROOM_TYPE[type as RoomType] ?? 0;
  const bedMismatch = isEdit && room.beds_count > 0 && room.beds_count !== suggestedBeds;

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: RoomInput) => {
    mutation.mutate(values, {
      onSuccess: (saved) => {
        if (!isEdit) onCreated?.(saved);
        handleClose();
      },
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title={isEdit ? `Edit room ${room.room_no}` : 'Add a room'}
      description="The room itself. Its beds are added afterwards, and they are what gets allocated."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="hostel-room-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add room'}
          </Button>
        </>
      }
    >
      <Form id="hostel-room-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormSelect<RoomInput>
            name="hostel_id"
            label="Hostel"
            options={hostelOptions}
            placeholder={hostelsLoading ? 'Loading hostels…' : 'Select a hostel'}
            valueAsNumber
            // Moving a furnished room to another block would move its
            // residents into a hostel of the wrong gender.
            disabled={isEdit && room.beds_count > 0}
            hint={
              isEdit && room.beds_count > 0
                ? 'A room with beds cannot be moved to another block.'
                : undefined
            }
            required
          />
          <FormInput<RoomInput>
            name="room_no"
            label="Room number"
            placeholder="A-101"
            required
          />

          <FormInput<RoomInput>
            name="floor"
            type="number"
            label="Floor"
            min={0}
            hint="Ground is 0."
            required
          />
          <FormSelect<RoomInput>
            name="type"
            label="Type"
            options={ROOM_TYPE_OPTIONS}
            hint={`Usually ${suggestedBeds} bed${suggestedBeds === 1 ? '' : 's'}.`}
            required
          />

          <FormInput<RoomInput>
            name="monthly_rent"
            type="number"
            label="Monthly rent, per bed"
            min={0}
            step="0.01"
            hint="Charged on top of the mess plan."
            required
          />
          <FormSelect<RoomInput>
            name="status"
            label="Status"
            options={ROOM_STATUS_OPTIONS}
            hint="“Full” is worked out from the beds."
            required
          />

          <FormCheckbox<RoomInput> name="has_ac" label="Air conditioned" />
          <FormCheckbox<RoomInput> name="has_attached_bath" label="Attached bathroom" />

          <FormFullRow>
            <FormTextarea<RoomInput> name="notes" label="Notes" rows={2} />
          </FormFullRow>
        </FormGrid>

        {bedMismatch && (
          <Alert tone="info">
            This room has {room.beds_count} bed{room.beds_count === 1 ? '' : 's'}, and a{' '}
            {ROOM_TYPE_OPTIONS.find((option) => option.value === type)?.label.toLowerCase()} room
            usually has {suggestedBeds}. The beds are what counts — the type is a label.
          </Alert>
        )}

        {status !== 'available' && isEdit && room.occupied_beds > 0 && (
          <Alert tone="warning" title="This room has residents">
            {room.occupied_beds} bed{room.occupied_beds === 1 ? ' is' : 's are'} occupied. Taking
            the room out of use stops new allocations but leaves them where they are.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
