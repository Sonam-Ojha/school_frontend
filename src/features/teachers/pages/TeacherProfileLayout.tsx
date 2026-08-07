import { BookOpen, Briefcase, CalendarDays, FileText, GraduationCap, Pencil, User } from 'lucide-react';
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

import { EMPLOYMENT_TYPE_LABELS, STATUS_LABELS, STATUS_TONES, TEACHER_PERMISSIONS } from '../constants';
import { useTeacher } from '../hooks/useTeachers';

import { TeacherContext } from './teacherContext';

function tabsFor(id: number | string): NavTabItem[] {
  return [
    { label: 'Overview', to: toPath(PATHS.teacherOverview, { id }), icon: User },
    { label: 'Qualifications', to: toPath(PATHS.teacherQualifications, { id }), icon: GraduationCap },
    { label: 'Experience', to: toPath(PATHS.teacherExperience, { id }), icon: Briefcase },
    { label: 'Subjects & classes', to: toPath(PATHS.teacherAssignments, { id }), icon: BookOpen },
    { label: 'Documents', to: toPath(PATHS.teacherDocuments, { id }), icon: FileText },
  ];
}

export function TeacherProfileLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: teacher, isLoading, error } = useTeacher(id);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Teacher" />
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

  if (error || !teacher) {
    return (
      <>
        <PageHeader
          title="Teacher"
          breadcrumbs={[
            { label: 'Dashboard', to: PATHS.dashboard },
            { label: 'Teachers', to: PATHS.teachers },
          ]}
        />
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
    <TeacherContext value={teacher}>
      <PageHeader
        title={teacher.full_name}
        breadcrumbs={[
          { label: 'Dashboard', to: PATHS.dashboard },
          { label: 'Teachers', to: PATHS.teachers },
          { label: teacher.full_name },
        ]}
        actions={
          <Can permissions={[TEACHER_PERMISSIONS.update]}>
            <Button
              onClick={() => navigate(toPath(PATHS.teacherEdit, { id: teacher.id }))}
              leftIcon={<Pencil className="size-4" />}
            >
              Edit
            </Button>
          </Can>
        }
      />

      <Card className="mb-6">
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={teacher.full_name} src={teacher.photo_url} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-slate-900">{teacher.full_name}</p>
              <Badge tone={STATUS_TONES[teacher.status]}>{STATUS_LABELS[teacher.status]}</Badge>
              {teacher.class_teacher_of && (
                <Badge tone="info">Class teacher — {teacher.class_teacher_of}</Badge>
              )}
            </div>

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>
                <code className="text-slate-600">{teacher.employee_id}</code>
              </span>
              <span>
                {teacher.designation}
                {teacher.department ? ` · ${teacher.department}` : ''}
              </span>
              <span>{EMPLOYMENT_TYPE_LABELS[teacher.employment_type]}</span>
              <span>
                {teacher.experience_years > 0
                  ? `${teacher.experience_years} yr experience`
                  : 'No prior experience'}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3" aria-hidden />
                Joined {formatDate(teacher.joining_date)}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      <NavTabs items={tabsFor(teacher.id)} className="mb-6" />

      <Outlet />
    </TeacherContext>
  );
}
