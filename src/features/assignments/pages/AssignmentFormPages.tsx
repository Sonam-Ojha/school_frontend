import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { toDateInputValue } from '@/lib/format';

import { AssignmentForm } from '../components/AssignmentForm';
import {
  useAssignment,
  useCreateAssignment,
  useUpdateAssignment,
} from '../hooks/useAssignments';
import type { AssignmentInput } from '../schemas';
import type { AssignmentDetail } from '../types';

/** Blank assignment, due a fortnight out — coursework is not overnight work. */
function emptyAssignment(): AssignmentInput {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  return {
    title: '',
    instructions: '',
    type: 'project',
    class_id: 0,
    section_id: null,
    subject_id: 0,
    assigned_date: toDateInputValue(new Date()),
    due_date: toDateInputValue(dueDate),
    max_marks: 50,
    weightage_percent: 10,
    allows_late_submission: true,
    late_penalty_percent: 10,
    rubric: [],
  };
}

function toInput(assignment: AssignmentDetail): AssignmentInput {
  return {
    title: assignment.title,
    instructions: assignment.instructions,
    type: assignment.type,
    class_id: assignment.class_id,
    section_id: assignment.section_id,
    subject_id: assignment.subject_id,
    assigned_date: toDateInputValue(assignment.assigned_date),
    due_date: toDateInputValue(assignment.due_date),
    max_marks: assignment.max_marks,
    weightage_percent: assignment.weightage_percent,
    allows_late_submission: assignment.allows_late_submission,
    late_penalty_percent: assignment.late_penalty_percent,
    rubric: assignment.rubric.map((criterion) => ({
      id: criterion.id,
      name: criterion.name,
      description: criterion.description ?? '',
      max_marks: criterion.max_marks,
    })),
  };
}

export function AssignmentCreatePage() {
  const navigate = useNavigate();
  const createAssignment = useCreateAssignment();

  return (
    <>
      <PageHeader
        title="Set assignment"
        description="Write the brief and the marking scheme, then attach files and publish it."
        breadcrumbs={[
          { label: 'Dashboard', to: PATHS.dashboard },
          { label: 'Assignments', to: PATHS.assignments },
          { label: 'New' },
        ]}
      />

      <AssignmentForm
        defaultValues={emptyAssignment()}
        isPending={createAssignment.isPending}
        submitLabel="Save draft"
        onCancel={() => navigate(PATHS.assignments)}
        onSubmit={(values, { onError }) =>
          createAssignment.mutate(values, {
            // Straight to the detail page — attachments come next.
            onSuccess: (assignment) =>
              navigate(toPath(PATHS.assignmentDetail, { id: assignment.id }), { replace: true }),
            onError,
          })
        }
      />
    </>
  );
}

export function AssignmentEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: assignment, isLoading, error } = useAssignment(id);
  const updateAssignment = useUpdateAssignment(Number(id));

  const breadcrumbs = [
    { label: 'Dashboard', to: PATHS.dashboard },
    { label: 'Assignments', to: PATHS.assignments },
    { label: assignment?.title ?? 'Edit' },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Edit assignment" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody className="space-y-4">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </CardBody>
        </Card>
      </>
    );
  }

  if (error || !assignment) {
    return (
      <>
        <PageHeader title="Edit assignment" breadcrumbs={breadcrumbs} />
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

  const detailPath = toPath(PATHS.assignmentDetail, { id: assignment.id });

  return (
    <>
      <PageHeader
        title={`Edit ${assignment.title}`}
        description={`${assignment.subject_name} · ${assignment.class_name}`}
        breadcrumbs={breadcrumbs}
      />

      <AssignmentForm
        // Remount per record so `defaultValues` are applied.
        key={assignment.id}
        defaultValues={toInput(assignment)}
        isPending={updateAssignment.isPending}
        submitLabel="Save changes"
        requireDirty
        isPublished={assignment.status !== 'draft'}
        marksPublished={assignment.marks_published_at !== null}
        onCancel={() => navigate(detailPath)}
        onSubmit={(values, { onError }) =>
          updateAssignment.mutate(values, {
            onSuccess: () => navigate(detailPath, { replace: true }),
            onError,
          })
        }
      />
    </>
  );
}
