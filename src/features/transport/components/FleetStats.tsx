import { Bus, Radio, ShieldAlert, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

import { useTransportSummary } from '../hooks/useTransport';

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
 * The fleet at a glance.
 *
 * Lapsed papers get their own banner rather than a number in a grid: a bus
 * that cannot legally carry children tomorrow morning is not a statistic.
 */
export function FleetStats() {
  const { data, isLoading } = useTransportSummary();

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
      {data.expired_documents > 0 && (
        <Alert
          tone="danger"
          title={`${data.expired_documents} bus${data.expired_documents === 1 ? '' : 'es'} cannot legally run`}
        >
          Insurance or a fitness certificate has lapsed. They must come off their routes until it
          is renewed.
        </Alert>
      )}

      <Card>
        <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            icon={<Bus className="size-4" />}
            label="Fleet"
            value={`${formatNumber(data.active_vehicles)} in service · ${formatNumber(data.vehicles)} total`}
          />
          <Stat
            icon={<Users className="size-4" />}
            label="Students carried"
            value={`${formatNumber(data.students)} on ${formatNumber(data.routes)} routes`}
          />
          <Stat
            icon={<ShieldAlert className="size-4" />}
            label="Papers expiring"
            value={formatNumber(data.expiring_documents)}
            tone={data.expiring_documents > 0 ? 'text-amber-700' : undefined}
          />
          <Stat
            icon={<Radio className="size-4" />}
            label="Trackers reporting"
            value={`${formatNumber(data.gps_online)} of ${formatNumber(data.gps_online + data.gps_offline)}`}
            tone={data.gps_offline > 0 ? 'text-amber-700' : undefined}
          />
        </CardBody>
      </Card>
    </div>
  );
}
