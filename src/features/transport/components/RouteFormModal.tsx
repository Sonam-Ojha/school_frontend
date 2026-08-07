import { zodResolver } from '@hookform/resolvers/zod';
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

import { useCreateRoute, useUpdateRoute, useVehicleOptions } from '../hooks/useTransport';
import { routeSchema, type RouteInput } from '../schemas';
import type { RouteDetail } from '../types';

const FIELDS = ['name', 'code', 'description', 'vehicle_id', 'distance_km', 'is_active'] as const;

interface RouteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to add. */
  route?: RouteDetail | null;
  onCreated?: (route: RouteDetail) => void;
}

export function RouteFormModal({
  isOpen,
  onClose,
  route = null,
  onCreated,
}: RouteFormModalProps) {
  const isEdit = route !== null;

  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute(route?.id ?? 0);
  const mutation = isEdit ? updateRoute : createRoute;

  const { vehicles, vehicleOptions, isLoading: vehiclesLoading } = useVehicleOptions();

  const form = useForm<RouteInput>({
    resolver: zodResolver(routeSchema),
    defaultValues: route
      ? {
          name: route.name,
          code: route.code,
          description: route.description ?? '',
          vehicle_id: route.vehicle_id,
          distance_km: route.distance_km === null ? '' : String(route.distance_km),
          is_active: route.is_active,
        }
      : {
          name: '',
          code: '',
          description: '',
          vehicle_id: null,
          distance_km: '',
          is_active: true,
        },
  });

  const vehicleId = form.watch('vehicle_id');
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId) ?? null;

  // A bus already on another route would be in two places at 7am.
  const alreadyElsewhere =
    selectedVehicle !== null &&
    selectedVehicle.route_id !== null &&
    selectedVehicle.route_id !== route?.id;

  const undersized =
    selectedVehicle !== null && isEdit && route.students_count > selectedVehicle.capacity;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: RouteInput) => {
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
      title={isEdit ? `Edit ${route.name}` : 'Add a route'}
      description="The run itself. Its stops are added afterwards, in order."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="route-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add route'}
          </Button>
        </>
      }
    >
      <Form id="route-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormInput<RouteInput>
            name="name"
            label="Name"
            placeholder="Jayanagar — Banashankari"
            required
          />
          <FormInput<RouteInput>
            name="code"
            label="Code"
            placeholder="R-04"
            hint="Shown on the bus board."
            required
          />

          <FormSelect<RouteInput>
            name="vehicle_id"
            label="Bus"
            options={vehicleOptions}
            placeholder={vehiclesLoading ? 'Loading buses…' : 'No bus assigned yet'}
            valueAsNumber
            hint="A route without a bus is planned, not running."
          />
          <FormInput<RouteInput>
            name="distance_km"
            inputMode="decimal"
            label="Distance (km)"
            placeholder="18.5"
            hint="Optional"
          />

          <FormFullRow>
            <FormTextarea<RouteInput> name="description" label="Description" rows={2} />
          </FormFullRow>

          <FormCheckbox<RouteInput>
            name="is_active"
            label="In service"
            description="Turn off to suspend a route without unassigning its students."
          />
        </FormGrid>

        {alreadyElsewhere && selectedVehicle && (
          <Alert tone="warning" title="That bus is already on another route">
            {selectedVehicle.name} runs {selectedVehicle.route_name}. Saving will be refused —
            take it off that route first.
          </Alert>
        )}

        {undersized && selectedVehicle && (
          <Alert tone="danger" title="That bus is too small">
            {route.students_count} students are assigned to this route and{' '}
            {selectedVehicle.name} seats {selectedVehicle.capacity}.
          </Alert>
        )}

        {selectedVehicle && selectedVehicle.compliance === 'expired' && (
          <Alert tone="danger" title="That bus has lapsed papers">
            {selectedVehicle.name} cannot legally carry children until they are renewed.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
