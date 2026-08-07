import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { toDateInputValue } from '@/lib/format';

import { ExamForm } from '../components/ExamForm';
import { useCreateExam, useExam, useUpdateExam } from '../hooks/useExams';
import type { ExamInput } from '../schemas';
import type { ExamDetail } from '../types';

/** A blank exam running for a week from today — the commonest shape. */
function emptyExam(): ExamInput {
  const end = new Date();
  end.setDate(end.getDate() + 7);

  return {
    name: '',
    type: 'unit_test',
    academic_year_id: 0,
    start_date: toDateInputValue(new Date()),
    end_date: toDateInputValue(end),
    description: '',
  };
}

function toInput(exam: ExamDetail): ExamInput {
  return {
    name: exam.name,
    type: exam.type,
    academic_year_id: exam.academic_year_id,
    start_date: toDateInputValue(exam.start_date),
    end_date: toDateInputValue(exam.end_date),
    description: exam.description ?? '',
  };
}

export function ExamCreatePage() {
  const navigate = useNavigate();
  const createExam = useCreateExam();

  return (
    <>
      <PageHeader
        title="New exam"
        description="Name the exam and set its window, then schedule the papers."
        breadcrumbs={[
          { label: 'Dashboard', to: PATHS.dashboard },
          { label: 'Examinations', to: PATHS.exams },
          { label: 'New' },
        ]}
      />

      <ExamForm
        defaultValues={emptyExam()}
        isPending={createExam.isPending}
        submitLabel="Create exam"
        onCancel={() => navigate(PATHS.exams)}
        onSubmit={(values, { onError }) =>
          createExam.mutate(values, {
            // Straight to the detail page — the timetable comes next.
            onSuccess: (exam) =>
              navigate(toPath(PATHS.examDetail, { id: exam.id }), { replace: true }),
            onError,
          })
        }
      />
    </>
  );
}

export function ExamEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: exam, isLoading, error } = useExam(id);
  const updateExam = useUpdateExam(Number(id));

  const breadcrumbs = [
    { label: 'Dashboard', to: PATHS.dashboard },
    { label: 'Examinations', to: PATHS.exams },
    { label: exam?.name ?? 'Edit' },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Edit exam" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </CardBody>
        </Card>
      </>
    );
  }

  if (error || !exam) {
    return (
      <>
        <PageHeader title="Edit exam" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this exam">
              {error?.message ?? 'It no longer exists.'}
            </Alert>
            <Button variant="outline" className="mt-4" onClick={() => navigate(PATHS.exams)}>
              Back to examinations
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  const detailPath = toPath(PATHS.examDetail, { id: exam.id });

  return (
    <>
      <PageHeader
        title={`Edit ${exam.name}`}
        description={`${exam.papers_count} paper${exam.papers_count === 1 ? '' : 's'} scheduled`}
        breadcrumbs={breadcrumbs}
      />

      <ExamForm
        // Remount per record so `defaultValues` are applied.
        key={exam.id}
        defaultValues={toInput(exam)}
        isPending={updateExam.isPending}
        submitLabel="Save changes"
        requireDirty
        hasPapers={exam.papers_count > 0}
        onCancel={() => navigate(detailPath)}
        onSubmit={(values, { onError }) =>
          updateExam.mutate(values, {
            onSuccess: () => navigate(detailPath, { replace: true }),
            onError,
          })
        }
      />
    </>
  );
}
