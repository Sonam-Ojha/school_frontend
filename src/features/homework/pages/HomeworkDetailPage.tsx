import { CalendarDays, Lock, Pencil, Send, TriangleAlert } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatDate } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { AttachmentsCard } from '../components/AttachmentsCard';
import { SubmissionsCard } from '../components/SubmissionsCard';
import { HOMEWORK_PERMISSIONS, HOMEWORK_STATUS_LABELS, HOMEWORK_STATUS_TONES } from '../constants';
import { useCloseHomework, useHomework, usePublishHomework } from '../hooks/useHomework';

export default function HomeworkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: homework, isLoading, error } = useHomework(id);
  const publishHomework = usePublishHomework(Number(id));
  const closeHomework = useCloseHomework(Number(id));
  const closeDialog = useDisclosure();

  const canUpdate = useAuthStore((state) => state.hasPermission)(HOMEWORK_PERMISSIONS.update);

  const breadcrumbs = [
    { label: 'Dashboard', to: PATHS.dashboard },
    { label: 'Homework', to: PATHS.homework },
    { label: homework?.title ?? 'Homework' },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Homework" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody className="space-y-3">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-24 w-full" />
          </CardBody>
        </Card>
      </>
    );
  }

  if (error || !homework) {
    return (
      <>
        <PageHeader title="Homework" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this homework">
              {error?.message ?? 'It no longer exists.'}
            </Alert>
            <Button variant="outline" className="mt-4" onClick={() => navigate(PATHS.homework)}>
              Back to homework
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  const isDraft = homework.status === 'draft';
  const isPublished = homework.status === 'published';

  return (
    <>
      <PageHeader
        title={homework.title}
        description={`${homework.subject_name} · ${homework.class_name}${homework.section_name ? ` — ${homework.section_name}` : ''}`}
        breadcrumbs={breadcrumbs}
        actions={
          <Can permissions={[HOMEWORK_PERMISSIONS.update]}>
            <Button
              variant="outline"
              onClick={() => navigate(toPath(PATHS.homeworkEdit, { id: homework.id }))}
              leftIcon={<Pencil className="size-4" />}
            >
              Edit
            </Button>

            {isDraft && (
              <Button
                isLoading={publishHomework.isPending}
                onClick={() => publishHomework.mutate()}
                leftIcon={<Send className="size-4" />}
              >
                Publish
              </Button>
            )}

            {isPublished && (
              <Button
                variant="outline"
                onClick={closeDialog.open}
                leftIcon={<Lock className="size-4" />}
              >
                Close
              </Button>
            )}
          </Can>
        }
      />

      {isDraft && (
        <Alert tone="info" className="mb-4" title="This is a draft">
          Students cannot see it yet. Attach any files first — publishing raises a submission row
          for every student in scope.
        </Alert>
      )}

      {homework.is_overdue && (
        <Alert tone="warning" className="mb-4" title="Past its due date">
          {homework.students_count - homework.submitted_count} student
          {homework.students_count - homework.submitted_count === 1 ? ' has' : 's have'} still not
          handed in. Late submissions are still accepted until you close it.
        </Alert>
      )}

      <Card className="mb-6">
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={HOMEWORK_STATUS_TONES[homework.status]}>
              {HOMEWORK_STATUS_LABELS[homework.status]}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <CalendarDays className="size-3" aria-hidden />
              Set {formatDate(homework.assigned_date)} · due {formatDate(homework.due_date)}
            </span>
            <span className="text-xs text-slate-500">Out of {homework.max_marks}</span>
            <span className="text-xs text-slate-500">Set by {homework.teacher_name}</span>
            {homework.is_overdue && (
              <span className="flex items-center gap-1 text-xs text-amber-700">
                <TriangleAlert className="size-3" aria-hidden />
                Overdue
              </span>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs font-medium text-slate-500">What to do</p>
            {/* The brief is plain text, so newlines have to be preserved. */}
            <p className="mt-1 text-sm whitespace-pre-wrap text-slate-800">
              {homework.description}
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-6">
        <AttachmentsCard
          homeworkId={homework.id}
          attachments={homework.attachments}
          // Closed homework is a record — its files should not change under it.
          canEdit={canUpdate && homework.status !== 'closed'}
        />

        <SubmissionsCard homework={homework} />
      </div>

      <ConfirmDialog
        isOpen={closeDialog.isOpen}
        onClose={closeDialog.close}
        onConfirm={() => closeHomework.mutate(undefined, { onSuccess: () => closeDialog.close() })}
        isLoading={closeHomework.isPending}
        title="Close this homework?"
        confirmLabel="Close homework"
        message={
          <>
            No further submissions will be accepted.{' '}
            {homework.students_count - homework.submitted_count > 0 && (
              <>
                <strong>{homework.students_count - homework.submitted_count}</strong> student
                {homework.students_count - homework.submitted_count === 1 ? '' : 's'} have not
                handed in and will stay that way.{' '}
              </>
            )}
            Everything already submitted stays readable and gradable.
          </>
        }
      />
    </>
  );
}
