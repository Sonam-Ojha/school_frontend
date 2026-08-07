import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';

import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import type { PaginationMeta, SortDirection } from '@/types/api';
import type { Identifiable } from '@/types/common';

import { Pagination } from './Pagination';
import { TableSkeleton } from './TableSkeleton';
import type { Column, ColumnAlign, ColumnBreakpoint } from './types';

const ALIGN: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const HIDE_BELOW: Record<ColumnBreakpoint, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
};

export interface DataTableProps<TRow extends Identifiable> {
  columns: Column<TRow>[];
  rows: TRow[] | undefined;

  /** First load — renders row skeletons. */
  isLoading?: boolean;
  /** Background refetch — dims the body and keeps the current rows visible. */
  isFetching?: boolean;
  error?: Error | null;

  /** Server pagination meta. Omit to render the table without a pager. */
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;

  sortBy?: string;
  sortDir?: SortDirection;
  onSort?: (sortKey: string) => void;

  onRowClick?: (row: TRow) => void;
  emptyState?: ReactNode;
  /** Rendered above the table — typically a `TableToolbar`. */
  toolbar?: ReactNode;
  className?: string;
}

/**
 * Server-driven data table: sorting, pagination, loading and empty states in
 * one place. Every list screen in the ERP renders through this — pass column
 * definitions, never hand-rolled `<table>` markup.
 *
 * Pair with `useTableQueryState`, which supplies `sortBy`/`sortDir`/handlers
 * and keeps them in the URL.
 */
export function DataTable<TRow extends Identifiable>({
  columns,
  rows,
  isLoading = false,
  isFetching = false,
  error = null,
  meta,
  onPageChange,
  onPerPageChange,
  sortBy,
  sortDir = 'asc',
  onSort,
  onRowClick,
  emptyState,
  toolbar,
  className,
}: DataTableProps<TRow>) {
  const isEmpty = !isLoading && !error && (rows?.length ?? 0) === 0;

  const headers = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        resolvedSortKey: column.sortKey ?? column.key,
      })),
    [columns],
  );

  return (
    <div
      className={cn(
        'rounded-card border border-slate-200 bg-white shadow-card overflow-hidden',
        className,
      )}
    >
      {toolbar}

      {error ? (
        <div className="p-4 sm:p-6">
          <Alert tone="danger" title="Could not load this list">
            {error.message}
          </Alert>
        </div>
      ) : (
        <div className="relative">
          {/* Keeps wide tables scrolling inside the card instead of the page. */}
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {headers.map((column) => {
                    const isSorted = sortBy === column.resolvedSortKey;
                    const canSort = Boolean(column.sortable && onSort);

                    return (
                      <th
                        key={column.key}
                        scope="col"
                        style={column.width ? { width: column.width } : undefined}
                        aria-sort={
                          isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                        }
                        className={cn(
                          'px-4 py-3 text-xs font-semibold tracking-wide text-slate-600 uppercase',
                          ALIGN[column.align ?? 'left'],
                          column.hideBelow && HIDE_BELOW[column.hideBelow],
                          column.headerClassName,
                        )}
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={() => onSort?.(column.resolvedSortKey)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded transition-colors hover:text-slate-900',
                              isSorted && 'text-brand-700',
                            )}
                          >
                            {column.header}
                            {isSorted ? (
                              sortDir === 'asc' ? (
                                <ArrowUp className="size-3.5" aria-hidden />
                              ) : (
                                <ArrowDown className="size-3.5" aria-hidden />
                              )
                            ) : (
                              <ArrowUpDown className="size-3.5 opacity-40" aria-hidden />
                            )}
                          </button>
                        ) : (
                          column.header
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className={cn(isFetching && !isLoading && 'opacity-60 transition-opacity')}>
                {isLoading ? (
                  <TableSkeleton columns={columns.length} />
                ) : (
                  rows?.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={cn(
                        'border-b border-slate-100 last:border-0',
                        onRowClick && 'cursor-pointer hover:bg-slate-50',
                      )}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            'px-4 py-3.5 align-middle text-slate-700',
                            ALIGN[column.align ?? 'left'],
                            column.hideBelow && HIDE_BELOW[column.hideBelow],
                            column.cellClassName,
                          )}
                        >
                          {column.cell
                            ? column.cell(row, rowIndex)
                            : String((row as Record<string, unknown>)[column.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {isEmpty &&
            (emptyState ?? (
              <EmptyState
                title="No records found"
                description="Try adjusting your search or filters."
              />
            ))}

          {/* Refetch indicator — non-blocking, so stale rows stay readable. */}
          {isFetching && !isLoading && (
            <div className="pointer-events-none absolute top-2 right-3 text-brand-600">
              <Spinner size="sm" label="Refreshing" />
            </div>
          )}
        </div>
      )}

      {meta && onPageChange && !error && (
        <Pagination
          meta={meta}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          isDisabled={isLoading}
        />
      )}
    </div>
  );
}
