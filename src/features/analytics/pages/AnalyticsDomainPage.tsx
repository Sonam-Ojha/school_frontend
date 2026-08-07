import { ArrowUpRight, FileWarning } from 'lucide-react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';

import { AnalysisRunner } from '../components/AnalysisRunner';
import { analysesOf, domainOf, isDomain } from '../constants';

/**
 * One domain's analyses, and whichever is selected.
 *
 * The same single-route shape the reports module uses: the domain is a URL
 * parameter and the analysis a query parameter, so every combination is a
 * link somebody can send, and adding an analysis to the catalogue adds it
 * here without touching this file.
 */
export default function AnalyticsDomainPage() {
  const { domain } = useParams<{ domain: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  if (!isDomain(domain)) {
    return <Navigate to={toPath(PATHS.analyticsDomain, { domain: 'performance' })} replace />;
  }

  const definition = domainOf(domain);
  const analyses = analysesOf(domain);
  const selected =
    analyses.find((analysis) => analysis.key === searchParams.get('analysis')) ?? analyses[0];

  const choose = (key: string) => {
    // Parameters belong to the analysis that declared them; carrying them
    // across would run the next one with filters it never asked for.
    setSearchParams(new URLSearchParams({ analysis: key }), { replace: true });
  };

  if (!selected) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<FileWarning className="size-6" />}
            title={`No ${definition.label.toLowerCase()} analyses`}
            description="Nothing is registered for this domain yet."
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
              to={PATHS.reports}
              className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
            >
              The figures behind it
              <ArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {analyses.map((analysis) => (
              <button
                key={analysis.key}
                type="button"
                onClick={() => choose(analysis.key)}
                aria-pressed={analysis.key === selected.key}
                className={cn(
                  'rounded-lg border px-3 py-2 text-left transition-colors',
                  analysis.key === selected.key
                    ? 'border-brand-300 bg-brand-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <span className="block text-sm font-medium text-slate-900">{analysis.title}</span>
                <span className="block max-w-sm text-xs text-slate-500">{analysis.question}</span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Keyed on the analysis so switching resets the runner rather than
          carrying one analysis's filters into the next. */}
      <AnalysisRunner key={selected.key} analysis={selected} />
    </div>
  );
}
