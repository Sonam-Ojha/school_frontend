import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';

import { AdmissionWizard } from '../components/admission/AdmissionWizard';
import { useCreateStudent } from '../hooks/useStudentMutations';

export default function StudentAdmissionPage() {
  const navigate = useNavigate();
  const createStudent = useCreateStudent();

  return (
    <>
      <PageHeader
        title="New admission"
        description="Record a new student. Medical and previous-school details can be added later."
        breadcrumbs={[
          { label: 'Dashboard', to: PATHS.dashboard },
          { label: 'Students', to: PATHS.students },
          { label: 'New admission' },
        ]}
      />

      <AdmissionWizard
        isPending={createStudent.isPending}
        onCancel={() => navigate(PATHS.students)}
        onSubmit={(values, { onError }) =>
          createStudent.mutate(values, {
            // Straight to the new profile — the next thing staff do is upload
            // the birth certificate and transfer certificate.
            onSuccess: (student) =>
              navigate(toPath(PATHS.studentDocuments, { id: student.id }), { replace: true }),
            onError,
          })
        }
      />
    </>
  );
}
