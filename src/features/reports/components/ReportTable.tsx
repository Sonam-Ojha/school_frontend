import { cn } from '@/lib/cn';

import { formatValue } from '../format';
import type { ReportColumn, ReportRow } from '../types';

interface ReportTableProps {
  columns: ReportColumn[];
  rows: ReportRow[];
  totals: ReportRow | null;
  emptyMessage: string;
}

const HIDE_BELOW: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

const alignOf = (column: ReportColumn) =>
  column.align ??
  (column.format === 'number' || column.format === 'money' || column.format === 'percent'
    ? 'right'
    : 'left');

/**
 * The rows behind the chart.
 *
 * Deliberately not the shared `DataTable`: that one is a paginated, sortable,
 * clickable register of records with ids, and a report row is none of those
 * things — it is a computed line with no identity and no detail page to open.
 * Forcing it through would mean inventing an id per row and disabling half the
 * component. What it does borrow is the column-priority rule, so the same
 * columns drop away on a phone.
 */
export function ReportTable({ columns, rows, totals, emptyMessage }: ReportTableProps) {
  if (rows.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-slate-500 sm:px-6">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-4 py-2.5 font-medium whitespace-nowrap text-slate-600',
                  alignOf(column) === 'right' && 'text-right',
                  alignOf(column) === 'center' && 'text-center',
                  column.hideBelow && HIDE_BELOW[column.hideBelow],
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-2.5',
                    alignOf(column) === 'right' && 'text-right tabular-nums',
                    alignOf(column) === 'center' && 'text-center',
                    column.hideBelow && HIDE_BELOW[column.hideBelow],
                    column.format === 'text' ? 'text-slate-800' : 'text-slate-700',
                  )}
                >
                  {formatValue(row[column.key] ?? null, column.format)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        {totals && (
          <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
            <tr>
              {columns.map((column, index) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-2.5',
                    alignOf(column) === 'right' && 'text-right tabular-nums',
                    alignOf(column) === 'center' && 'text-center',
                    column.hideBelow && HIDE_BELOW[column.hideBelow],
                  )}
                >
                  {/* Only columns that asked to be totalled are; a mean of
                      percentages down a column is not a total of anything. */}
                  {index === 0 && totals[column.key] === undefined
                    ? 'Total'
                    : column.total || totals[column.key] !== undefined
                      ? formatValue(totals[column.key] ?? null, column.format)
                      : ''}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
