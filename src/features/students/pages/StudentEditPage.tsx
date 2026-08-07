import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { Form } from '@/components/form/Form';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { applyServerErrors } from '@/lib/formErrors';

import { GuardiansSection } from '../components/sections/GuardiansSection';
import { MedicalSection } from '../components/sections/MedicalSection';
import { PersonalSection } from '../components/sections/PersonalSection';
import { PreviousSchoolSection } from '../components/sections/PreviousSchoolSection';
import { useStudent } from '../hooks/useStudents';
import { useUpdateStudent } from '../hooks/useStudentMutations';
import { studentSchema, type StudentInput } from '../schemas';
import { studentToInput } from '../utils/defaults';
import type { StudentDetail } from '../types';

/**
 * Edit screen.
 *
 * Reuses the same four sections as the admission wizard, stacked on one page
 * rather than stepped — someone correcting a phone number should not walk
 * through five steps to reach it.
 */
function EditForm({ student }: { student: StudentDetail }) {
  const navigate = useNavigate();
  const updateStudent = useUpdateStudent(student.id);
  const profilePath = toPath(PATHS.studentProfile, { id: student.id });

  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: studentToInput(student),
  });

  const onSubmit = (values: StudentInput) => {
    updateStudent.mutate(values, {
      onSuccess: () => navigate(profilePath, { replace: true }),
      onError: (error) => {
        if (applyServerErrors(error, form.setError)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  return (
    <Form form={form} onSubmit={onSubmit}>
      <Card>
        <CardBody className="space-y-8">
          <PersonalSection />

          <div className="border-t border-slate-200 pt-6">
            <GuardiansSection />
          </div>

          <div className="border-t border-slate-200 pt-6">
            <MedicalSection />
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Previous school</h3>
            <PreviousSchoolSection />
          </div>
        </CardBody>

        <CardFooter>
          <Button
            variant="outline"
            onClick={() => navigate(profilePath)}
            disabled={updateStudent.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={updateStudent.isPending}
            disabled={!form.formState.isDirty}
            leftIcon={<Save className="size-4" />}
          >
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
}

export default function StudentEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: student, isLoading, error } = useStudent(id);

  const breadcrumbs = [
    { label: 'Dashboard', to: PATHS.dashboard },
    { label: 'Students', to: PATHS.students },
    ...(student
      ? [
          { label: student.full_name, to: toPath(PATHS.studentProfile, { id: student.id }) },
          { label: 'Edit' },
        ]
      : [{ label: 'Edit' }]),
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Edit student" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody className="space-y-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </CardBody>
        </Card>
      </>
    );
  }

  if (error || !student) {
    return (
      <>
        <PageHeader title="Edit student" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this student">
              {error?.message ?? 'The record no longer exists.'}
            </Alert>
            <Button variant="outline" className="mt-4" onClick={() => navigate(PATHS.students)}>
              Back to students
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit ${student.full_name}`}
        description={`Admission number ${student.admission_no}`}
        breadcrumbs={breadcrumbs}
      />
      {/* Remount per record so `defaultValues` are applied. */}
      <EditForm key={student.id} student={student} />
    </>
  );
}
