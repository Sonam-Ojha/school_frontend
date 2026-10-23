import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';

import { useCreateDevice, useUpdateDevice } from '../hooks/useDevices';
import { deviceSchema, type DeviceInput } from '../schemas';
import type { BiometricDevice, RegisteredDevice } from '../types';

const FIELDS = ['name', 'serial_number', 'location'] as const;
const FORM_ID = 'device-form';

interface DeviceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to register a new reader. */
  device?: BiometricDevice | null;
  /** Called when the API issues a key, which it does once: on registering, or when a new one is asked for. */
  onKeyIssued: (device: RegisteredDevice) => void;
}

export function DeviceFormModal({ isOpen, onClose, device = null, onKeyIssued }: DeviceFormModalProps) {
  const isEdit = device !== null;

  const createDevice = useCreateDevice();
  const updateDevice = useUpdateDevice(device?.id ?? 0);
  const mutation = isEdit ? updateDevice : createDevice;

  const form = useForm<DeviceInput>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: device?.name ?? '',
      serial_number: device?.serial_number ?? '',
      location: device?.location ?? '',
      regenerate_key: false,
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: DeviceInput) => {
    mutation.mutate(values, {
      onSuccess: (saved) => {
        handleClose();
        if (saved.push_key) onKeyIssued(saved);
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
      size="sm"
      title={isEdit ? `Edit ${device.name}` : 'Register a reader'}
      description="Scans are accepted only from readers registered here."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Register'}
          </Button>
        </>
      }
    >
      <Form id={FORM_ID} form={form} onSubmit={onSubmit}>
        <FormGrid cols={1}>
          <FormInput<DeviceInput> name="name" label="Name" placeholder="Main gate" autoFocus required />
          <FormInput<DeviceInput>
            name="serial_number"
            label="Serial number"
            hint="Exactly as the reader reports it — it is printed on the device and shown in its system information."
            required
          />
          <FormInput<DeviceInput> name="location" label="Where it is" placeholder="Block A entrance" />

          {isEdit && (
            <FormFullRow>
              <FormCheckbox<DeviceInput>
                name="regenerate_key"
                label="Issue a new key"
                description="For a reader that has been replaced or lost. The old key stops working at once."
              />
            </FormFullRow>
          )}
        </FormGrid>
      </Form>
    </Modal>
  );
}
