import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/Button';
import { PAGE_SIZE_OPTIONS } from '@/config/constants';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import type { PaginationMeta } from '@/types/api';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  isDisabled?: boolean;
  className?: string;
}

const ELLIPSIS = 'ellipsis' as const;
type PageItem = number | typeof ELLIPSIS;

/**
 * Build a windowed page list: always the first and last page, plus a window
 * around the current one, so the control has a fixed width at any total.
 */
function buildPages(current: number, last: number): PageItem[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const window: PageItem[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);

  if (start > 2) window.push(ELLIPSIS);
  for (let page = start; page <= end; page += 1) window.push(page);
  if (end < last - 1) window.push(ELLIPSIS);

  window.push(last);
  return window;
}

export function Pagination({
  meta,
  onPageChange,
  onPerPageChange,
  isDisabled = false,
  className,
}: PaginationProps) {
  const { current_page: current, last_page: last, from, to, total, per_page: perPage } = meta;

  const pages = useMemo(() => buildPages(current, last), [current, last]);

  if (total === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-slate-200 px-4 py-3',
        'sm:flex-row sm:items-center sm:justify-between sm:px-6',
        className,
      )}
    >
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span>
          Showing <span className="font-medium text-slate-900">{formatNumber(from ?? 0)}</span>–
          <span className="font-medium text-slate-900">{formatNumber(to ?? 0)}</span> of{' '}
          <span className="font-medium text-slate-900">{formatNumber(total)}</span>
        </span>

        {onPerPageChange && (
          <label className="hidden items-center gap-2 sm:flex">
            <span className="sr-only">Rows per page</span>
            <select
              value={perPage}
              disabled={isDisabled}
              onChange={(event) => onPerPageChange(Number(event.target.value))}
              className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <Button
          variant="outline"
          size="sm"
          iconOnly
          aria-label="Previous page"
          disabled={isDisabled || current <= 1}
          onClick={() => onPageChange(current - 1)}
          leftIcon={<ChevronLeft className="size-4" />}
        />

        {pages.map((page, index) =>
          page === ELLIPSIS ? (
            <span key={`gap-${index}`} className="px-1.5 text-sm text-slate-400" aria-hidden>
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={page === current ? 'primary' : 'ghost'}
              size="sm"
              disabled={isDisabled}
              aria-current={page === current ? 'page' : undefined}
              onClick={() => onPageChange(page)}
              className="min-w-8 px-2"
            >
              {page}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          iconOnly
          aria-label="Next page"
          disabled={isDisabled || current >= last}
          onClick={() => onPageChange(current + 1)}
          leftIcon={<ChevronRight className="size-4" />}
        />
      </nav>
    </div>
  );
}
