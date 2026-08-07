import { CalendarDays, Download, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';

import { ScheduleCard } from '../components/ScheduleCard';
import { EXAM_PERMISSIONS, EXAM_STATUS_LABELS, EXAM_STATUS_TONES, EXAM_TYPE_LABELS } from '../constants';
import { useExam } from '../hooks/useExams';

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: exam, isLoading, error } = useExam(id);

  const breadcrumbs = [
    { label: 'Dashboard', to: PATHS.dashboard },
    { label: 'Examinations', to: PATHS.exams },
    { label: exam?.name ?? 'Exam' },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Exam" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody className="space-y-3">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-32 w-full" />
          </CardBody>
        </Card>
      </>
    );
  }

  if (error || !exam) {
    return (
      <>
        <PageHeader title="Exam" breadcrumbs={breadcrumbs} />
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

  const outstanding = exam.papers_count - exam.marks_entered_papers;

  return (
    <>
      <PageHeader
        title={exam.name}
        description={`${EXAM_TYPE_LABELS[exam.type]} · ${exam.academic_year_name}`}
        breadcrumbs={breadcrumbs}
        actions={
          <>
            <Can permissions={[EXAM_PERMISSIONS.read]}>
              <Button
                variant="outline"
                onClick={() => navigate(toPath(PATHS.examResults, { id: exam.id }))}
                leftIcon={<Download className="size-4" />}
              >
                Results
              </Button>
            </Can>
            <Can permissions={[EXAM_PERMISSIONS.update]}>
              <Button
                onClick={() => navigate(toPath(PATHS.examEdit, { id: exam.id }))}
                leftIcon={<Pencil className="size-4" />}
              >
                Edit
              </Button>
            </Can>
          </>
        }
      />

      <Card className="mb-6">
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={EXAM_STATUS_TONES[exam.status]}>{EXAM_STATUS_LABELS[exam.status]}</Badge>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <CalendarDays className="size-3" aria-hidden />
              {exam.start_date === exam.end_date
                ? formatDate(exam.start_date)
                : `${formatDate(exam.start_date)} – ${formatDate(exam.end_date)}`}
            </span>
            <span className="text-xs text-slate-500">
              {exam.papers_count} paper{exam.papers_count === 1 ? '' : 's'} ·{' '}
              {exam.classes_count} class{exam.classes_count === 1 ? '' : 'es'}
            </span>
          </div>

          {exam.description && (
            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-medium text-slate-500">Instructions</p>
              <p className="mt-1 text-sm whitespace-pre-wrap text-slate-800">{exam.description}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {exam.papers_count > 0 && outstanding > 0 && (
        <Alert tone="info" className="mb-4">
          Marks are still outstanding for {outstanding} paper{outstanding === 1 ? '' : 's'}.
          Results stay provisional until every paper is entered.
        </Alert>
      )}

      <ScheduleCard exam={exam} />
    </>
  );
}
