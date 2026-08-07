import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Shift } from '@/features/academics/types';
import { applyServerErrors } from '@/lib/formErrors';
import { durationBetween } from '@/lib/time';

import { SHIFT_OPTIONS } from '../constants';
import { useCreatePeriod, useUpdatePeriod } from '../hooks/useTimetable';
import { periodSchema, type PeriodInput } from '../schemas';
import type { Period } from '../types';

const FIELDS = ['name', 'shift', 'sort_order', 'start_time', 'end_time', 'is_break'] as const;

interface PeriodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to add. */
  period?: Period | null;
  /** Next free position in the shift, used as the default for a new period. */
  nextSortOrder: number;
  /** The shift whose "add" button was pressed. */
  defaultShift?: Shift;
}

export function PeriodFormModal({
  isOpen,
  onClose,
  period = null,
  nextSortOrder,
  defaultShift = 'morning',
}: PeriodFormModalProps) {
  const isEdit = period !== null;

  const createPeriod = useCreatePeriod();
  const updatePeriod = useUpdatePeriod(period?.id ?? 0);
  const mutation = isEdit ? updatePeriod : createPeriod;

  const form = useForm<PeriodInput>({
    resolver: zodResolver(periodSchema),
    defaultValues: period
      ? {
          name: period.name,
          shift: period.shift,
          sort_order: period.sort_order,
          start_time: period.start_time,
          end_time: period.end_time,
          is_break: period.is_break,
        }
      : {
          name: `Period ${nextSortOrder}`,
          shift: defaultShift,
          sort_order: nextSortOrder,
          start_time: '09:00',
          end_time: '09:45',
          is_break: false,
        },
  });

  const start = form.watch('start_time');
  const end = form.watch('end_time');
  const minutes = durationBetween(start, end);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: PeriodInput) => {
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
      title={isEdit ? `Edit ${period.name}` : 'Add a period'}
      description="Periods are the school's daily time grid. Every section on this shift uses them."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="period-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add period'}
          </Button>
        </>
      }
    >
      <Form id="period-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormInput<PeriodInput>
            name="name"
            label="Name"
            placeholder="Period 1"
            required
          />
          <FormSelect<PeriodInput>
            name="shift"
            label="Shift"
            options={SHIFT_OPTIONS}
            required
          />

          <FormInput<PeriodInput>
            name="start_time"
            type="time"
            label="Starts at"
            required
          />
          <FormInput<PeriodInput>
            name="end_time"
            type="time"
            label="Ends at"
            hint={minutes !== null && minutes > 0 ? `${minutes} minutes` : undefined}
            required
          />

          <FormInput<PeriodInput>
            name="sort_order"
            type="number"
            label="Position in the day"
            min={1}
            valueAsNumber
            hint="Periods are shown in this order."
            required
          />

          <FormCheckbox<PeriodInput>
            name="is_break"
            label="This is a break"
            description="Assembly, lunch or games — no lesson can be scheduled in it."
          />
        </FormGrid>

        {isEdit && period.slots_count > 0 && (
          <Alert tone="info">
            {period.slots_count} lesson{period.slots_count === 1 ? '' : 's'} currently sit in this
            period. Changing its times moves them all.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
