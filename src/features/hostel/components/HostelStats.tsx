import { BedDouble, Building2, IndianRupee, UserCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatCurrency, formatNumber } from '@/lib/format';

import { HIGH_OCCUPANCY_PERCENT } from '../constants';
import { useHostelSummary } from '../hooks/useHostel';

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
 * The boarding numbers.
 *
 * Residents unaccounted for tonight gets its own banner, not a cell in a
 * grid: it is the one figure on this screen that somebody has to act on
 * before they go to bed.
 */
export function HostelStats() {
  const { data, isLoading } = useHostelSummary();

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
      {data.unmarked_tonight > 0 && (
        <Alert
          tone="warning"
          title={`${data.unmarked_tonight} resident${data.unmarked_tonight === 1 ? '' : 's'} not yet called tonight`}
        >
          Tonight's roll call is incomplete. Until it is taken, nobody can say who is in the
          building.
        </Alert>
      )}

      <Card>
        <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            icon={<Building2 className="size-4" />}
            label="Blocks"
            value={`${formatNumber(data.hostels)} · ${formatNumber(data.rooms)} rooms`}
          />
          <Stat
            icon={<BedDouble className="size-4" />}
            label="Beds free"
            value={`${formatNumber(data.available_beds)} of ${formatNumber(data.beds)}`}
            tone={data.available_beds === 0 ? 'text-amber-700' : undefined}
          />
          <Stat
            icon={<UserCheck className="size-4" />}
            label="Occupancy"
            value={`${data.occupancy_percent}%`}
            tone={
              data.occupancy_percent >= HIGH_OCCUPANCY_PERCENT ? 'text-amber-700' : undefined
            }
          />
          <Stat
            icon={<IndianRupee className="size-4" />}
            label="Fees outstanding"
            value={formatCurrency(data.outstanding_fees)}
            tone={data.outstanding_fees > 0 ? 'text-amber-700' : undefined}
          />
        </CardBody>
      </Card>
    </div>
  );
}
