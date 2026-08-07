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
import { useAcademicYears } from '@/features/settings/hooks/useAcademicYears';
import { applyServerErrors } from '@/lib/formErrors';

import { EXAM_TYPE_OPTIONS } from '../constants';
import { examSchema, type ExamInput } from '../schemas';

interface ExamFormProps {
  defaultValues: ExamInput;
  onSubmit: (values: ExamInput, helpers: { onError: (error: unknown) => void }) => void;
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
  requireDirty?: boolean;
  /** Narrowing the window on a scheduled exam can orphan papers. */
  hasPapers?: boolean;
}

/**
 * Shared by the create and edit screens — the two differ only in
 * `defaultValues` and which mutation they hand to `onSubmit`.
 */
export function ExamForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
  onCancel,
  requireDirty = false,
  hasPapers = false,
}: ExamFormProps) {
  const { data: academicYears } = useAcademicYears();

  const form = useForm<ExamInput>({
    resolver: zodResolver(examSchema),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const yearOptions = (academicYears ?? []).map((year) => ({ label: year.name, value: year.id }));

  const handleSubmit = (values: ExamInput) => {
    onSubmit(values, {
      onError: (error) => {
        if (applyServerErrors(error, form.setError)) return;
        form.setError('root.serverError', {
          type: 'server',
          message: error instanceof Error ? error.message : 'Could not save this exam.',
        });
      },
    });
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Card>
        <CardBody className="space-y-5">
          <FormGrid cols={2}>
            <FormInput<ExamInput>
              name="name"
              label="Exam name"
              placeholder="Half Yearly Examination 2025"
              required
            />
            <FormSelect<ExamInput>
              name="type"
              label="Type"
              options={EXAM_TYPE_OPTIONS}
              required
            />

            <FormSelect<ExamInput>
              name="academic_year_id"
              label="Academic year"
              options={yearOptions}
              placeholder="Select a session"
              valueAsNumber
              required
            />
            <div />

            <FormInput<ExamInput> name="start_date" type="date" label="Starts" required />
            <FormInput<ExamInput>
              name="end_date"
              type="date"
              label="Ends"
              hint="Papers must fall inside this window."
              required
            />

            <FormFullRow>
              <FormTextarea<ExamInput>
                name="description"
                label="Instructions"
                rows={3}
                placeholder="Exam rules, materials permitted, reporting time…"
                hint="Optional — shown with the timetable."
              />
            </FormFullRow>
          </FormGrid>

          {hasPapers && (
            <Alert tone="warning">
              This exam already has papers scheduled. Narrowing the date window can leave a paper
              outside it — check the timetable after saving.
            </Alert>
          )}

          <Alert tone="info">
            Saving creates the exam. Add a paper for each class-and-subject next, then publish the
            timetable.
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
