import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import type { Option } from '@/types/common';

import { BEDS_FOR_ROOM_TYPE, MAX_BEDS_PER_ROOM } from '../constants';
import { useAddBeds, useUpdateBed } from '../hooks/useHostel';
import { addBedsSchema, bedSchema, type AddBedsInput, type BedInput } from '../schemas';
import type { Bed, HostelRoomDetail } from '../types';

/** Only the states a person sets — `occupied` follows from an allocation. */
const BED_STATUS_OPTIONS: Option[] = [
  { label: 'Vacant', value: 'vacant' },
  { label: 'Reserved', value: 'reserved' },
  { label: 'Out of use', value: 'maintenance' },
];

interface AddBedsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: HostelRoomDetail;
}

/**
 * Furnish a room.
 *
 * Quantity rather than one form per bed: a warden putting four beds in a room
 * is doing one thing. Labels come back from the API, which is the only place
 * that can guarantee they are unique within the room.
 */
export function AddBedsModal({ isOpen, onClose, room }: AddBedsModalProps) {
  const addBeds = useAddBeds(room.id);

  const remaining = Math.max(0, BEDS_FOR_ROOM_TYPE[room.type] - room.beds_count);

  const form = useForm<AddBedsInput>({
    resolver: zodResolver(addBedsSchema),
    defaultValues: { quantity: remaining > 0 ? remaining : 1, notes: '' },
  });

  const quantity = form.watch('quantity');

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      title="Add beds"
      description={`Room ${room.room_no} · ${room.hostel_name}`}
      closeOnOverlayClick={!addBeds.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={addBeds.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="add-beds-form" isLoading={addBeds.isPending}>
            Add {Number.isFinite(quantity) && quantity > 0 ? quantity : ''}{' '}
            {quantity === 1 ? 'bed' : 'beds'}
          </Button>
        </>
      }
    >
      <Form
        id="add-beds-form"
        form={form}
        onSubmit={(values) =>
          addBeds.mutate(values, {
            onSuccess: handleClose,
            onError: (error) => {
              if (applyServerErrors(error, form.setError, ['quantity', 'notes'])) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        <FormGrid cols={1}>
          <FormInput<AddBedsInput>
            name="quantity"
            type="number"
            label="How many"
            min={1}
            max={MAX_BEDS_PER_ROOM - room.beds_count}
            hint={
              room.beds_count > 0
                ? `${room.beds_count} already in this room.`
                : 'Labelled A, B, C… in order.'
            }
            required
          />
          <FormTextarea<AddBedsInput> name="notes" label="Notes" rows={2} />
        </FormGrid>

        {remaining > 0 && (
          <Alert tone="info">
            A {room.type} room usually holds {BEDS_FOR_ROOM_TYPE[room.type]} beds — {remaining}{' '}
            still to add.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}

interface EditBedModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: HostelRoomDetail;
  bed: Bed;
}

export function EditBedModal({ isOpen, onClose, room, bed }: EditBedModalProps) {
  const updateBed = useUpdateBed(room.id, bed.id);

  const form = useForm<BedInput>({
    resolver: zodResolver(bedSchema),
    defaultValues: {
      bed_no: bed.bed_no,
      // An occupied bed is never edited here, so the value is always settable.
      status: bed.status === 'occupied' ? 'vacant' : bed.status,
      notes: bed.notes ?? '',
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      title={`Edit bed ${bed.bed_no}`}
      description={`Room ${room.room_no} · ${room.hostel_name}`}
      closeOnOverlayClick={!updateBed.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={updateBed.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="edit-bed-form" isLoading={updateBed.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      <Form
        id="edit-bed-form"
        form={form}
        onSubmit={(values) =>
          updateBed.mutate(values, {
            onSuccess: handleClose,
            onError: (error) => {
              if (applyServerErrors(error, form.setError, ['bed_no', 'status', 'notes'])) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        <FormGrid cols={2}>
          <FormInput<BedInput> name="bed_no" label="Label" placeholder="A" required />
          <FormSelect<BedInput>
            name="status"
            label="Status"
            options={BED_STATUS_OPTIONS}
            hint="“Occupied” follows from an allocation."
            required
          />

          <FormFullRow>
            <FormTextarea<BedInput> name="notes" label="Notes" rows={2} />
          </FormFullRow>
        </FormGrid>
      </Form>
    </Modal>
  );
}
