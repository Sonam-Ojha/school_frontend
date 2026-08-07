import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { toDateInputValue } from '@/lib/format';

import { useCreateAcademicYear, useUpdateAcademicYear } from '../hooks/useAcademicYears';
import { academicYearSchema, type AcademicYearInput } from '../schemas';
import type { AcademicYear } from '../types';

const FIELDS = ['name', 'start_date', 'end_date', 'is_current'] as const;

interface AcademicYearFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to create. */
  academicYear?: AcademicYear | null;
}

/** Suggests `2025-2026` from today, matching the usual Indian session naming. */
function suggestName(): string {
  const now = new Date();
  // Sessions normally start in April, so before April we are still in the
  // session that began the previous calendar year.
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
}

export function AcademicYearFormModal({
  isOpen,
  onClose,
  academicYear = null,
}: AcademicYearFormModalProps) {
  const isEdit = academicYear !== null;

  const createYear = useCreateAcademicYear();
  const updateYear = useUpdateAcademicYear(academicYear?.id ?? 0);
  const mutation = isEdit ? updateYear : createYear;

  const form = useForm<AcademicYearInput>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: academicYear
      ? {
          name: academicYear.name,
          start_date: toDateInputValue(academicYear.start_date),
          end_date: toDateInputValue(academicYear.end_date),
          is_current: academicYear.is_current,
        }
      : { name: suggestName(), start_date: '', end_date: '', is_current: false },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: AcademicYearInput) => {
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
      title={isEdit ? `Edit ${academicYear.name}` : 'New academic session'}
      description="Sessions scope admissions, attendance, exams and fees."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="academic-year-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Create session'}
          </Button>
        </>
      }
    >
      <Form id="academic-year-form" form={form} onSubmit={onSubmit}>
        <FormInput<AcademicYearInput>
          name="name"
          label="Session name"
          placeholder="2025-2026"
          autoFocus
          required
        />

        <FormGrid cols={2}>
          <FormInput<AcademicYearInput>
            name="start_date"
            type="date"
            label="Start date"
            required
          />
          <FormInput<AcademicYearInput> name="end_date" type="date" label="End date" required />
        </FormGrid>

        {/* Editing the active session cannot deactivate it — that would leave
            the school with none. Switching is done from the list. */}
        {academicYear?.is_current ? (
          <Alert tone="info">
            This is the current session. To switch, activate a different one from the list.
          </Alert>
        ) : (
          <FormCheckbox<AcademicYearInput>
            name="is_current"
            label="Make this the current session"
            description="The previously current session will be deactivated."
          />
        )}
      </Form>
    </Modal>
  );
}
