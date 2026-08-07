import { CalendarDays, ListChecks, Lock, Pencil, Send, TriangleAlert } from 'lucide-react';
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

import { AssignmentAttachmentsCard } from '../components/AssignmentAttachmentsCard';
import { MarksCard } from '../components/MarksCard';
import { SubmissionsCard } from '../components/SubmissionsCard';
import {
  ASSIGNMENT_PERMISSIONS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_TONES,
  ASSIGNMENT_TYPE_LABELS,
} from '../constants';
import {
  useAssignment,
  useCloseAssignment,
  usePublishAssignment,
} from '../hooks/useAssignments';

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: assignment, isLoading, error } = useAssignment(id);
  const publishAssignment = usePublishAssignment(Number(id));
  const closeAssignment = useCloseAssignment(Number(id));
  const closeDialog = useDisclosure();

  const canUpdate = useAuthStore((state) => state.hasPermission)(ASSIGNMENT_PERMISSIONS.update);

  const breadcrumbs = [
    { label: 'Dashboard', to: PATHS.dashboard },
    { label: 'Assignments', to: PATHS.assignments },
    { label: assignment?.title ?? 'Assignment' },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Assignment" breadcrumbs={breadcrumbs} />
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

  if (error || !assignment) {
    return (
      <>
        <PageHeader title="Assignment" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this assignment">
              {error?.message ?? 'It no longer exists.'}
            </Alert>
            <Button variant="outline" className="mt-4" onClick={() => navigate(PATHS.assignments)}>
              Back to assignments
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  const isDraft = assignment.status === 'draft';
  const isPublished = assignment.status === 'published';
  const outstanding = assignment.students_count - assignment.submitted_count;

  return (
    <>
      <PageHeader
        title={assignment.title}
        description={`${assignment.subject_name} · ${assignment.class_name}${assignment.section_name ? ` — ${assignment.section_name}` : ''}`}
        breadcrumbs={breadcrumbs}
        actions={
          <Can permissions={[ASSIGNMENT_PERMISSIONS.update]}>
            <Button
              variant="outline"
              onClick={() => navigate(toPath(PATHS.assignmentEdit, { id: assignment.id }))}
              leftIcon={<Pencil className="size-4" />}
            >
              Edit
            </Button>

            {isDraft && (
              <Button
                isLoading={publishAssignment.isPending}
                onClick={() => publishAssignment.mutate()}
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
          Students cannot see it yet. Settle the marking scheme and attach any files first —
          publishing raises a submission row for every student in scope.
        </Alert>
      )}

      {assignment.is_overdue && (
        <Alert tone="warning" className="mb-4" title="Past its due date">
          {outstanding} student{outstanding === 1 ? ' has' : 's have'} still not handed in.{' '}
          {assignment.allows_late_submission
            ? `Late work is still accepted${assignment.late_penalty_percent > 0 ? `, at ${assignment.late_penalty_percent}% off per day` : ''}, until you close it.`
            : 'Late work is not accepted for this assignment.'}
        </Alert>
      )}

      <Card className="mb-6">
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={ASSIGNMENT_STATUS_TONES[assignment.status]}>
              {ASSIGNMENT_STATUS_LABELS[assignment.status]}
            </Badge>
            <Badge tone="neutral">{ASSIGNMENT_TYPE_LABELS[assignment.type]}</Badge>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <CalendarDays className="size-3" aria-hidden />
              Set {formatDate(assignment.assigned_date)} · due {formatDate(assignment.due_date)}
            </span>
            <span className="text-xs text-slate-500">
              Out of {assignment.max_marks} · {assignment.weightage_percent}% weight
            </span>
            <span className="text-xs text-slate-500">Set by {assignment.teacher_name}</span>
            {assignment.is_overdue && (
              <span className="flex items-center gap-1 text-xs text-amber-700">
                <TriangleAlert className="size-3" aria-hidden />
                Overdue
              </span>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs font-medium text-slate-500">What to produce</p>
            {/* The brief is plain text, so newlines have to be preserved. */}
            <p className="mt-1 text-sm whitespace-pre-wrap text-slate-800">
              {assignment.instructions}
            </p>
          </div>

          {assignment.rubric.length > 0 && (
            <div className="border-t border-slate-200 pt-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <ListChecks className="size-3.5" aria-hidden />
                Marking scheme
              </p>

              <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
                {assignment.rubric.map((criterion) => (
                  <li
                    key={criterion.id}
                    className="flex items-start justify-between gap-4 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{criterion.name}</p>
                      {criterion.description && (
                        <p className="text-xs text-slate-500">{criterion.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm text-slate-700">{criterion.max_marks}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="space-y-6">
        <AssignmentAttachmentsCard
          assignmentId={assignment.id}
          attachments={assignment.attachments}
          // A closed assignment is a record — its files should not change under it.
          canEdit={canUpdate && assignment.status !== 'closed'}
        />

        <MarksCard assignment={assignment} />

        <SubmissionsCard assignment={assignment} />
      </div>

      <ConfirmDialog
        isOpen={closeDialog.isOpen}
        onClose={closeDialog.close}
        onConfirm={() => closeAssignment.mutate(undefined, { onSuccess: closeDialog.close })}
        isLoading={closeAssignment.isPending}
        title="Close this assignment?"
        confirmLabel="Close assignment"
        message={
          <>
            No further submissions will be accepted.{' '}
            {outstanding > 0 && (
              <>
                <strong>{outstanding}</strong> student{outstanding === 1 ? '' : 's'} have not handed
                in and will stay that way.{' '}
              </>
            )}
            Everything already submitted stays readable and can still be evaluated.
          </>
        }
      />
    </>
  );
}
