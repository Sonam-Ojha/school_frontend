import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { toDateInputValue } from '@/lib/format';

import { HomeworkForm } from '../components/HomeworkForm';
import { useCreateHomework, useHomework, useUpdateHomework } from '../hooks/useHomework';
import type { HomeworkInput } from '../schemas';
import type { HomeworkDetail } from '../types';

/** Blank homework, due a week out — the commonest case, still editable. */
function emptyHomework(): HomeworkInput {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  return {
    title: '',
    description: '',
    class_id: 0,
    section_id: null,
    subject_id: 0,
    assigned_date: toDateInputValue(new Date()),
    due_date: toDateInputValue(dueDate),
    max_marks: 20,
  };
}

function toInput(homework: HomeworkDetail): HomeworkInput {
  return {
    title: homework.title,
    description: homework.description,
    class_id: homework.class_id,
    section_id: homework.section_id,
    subject_id: homework.subject_id,
    assigned_date: toDateInputValue(homework.assigned_date),
    due_date: toDateInputValue(homework.due_date),
    max_marks: homework.max_marks,
  };
}

export function HomeworkCreatePage() {
  const navigate = useNavigate();
  const createHomework = useCreateHomework();

  return (
    <>
      <PageHeader
        title="Set homework"
        description="Write the brief, then attach files and publish it."
        breadcrumbs={[
          { label: 'Dashboard', to: PATHS.dashboard },
          { label: 'Homework', to: PATHS.homework },
          { label: 'New' },
        ]}
      />

      <HomeworkForm
        defaultValues={emptyHomework()}
        isPending={createHomework.isPending}
        submitLabel="Save draft"
        onCancel={() => navigate(PATHS.homework)}
        onSubmit={(values, { onError }) =>
          createHomework.mutate(values, {
            // Straight to the detail page — attachments come next.
            onSuccess: (homework) =>
              navigate(toPath(PATHS.homeworkDetail, { id: homework.id }), { replace: true }),
            onError,
          })
        }
      />
    </>
  );
}

export function HomeworkEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: homework, isLoading, error } = useHomework(id);
  const updateHomework = useUpdateHomework(Number(id));

  const breadcrumbs = [
    { label: 'Dashboard', to: PATHS.dashboard },
    { label: 'Homework', to: PATHS.homework },
    { label: homework?.title ?? 'Edit' },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Edit homework" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody className="space-y-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </CardBody>
        </Card>
      </>
    );
  }

  if (error || !homework) {
    return (
      <>
        <PageHeader title="Edit homework" breadcrumbs={breadcrumbs} />
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

  const detailPath = toPath(PATHS.homeworkDetail, { id: homework.id });

  return (
    <>
      <PageHeader
        title={`Edit ${homework.title}`}
        description={`${homework.subject_name} · ${homework.class_name}`}
        breadcrumbs={breadcrumbs}
      />

      <HomeworkForm
        // Remount per record so `defaultValues` are applied.
        key={homework.id}
        defaultValues={toInput(homework)}
        isPending={updateHomework.isPending}
        submitLabel="Save changes"
        requireDirty
        isPublished={homework.status !== 'draft'}
        onCancel={() => navigate(detailPath)}
        onSubmit={(values, { onError }) =>
          updateHomework.mutate(values, {
            onSuccess: () => navigate(detailPath, { replace: true }),
            onError,
          })
        }
      />
    </>
  );
}
