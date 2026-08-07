import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { todayInputValue } from '@/lib/format';

import { useSaveGpsDevice, useVehicleOptions } from '../hooks/useTransport';
import { gpsDeviceSchema, type GpsDeviceInput } from '../schemas';
import type { GpsDevice } from '../types';

const FIELDS = ['imei', 'sim_number', 'provider', 'vehicle_id', 'installed_on'] as const;

interface GpsDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to register a new one. */
  device?: GpsDevice | null;
}

export function GpsDeviceModal({ isOpen, onClose, device = null }: GpsDeviceModalProps) {
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
        }
      : {
          imei: '',
          sim_number: '',
          provider: '',
          vehicle_id: null,
          installed_on: todayInputValue(),
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
      description="The device itself. Positions arrive from it — nothing is configured here."
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
            onSuccess: handleClose,
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
            inputMode="numeric"
            label="IMEI"
            placeholder="860123456789012"
            hint="Fifteen digits, printed on the device."
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
        </FormGrid>

        <Alert tone="info">
          The tracker pushes to the backend over its own protocol. This screen only records which
          device is on which bus, and reads back the positions that arrive.
        </Alert>
      </Form>
    </Modal>
  );
}
