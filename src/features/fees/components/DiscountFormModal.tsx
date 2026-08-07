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
import { formatCurrency } from '@/lib/format';
import { percentageOf } from '@/lib/money';

import { DISCOUNT_TYPE_OPTIONS } from '../constants';
import { useCreateDiscount, useUpdateDiscount } from '../hooks/useFeeCatalogue';
import { discountSchema, type DiscountInput } from '../schemas';
import type { Discount } from '../types';

const FIELDS = ['name', 'code', 'value_type', 'value', 'description', 'is_active'] as const;

/** A representative bill, so a percentage discount has something to land on. */
const SAMPLE_BILL = 50_000;

interface DiscountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to create. */
  discount?: Discount | null;
}

export function DiscountFormModal({ isOpen, onClose, discount = null }: DiscountFormModalProps) {
  const isEdit = discount !== null;

  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount(discount?.id ?? 0);
  const mutation = isEdit ? updateDiscount : createDiscount;

  const form = useForm<DiscountInput>({
    resolver: zodResolver(discountSchema),
    defaultValues: discount
      ? {
          name: discount.name,
          code: discount.code,
          value_type: discount.value_type,
          value: discount.value,
          description: discount.description ?? '',
          is_active: discount.is_active,
        }
      : {
          name: '',
          code: '',
          value_type: 'percentage',
          value: 10,
          description: '',
          is_active: true,
        },
  });

  const valueType = form.watch('value_type');
  const value = form.watch('value');

  const preview =
    Number.isFinite(value) && value > 0
      ? valueType === 'percentage'
        ? percentageOf(SAMPLE_BILL, value)
        : value
      : 0;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: DiscountInput) => {
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
      title={isEdit ? `Edit ${discount.name}` : 'New discount'}
      description="Applied at collection time against a student's balance."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="discount-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Create discount'}
          </Button>
        </>
      }
    >
      <Form id="discount-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormInput<DiscountInput>
            name="name"
            label="Name"
            placeholder="Sibling concession"
            autoFocus
            required
          />
          <FormInput<DiscountInput> name="code" label="Code" placeholder="SIB" required />

          <FormSelect<DiscountInput>
            name="value_type"
            label="Type"
            options={DISCOUNT_TYPE_OPTIONS}
            required
          />
          <FormInput<DiscountInput>
            name="value"
            type="number"
            label={valueType === 'percentage' ? 'Percentage' : 'Amount'}
            min={0}
            step={valueType === 'percentage' ? 0.5 : 0.01}
            max={valueType === 'percentage' ? 100 : undefined}
            required
          />

          <FormFullRow>
            <FormTextarea<DiscountInput>
              name="description"
              label="Description"
              rows={2}
              hint="Optional — why this concession exists."
            />
          </FormFullRow>
        </FormGrid>

        {preview > 0 && (
          <Alert tone="info">
            On a bill of {formatCurrency(SAMPLE_BILL)}, this takes off{' '}
            <strong>{formatCurrency(preview)}</strong>.
          </Alert>
        )}

        <FormCheckbox<DiscountInput>
          name="is_active"
          label="Active"
          description="Inactive discounts cannot be applied to new payments."
        />
      </Form>
    </Modal>
  );
}
