import { FileSpreadsheet, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { formatValue } from '@/features/reports';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import type { ToneName } from '@/types/common';

import { ANALYTICS_PERMISSIONS } from '../constants';
import type { Cohort } from '../types';

const NAME_TONE: Record<ToneName, string> = {
  neutral: 'text-slate-900',
  info: 'text-brand-800',
  success: 'text-emerald-800',
  warning: 'text-amber-800',
  danger: 'text-red-800',
};

interface CohortTableProps {
  cohort: Cohort;
  onExport?: (format: string) => void;
  isExporting?: boolean;
}

/**
 * The people an analysis is about.
 *
 * The part that makes it analytics rather than a chart: a correlation is
 * interesting, a list of the forty children it applies to is actionable, and
 * the export exists because the next thing anybody does with that list is
 * take it into a meeting.
 */
export function CohortTable({ cohort, onExport, isExporting }: CohortTableProps) {
  return (
    <Card>
      <CardHeader
        title={cohort.title}
        description={cohort.description}
        actions={
          onExport && (
            <Can permissions={[ANALYTICS_PERMISSIONS.export]}>
              <Button
                variant="outline"
                size="sm"
                isLoading={isExporting}
                disabled={cohort.members.length === 0}
                onClick={() => onExport('excel')}
                leftIcon={<FileSpreadsheet className="size-4" />}
              >
                Export
              </Button>
            </Can>
          )
        }
      />

      <CardBody className="p-0">
        {cohort.members.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
            <Users className="size-6" />
            <p className="text-sm">Nobody matches — which is the answer you want.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium text-slate-600 sm:px-6">
                      Student
                    </th>
                    {cohort.columns.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        className="px-4 py-2.5 text-right font-medium whitespace-nowrap text-slate-600"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {cohort.members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 sm:px-6">
                        {member.to ? (
                          <Link to={member.to} className="group block">
                            <p
                              className={cn(
                                'font-medium group-hover:underline',
                                NAME_TONE[member.tone],
                              )}
                            >
                              {member.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              <code>{member.identifier}</code>
                              {member.detail ? ` · ${member.detail}` : ''}
                            </p>
                          </Link>
                        ) : (
                          <>
                            <p className={cn('font-medium', NAME_TONE[member.tone])}>
                              {member.name}
                            </p>
                            <p className="text-xs text-slate-500">{member.identifier}</p>
                          </>
                        )}
                      </td>

                      {cohort.columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-4 py-2.5 text-right tabular-nums text-slate-700"
                        >
                          {formatValue(member.metrics[column.key] ?? null, column.format)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {cohort.total > cohort.members.length && (
              <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500 sm:px-6">
                Showing the {formatNumber(cohort.members.length)} most pressing of{' '}
                {formatNumber(cohort.total)}. The export carries all of them.
              </p>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
