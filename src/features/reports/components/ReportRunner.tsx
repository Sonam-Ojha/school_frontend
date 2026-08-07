import { FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { useMemo } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateTime } from '@/lib/format';
import { useQueryParams } from '@/hooks/useQueryParams';

import { REPORT_PERMISSIONS, type ReportDefinition } from '../constants';
import { useExportReport, useReport } from '../hooks/useReports';
import { ReportChart } from './ReportChart';
import { ReportFilters } from './ReportFilters';
import { ReportStats } from './ReportStats';
import { ReportTable } from './ReportTable';

/** Sensible starting filters, so a report opens with an answer rather than a form. */
function defaultsFor(report: ReportDefinition): Record<string, string> {
  const now = new Date();
  const defaults: Record<string, string> = {};

  if (report.params.includes('year')) defaults.year = String(now.getFullYear());
  if (report.params.includes('month')) {
    defaults.month = String(now.getMonth() + 1);
    defaults.year = String(now.getFullYear());
  }
  if (report.params.includes('date_range')) {
    defaults.from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    defaults.to = now.toISOString().slice(0, 10);
  }

  return defaults;
}

/**
 * One report, end to end.
 *
 * Filters come from the registry, the numbers from the API, and the chart
 * shape from the result — so this component knows nothing about attendance or
 * payroll and never has to. Filters live in the query string, which is what
 * makes a report somebody has narrowed down a link they can send.
 */
export function ReportRunner({ report }: { report: ReportDefinition }) {
  const { searchParams, patch: patchParams } = useQueryParams();
  const exportReport = useExportReport();

  const defaults = useMemo(() => defaultsFor(report), [report]);

  const values = useMemo(() => {
    const merged: Record<string, string> = { ...defaults };
    for (const [key, value] of searchParams.entries()) {
      if (value !== '') merged[key] = value;
    }
    return merged;
  }, [defaults, searchParams]);

  const patch = (key: string, value: string | undefined) => patchParams({ [key]: value });

  // A report that needs an exam cannot run before one is chosen — asking the
  // API anyway would return a reason the reader already knows.
  const missing = report.params.includes('exam') && !values.exam_id;

  const { data, isLoading, isFetching, error } = useReport(report.key, values, !missing);

  const runExport = (format: 'pdf' | 'excel') =>
    exportReport.mutate({ key: report.key, params: values, format });

  return (
    <div className="space-y-4">
      <Card className="print-hidden">
        <CardBody className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <ReportFilters params={report.params} values={values} onChange={patch} />

          <Can permissions={[REPORT_PERMISSIONS.export]}>
            <div className="flex flex-wrap items-end gap-2">
              <Button
                variant="outline"
                isLoading={exportReport.isPending}
                disabled={!data || data.rows.length === 0}
                onClick={() => runExport('excel')}
                leftIcon={<FileSpreadsheet className="size-4" />}
              >
                Excel
              </Button>
              <Button
                variant="outline"
                isLoading={exportReport.isPending}
                disabled={!data || data.rows.length === 0}
                onClick={() => runExport('pdf')}
                leftIcon={<FileText className="size-4" />}
              >
                PDF
              </Button>
              {report.needsPrint && (
                <Can permissions={[REPORT_PERMISSIONS.print]}>
                  <Button
                    variant="outline"
                    onClick={() => window.print()}
                    leftIcon={<Printer className="size-4" />}
                  >
                    Print
                  </Button>
                </Can>
              )}
            </div>
          </Can>
        </CardBody>
      </Card>

      {missing ? (
        <Card>
          <CardBody>
            <Alert tone="info" title="Choose an exam">
              This report is about one exam, so there is nothing to show until you pick which.
            </Alert>
          </CardBody>
        </Card>
      ) : error ? (
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not run this report">
              {error.message}
            </Alert>
          </CardBody>
        </Card>
      ) : isLoading || !data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
          <div className="space-y-4">
            <ReportStats stats={data.stats} />

            {data.empty_reason && (
              <Alert tone="warning" title="Nothing to report">
                {data.empty_reason}
              </Alert>
            )}

            {data.series.map((series) => (
              <Card key={series.key}>
                <CardHeader title={series.label} />
                <CardBody>
                  <ReportChart series={series} height={series.chart === 'donut' ? 200 : 240} />
                </CardBody>
              </Card>
            ))}

            <Card>
              <CardHeader
                title={data.title}
                description={data.subtitle ?? undefined}
                actions={
                  <span className="text-xs whitespace-nowrap text-slate-400">
                    as at {formatDateTime(data.generated_at)}
                  </span>
                }
              />
              <CardBody className="p-0">
                <ReportTable
                  columns={data.columns}
                  rows={data.rows}
                  totals={data.totals}
                  emptyMessage={data.empty_reason ?? 'No rows for these filters.'}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
