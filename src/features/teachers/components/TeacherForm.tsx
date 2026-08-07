import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Form } from '@/components/form/Form';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { applyServerErrors } from '@/lib/formErrors';

import { teacherSchema, type TeacherInput } from '../schemas';

import { AssignmentsSection } from './sections/AssignmentsSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { QualificationsSection } from './sections/QualificationsSection';
import { TeacherPersonalSection } from './sections/TeacherPersonalSection';

interface TeacherFormProps {
  defaultValues: TeacherInput;
  onSubmit: (values: TeacherInput, helpers: { onError: (error: unknown) => void }) => void;
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
  /** Only edit needs the dirty guard; create starts blank and is always saveable. */
  requireDirty?: boolean;
}

/**
 * Shared by the create and edit screens — the two differ only in
 * `defaultValues` and which mutation they hand to `onSubmit`.
 *
 * Sections are stacked rather than stepped: unlike admission, a teacher record
 * is usually edited one field at a time, and a wizard would make that slower.
 */
export function TeacherForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
  onCancel,
  requireDirty = false,
}: TeacherFormProps) {
  const form = useForm<TeacherInput>({
    resolver: zodResolver(teacherSchema),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const handleSubmit = (values: TeacherInput) => {
    onSubmit(values, {
      onError: (error) => {
        if (applyServerErrors(error, form.setError)) return;
        form.setError('root.serverError', {
          type: 'server',
          message: error instanceof Error ? error.message : 'Could not save this teacher.',
        });
      },
    });
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Card>
        <CardBody className="space-y-8">
          <TeacherPersonalSection />

          <div className="border-t border-slate-200 pt-6">
            <QualificationsSection />
          </div>

          <div className="border-t border-slate-200 pt-6">
            <ExperienceSection />
          </div>

          <div className="border-t border-slate-200 pt-6">
            <AssignmentsSection />
          </div>
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
