import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

import { StaffForm } from '../components/StaffForm';
import { useStaffMember, useUpdateStaff } from '../hooks/useStaff';
import { staffToInput } from '../utils/defaults';
import type { StaffMemberDetail } from '../types';

function EditForm({ member }: { member: StaffMemberDetail }) {
  const navigate = useNavigate();
  const updateStaff = useUpdateStaff(member.id);
  const profilePath = toPath(PATHS.staffProfile, { id: member.id });

  return (
    <StaffForm
      defaultValues={staffToInput(member)}
      isPending={updateStaff.isPending}
      submitLabel="Save changes"
      requireDirty
      onCancel={() => navigate(profilePath)}
      onSubmit={(values, { onError }) =>
        updateStaff.mutate(values, {
          onSuccess: () => navigate(profilePath, { replace: true }),
          onError,
        })
      }
    />
  );
}

export default function StaffEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: member, isLoading, error } = useStaffMember(id);

  const breadcrumbs = [
    { label: 'Dashboard', to: PATHS.dashboard },
    { label: 'Staff', to: PATHS.staff },
    ...(member
      ? [
          { label: member.full_name, to: toPath(PATHS.staffProfile, { id: member.id }) },
          { label: 'Edit' },
        ]
      : [{ label: 'Edit' }]),
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Edit staff member" breadcrumbs={breadcrumbs} />
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

  if (error || !member) {
    return (
      <>
        <PageHeader title="Edit staff member" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this staff member">
              {error?.message ?? 'The record no longer exists.'}
            </Alert>
            <Button variant="outline" className="mt-4" onClick={() => navigate(PATHS.staff)}>
              Back to staff
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Edit ${member.full_name}`}
        description={`Employee ID ${member.employee_id}`}
        breadcrumbs={breadcrumbs}
      />
      {/* Remount per record so `defaultValues` are applied. */}
      <EditForm key={member.id} member={member} />
    </>
  );
}
