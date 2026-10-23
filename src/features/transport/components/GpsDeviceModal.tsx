import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { todayInputValue } from '@/lib/format';

import { useSaveGpsDevice, useVehicleOptions } from '../hooks/useTransport';
import { gpsDeviceSchema, type GpsDeviceInput } from '../schemas';
import type { GpsDevice, RegisteredGpsDevice } from '../types';

const FIELDS = ['imei', 'sim_number', 'provider', 'vehicle_id', 'installed_on'] as const;

interface GpsDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to register a new one. */
  device?: GpsDevice | null;
  /** Called when the API issues a key, which it does once: on registering, or when a new one is asked for. */
  onKeyIssued: (device: RegisteredGpsDevice) => void;
}

export function GpsDeviceModal({
  isOpen,
  onClose,
  device = null,
  onKeyIssued,
}: GpsDeviceModalProps) {
  const isEdit = device !== null;
  const saveDevice = useSaveGpsDevice(device?.id);

  const { vehicleOptions, isLoading: vehiclesLoading } = useVehicleOptions();

  const form = useForm<GpsDeviceInput>({
    resolver: zodResolver(gpsDeviceSchema),
    defaultValues: device
      ? {
          imei: device.imei,
          sim_number: device.sim_number ?? '',
          provider: device.provider,
          vehicle_id: device.vehicle_id,
          installed_on: device.installed_on,
          regenerate_key: false,
        }
      : {
          imei: '',
          sim_number: '',
          provider: '',
          vehicle_id: null,
          installed_on: todayInputValue(),
          regenerate_key: false,
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
      size="md"
      title={isEdit ? 'Edit this tracker' : 'Register a tracker'}
      description="The device itself, and the bus it rides on. Positions are accepted only from trackers registered here."
      closeOnOverlayClick={!saveDevice.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={saveDevice.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="gps-form" isLoading={saveDevice.isPending}>
            {isEdit ? 'Save changes' : 'Register'}
          </Button>
        </>
      }
    >
      <Form
        id="gps-form"
        form={form}
        onSubmit={(values) =>
          saveDevice.mutate(values, {
            onSuccess: (saved) => {
              handleClose();
              if (saved.push_key) onKeyIssued(saved);
            },
            onError: (error) => {
              if (applyServerErrors(error, form.setError, FIELDS)) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        <FormGrid cols={2}>
          <FormInput<GpsDeviceInput>
            name="imei"
            label="IMEI or device ID"
            placeholder="860123456789012"
            hint="The 15 digits printed on a fitted tracker, or any name for a phone — bus-07."
            required
          />
          <FormInput<GpsDeviceInput>
            name="provider"
            label="Make"
            placeholder="Teltonika FMB920"
            required
          />

          <FormInput<GpsDeviceInput>
            name="sim_number"
            label="SIM number"
            placeholder="+91 90000 00000"
            hint="Optional"
          />
          <FormInput<GpsDeviceInput>
            name="installed_on"
            type="date"
            label="Fitted on"
            max={todayInputValue()}
            required
          />

          <FormSelect<GpsDeviceInput>
            name="vehicle_id"
            label="Fitted to"
            options={vehicleOptions}
            placeholder={vehiclesLoading ? 'Loading buses…' : 'On the shelf'}
            valueAsNumber
            hint="Leave blank for a spare device not yet fitted."
          />

          {isEdit && (
            <FormFullRow>
              <FormCheckbox<GpsDeviceInput>
                name="regenerate_key"
                label="Issue a new key"
                description="For a tracker that has been replaced or lost. The old key stops working at once."
              />
            </FormFullRow>
          )}
        </FormGrid>

        {!isEdit && (
          <Alert tone="info">
            Registering gives you a key and the address to point the tracker at. They are shown
            once, on the next screen.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
