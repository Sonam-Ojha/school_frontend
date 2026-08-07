import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { formatTime } from '@/lib/time';

import { useAddStop, useUpdateStop } from '../hooks/useTransport';
import { stopSchemaWithCoordinates, type StopInput } from '../schemas';
import type { RouteDetail, RouteStop } from '../types';

const FIELDS = [
  'name', 'sequence', 'landmark', 'pickup_time', 'drop_time',
  'fare', 'latitude', 'longitude',
] as const;

interface StopFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteDetail;
  /** Omit to add. */
  stop?: RouteStop | null;
}

export function StopFormModal({ isOpen, onClose, route, stop = null }: StopFormModalProps) {
  const isEdit = stop !== null;

  const addStop = useAddStop(route.id);
  const updateStop = useUpdateStop(route.id, stop?.id ?? 0);
  const mutation = isEdit ? updateStop : addStop;

  const nextSequence = route.stops.reduce((highest, entry) => Math.max(highest, entry.sequence), 0) + 1;

  const form = useForm<StopInput>({
    resolver: zodResolver(stopSchemaWithCoordinates),
    defaultValues: stop
      ? {
          name: stop.name,
          sequence: stop.sequence,
          landmark: stop.landmark ?? '',
          pickup_time: stop.pickup_time,
          drop_time: stop.drop_time,
          fare: stop.fare,
          latitude: stop.latitude === null ? '' : String(stop.latitude),
          longitude: stop.longitude === null ? '' : String(stop.longitude),
        }
      : {
          name: '',
          sequence: nextSequence,
          landmark: '',
          // Seeded from the stop before it, since a run is a sequence of times.
          pickup_time: route.stops.at(-1)?.pickup_time ?? '07:00',
          drop_time: route.stops.at(-1)?.drop_time ?? '15:30',
          fare: route.stops.at(-1)?.fare ?? 0,
          latitude: '',
          longitude: '',
        },
  });

  const sequence = form.watch('sequence');
  const pickup = form.watch('pickup_time');

  /** The stop this one would follow, so the time rule is visible before saving. */
  const previous = route.stops
    .filter((entry) => entry.id !== stop?.id && entry.sequence < sequence)
    .sort((left, right) => right.sequence - left.sequence)[0];

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: StopInput) => {
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
      title={isEdit ? `Edit ${stop.name}` : 'Add a stop'}
      description={`${route.code} — ${route.name}`}
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="stop-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add stop'}
          </Button>
        </>
      }
    >
      <Form id="stop-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormInput<StopInput>
            name="name"
            label="Stop name"
            placeholder="Jayanagar 4th Block"
            required
          />
          <FormInput<StopInput>
            name="sequence"
            type="number"
            label="Position on the run"
            min={1}
            hint="Stops are visited in this order."
            required
          />

          <FormFullRow>
            <FormInput<StopInput>
              name="landmark"
              label="Landmark"
              placeholder="Opposite the post office"
              hint="Optional — what a parent would look for."
            />
          </FormFullRow>

          <FormInput<StopInput>
            name="pickup_time"
            type="time"
            label="Pickup"
            hint={previous ? `${previous.name} is at ${formatTime(previous.pickup_time)}` : undefined}
            required
          />
          <FormInput<StopInput> name="drop_time" type="time" label="Drop" required />

          <FormFullRow>
            <FormInput<StopInput>
              name="fare"
              type="number"
              label="Monthly fare"
              min={0}
              step="0.01"
              hint="A one-way rider pays half of this."
              required
            />
          </FormFullRow>

          <FormInput<StopInput>
            name="latitude"
            inputMode="decimal"
            label="Latitude"
            placeholder="12.9250"
            hint="Optional — used by the live map."
          />
          <FormInput<StopInput>
            name="longitude"
            inputMode="decimal"
            label="Longitude"
            placeholder="77.5938"
            hint="Optional"
          />
        </FormGrid>

        {previous && pickup && pickup <= previous.pickup_time && (
          <Alert tone="warning" title="That time runs backwards">
            {previous.name} is stop {previous.sequence} at {formatTime(previous.pickup_time)}. A
            later stop cannot be picked up earlier — saving will be refused.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
