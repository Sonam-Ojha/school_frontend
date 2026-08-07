import { ArrowUpRight, FileWarning } from 'lucide-react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';

import { ReportRunner } from '../components/ReportRunner';
import { familyOf, isReportFamily, reportsOf } from '../constants';

/**
 * One family's reports, and whichever of them is selected.
 *
 * A single route rather than six near-identical pages: the family is a URL
 * parameter and the report is a query parameter, so every combination is a
 * link somebody can send — and adding a report to the catalogue adds it here
 * without touching this file.
 */
export default function ReportFamilyPage() {
  const { family } = useParams<{ family: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!isReportFamily(family)) return <Navigate to={PATHS.reportsOverview} replace />;

  const definition = familyOf(family);
  const reports = reportsOf(family);
  const selected = reports.find((report) => report.key === searchParams.get('report')) ?? reports[0];

  const choose = (key: string) => {
    // Filters belong to the report that declared them — carrying them across
    // would run the next report with parameters it never asked for.
    setSearchParams(new URLSearchParams({ report: key }), { replace: true });
  };

  if (!selected) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<FileWarning className="size-6" />}
            title={`No ${definition.label.toLowerCase()} reports`}
            description="Nothing is registered for this family yet."
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="print-hidden">
        <CardBody className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="text-sm text-slate-600">{definition.description}</p>
            <Link
              to={definition.ownerPath}
              className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
            >
              {definition.ownerLabel}
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {reports.map((report) => (
              <button
                key={report.key}
                type="button"
                onClick={() => choose(report.key)}
                aria-pressed={report.key === selected.key}
                className={cn(
                  'rounded-lg border px-3 py-2 text-left transition-colors',
                  report.key === selected.key
                    ? 'border-brand-300 bg-brand-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <span className="block text-sm font-medium text-slate-900">{report.title}</span>
                <span className="block max-w-xs text-xs text-slate-500">{report.description}</span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Keyed on the report, so switching resets the runner's state rather
          than carrying one report's filters into the next. */}
      <ReportRunner key={selected.key} report={selected} />
    </div>
  );
}
