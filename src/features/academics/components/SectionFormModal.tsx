import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';

import { SHIFT_OPTIONS } from '../constants';
import { useCreateSection, useUpdateSection } from '../hooks/useClasses';
import { sectionSchemaFor, type SectionInput } from '../schemas';
import type { Section } from '../types';

const FIELDS = ['name', 'shift', 'capacity', 'room', 'is_active'] as const;

interface SectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  className: string;
  /** Omit to create. */
  section?: Section | null;
  /** Shift to pre-select on a new section — usually the class's existing one. */
  defaultShift?: SectionInput['shift'];
}

export function SectionFormModal({
  isOpen,
  onClose,
  classId,
  className,
  section = null,
  defaultShift = 'morning',
}: SectionFormModalProps) {
  const isEdit = section !== null;
  const enrolled = section?.students_count ?? 0;

  const createSection = useCreateSection(classId);
  const updateSection = useUpdateSection(classId, section?.id ?? 0);
  const mutation = isEdit ? updateSection : createSection;

  // The floor on capacity depends on the record, not the form, so the schema
  // is built per-section rather than shared.
  const schema = useMemo(() => sectionSchemaFor(enrolled), [enrolled]);

  const form = useForm<SectionInput>({
    resolver: zodResolver(schema),
    defaultValues: section
      ? {
          name: section.name,
          shift: section.shift,
          capacity: section.capacity,
          room: section.room ?? '',
          is_active: section.is_active,
        }
      : { name: '', shift: defaultShift, capacity: 40, room: '', is_active: true },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: SectionInput) => {
    mutation.mutate(values, {
      onSuccess: handleClose,
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  const willDeactivate = isEdit && section.is_active && !form.watch('is_active') && enrolled > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      title={isEdit ? `Edit section ${section.name}` : `New section in ${className}`}
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="section-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Create section'}
          </Button>
        </>
      }
    >
      <Form id="section-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormInput<SectionInput>
            name="name"
            label="Section name"
            placeholder="A"
            autoFocus
            required
          />
          <FormSelect<SectionInput>
            name="shift"
            label="Shift"
            options={SHIFT_OPTIONS}
            required
          />

          <FormInput<SectionInput>
            name="capacity"
            type="number"
            label="Capacity"
            min={1}
            hint={enrolled > 0 ? `${enrolled} seats already taken` : 'Seats in this section'}
            required
          />
          <FormInput<SectionInput>
            name="room"
            label="Room"
            placeholder="Block A — 204"
            hint="Optional"
          />
        </FormGrid>

        <FormCheckbox<SectionInput>
          name="is_active"
          label="Active"
          description="Inactive sections are hidden from admission and assignment pickers."
        />

        {willDeactivate && (
          <Alert tone="warning">
            {enrolled} student{enrolled === 1 ? ' is' : 's are'} enrolled in this section. They
            keep their records, but the section will no longer be selectable.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
