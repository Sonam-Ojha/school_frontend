import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';

import { StaffForm } from '../components/StaffForm';
import { useCreateStaff } from '../hooks/useStaff';
import { emptyStaff } from '../utils/defaults';

export default function StaffCreatePage() {
  const navigate = useNavigate();
  const createStaff = useCreateStaff();

  return (
    <>
      <PageHeader
        title="Add staff member"
        description="Record a non-teaching staff member. Documents can be uploaded afterwards."
        breadcrumbs={[
          { label: 'Dashboard', to: PATHS.dashboard },
          { label: 'Staff', to: PATHS.staff },
          { label: 'Add staff' },
        ]}
      />

      <StaffForm
        defaultValues={emptyStaff()}
        isPending={createStaff.isPending}
        submitLabel="Add staff member"
        onCancel={() => navigate(PATHS.staff)}
        onSubmit={(values, { onError }) =>
          createStaff.mutate(values, {
            // Straight to Documents — the next step is uploading the
            // appointment letter and police verification.
            onSuccess: (member) =>
              navigate(toPath(PATHS.staffDocuments, { id: member.id }), { replace: true }),
            onError,
          })
        }
      />
    </>
  );
}
