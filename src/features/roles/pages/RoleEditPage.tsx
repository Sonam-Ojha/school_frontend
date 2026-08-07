import { ShieldAlert } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { roleLabel } from '@/types/auth';

import { RoleForm } from '../components/RoleForm';
import { isSuperAdminRole } from '../constants';
import { useUpdateRole } from '../hooks/useRoleMutations';
import { useRole } from '../hooks/useRoles';

export default function RoleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: role, isLoading, error } = useRole(id);
  const updateRole = useUpdateRole(id ?? '');

  const breadcrumbs = [
    { label: 'Dashboard', to: PATHS.dashboard },
    { label: 'Roles', to: PATHS.roles },
    { label: role ? roleLabel(role.name) : 'Edit role' },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Edit role" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </CardBody>
        </Card>
      </>
    );
  }

  if (error || !role) {
    return (
      <>
        <PageHeader title="Edit role" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this role">
              {error?.message ?? 'The role no longer exists.'}
            </Alert>
            <Button variant="outline" className="mt-4" onClick={() => navigate(PATHS.roles)}>
              Back to roles
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  // super-admin bypasses every check through Spatie's Gate::before, so its
  // permission rows would be decorative. Say so rather than render a lie.
  if (isSuperAdminRole(role.name)) {
    return (
      <>
        <PageHeader title={roleLabel(role.name)} breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody>
            <EmptyState
              icon={<ShieldAlert className="size-6" />}
              title="Super Admin is not editable"
              description="This role is granted every permission automatically and always will be. Editing its permission list would have no effect."
              action={
                <Button variant="outline" onClick={() => navigate(PATHS.roles)}>
                  Back to roles
                </Button>
              }
            />
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={roleLabel(role.name)}
        description={`${role.users_count} user${role.users_count === 1 ? '' : 's'} hold this role. Changes take effect immediately.`}
        breadcrumbs={breadcrumbs}
      />

      <RoleForm
        // Remount when the record arrives so `defaultValues` are applied.
        key={role.id}
        defaultValues={{ name: role.name, permissions: role.permissions }}
        isSystemRole={role.is_system}
        isPending={updateRole.isPending}
        submitLabel="Save changes"
        onCancel={() => navigate(PATHS.roles)}
        onSubmit={(values, { onError }) =>
          updateRole.mutate(values, {
            onSuccess: () => navigate(PATHS.roles, { replace: true }),
            onError,
          })
        }
      />
    </>
  );
}
