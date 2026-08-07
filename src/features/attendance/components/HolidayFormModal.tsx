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
import { toDateInputValue } from '@/lib/format';

import { HOLIDAY_SCOPE_OPTIONS, HOLIDAY_TYPE_OPTIONS } from '../constants';
import { useCreateHoliday, useUpdateHoliday } from '../hooks/useHolidays';
import { holidaySchema, type HolidayInput } from '../schemas';
import type { Holiday } from '../types';

const FIELDS = ['name', 'start_date', 'end_date', 'type', 'scope', 'description'] as const;

interface HolidayFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to create. */
  holiday?: Holiday | null;
}

export function HolidayFormModal({ isOpen, onClose, holiday = null }: HolidayFormModalProps) {
  const isEdit = holiday !== null;

  const createHoliday = useCreateHoliday();
  const updateHoliday = useUpdateHoliday(holiday?.id ?? 0);
  const mutation = isEdit ? updateHoliday : createHoliday;

  const form = useForm<HolidayInput>({
    resolver: zodResolver(holidaySchema),
    defaultValues: holiday
      ? {
          name: holiday.name,
          start_date: toDateInputValue(holiday.start_date),
          end_date: toDateInputValue(holiday.end_date),
          type: holiday.type,
          scope: holiday.scope,
          description: holiday.description ?? '',
        }
      : {
          name: '',
          start_date: '',
          end_date: '',
          type: 'public',
          scope: 'all',
          description: '',
        },
  });

  const start = form.watch('start_date');
  const end = form.watch('end_date');

  // Live day count, so a mistyped year is obvious before saving.
  const days =
    start && end
      ? Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1
      : 0;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: HolidayInput) => {
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
      title={isEdit ? `Edit ${holiday.name}` : 'New holiday'}
      description="Attendance is not taken on days a holiday covers."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="holiday-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add holiday'}
          </Button>
        </>
      }
    >
      <Form id="holiday-form" form={form} onSubmit={onSubmit}>
        <FormInput<HolidayInput>
          name="name"
          label="Holiday name"
          placeholder="Independence Day"
          autoFocus
          required
        />

        <FormGrid cols={2}>
          <FormInput<HolidayInput> name="start_date" type="date" label="From" required />
          <FormInput<HolidayInput>
            name="end_date"
            type="date"
            label="To"
            hint={days > 0 ? `${days} day${days === 1 ? '' : 's'}` : 'Same as "From" for one day'}
            required
          />

          <FormSelect<HolidayInput>
            name="type"
            label="Type"
            options={HOLIDAY_TYPE_OPTIONS}
            required
          />
          <FormSelect<HolidayInput>
            name="scope"
            label="Applies to"
            options={HOLIDAY_SCOPE_OPTIONS}
            required
          />

          <FormFullRow>
            <FormTextarea<HolidayInput>
              name="description"
              label="Description"
              rows={2}
              hint="Optional"
            />
          </FormFullRow>
        </FormGrid>

        {form.watch('scope') === 'students' && (
          <Alert tone="info">
            Staff and teachers will still be marked on these days — use “Everyone” to close the
            school entirely.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
