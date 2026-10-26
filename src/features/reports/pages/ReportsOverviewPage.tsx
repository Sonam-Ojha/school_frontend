import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { Alert } from '@/components/ui/Alert';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePlanModules } from '@/features/saas/hooks/useSubscription';
import { formatDateTime } from '@/lib/format';

import { ReportChart } from '../components/ReportChart';
import { familyOf } from '../constants';
import { formatValue } from '../format';
import { useReportsOverview } from '../hooks/useReports';

/**
 * One chart from each family, side by side.
 *
 * The point of the page is the comparison a single module cannot make: falling
 * attendance next to rising outstanding fees is a different conversation from
 * either on its own. Each panel links through to the full report rather than
 * trying to be it.
 */
export default function ReportsOverviewPage() {
  const { data, isLoading, error } = useReportsOverview();
  // Payroll figures only on a plan with payroll.
  const modules = usePlanModules();
  const shown = (family: string) => family !== 'payroll' || modules === null || modules.includes('payroll');

  if (error) {
    return (
      <Card>
        <CardBody>
          <Alert tone="danger" title="Could not load the overview">
            {error.message}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-72 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {data.panels.filter((panel) => shown(panel.family)).map((panel) => {
          const family = familyOf(panel.family);

          return (
            <Card key={panel.key}>
              <CardHeader
                title={panel.title}
                description={family.label}
                actions={
                  <Link
                    to={`${toPath(PATHS.reportFamily, { family: panel.family })}?report=${panel.key}`}
                    className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
                  >
                    Open
                    <ArrowRight className="size-3.5" />
                  </Link>
                }
              />
              <CardBody className="space-y-3">
                <div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {formatValue(panel.stat.value, panel.stat.format)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {panel.stat.label}
                    {panel.stat.hint ? ` · ${panel.stat.hint}` : ''}
                  </p>
                </div>

                <ReportChart series={panel.series} height={panel.series.chart === 'donut' ? 190 : 200} />
              </CardBody>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400">
        Generated {formatDateTime(data.generated_at)}. Every figure is read from the module that
        owns it — nothing here is a second copy.
      </p>
    </div>
  );
}
