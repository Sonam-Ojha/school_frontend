import { Search, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

interface TableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Filter controls — usually `<Select>`s bound to `setFilter`. */
  filters?: ReactNode;
  /** Right-aligned actions such as "Add" or "Export". */
  actions?: ReactNode;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  className?: string;
}

/**
 * Search + filters + actions bar above a `DataTable`. Stacks vertically on
 * mobile; the search field keeps priority width on every breakpoint.
 */
export function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters,
  actions,
  hasActiveFilters = false,
  onResetFilters,
  className,
}: TableToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-slate-200 px-4 py-3',
        'lg:flex-row lg:items-center lg:justify-between sm:px-6',
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          leftIcon={<Search className="size-4" />}
          className="sm:max-w-xs"
        />

        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}

        {hasActiveFilters && onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            leftIcon={<X className="size-3.5" />}
            className="self-start"
          >
            Clear
          </Button>
        )}
      </div>

      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
