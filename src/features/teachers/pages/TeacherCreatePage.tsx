import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';

import { TeacherForm } from '../components/TeacherForm';
import { useCreateTeacher } from '../hooks/useTeachers';
import { emptyTeacher } from '../utils/defaults';

export default function TeacherCreatePage() {
  const navigate = useNavigate();
  const createTeacher = useCreateTeacher();

  return (
    <>
      <PageHeader
        title="Add teacher"
        description="Record a new teacher. Experience and class assignments can be added later."
        breadcrumbs={[
          { label: 'Dashboard', to: PATHS.dashboard },
          { label: 'Teachers', to: PATHS.teachers },
          { label: 'Add teacher' },
        ]}
      />

      <TeacherForm
        defaultValues={emptyTeacher()}
        isPending={createTeacher.isPending}
        submitLabel="Add teacher"
        onCancel={() => navigate(PATHS.teachers)}
        onSubmit={(values, { onError }) =>
          createTeacher.mutate(values, {
            // Straight to Documents — the next thing staff do is upload the
            // degree certificate and police verification.
            onSuccess: (teacher) =>
              navigate(toPath(PATHS.teacherDocuments, { id: teacher.id }), { replace: true }),
            onError,
          })
        }
      />
    </>
  );
}
