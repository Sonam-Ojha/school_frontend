import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { useClassOptions, useSubjectOptions } from '@/features/academics/hooks/useAcademics';
import { applyServerErrors } from '@/lib/formErrors';

import { ASSIGNMENT_TYPE_OPTIONS } from '../constants';
import { assignmentSchema, type AssignmentInput } from '../schemas';

import { RubricBuilder } from './RubricBuilder';

interface AssignmentFormProps {
  defaultValues: AssignmentInput;
  onSubmit: (values: AssignmentInput, helpers: { onError: (error: unknown) => void }) => void;
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
  requireDirty?: boolean;
  /** Published coursework has been seen — scope changes need a warning. */
  isPublished?: boolean;
  /** Marks already released; changing the scheme would rewrite a record. */
  marksPublished?: boolean;
}

/**
 * Shared by the create and edit screens — the two differ only in
 * `defaultValues` and which mutation they hand to `onSubmit`.
 */
export function AssignmentForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
  onCancel,
  requireDirty = false,
  isPublished = false,
  marksPublished = false,
}: AssignmentFormProps) {
  const form = useForm<AssignmentInput>({
    resolver: zodResolver(assignmentSchema),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const classId = form.watch('class_id');
  const maxMarks = Number(form.watch('max_marks')) || 0;
  const allowsLate = form.watch('allows_late_submission');

  const { classOptions, sectionOptions } = useClassOptions(classId);
  const { subjectOptions, isLoading: subjectsLoading } = useSubjectOptions();

  const handleSubmit = (values: AssignmentInput) => {
    onSubmit(values, {
      onError: (error) => {
        if (applyServerErrors(error, form.setError)) return;
        form.setError('root.serverError', {
          type: 'server',
          message: error instanceof Error ? error.message : 'Could not save this assignment.',
        });
      },
    });
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Card>
        <CardBody className="space-y-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">The brief</h3>

            <FormGrid cols={2}>
              <FormInput<AssignmentInput>
                name="title"
                label="Title"
                placeholder="Water quality of the local river"
                required
              />
              <FormSelect<AssignmentInput>
                name="type"
                label="Kind of work"
                options={ASSIGNMENT_TYPE_OPTIONS}
                required
              />

              <FormFullRow>
                <FormTextarea<AssignmentInput>
                  name="instructions"
                  label="Instructions"
                  rows={7}
                  placeholder="What to produce, how long it should be, what to hand in and in what form."
                  hint="Visible to students and their guardians once published."
                  required
                />
              </FormFullRow>
            </FormGrid>
          </section>

          <section className="border-t border-slate-200 pt-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Who and when</h3>

            {isPublished && (
              <Alert tone="warning" className="mb-3">
                This assignment is already published. Changing the class or section re-scopes it,
                and submissions already recorded for students who fall out of scope will be lost.
              </Alert>
            )}

            <FormGrid cols={3}>
              <FormSelect<AssignmentInput>
                name="class_id"
                label="Class"
                options={classOptions}
                placeholder="Select a class"
                valueAsNumber
                required
              />
              <FormSelect<AssignmentInput>
                name="section_id"
                label="Section"
                options={sectionOptions}
                placeholder={classId ? 'All sections' : 'Select a class first'}
                disabled={sectionOptions.length === 0}
                valueAsNumber
                hint="Leave blank for the whole class."
              />
              <FormSelect<AssignmentInput>
                name="subject_id"
                label="Subject"
                options={subjectOptions}
                placeholder={subjectsLoading ? 'Loading subjects…' : 'Select a subject'}
                valueAsNumber
                required
              />

              <FormInput<AssignmentInput>
                name="assigned_date"
                type="date"
                label="Assigned on"
                required
              />
              <FormInput<AssignmentInput> name="due_date" type="date" label="Due by" required />
            </FormGrid>
          </section>

          <section className="border-t border-slate-200 pt-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Marks and lateness</h3>

            {marksPublished && (
              <Alert tone="warning" className="mb-3">
                Marks for this assignment have already been published. Changing the maximum or the
                marking scheme re-grades work students have already seen.
              </Alert>
            )}

            <FormGrid cols={3}>
              <FormInput<AssignmentInput>
                name="max_marks"
                type="number"
                label="Out of"
                min={1}
                step={0.5}
                hint="Evaluations are capped at this."
                required
              />
              <FormInput<AssignmentInput>
                name="weightage_percent"
                type="number"
                label="Weightage"
                min={0}
                max={100}
                step={0.5}
                hint="Share of the term's internal assessment."
                required
              />
              <FormInput<AssignmentInput>
                name="late_penalty_percent"
                type="number"
                label="Penalty per day late"
                min={0}
                max={100}
                step={1}
                disabled={!allowsLate}
                hint={
                  allowsLate
                    ? `Percent of ${maxMarks || 'the total'} docked per day.`
                    : 'Late work is not accepted.'
                }
              />

              <FormFullRow>
                <FormCheckbox<AssignmentInput>
                  name="allows_late_submission"
                  label="Accept work after the due date"
                  description="Late submissions are flagged, and the daily penalty is applied when you evaluate them. You can waive it per student."
                />
              </FormFullRow>
            </FormGrid>
          </section>

          <RubricBuilder maxMarks={maxMarks} />

          <Alert tone="info">
            Saving creates a draft. Students see nothing until you publish it — that is when their
            submission rows are raised. Marks stay yours until you publish those separately.
          </Alert>
        </CardBody>

        <CardFooter>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
            disabled={requireDirty && !form.formState.isDirty}
            leftIcon={<Save className="size-4" />}
          >
            {submitLabel}
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
}
