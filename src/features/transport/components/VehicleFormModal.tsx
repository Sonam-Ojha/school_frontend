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

import { DOCUMENT_LABELS, FUEL_TYPE_OPTIONS, VEHICLE_STATUS_OPTIONS } from '../constants';
import { useCreateVehicle, useDrivers, useUpdateVehicle } from '../hooks/useTransport';
import { vehicleSchema, type VehicleInput } from '../schemas';
import type { DocumentKind, Vehicle } from '../types';

const FIELDS = [
  'registration_no', 'name', 'make', 'model', 'manufacture_year', 'capacity',
  'fuel_type', 'status', 'driver_id', 'attendant_id',
  'insurance_expiry', 'fitness_expiry', 'permit_expiry', 'pollution_expiry',
  'odometer_km', 'notes',
] as const;

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to add. */
  vehicle?: Vehicle | null;
}

const expiryOf = (vehicle: Vehicle | null, kind: DocumentKind): string =>
  vehicle?.documents.find((document) => document.kind === kind)?.expires_on ?? '';

export function VehicleFormModal({ isOpen, onClose, vehicle = null }: VehicleFormModalProps) {
  const isEdit = vehicle !== null;

  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle(vehicle?.id ?? 0);
  const mutation = isEdit ? updateVehicle : createVehicle;

  const { driverOptions, isLoading: driversLoading } = useDrivers();

  const form = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle
      ? {
          registration_no: vehicle.registration_no,
          name: vehicle.name,
          make: vehicle.make ?? '',
          model: vehicle.model ?? '',
          // Optional numbers are strings in the form; blank means not recorded.
          manufacture_year:
            vehicle.manufacture_year === null ? '' : String(vehicle.manufacture_year),
          capacity: vehicle.capacity,
          fuel_type: vehicle.fuel_type,
          status: vehicle.status,
          driver_id: vehicle.driver_id,
          attendant_id: vehicle.attendant_id,
          insurance_expiry: expiryOf(vehicle, 'insurance'),
          fitness_expiry: expiryOf(vehicle, 'fitness'),
          permit_expiry: expiryOf(vehicle, 'permit'),
          pollution_expiry: expiryOf(vehicle, 'pollution'),
          odometer_km: vehicle.odometer_km === null ? '' : String(vehicle.odometer_km),
          notes: vehicle.notes ?? '',
        }
      : {
          registration_no: '',
          name: '',
          make: '',
          model: '',
          manufacture_year: '',
          capacity: 40,
          fuel_type: 'diesel',
          status: 'active',
          driver_id: null,
          attendant_id: null,
          insurance_expiry: '',
          fitness_expiry: '',
          permit_expiry: '',
          pollution_expiry: '',
          odometer_km: '',
          notes: '',
        },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: VehicleInput) => {
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
      size="lg"
      title={isEdit ? `Edit ${vehicle.name}` : 'Add a bus'}
      description="Registration, seats, who drives it, and the papers it has to carry."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="vehicle-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add bus'}
          </Button>
        </>
      }
    >
      <Form id="vehicle-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormInput<VehicleInput>
            name="name"
            label="Name"
            placeholder="Bus 4"
            hint="What it is called on the board."
            required
          />
          <FormInput<VehicleInput>
            name="registration_no"
            label="Registration"
            placeholder="KA 05 MH 1234"
            required
          />

          <FormInput<VehicleInput> name="make" label="Make" placeholder="Tata" hint="Optional" />
          <FormInput<VehicleInput>
            name="model"
            label="Model"
            placeholder="Starbus 40"
            hint="Optional"
          />

          <FormInput<VehicleInput>
            name="capacity"
            type="number"
            label="Seats"
            min={1}
            hint="Excluding the driver. Caps how many students the route may carry."
            required
          />
          <FormInput<VehicleInput>
            name="manufacture_year"
            inputMode="numeric"
            label="Year"
            placeholder="2019"
            hint="Optional"
          />

          <FormSelect<VehicleInput>
            name="fuel_type"
            label="Fuel"
            options={FUEL_TYPE_OPTIONS}
            required
          />
          <FormSelect<VehicleInput>
            name="status"
            label="Status"
            options={VEHICLE_STATUS_OPTIONS}
            required
          />

          <FormSelect<VehicleInput>
            name="driver_id"
            label="Driver"
            options={driverOptions}
            placeholder={driversLoading ? 'Loading drivers…' : 'Nobody assigned yet'}
            valueAsNumber
            hint="Only staff with a valid licence can be selected."
          />
          <FormSelect<VehicleInput>
            name="attendant_id"
            label="Attendant"
            options={driverOptions}
            placeholder="Nobody assigned yet"
            valueAsNumber
            hint="Optional"
          />
        </FormGrid>

        <div className="border-t border-slate-100 pt-4">
          <p className="mb-3 text-sm font-medium text-slate-800">Statutory papers</p>

          <FormGrid cols={2}>
            <FormInput<VehicleInput>
              name="insurance_expiry"
              type="date"
              label={`${DOCUMENT_LABELS.insurance} expires`}
            />
            <FormInput<VehicleInput>
              name="fitness_expiry"
              type="date"
              label={`${DOCUMENT_LABELS.fitness} expires`}
            />
            <FormInput<VehicleInput>
              name="permit_expiry"
              type="date"
              label={`${DOCUMENT_LABELS.permit} expires`}
            />
            <FormInput<VehicleInput>
              name="pollution_expiry"
              type="date"
              label={`${DOCUMENT_LABELS.pollution} expires`}
            />

            <FormInput<VehicleInput>
              name="odometer_km"
              inputMode="numeric"
              label="Odometer (km)"
              hint="Optional"
            />

            <FormFullRow>
              <FormTextarea<VehicleInput> name="notes" label="Notes" rows={2} />
            </FormFullRow>
          </FormGrid>
        </div>

        <Alert tone="info">
          A bus with lapsed insurance or a lapsed fitness certificate cannot be put on a route —
          the other two papers are flagged but do not stop it.
        </Alert>
      </Form>
    </Modal>
  );
}
