import { CalendarOff, CircleAlert, Clock, UserCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

import { APPLICANT_TYPE_LABELS } from '../constants';
import { useLeaveSummary } from '../hooks/useLeave';
import type { ApplicantType } from '../types';

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
 * The leave numbers.
 *
 * Applications whose leave has already started but which nobody has decided
 * get their own banner: somebody is either away without permission or at
 * work when they expected not to be, and both are worse than a number in a
 * grid.
 */
export function LeaveStats() {
  const { data, isLoading } = useLeaveSummary();

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
      {data.overdue_decisions > 0 && (
        <Alert
          tone="danger"
          title={`${data.overdue_decisions} application${data.overdue_decisions === 1 ? '' : 's'} whose leave has already started`}
        >
          Nobody has decided, and the first day has passed — so somebody is either away without
          permission or at work expecting not to be.{' '}
          <Link
            to={`${PATHS.leaveApplications}?status=pending`}
            className="font-medium underline"
          >
            Deal with them
          </Link>
          .
        </Alert>
      )}

      <Card>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat
              icon={<Clock className="size-4" />}
              label="Awaiting a decision"
              value={formatNumber(data.pending)}
              tone={data.pending > 0 ? 'text-amber-700' : undefined}
            />
            <Stat
              icon={<CalendarOff className="size-4" />}
              label="Away today"
              value={formatNumber(data.away_today)}
            />
            <Stat
              icon={<UserCheck className="size-4" />}
              label="Approved this month"
              value={formatNumber(data.approved_this_month)}
            />
            <Stat
              icon={<CircleAlert className="size-4" />}
              label="Overdue decisions"
              value={formatNumber(data.overdue_decisions)}
              tone={data.overdue_decisions > 0 ? 'text-red-700' : undefined}
            />
          </div>

          {data.away_today > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              {(Object.keys(data.away_by_type) as ApplicantType[]).map((type) => (
                <Badge key={type} tone={data.away_by_type[type] > 0 ? 'info' : 'neutral'}>
                  {APPLICANT_TYPE_LABELS[type]} · {data.away_by_type[type]}
                </Badge>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
