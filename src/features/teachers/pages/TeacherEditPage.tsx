import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

import { TeacherForm } from '../components/TeacherForm';
import { useTeacher, useUpdateTeacher } from '../hooks/useTeachers';
import { teacherToInput } from '../utils/defaults';
import type { TeacherDetail } from '../types';

function EditForm({ teacher }: { teacher: TeacherDetail }) {
  const navigate = useNavigate();
  const updateTeacher = useUpdateTeacher(teacher.id);
  const profilePath = toPath(PATHS.teacherProfile, { id: teacher.id });

  return (
    <TeacherForm
      defaultValues={teacherToInput(teacher)}
      isPending={updateTeacher.isPending}
      submitLabel="Save changes"
      requireDirty
      onCancel={() => navigate(profilePath)}
      onSubmit={(values, { onError }) =>
        updateTeacher.mutate(values, {
          onSuccess: () => navigate(profilePath, { replace: true }),
          onError,
        })
      }
    />
  );
}

export default function TeacherEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: teacher, isLoading, error } = useTeacher(id);

  const breadcrumbs = [
    { label: 'Dashboard', to: PATHS.dashboard },
    { label: 'Teachers', to: PATHS.teachers },
    ...(teacher
      ? [
          { label: teacher.full_name, to: toPath(PATHS.teacherProfile, { id: teacher.id }) },
          { label: 'Edit' },
        ]
      : [{ label: 'Edit' }]),
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Edit teacher" breadcrumbs={breadcrumbs} />
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

  if (error || !teacher) {
    return (
      <>
        <PageHeader title="Edit teacher" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this teacher">
              {error?.message ?? 'The record no longer exists.'}
            </Alert>
            <Button variant="outline" className="mt-4" onClick={() => navigate(PATHS.teachers)}>
              Back to teachers
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit ${teacher.full_name}`}
        description={`Employee ID ${teacher.employee_id}`}
        breadcrumbs={breadcrumbs}
      />
      {/* Remount per record so `defaultValues` are applied. */}
      <EditForm key={teacher.id} teacher={teacher} />
    </>
  );
}
