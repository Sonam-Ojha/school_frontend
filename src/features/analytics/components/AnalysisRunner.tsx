import { useMemo } from 'react';

import { ScatterChart } from '@/components/charts';
import { Alert } from '@/components/ui/Alert';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ReportChart, ReportFilters } from '@/features/reports';
import { useQueryParams } from '@/hooks/useQueryParams';

import { useAnalysis, useExportCohort } from '../hooks/useAnalytics';
import type { AnalysisDefinition } from '../constants';
import { CohortTable } from './CohortTable';
import { InsightList } from './InsightList';
import { IntelligencePanel } from './IntelligencePanel';

function defaultsFor(analysis: AnalysisDefinition): Record<string, string> {
  const now = new Date();
  const defaults: Record<string, string> = {};

  if (analysis.params.includes('year')) defaults.year = String(now.getFullYear());
  if (analysis.params.includes('month')) {
    defaults.month = String(now.getMonth() + 1);
    defaults.year = String(now.getFullYear());
  }

  return defaults;
}

/**
 * One analysis, end to end.
 *
 * Filters come from the reports module's own `ReportFilters` — the parameter
 * vocabulary is identical and a second filter bar would be a second place to
 * fix a class picker. Charts likewise go through `ReportChart`. What this
 * module adds on top is the findings, the cohort and the intelligence seam.
 */
export function AnalysisRunner({ analysis }: { analysis: AnalysisDefinition }) {
  const { searchParams, patch: patchParams } = useQueryParams();
  const exportCohort = useExportCohort();

  const defaults = useMemo(() => defaultsFor(analysis), [analysis]);

  const values = useMemo(() => {
    const merged: Record<string, string> = { ...defaults };
    for (const [key, value] of searchParams.entries()) {
      if (value !== '' && key !== 'analysis') merged[key] = value;
    }
    return merged;
  }, [defaults, searchParams]);

  const patch = (key: string, value: string | undefined) => patchParams({ [key]: value });

  const { data, isLoading, isFetching, error } = useAnalysis(analysis.key, values);

  if (error) {
    return (
      <Card>
        <CardBody>
          <Alert tone="danger" title="Could not run this analysis">
            {error.message}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {analysis.params.length > 0 && (
        <Card className="print-hidden">
          <CardBody>
            <ReportFilters
              params={analysis.params}
              values={values}
              onChange={patch}
            />
          </CardBody>
        </Card>
      )}

      <div className={isFetching ? 'space-y-4 opacity-60 transition-opacity' : 'space-y-4'}>
        {data.empty_reason ? (
          <Alert tone="warning" title="Not enough to analyse">
            {data.empty_reason}
          </Alert>
        ) : (
          <>
            <InsightList
              insights={data.insights}
              method={data.method}
              sampleSize={data.sample_size}
              confidence={data.confidence}
            />

            {data.scatter && (
              <Card>
                <CardHeader
                  title={`${data.scatter.y_label} against ${data.scatter.x_label}`}
                  description={
                    data.scatter.trend
                      ? `The dashed line is a least-squares fit; it accounts for ${Math.round(
                          data.scatter.trend.r_squared * 100,
                        )}% of the variation.`
                      : 'No trend line — the relationship is too weak to draw one honestly.'
                  }
                />
                <CardBody>
                  <ScatterChart
                    points={data.scatter.points}
                    xLabel={data.scatter.x_label}
                    yLabel={data.scatter.y_label}
                    xIsPercent={data.scatter.x_is_percent}
                    yIsPercent={data.scatter.y_is_percent}
                    trend={data.scatter.trend}
                  />
                </CardBody>
              </Card>
            )}

            {data.series.length > 0 && (
              <div className={data.series.length > 1 ? 'grid gap-4 lg:grid-cols-2' : ''}>
                {data.series.map((series) => (
                  <Card key={series.key}>
                    <CardHeader title={series.label} />
                    <CardBody>
                      <ReportChart
                        series={series}
                        height={series.chart === 'donut' ? 200 : 230}
                      />
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}

            {data.cohort && (
              <CohortTable
                cohort={data.cohort}
                isExporting={exportCohort.isPending}
                onExport={(format) =>
                  exportCohort.mutate({ key: analysis.key, params: values, format })
                }
              />
            )}
          </>
        )}

        <IntelligencePanel
          analysisKey={analysis.key}
          params={values}
          intelligence={data.intelligence}
          summary={{
            schema_version: data.features.schema_version,
            feature_names: data.features.feature_names,
            target: data.features.target,
            rowCount: data.features.rows.length,
          }}
        />
      </div>
    </div>
  );
}
