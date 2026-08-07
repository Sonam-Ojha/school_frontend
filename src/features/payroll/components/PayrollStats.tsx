import { CircleAlert, IndianRupee, Users, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Alert } from '@/components/ui/Alert';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatCurrency, formatNumber } from '@/lib/format';

import { RUN_STATUS_LABELS } from '../constants';
import { usePayrollSummary } from '../hooks/usePayroll';

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-lg bg-slate-100 p-2 text-slate-500">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className={cn('truncate text-lg font-semibold', tone ?? 'text-slate-900')}>{value}</p>
      </div>
    </div>
  );
}

/**
 * The payroll numbers.
 *
 * Employees without a salary structure get their own banner: they are the
 * people who will silently be missed out of the next run, and a count in a
 * grid is not enough warning for that.
 */
export function PayrollStats() {
  const { data, isLoading } = usePayrollSummary();

  if (isLoading || !data) {
    return (
      <Card>
        <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.employees_without_structure > 0 && (
        <Alert
          tone="warning"
          title={`${data.employees_without_structure} employee${data.employees_without_structure === 1 ? '' : 's'} not on the payroll`}
        >
          They have no salary structure, so the next run will pass over them without saying so.{' '}
          <Link to={PATHS.payrollStructures} className="font-medium underline">
            Set their salary
          </Link>
          .
        </Alert>
      )}

      <Card>
        <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            icon={<Users className="size-4" />}
            label="On the payroll"
            value={formatNumber(data.employees_on_payroll)}
          />
          <Stat
            icon={<Wallet className="size-4" />}
            label="Monthly gross"
            value={formatCurrency(data.monthly_gross)}
          />
          <Stat
            icon={<IndianRupee className="size-4" />}
            label="Monthly net"
            value={formatCurrency(data.monthly_net)}
          />
          <Stat
            icon={<CircleAlert className="size-4" />}
            label="Latest run"
            value={
              data.latest_run_month
                ? `${data.latest_run_month} · ${RUN_STATUS_LABELS[data.latest_run_status!]}`
                : 'None yet'
            }
            tone={data.unpaid_runs > 0 ? 'text-amber-700' : undefined}
          />
        </CardBody>
      </Card>
    </div>
  );
}
