import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { ToneName } from '@/types/common';

import type { DashboardList } from '../types';

const META_TONE: Record<ToneName, string> = {
  neutral: 'text-slate-500',
  info: 'text-brand-700',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
};

/**
 * A short list — today's lessons, the next exams, the last few payments.
 *
 * Always a preview with a way through to the real screen, never a table
 * pretending to be one. A dashboard that tries to be every register at once
 * is a dashboard nobody can read at a glance, which is the only thing it is
 * for.
 */
export function ListPanel({ list }: { list: DashboardList }) {
  return (
    <Card className="flex flex-col">
      <CardHeader
        title={list.title}
        description={list.description ?? undefined}
        actions={
          list.to && (
            <Link
              to={list.to}
              className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
            >
              All
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          )
        }
      />

      <CardBody className="flex-1 p-0">
        {list.items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500 sm:px-6">{list.empty}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.items.map((item) => {
              const row = (
                <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                    {item.detail && (
                      <p className="truncate text-xs text-slate-500">{item.detail}</p>
                    )}
                  </div>

                  {item.meta && (
                    <span
                      className={cn(
                        'shrink-0 text-sm font-medium whitespace-nowrap',
                        META_TONE[item.tone ?? 'neutral'],
                      )}
                    >
                      {item.meta}
                    </span>
                  )}
                </div>
              );

              return (
                <li key={item.id}>
                  {item.to ? (
                    <Link to={item.to} className="block hover:bg-slate-50">
                      {row}
                    </Link>
                  ) : (
                    row
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
