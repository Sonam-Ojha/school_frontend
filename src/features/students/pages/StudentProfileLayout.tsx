import {
  CalendarDays,
  FileText,
  HeartPulse,
  IdCard,
  Pencil,
  School,
  User,
  Users,
} from 'lucide-react';
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
import { ageFrom, formatDate } from '@/lib/format';

import { STATUS_LABELS, STATUS_TONES, STUDENT_PERMISSIONS } from '../constants';
import { useStudent } from '../hooks/useStudents';

import { StudentContext } from './studentContext';

function tabsFor(id: number | string): NavTabItem[] {
  return [
    { label: 'Overview', to: toPath(PATHS.studentOverview, { id }), icon: User },
    { label: 'Guardians', to: toPath(PATHS.studentGuardians, { id }), icon: Users },
    { label: 'Medical', to: toPath(PATHS.studentMedical, { id }), icon: HeartPulse },
    { label: 'Previous school', to: toPath(PATHS.studentPreviousSchool, { id }), icon: School },
    { label: 'Documents', to: toPath(PATHS.studentDocuments, { id }), icon: FileText },
  ];
}

export function StudentProfileLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: student, isLoading, error } = useStudent(id);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Student" />
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

  if (error || !student) {
    return (
      <>
        <PageHeader
          title="Student"
          breadcrumbs={[
            { label: 'Dashboard', to: PATHS.dashboard },
            { label: 'Students', to: PATHS.students },
          ]}
        />
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

  const age = ageFrom(student.date_of_birth);

  return (
    <StudentContext value={student}>
      <PageHeader
        title={student.full_name}
        breadcrumbs={[
          { label: 'Dashboard', to: PATHS.dashboard },
          { label: 'Students', to: PATHS.students },
          { label: student.full_name },
        ]}
        actions={
          <>
            <Can permissions={[STUDENT_PERMISSIONS.print]}>
              <Button
                variant="outline"
                onClick={() => navigate(toPath(PATHS.studentIdCard, { id: student.id }))}
                leftIcon={<IdCard className="size-4" />}
              >
                ID card
              </Button>
            </Can>
            <Can permissions={[STUDENT_PERMISSIONS.update]}>
              <Button
                onClick={() => navigate(toPath(PATHS.studentEdit, { id: student.id }))}
                leftIcon={<Pencil className="size-4" />}
              >
                Edit
              </Button>
            </Can>
          </>
        }
      />

      <Card className="mb-6">
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={student.full_name} src={student.photo_url} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-slate-900">{student.full_name}</p>
              <Badge tone={STATUS_TONES[student.status]}>{STATUS_LABELS[student.status]}</Badge>
            </div>

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>
                <code className="text-slate-600">{student.admission_no}</code>
              </span>
              <span>
                {student.class_name}
                {student.section_name ? ` — ${student.section_name}` : ''}
                {student.roll_no ? ` · Roll ${student.roll_no}` : ''}
              </span>
              {age !== null && <span>{age} years old</span>}
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3" aria-hidden />
                Admitted {formatDate(student.admission_date)}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      <NavTabs items={tabsFor(student.id)} className="mb-6" />

      <Outlet />
    </StudentContext>
  );
}
