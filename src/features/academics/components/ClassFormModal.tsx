import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';

import { useCreateClass, useUpdateClass } from '../hooks/useClasses';
import { classSchema, type ClassInput } from '../schemas';
import type { SchoolClassSummary } from '../types';

const FIELDS = ['name', 'level', 'is_active'] as const;

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to create. */
  schoolClass?: SchoolClassSummary | null;
}

/**
 * Create or edit a class. A modal rather than a page — a class is three
 * fields, and staff usually add several in one sitting.
 */
export function ClassFormModal({ isOpen, onClose, schoolClass = null }: ClassFormModalProps) {
  const isEdit = schoolClass !== null;

  const createClass = useCreateClass();
  const updateClass = useUpdateClass(schoolClass?.id ?? 0);
  const mutation = isEdit ? updateClass : createClass;

  const form = useForm<ClassInput>({
    resolver: zodResolver(classSchema),
    defaultValues: schoolClass
      ? { name: schoolClass.name, level: schoolClass.level, is_active: schoolClass.is_active }
      : { name: '', level: 1, is_active: true },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: ClassInput) => {
    mutation.mutate(values, {
      onSuccess: handleClose,
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  // Deactivating a class with students is allowed, but should not be silent.
  const willHideStudents =
    isEdit && schoolClass.is_active && !form.watch('is_active') && schoolClass.students_count > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      title={isEdit ? `Edit ${schoolClass.name}` : 'New class'}
      description="Sections, shifts and capacity are managed inside the class."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="class-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Create class'}
          </Button>
        </>
      }
    >
      <Form id="class-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormInput<ClassInput>
            name="name"
            label="Class name"
            placeholder="Class 10"
            autoFocus
            required
          />
          <FormInput<ClassInput>
            name="level"
            type="number"
            label="Level"
            min={1}
            hint="Used for ordering and year-end promotion."
            required
          />
        </FormGrid>

        <FormCheckbox<ClassInput>
          name="is_active"
          label="Active"
          description="Inactive classes are hidden from admission and assignment pickers."
        />

        {willHideStudents && (
          <Alert tone="warning">
            {schoolClass.students_count} student
            {schoolClass.students_count === 1 ? ' is' : 's are'} enrolled in this class. They keep
            their records, but the class will no longer appear when admitting or assigning.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
