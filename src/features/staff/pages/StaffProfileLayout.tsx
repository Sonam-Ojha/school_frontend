import { CalendarDays, FileText, Pencil, User } from 'lucide-react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';

import { isLicenceExpiringSoon } from '../components/staffColumns';
import {
  EMPLOYMENT_TYPE_LABELS,
  SHIFT_LABELS,
  STAFF_PERMISSIONS,
  STAFF_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
} from '../constants';
import { useStaffMember } from '../hooks/useStaff';

import { StaffContext } from './staffContext';

function tabsFor(id: number | string): NavTabItem[] {
  return [
    { label: 'Overview', to: toPath(PATHS.staffOverview, { id }), icon: User },
    { label: 'Documents', to: toPath(PATHS.staffDocuments, { id }), icon: FileText },
  ];
}

export function StaffProfileLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: member, isLoading, error } = useStaffMember(id);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Staff member" />
        <Card>
          <CardBody className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
          </CardBody>
        </Card>
      </>
    );
  }

  if (error || !member) {
    return (
      <>
        <PageHeader
          title="Staff member"
          breadcrumbs={[
            { label: 'Dashboard', to: PATHS.dashboard },
            { label: 'Staff', to: PATHS.staff },
          ]}
        />
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

  const licenceExpiring = isLicenceExpiringSoon(member.licence_expiry);

  return (
    <StaffContext value={member}>
      <PageHeader
        title={member.full_name}
        breadcrumbs={[
          { label: 'Dashboard', to: PATHS.dashboard },
          { label: 'Staff', to: PATHS.staff },
          { label: member.full_name },
        ]}
        actions={
          <Can permissions={[STAFF_PERMISSIONS.update]}>
            <Button
              onClick={() => navigate(toPath(PATHS.staffEdit, { id: member.id }))}
              leftIcon={<Pencil className="size-4" />}
            >
              Edit
            </Button>
          </Can>
        }
      />

      {/* Surfaced on every tab — a lapsed licence grounds a driver. */}
      {licenceExpiring && (
        <Alert tone="warning" title="Driving licence expiring" className="mb-4">
          Licence {member.licence_number} is valid only until{' '}
          {formatDate(member.licence_expiry)}. Renew it before assigning further duties.
        </Alert>
      )}

      <Card className="mb-6">
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={member.full_name} src={member.photo_url} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-slate-900">{member.full_name}</p>
              <Badge tone={STATUS_TONES[member.status]}>{STATUS_LABELS[member.status]}</Badge>
              <Badge tone="info">{STAFF_TYPE_LABELS[member.staff_type]}</Badge>
            </div>

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>
                <code className="text-slate-600">{member.employee_id}</code>
              </span>
              <span>{member.designation}</span>
              <span>{EMPLOYMENT_TYPE_LABELS[member.employment_type]}</span>
              <span>{SHIFT_LABELS[member.shift]} shift</span>
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3" aria-hidden />
                Joined {formatDate(member.joining_date)}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      <NavTabs items={tabsFor(member.id)} className="mb-6" />

      <Outlet />
    </StaffContext>
  );
}
