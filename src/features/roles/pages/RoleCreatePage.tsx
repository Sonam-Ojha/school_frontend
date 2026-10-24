import { useNavigate } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';

import { RoleForm } from '../components/RoleForm';
import { useCreateRole } from '../hooks/useRoleMutations';

export default function RoleCreatePage() {
  const navigate = useNavigate();
  const createRole = useCreateRole();

  return (
    <>
      <PageHeader
        title="New role"
        description="Name the role, then grant it the permissions it needs."
        breadcrumbs={[
          { label: 'Dashboard', to: PATHS.dashboard },
          { label: 'Roles', to: PATHS.roles },
          { label: 'New role' },
        ]}
      />

      <RoleForm
        defaultValues={{ name: '', permissions: [], hidden_fields: [] }}
        isPending={createRole.isPending}
        submitLabel="Create role"
        onCancel={() => navigate(PATHS.roles)}
        onSubmit={(values, { onError }) =>
          createRole.mutate(values, {
            onSuccess: () => navigate(PATHS.roles, { replace: true }),
            onError,
          })
        }
      />
    </>
  );
}
