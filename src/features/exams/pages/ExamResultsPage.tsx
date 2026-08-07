import { ArrowLeft, FileSpreadsheet, FileText, Printer, Send } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useClassOptions } from '@/features/academics/hooks/useAcademics';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { toneForGrade } from '@/lib/grading';
import { useAuthStore } from '@/store/authStore';
import { useQueryParams } from '@/hooks/useQueryParams';

import { ResultsTable } from '../components/ResultsTable';
import { EXAM_PERMISSIONS } from '../constants';
import {
  useDownloadReportCards,
  useExam,
  useExamClasses,
  useExportResults,
  usePublishResults,
  useResults,
} from '../hooks/useExams';

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn('mt-0.5 text-lg font-semibold', tone ?? 'text-slate-900')}>{value}</p>
    </div>
  );
}

export default function ExamResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { searchParams, patch } = useQueryParams();

  const examId = Number(id);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canPublish = hasPermission(EXAM_PERMISSIONS.publish);
  const canPrint = hasPermission(EXAM_PERMISSIONS.print);

  const { data: exam } = useExam(id);
  const { data: examClasses } = useExamClasses(examId);
  const { sectionOptions } = useClassOptions(
    searchParams.get('class_id') ? Number(searchParams.get('class_id')) : null,
  );

  const classId = Number(searchParams.get('class_id')) || 0;
  const sectionId = searchParams.get('section_id') ? Number(searchParams.get('section_id')) : null;

  const query = useMemo(() => ({ classId, sectionId }), [classId, sectionId]);
  const { data: results, isLoading, error } = useResults(examId, query, classId > 0);

  const publishResults = usePublishResults(examId);
  const exportResults = useExportResults(examId);
  const downloadCards = useDownloadReportCards(examId);
  const publishDialog = useDisclosure();

  const classOptions = (examClasses ?? []).map((entry) => ({
    label: entry.name,
    value: entry.id,
  }));


  const detailPath = toPath(PATHS.examDetail, { id: examId });
  const summary = results?.summary;

  return (
    <>
      <PageHeader
        title="Results"
        description={exam?.name}
        breadcrumbs={[
          { label: 'Examinations', to: PATHS.exams },
          { label: exam?.name ?? 'Exam', to: detailPath },
          { label: 'Results' },
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate(detailPath)}
            leftIcon={<ArrowLeft className="size-4" />}
          >
            Back
          </Button>
        }
      />

      <Card className="mb-4">
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label htmlFor="results-class" className="mb-1.5 block text-sm font-medium text-slate-700">
              Class
            </label>
            <Select
              id="results-class"
              value={classId || ''}
              options={classOptions}
              placeholder="Select a class"
              onChange={(event) =>
                patch({ class_id: event.target.value || undefined, section_id: undefined })
              }
              className="w-44"
            />
          </div>

          <div>
            <label
              htmlFor="results-section"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Section
            </label>
            <Select
              id="results-section"
              value={sectionId ?? ''}
              options={sectionOptions}
              placeholder={classId ? 'All sections' : 'Select a class first'}
              disabled={sectionOptions.length === 0}
              onChange={(event) => patch({ section_id: event.target.value || undefined })}
              className="w-40"
            />
          </div>

          {results && results.rows.length > 0 && (
            <div className="flex flex-wrap items-end gap-2 sm:ml-auto">
              <Can permissions={[EXAM_PERMISSIONS.export]}>
                <Button
                  variant="outline"
                  isLoading={exportResults.isPending}
                  onClick={() => exportResults.mutate({ query, format: 'excel' })}
                  leftIcon={<FileSpreadsheet className="size-4" />}
                >
                  Excel
                </Button>
              </Can>

              <Can permissions={[EXAM_PERMISSIONS.print]}>
                <Button
                  variant="outline"
                  isLoading={downloadCards.isPending}
                  onClick={() => downloadCards.mutate(query)}
                  leftIcon={<Printer className="size-4" />}
                >
                  All report cards
                </Button>
              </Can>

              {canPublish && !results.is_published && (
                <Button onClick={publishDialog.open} leftIcon={<Send className="size-4" />}>
                  Publish results
                </Button>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {classId === 0 ? (
        <Card>
          <CardBody>
            <Alert tone="info">
              Choose a class to see its results. Results are computed from the marks entered, so
              they change as more papers are marked.
            </Alert>
          </CardBody>
        </Card>
      ) : error ? (
        <Alert tone="danger" title="Could not load results">
          {error.message}
        </Alert>
      ) : isLoading ? (
        <Card>
          <CardBody className="space-y-2">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </CardBody>
        </Card>
      ) : results ? (
        <div className="space-y-4">
          {summary && (
            <Card>
              <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-6">
                <Stat label="Students" value={String(summary.students)} />
                <Stat label="Appeared" value={String(summary.appeared)} />
                <Stat label="Passed" value={String(summary.passed)} tone="text-emerald-700" />
                <Stat
                  label="Failed"
                  value={String(summary.failed)}
                  tone={summary.failed > 0 ? 'text-red-700' : undefined}
                />
                <Stat label="Pass rate" value={`${summary.pass_percent}%`} />
                <Stat
                  label="Class average"
                  value={summary.class_average === null ? '—' : `${summary.class_average}%`}
                />
              </CardBody>
            </Card>
          )}

          {!results.is_published && (
            <Alert tone="warning" title="Provisional">
              These results have not been published. Ranks are not assigned and students cannot
              see their report cards yet.
            </Alert>
          )}

          <Card>
            <CardHeader
              title={`${results.class_name}${results.section_name ? ` — ${results.section_name}` : ''}`}
              description={
                results.is_published ? 'Published — visible to students and guardians.' : undefined
              }
              actions={
                summary && summary.distribution.some((band) => band.count > 0) ? (
                  <div className="hidden flex-wrap items-center gap-2 lg:flex">
                    {summary.distribution
                      .filter((band) => band.count > 0)
                      .map((band) => (
                        <Badge key={band.grade} tone={toneForGrade(band.grade)}>
                          {band.grade} · {band.count}
                        </Badge>
                      ))}
                  </div>
                ) : null
              }
            />

            <CardBody className="p-0">
              <ResultsTable
                results={results}
                canPrint={canPrint}
                onOpenReportCard={(row) =>
                  navigate(toPath(PATHS.examReportCard, { id: examId, studentId: row.student_id }))
                }
              />
            </CardBody>
          </Card>
        </div>
      ) : (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FileText className="size-6" />}
              title="No results"
              description="No marks have been entered for this class yet."
            />
          </CardBody>
        </Card>
      )}

      <ConfirmDialog
        isOpen={publishDialog.isOpen}
        onClose={publishDialog.close}
        onConfirm={() =>
          publishResults.mutate(
            { class_id: classId, section_id: sectionId, remarks: '' },
            { onSuccess: () => publishDialog.close() },
          )
        }
        isLoading={publishResults.isPending}
        title="Publish these results?"
        confirmLabel="Publish results"
        message={
          <>
            Report cards become visible to students and guardians, and ranks are assigned and
            frozen.
            {exam && exam.marks_entered_papers < exam.papers_count && (
              <>
                <br />
                <br />
                <strong>
                  {exam.papers_count - exam.marks_entered_papers} paper
                  {exam.papers_count - exam.marks_entered_papers === 1 ? '' : 's'}
                </strong>{' '}
                still have marks outstanding. Those subjects will show as unmarked on every
                report card.
              </>
            )}
          </>
        }
      />
    </>
  );
}
