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
import { useStaffOptions } from '@/features/staff/hooks/useStaff';
import { applyServerErrors } from '@/lib/formErrors';
import { formatCurrency } from '@/lib/format';

import { HOSTEL_TYPE_OPTIONS, MESS_PLAN_LABELS, MESS_PLAN_MULTIPLIER } from '../constants';
import { useCreateHostel, useUpdateHostel } from '../hooks/useHostel';
import { hostelSchema, type HostelInput } from '../schemas';
import type { Hostel } from '../types';

const FIELDS = ['name', 'code', 'type', 'address', 'warden_id', 'mess_charge', 'is_active'] as const;

interface HostelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to add. */
  hostel?: Hostel | null;
}

export function HostelFormModal({ isOpen, onClose, hostel = null }: HostelFormModalProps) {
  const isEdit = hostel !== null;

  const createHostel = useCreateHostel();
  const updateHostel = useUpdateHostel(hostel?.id ?? 0);
  const mutation = isEdit ? updateHostel : createHostel;

  const { staffOptions, isLoading: staffLoading } = useStaffOptions();

  const form = useForm<HostelInput>({
    resolver: zodResolver(hostelSchema),
    defaultValues: hostel
      ? {
          name: hostel.name,
          code: hostel.code,
          type: hostel.type,
          address: hostel.address ?? '',
          warden_id: hostel.warden_id,
          mess_charge: hostel.mess_charge,
          is_active: hostel.is_active,
        }
      : {
          name: '',
          code: '',
          type: 'boys',
          address: '',
          warden_id: null,
          mess_charge: 0,
          is_active: true,
        },
  });

  const messCharge = form.watch('mess_charge');

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: HostelInput) => {
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
      title={isEdit ? `Edit ${hostel.name}` : 'Add a hostel'}
      description="A block, its warden and its mess. Rooms are added inside it."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="hostel-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add hostel'}
          </Button>
        </>
      }
    >
      <Form id="hostel-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormInput<HostelInput>
            name="name"
            label="Name"
            placeholder="Nilgiri Block"
            required
          />
          <FormInput<HostelInput>
            name="code"
            label="Code"
            placeholder="BH-A"
            hint="Shown on the block board."
            required
          />

          <FormSelect<HostelInput>
            name="type"
            label="Residents"
            options={HOSTEL_TYPE_OPTIONS}
            hint="Only students of this gender can be allocated a bed here."
            required
          />
          <FormSelect<HostelInput>
            name="warden_id"
            label="Warden"
            options={staffOptions}
            placeholder={staffLoading ? 'Loading staff…' : 'Nobody in charge yet'}
            valueAsNumber
          />

          <FormFullRow>
            <FormInput<HostelInput>
              name="mess_charge"
              type="number"
              label="Monthly mess charge, full board"
              min={0}
              step="0.01"
              hint="Other plans are charged a share of this."
              required
            />
          </FormFullRow>

          <FormFullRow>
            <FormTextarea<HostelInput> name="address" label="Address" rows={2} />
          </FormFullRow>

          <FormCheckbox<HostelInput>
            name="is_active"
            label="Taking residents"
            description="Turn off to close a block without vacating the students in it."
          />
        </FormGrid>

        {messCharge > 0 && (
          <Alert tone="info" title="What each plan costs">
            {(Object.keys(MESS_PLAN_MULTIPLIER) as (keyof typeof MESS_PLAN_MULTIPLIER)[])
              .map(
                (plan) =>
                  `${MESS_PLAN_LABELS[plan]} ${formatCurrency(
                    Math.round(messCharge * MESS_PLAN_MULTIPLIER[plan] * 100) / 100,
                  )}`,
              )
              .join(' · ')}
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
