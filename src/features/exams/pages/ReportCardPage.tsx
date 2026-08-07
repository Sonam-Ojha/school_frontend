import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { toast } from '@/store/toastStore';

import { ReportCardSheet } from '../components/ReportCardSheet';
import { EXAM_PERMISSIONS } from '../constants';
import { useReportCard } from '../hooks/useExams';
import { examService } from '../services/examService';

export default function ReportCardPage() {
  const { id, studentId } = useParams<{ id: string; studentId: string }>();
  const navigate = useNavigate();

  const examId = Number(id);
  const { data: card, isLoading, error } = useReportCard(examId, Number(studentId));
  const { data: school } = useSettings();
  const [isDownloading, setIsDownloading] = useState(false);

  const resultsPath = toPath(PATHS.examResults, { id: examId });

  const download = async () => {
    if (!card) return;
    setIsDownloading(true);
    try {
      await examService.downloadReportCard(examId, card);
    } catch (downloadError) {
      toast.error(
        'Could not download the report card',
        downloadError instanceof Error ? downloadError.message : 'Please try again.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Report card" />
        <Skeleton className="h-[60vh] w-full max-w-3xl" />
      </>
    );
  }

  if (error || !card) {
    return (
      <>
        <PageHeader title="Report card" />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this report card">
              {error?.message ?? 'It no longer exists.'}
            </Alert>
            <Button variant="outline" className="mt-4" onClick={() => navigate(resultsPath)}>
              Back to results
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* The whole header is hidden when printing. */}
      <div className="print-hidden">
        <PageHeader
          title={`Report card — ${card.result.student_name}`}
          description={`${card.exam.name} · ${card.result.class_name}`}
          breadcrumbs={[
            { label: 'Examinations', to: PATHS.exams },
            { label: card.exam.name, to: toPath(PATHS.examDetail, { id: examId }) },
            { label: 'Report card' },
          ]}
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => navigate(resultsPath)}
                leftIcon={<ArrowLeft className="size-4" />}
              >
                Back
              </Button>
              <Can permissions={[EXAM_PERMISSIONS.print]}>
                <Button
                  variant="outline"
                  isLoading={isDownloading}
                  onClick={download}
                  leftIcon={<Download className="size-4" />}
                >
                  Download PDF
                </Button>
                <Button onClick={() => window.print()} leftIcon={<Printer className="size-4" />}>
                  Print
                </Button>
              </Can>
            </>
          }
        />

        {card.published_at === null && (
          <Alert tone="warning" className="mb-4" title="Provisional report card">
            These results have not been published. Ranks are not assigned, and the student cannot
            see this card yet.
          </Alert>
        )}
      </div>

      <Card>
        <CardBody>
          {/* The print rules isolate this subtree; everything else is hidden. */}
          <div className="print-target">
            <ReportCardSheet card={card} school={school} />
          </div>
        </CardBody>
      </Card>
    </>
  );
}
