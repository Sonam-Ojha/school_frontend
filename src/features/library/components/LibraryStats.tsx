import { BookOpen, Clock, IndianRupee, Library } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatCurrency, formatNumber } from '@/lib/format';

import { useLibrarySummary } from '../hooks/useLibrary';

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

/** The four numbers a librarian is asked for, above every catalogue screen. */
export function LibraryStats() {
  const { data, isLoading } = useLibrarySummary();

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
    <Card>
      <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={<Library className="size-4" />}
          label="Titles"
          value={`${formatNumber(data.total_books)} · ${formatNumber(data.total_copies)} copies`}
        />
        <Stat
          icon={<BookOpen className="size-4" />}
          label="On the shelf"
          value={formatNumber(data.available_copies)}
        />
        <Stat
          icon={<Clock className="size-4" />}
          label="Overdue"
          value={formatNumber(data.overdue_loans)}
          tone={data.overdue_loans > 0 ? 'text-red-700' : undefined}
        />
        <Stat
          icon={<IndianRupee className="size-4" />}
          label="Fines outstanding"
          value={formatCurrency(data.outstanding_fines)}
          tone={data.outstanding_fines > 0 ? 'text-amber-700' : undefined}
        />
      </CardBody>
    </Card>
  );
}
