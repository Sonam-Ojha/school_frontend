import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { MarksEntrySheet } from '../components/MarksEntrySheet';
import { EXAM_PERMISSIONS } from '../constants';
import { useExam, usePaperMarks, useSaveMarks } from '../hooks/useExams';

export default function MarksEntryPage() {
  const { id, paperId } = useParams<{ id: string; paperId: string }>();
  const navigate = useNavigate();

  const examId = Number(id);
  const paperIdNumber = Number(paperId);

  const { data: exam } = useExam(id);
  const { data, isLoading, error } = usePaperMarks(examId, paperIdNumber);
  const saveMarks = useSaveMarks(examId, paperIdNumber);

  const canEnter = useAuthStore((state) => state.hasPermission)(EXAM_PERMISSIONS.enterMarks);
  const detailPath = toPath(PATHS.examDetail, { id: examId });

  const breadcrumbs = [
    { label: 'Examinations', to: PATHS.exams },
    { label: exam?.name ?? 'Exam', to: detailPath },
    { label: 'Marks entry' },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Marks entry" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody className="space-y-3">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardBody>
        </Card>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <PageHeader title="Marks entry" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this paper">
              {error?.message ?? 'The paper no longer exists.'}
            </Alert>
            <Button variant="outline" className="mt-4" onClick={() => navigate(detailPath)}>
              Back to the timetable
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  const { paper } = data;

  return (
    <>
      <PageHeader
        title={`${paper.subject_name} — marks`}
        description={`${paper.class_name}${paper.section_name ? ` — ${paper.section_name}` : ''} · ${formatDate(paper.exam_date)} at ${paper.start_time}`}
        breadcrumbs={breadcrumbs}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate(detailPath)}
            leftIcon={<ArrowLeft className="size-4" />}
          >
            Back to timetable
          </Button>
        }
      />

      <MarksEntrySheet
        paper={paper}
        rows={data.data}
        summary={data.summary}
        isLoading={false}
        error={null}
        isSaving={saveMarks.isPending}
        canEnter={canEnter}
        onSave={(marks) => saveMarks.mutate(marks)}
      />
    </>
  );
}
