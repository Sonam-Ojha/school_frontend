import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';

import { ROOM_TYPE_OPTIONS } from '../constants';
import { useCreateRoom, useUpdateRoom } from '../hooks/useTimetable';
import { roomSchema, type RoomInput } from '../schemas';
import type { Room } from '../types';

const FIELDS = ['name', 'code', 'type', 'building', 'floor', 'capacity', 'is_active'] as const;

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to add. */
  room?: Room | null;
}

export function RoomFormModal({ isOpen, onClose, room = null }: RoomFormModalProps) {
  const isEdit = room !== null;

  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom(room?.id ?? 0);
  const mutation = isEdit ? updateRoom : createRoom;

  const form = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: room
      ? {
          name: room.name,
          code: room.code,
          type: room.type,
          building: room.building ?? '',
          // A null floor is "not applicable", which the input holds as blank.
          floor: room.floor === null ? '' : String(room.floor),
          capacity: room.capacity,
          is_active: room.is_active,
        }
      : {
          name: '',
          code: '',
          type: 'classroom',
          building: '',
          floor: '',
          capacity: 40,
          is_active: true,
        },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: RoomInput) => {
    mutation.mutate(values, {
      onSuccess: handleClose,
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
      title={isEdit ? `Edit ${room.name}` : 'Add a room'}
      description="Rooms are the spaces a lesson can be allocated to."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="room-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add room'}
          </Button>
        </>
      }
    >
      <Form id="room-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormInput<RoomInput>
            name="name"
            label="Name"
            placeholder="Block A — 101"
            required
          />
          <FormInput<RoomInput>
            name="code"
            label="Code"
            placeholder="A-101"
            hint="Shown in the timetable, where the full name will not fit."
            required
          />

          <FormSelect<RoomInput> name="type" label="Type" options={ROOM_TYPE_OPTIONS} required />
          <FormInput<RoomInput>
            name="capacity"
            type="number"
            label="Capacity"
            min={1}
            hint="Used to warn when a section will not fit."
            required
          />

          <FormInput<RoomInput>
            name="building"
            label="Building"
            placeholder="Main block"
            hint="Optional"
          />
          {/* Text, not number: blank means "not applicable", and a number
              input would hand the schema a NaN for it. */}
          <FormInput<RoomInput>
            name="floor"
            inputMode="numeric"
            label="Floor"
            placeholder="1"
            hint="Leave blank for a ground or open space."
          />

          <FormCheckbox<RoomInput>
            name="is_active"
            label="Available for allocation"
            description="Turn off while a room is under repair — existing lessons keep it."
          />
        </FormGrid>

        {isEdit && room.allocated_periods > 0 && !form.watch('is_active') && (
          <Alert tone="warning" title="This room is in use">
            {room.allocated_periods} period{room.allocated_periods === 1 ? '' : 's'} a week are
            allocated to it. Making it unavailable hides it from the picker but leaves those
            lessons where they are.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
