import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';

import { useCreateSubject, useUpdateSubject } from '../hooks/useSubjects';
import { readMarks, subjectSchema, type SubjectInput } from '../schemas';
import type { Subject } from '../types';

const FIELDS = [
  'name',
  'code',
  'has_theory',
  'theory_max_marks',
  'theory_pass_marks',
  'has_practical',
  'practical_max_marks',
  'practical_pass_marks',
  'credits',
  'is_elective',
  'is_active',
] as const;

const numText = (value: number | null): string => (value === null ? '' : String(value));

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to create. */
  subject?: Subject | null;
}

/**
 * Create or edit a subject, including its marks scheme.
 *
 * Each component's marks fields appear only when that component is switched
 * on — and the payload drops them when it is off, so turning practical off
 * cannot leave stale marks counting toward the total.
 */
export function SubjectFormModal({ isOpen, onClose, subject = null }: SubjectFormModalProps) {
  const isEdit = subject !== null;

  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject(subject?.id ?? 0);
  const mutation = isEdit ? updateSubject : createSubject;

  const form = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: subject
      ? {
          name: subject.name,
          code: subject.code,
          has_theory: subject.has_theory,
          theory_max_marks: numText(subject.theory_max_marks),
          theory_pass_marks: numText(subject.theory_pass_marks),
          has_practical: subject.has_practical,
          practical_max_marks: numText(subject.practical_max_marks),
          practical_pass_marks: numText(subject.practical_pass_marks),
          credits: subject.credits,
          is_elective: subject.is_elective,
          is_active: subject.is_active,
        }
      : {
          name: '',
          code: '',
          has_theory: true,
          theory_max_marks: '100',
          theory_pass_marks: '35',
          has_practical: false,
          practical_max_marks: '',
          practical_pass_marks: '',
          credits: 4,
          is_elective: false,
          is_active: true,
        },
  });

  const hasTheory = form.watch('has_theory');
  const hasPractical = form.watch('has_practical');

  // Live total, so the marks scheme can be sanity-checked while typing.
  const total =
    (hasTheory ? (readMarks(form.watch('theory_max_marks')) ?? 0) : 0) +
    (hasPractical ? (readMarks(form.watch('practical_max_marks')) ?? 0) : 0);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: SubjectInput) => {
    mutation.mutate(values, {
      onSuccess: handleClose,
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  const componentError = form.formState.errors.has_theory?.message;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title={isEdit ? `Edit ${subject.name}` : 'New subject'}
      description="Assign teachers from the subject list once it is saved."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="subject-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Create subject'}
          </Button>
        </>
      }
    >
      <Form id="subject-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormInput<SubjectInput>
            name="name"
            label="Subject name"
            placeholder="Mathematics"
            autoFocus
            required
          />
          <FormInput<SubjectInput>
            name="code"
            label="Subject code"
            placeholder="MATH"
            hint="Shown on report cards and timetables."
            required
          />
        </FormGrid>

        <div className="space-y-4 border-t border-slate-200 pt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Marks scheme</h3>
            {total > 0 && (
              <span className="text-xs text-slate-500">
                Total maximum: <span className="font-semibold text-slate-800">{total}</span>
              </span>
            )}
          </div>

          {typeof componentError === 'string' && <Alert tone="danger">{componentError}</Alert>}

          <div className="rounded-lg border border-slate-200 p-3">
            <FormCheckbox<SubjectInput>
              name="has_theory"
              label="Theory"
              description="Written examination component."
            />

            {hasTheory && (
              <FormGrid cols={2} className="mt-3">
                <FormInput<SubjectInput>
                  name="theory_max_marks"
                  label="Maximum marks"
                  inputMode="numeric"
                  required
                />
                <FormInput<SubjectInput>
                  name="theory_pass_marks"
                  label="Pass marks"
                  inputMode="numeric"
                  required
                />
              </FormGrid>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <FormCheckbox<SubjectInput>
              name="has_practical"
              label="Practical"
              description="Lab, field or performance component."
            />

            {hasPractical && (
              <FormGrid cols={2} className="mt-3">
                <FormInput<SubjectInput>
                  name="practical_max_marks"
                  label="Maximum marks"
                  inputMode="numeric"
                  required
                />
                <FormInput<SubjectInput>
                  name="practical_pass_marks"
                  label="Pass marks"
                  inputMode="numeric"
                  required
                />
              </FormGrid>
            )}
          </div>
        </div>

        <FormGrid cols={2} className="border-t border-slate-200 pt-4">
          <FormInput<SubjectInput>
            name="credits"
            type="number"
            label="Credits"
            min={0}
            step={0.5}
            hint="Weighting toward the final grade. 0 for non-credit subjects."
            required
          />
        </FormGrid>

        <div className="space-y-2">
          <FormCheckbox<SubjectInput>
            name="is_elective"
            label="Elective"
            description="Chosen by the student rather than assigned to the whole class."
          />
          <FormCheckbox<SubjectInput>
            name="is_active"
            label="Active"
            description="Inactive subjects are hidden from teacher and timetable pickers."
          />
        </div>
      </Form>
    </Modal>
  );
}
