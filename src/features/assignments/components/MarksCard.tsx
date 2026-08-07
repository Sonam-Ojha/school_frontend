import { BarChart3, Download, Send } from 'lucide-react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';

import { ASSIGNMENT_PERMISSIONS, GRADE_BANDS, PASS_PERCENT, toneForGrade } from '../constants';
import {
  useAssignmentSubmissions,
  useExportMarks,
  usePublishMarks,
} from '../hooks/useAssignments';
import type { AssignmentDetail, MarksSummary } from '../types';

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn('mt-0.5 text-lg font-semibold', tone ?? 'text-slate-900')}>{value}</p>
    </div>
  );
}

/**
 * Grade spread as a bar per band.
 *
 * Bars are scaled against the largest band rather than the class size — with
 * thirty students and a top band of four, scaling to thirty would render every
 * bar as a sliver and show nothing.
 */
function Distribution({ summary }: { summary: MarksSummary }) {
  const peak = Math.max(1, ...summary.distribution.map((band) => band.count));

  return (
    <ul className="space-y-1.5">
      {summary.distribution.map((band) => (
        <li key={band.grade} className="flex items-center gap-3">
          <span className="w-8 shrink-0 text-xs font-medium text-slate-600">{band.grade}</span>

          <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <span
              className={cn(
                'block h-full rounded-full',
                band.grade === 'F' ? 'bg-red-400' : 'bg-brand-500',
              )}
              style={{ width: `${(band.count / peak) * 100}%` }}
            />
          </span>

          <span className="w-6 shrink-0 text-right text-xs text-slate-500">{band.count}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * What the class scored, and the act of releasing it.
 *
 * Marks stay the teacher's working note until they are published: releasing
 * them one evaluation at a time would let a class compare partial results and
 * read an unfinished pass as a final one.
 */
export function MarksCard({ assignment }: { assignment: AssignmentDetail }) {
  const { data, isLoading, error } = useAssignmentSubmissions(assignment.id);
  const publishMarks = usePublishMarks(assignment.id);
  const exportMarks = useExportMarks(assignment.id);
  const publishDialog = useDisclosure();

  const summary = data?.summary;

  if (assignment.status === 'draft') return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Marks" />
        <CardBody className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardBody>
      </Card>
    );
  }

  if (error || !summary) {
    return (
      <Card>
        <CardHeader title="Marks" />
        <CardBody>
          <Alert tone="danger" title="Could not load the marks">
            {error?.message ?? 'Nothing has been evaluated yet.'}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  const outstanding = summary.submitted + summary.under_review + summary.returned;
  const nothingEvaluated = summary.evaluated === 0;

  return (
    <>
      <Card>
        <CardHeader
          title="Marks"
          description={
            summary.marks_published
              ? `Published ${formatDateTime(summary.published_at)} — students can see these.`
              : 'Visible only to staff until you publish them.'
          }
          actions={
            <div className="flex items-center gap-2">
              <Can permissions={[ASSIGNMENT_PERMISSIONS.export]}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={nothingEvaluated}
                  isLoading={exportMarks.isPending}
                  onClick={() => exportMarks.mutate(assignment.title)}
                  leftIcon={<Download className="size-4" />}
                >
                  Export
                </Button>
              </Can>

              <Can permissions={[ASSIGNMENT_PERMISSIONS.publishMarks]}>
                {!summary.marks_published && (
                  <Button
                    size="sm"
                    disabled={nothingEvaluated}
                    onClick={publishDialog.open}
                    leftIcon={<Send className="size-4" />}
                  >
                    Publish marks
                  </Button>
                )}
              </Can>
            </div>
          }
        />

        <CardBody className="space-y-5">
          {nothingEvaluated ? (
            <EmptyState
              icon={<BarChart3 className="size-6" />}
              title="Nothing evaluated yet"
              description="Score a submission below and the class picture builds here."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat
                  label="Evaluated"
                  value={`${summary.evaluated} / ${summary.total}`}
                  tone="text-emerald-700"
                />
                <Stat
                  label="Average"
                  value={
                    summary.average_marks === null
                      ? '—'
                      : `${summary.average_marks} / ${assignment.max_marks}`
                  }
                />
                <Stat
                  label="Highest"
                  value={summary.highest_marks === null ? '—' : String(summary.highest_marks)}
                />
                <Stat
                  label="Lowest"
                  value={summary.lowest_marks === null ? '—' : String(summary.lowest_marks)}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 border-t border-slate-200 pt-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">Grade spread</p>
                  <Distribution summary={summary} />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Pass rate</p>
                    <p className="mt-1 text-sm text-slate-800">
                      <span className="font-semibold">{summary.pass_count}</span> passed ·{' '}
                      <span className={cn(summary.fail_count > 0 && 'text-red-600')}>
                        {summary.fail_count} below {PASS_PERCENT}%
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">Bands</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {GRADE_BANDS.map((band) => (
                        <Badge key={band.grade} tone={toneForGrade(band.grade)}>
                          {band.grade} ≥ {band.min_percent}%
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    This assignment carries {assignment.weightage_percent}% of the term's internal
                    assessment.
                  </p>
                </div>
              </div>
            </>
          )}

          {!summary.marks_published && outstanding > 0 && !nothingEvaluated && (
            <Alert tone="warning">
              {outstanding} submission{outstanding === 1 ? ' is' : 's are'} still unevaluated.
              Publishing now releases only what has been marked.
            </Alert>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        isOpen={publishDialog.isOpen}
        onClose={publishDialog.close}
        onConfirm={() => publishMarks.mutate(undefined, { onSuccess: publishDialog.close })}
        isLoading={publishMarks.isPending}
        title="Publish these marks?"
        confirmLabel="Publish marks"
        message={
          <>
            <strong>{summary.evaluated}</strong> evaluated submission
            {summary.evaluated === 1 ? '' : 's'} — marks, grades and feedback — become visible to
            those students and their guardians.{' '}
            {outstanding > 0 && (
              <>
                The {outstanding} still unevaluated stay hidden until you evaluate and publish
                again.{' '}
              </>
            )}
            You can still change a mark afterwards; the student sees the correction.
          </>
        }
      />
    </>
  );
}
