import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { useClassOptions, useSubjectOptions } from '@/features/academics/hooks/useAcademics';
import { applyServerErrors } from '@/lib/formErrors';

import { homeworkSchema, type HomeworkInput } from '../schemas';

interface HomeworkFormProps {
  defaultValues: HomeworkInput;
  onSubmit: (values: HomeworkInput, helpers: { onError: (error: unknown) => void }) => void;
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
  requireDirty?: boolean;
  /** Published homework has been seen — scope changes need a warning. */
  isPublished?: boolean;
}

/**
 * Shared by the create and edit screens — the two differ only in
 * `defaultValues` and which mutation they hand to `onSubmit`.
 */
export function HomeworkForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
  onCancel,
  requireDirty = false,
  isPublished = false,
}: HomeworkFormProps) {
  const form = useForm<HomeworkInput>({
    resolver: zodResolver(homeworkSchema),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const classId = form.watch('class_id');
  const { classOptions, sectionOptions } = useClassOptions(classId);
  const { subjectOptions, isLoading: subjectsLoading } = useSubjectOptions();

  const handleSubmit = (values: HomeworkInput) => {
    onSubmit(values, {
      onError: (error) => {
        if (applyServerErrors(error, form.setError)) return;
        form.setError('root.serverError', {
          type: 'server',
          message: error instanceof Error ? error.message : 'Could not save this homework.',
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

            <FormInput<HomeworkInput>
              name="title"
              label="Title"
              placeholder="Chapter 4 — practice problems"
              required
            />

            <div className="mt-4">
              <FormTextarea<HomeworkInput>
                name="description"
                label="What to do"
                rows={6}
                placeholder="Set out the task, the pages, and anything the students need to know."
                hint="Visible to students and their guardians."
                required
              />
            </div>
          </section>

          <section className="border-t border-slate-200 pt-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Who and when</h3>

            {isPublished && (
              <Alert tone="warning" className="mb-3">
                This homework is already published. Changing the class or section re-scopes it,
                and submissions already recorded for students who fall out of scope will be lost.
              </Alert>
            )}

            <FormGrid cols={3}>
              <FormSelect<HomeworkInput>
                name="class_id"
                label="Class"
                options={classOptions}
                placeholder="Select a class"
                valueAsNumber
                required
              />
              <FormSelect<HomeworkInput>
                name="section_id"
                label="Section"
                options={sectionOptions}
                placeholder={classId ? 'All sections' : 'Select a class first'}
                disabled={sectionOptions.length === 0}
                valueAsNumber
                hint="Leave blank for the whole class."
              />
              <FormSelect<HomeworkInput>
                name="subject_id"
                label="Subject"
                options={subjectOptions}
                placeholder={subjectsLoading ? 'Loading subjects…' : 'Select a subject'}
                valueAsNumber
                required
              />

              <FormInput<HomeworkInput>
                name="assigned_date"
                type="date"
                label="Assigned on"
                required
              />
              <FormInput<HomeworkInput> name="due_date" type="date" label="Due by" required />
              <FormInput<HomeworkInput>
                name="max_marks"
                type="number"
                label="Out of"
                min={1}
                hint="Grades are capped at this."
                required
              />

              <FormFullRow>
                <Alert tone="info">
                  Saving creates a draft. Students see nothing until you publish it — that is
                  when their submission rows are raised.
                </Alert>
              </FormFullRow>
            </FormGrid>
          </section>
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
