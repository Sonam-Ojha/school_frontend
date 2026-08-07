import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';

import { FEE_CATEGORY_OPTIONS } from '../constants';
import { useCreateFeeType, useUpdateFeeType } from '../hooks/useFeeCatalogue';
import { feeTypeSchema, type FeeTypeInput } from '../schemas';
import type { FeeType } from '../types';

const FIELDS = ['name', 'code', 'category', 'is_recurring', 'is_refundable', 'is_active', 'description'] as const;

interface FeeTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to create. */
  feeType?: FeeType | null;
}

export function FeeTypeFormModal({ isOpen, onClose, feeType = null }: FeeTypeFormModalProps) {
  const isEdit = feeType !== null;

  const createType = useCreateFeeType();
  const updateType = useUpdateFeeType(feeType?.id ?? 0);
  const mutation = isEdit ? updateType : createType;

  const form = useForm<FeeTypeInput>({
    resolver: zodResolver(feeTypeSchema),
    defaultValues: feeType
      ? {
          name: feeType.name,
          code: feeType.code,
          category: feeType.category,
          is_recurring: feeType.is_recurring,
          is_refundable: feeType.is_refundable,
          is_active: feeType.is_active,
          description: feeType.description ?? '',
        }
      : {
          name: '',
          code: '',
          category: 'tuition',
          is_recurring: true,
          is_refundable: false,
          is_active: true,
          description: '',
        },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: FeeTypeInput) => {
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
      size="sm"
      title={isEdit ? `Edit ${feeType.name}` : 'New fee type'}
      description="Fee types are the lines a structure is built from."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="fee-type-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Create fee type'}
          </Button>
        </>
      }
    >
      <Form id="fee-type-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormInput<FeeTypeInput>
            name="name"
            label="Name"
            placeholder="Tuition fee"
            autoFocus
            required
          />
          <FormInput<FeeTypeInput> name="code" label="Code" placeholder="TUI" required />

          <FormFullRow>
            <FormSelect<FeeTypeInput>
              name="category"
              label="Category"
              options={FEE_CATEGORY_OPTIONS}
              required
            />
          </FormFullRow>

          <FormFullRow>
            <FormTextarea<FeeTypeInput>
              name="description"
              label="Description"
              rows={2}
              hint="Optional"
            />
          </FormFullRow>
        </FormGrid>

        <div className="space-y-2">
          <FormCheckbox<FeeTypeInput>
            name="is_recurring"
            label="Recurring"
            description="Charged every term rather than once at admission."
          />
          <FormCheckbox<FeeTypeInput>
            name="is_refundable"
            label="Refundable"
            description="Returned when the student leaves — a caution deposit, for example."
          />
          <FormCheckbox<FeeTypeInput>
            name="is_active"
            label="Active"
            description="Inactive types cannot be added to new structures."
          />
        </div>
      </Form>
    </Modal>
  );
}
