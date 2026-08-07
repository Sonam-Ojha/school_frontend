import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { formatCurrency } from '@/lib/format';

import {
  CALCULATION_OPTIONS,
  COMPONENT_TYPE_OPTIONS,
  MAX_COMPONENT_PERCENT,
} from '../constants';
import { useCreateComponent, useUpdateComponent } from '../hooks/usePayroll';
import { componentSchema, type ComponentInput } from '../schemas';
import type { SalaryComponent } from '../types';

const FIELDS = [
  'name', 'code', 'type', 'calculation', 'value',
  'is_taxable', 'affects_pf', 'is_active', 'sort_order',
] as const;

/** A worked example, so the rate means something before it is saved. */
const SAMPLE_BASIC = 25_000;

interface ComponentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to add. */
  component?: SalaryComponent | null;
  nextSortOrder: number;
}

export function ComponentFormModal({
  isOpen,
  onClose,
  component = null,
  nextSortOrder,
}: ComponentFormModalProps) {
  const isEdit = component !== null;

  const createComponent = useCreateComponent();
  const updateComponent = useUpdateComponent(component?.id ?? 0);
  const mutation = isEdit ? updateComponent : createComponent;

  const form = useForm<ComponentInput>({
    resolver: zodResolver(componentSchema),
    defaultValues: component
      ? {
          name: component.name,
          code: component.code,
          type: component.type,
          calculation: component.calculation,
          value: component.value,
          is_taxable: component.is_taxable,
          affects_pf: component.affects_pf,
          is_active: component.is_active,
          sort_order: component.sort_order,
        }
      : {
          name: '',
          code: '',
          type: 'earning',
          calculation: 'percent_of_basic',
          value: 0,
          is_taxable: true,
          affects_pf: false,
          is_active: true,
          sort_order: nextSortOrder,
        },
  });

  const type = form.watch('type');
  const calculation = form.watch('calculation');
  const value = form.watch('value');

  // Switching to a deduction invalidates two earning-only flags and, if the
  // calculation was gross-based, switching back would leave it illegal.
  useEffect(() => {
    if (type === 'deduction') {
      form.setValue('is_taxable', false);
      form.setValue('affects_pf', false);
    } else if (calculation === 'percent_of_gross') {
      form.setValue('calculation', 'percent_of_basic');
    }
  }, [type, calculation, form]);

  const preview =
    calculation === 'fixed'
      ? value
      : Number.isFinite(value)
        ? Math.round((SAMPLE_BASIC * value) / 100)
        : 0;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title={isEdit ? `Edit ${component.name}` : 'Add a component'}
      description="A line on the payslip. Defined once here, applied to many salaries."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="component-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add component'}
          </Button>
        </>
      }
    >
      <Form
        id="component-form"
        form={form}
        onSubmit={(values) =>
          mutation.mutate(values, {
            onSuccess: handleClose,
            onError: (error) => {
              if (applyServerErrors(error, form.setError, FIELDS)) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        {isEdit && component.is_statutory && (
          <Alert tone="warning" title="This is a statutory component">
            PF, ESI and professional tax are computed by rule. The name and its position on the
            payslip can be changed; the rate cannot.
          </Alert>
        )}

        <FormGrid cols={2}>
          <FormInput<ComponentInput>
            name="name"
            label="Name"
            placeholder="House rent allowance"
            required
          />
          <FormInput<ComponentInput>
            name="code"
            label="Payslip code"
            placeholder="HRA"
            required
          />

          <FormSelect<ComponentInput>
            name="type"
            label="Type"
            options={COMPONENT_TYPE_OPTIONS}
            disabled={isEdit && component.structures_count > 0}
            hint={
              isEdit && component.structures_count > 0
                ? 'In use on a salary — an allowance cannot become a deduction.'
                : undefined
            }
            required
          />
          <FormSelect<ComponentInput>
            name="calculation"
            label="Worked out as"
            options={CALCULATION_OPTIONS[type]}
            disabled={isEdit && component.is_statutory}
            required
          />

          <FormInput<ComponentInput>
            name="value"
            type="number"
            label={calculation === 'fixed' ? 'Amount' : 'Percentage'}
            min={0}
            max={calculation === 'fixed' ? undefined : MAX_COMPONENT_PERCENT}
            step="0.01"
            disabled={isEdit && component.is_statutory}
            hint={
              calculation === 'fixed'
                ? 'The same every month.'
                : `On a basic of ${formatCurrency(SAMPLE_BASIC)} this is ${formatCurrency(preview)}.`
            }
            required
          />
          <FormInput<ComponentInput>
            name="sort_order"
            type="number"
            label="Position on the payslip"
            min={1}
            hint="Lines are printed in this order."
            required
          />

          {type === 'earning' && (
            <>
              <FormCheckbox<ComponentInput>
                name="affects_pf"
                label="Counts toward PF wages"
                description="Dearness allowance does; house rent and conveyance do not."
              />
              <FormCheckbox<ComponentInput>
                name="is_taxable"
                label="Taxable"
                description="Enters taxable income for TDS."
              />
            </>
          )}

          <FormCheckbox<ComponentInput>
            name="is_active"
            label="Available for new salaries"
            description="Turn off to retire it without disturbing the salaries already using it."
          />
        </FormGrid>

        {type === 'earning' && form.watch('affects_pf') && (
          <Alert tone="info">
            PF is charged on basic plus the allowances marked here. Marking house rent or
            conveyance is the single most common reason a PF return is rejected.
          </Alert>
        )}

        {isEdit && component.structures_count > 0 && (
          <Alert tone="warning">
            {component.structures_count} salar
            {component.structures_count === 1 ? 'y uses' : 'ies use'} this component. Changing the
            rate reprices all of them — processed payslips are not affected.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
