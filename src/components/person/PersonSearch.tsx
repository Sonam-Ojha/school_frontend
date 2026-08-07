import { Search } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

/** The shape any roster can be mapped onto — one row of the dropdown. */
export interface PersonResult {
  key: string;
  name: string;
  photoUrl: string | null;
  /** Admission number, employee id — whatever identifies them at a desk. */
  identifier: string;
  /** Class and section, designation, or anything else worth disambiguating by. */
  detail: string | null;
  /** Renders to the right of the row — a badge, a warning, a balance. */
  badge?: ReactNode;
  /** Greys the row out and blocks selection, with the reason as a title. */
  disabled?: boolean;
  disabledReason?: string | null;
}

interface PersonSearchProps {
  label: string;
  placeholder?: string;
  /** Live search results for the debounced term. */
  results: PersonResult[] | undefined;
  isLoading?: boolean;
  onSelect: (result: PersonResult) => void;
  /** Fewer characters than this returns the whole school — so it does not ask. */
  minLength?: number;
  hint?: ReactNode;
  className?: string;
  /**
   * Owned by the caller, who also owns the debounce — the query key needs the
   * debounced term, and a second one in here would fight the first.
   */
  value: string;
  onChange: (value: string) => void;
}

/**
 * Typeahead over a roster of people.
 *
 * Every desk in the ERP starts the same way — a cashier, a librarian or a
 * receptionist has a name or a number in front of them, never an id — so the
 * search box, the debounce, the minimum length and the result row live here
 * rather than being rebuilt per module. Callers map their own roster onto
 * `PersonResult` and decide what the badge says.
 */
export function PersonSearch({
  label,
  placeholder = 'Name or number…',
  results,
  isLoading = false,
  onSelect,
  minLength = 2,
  hint,
  className,
  value,
  onChange,
}: PersonSearchProps) {
  const id = useId();
  const [isFocused, setIsFocused] = useState(false);

  const isOpen = value.trim().length >= minLength && isFocused;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <Input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          // Delayed so a click on a result lands before the list closes.
          onBlur={() => window.setTimeout(() => setIsFocused(false), 150)}
          placeholder={placeholder}
          autoComplete="off"
          leftIcon={<Search className="size-4" />}
        />

        {isOpen && (
          <div className="shadow-overlay absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white">
            {isLoading ? (
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : results && results.length > 0 ? (
              <ul className="max-h-72 overflow-y-auto py-1">
                {results.map((result) => (
                  <li key={result.key}>
                    <button
                      type="button"
                      disabled={result.disabled}
                      title={result.disabledReason ?? undefined}
                      onClick={() => onSelect(result)}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2 text-left',
                        result.disabled
                          ? 'cursor-not-allowed opacity-60'
                          : 'hover:bg-slate-50',
                      )}
                    >
                      <Avatar name={result.name} src={result.photoUrl} size="sm" />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-slate-900">{result.name}</span>
                        <span className="block truncate text-xs text-slate-500">
                          <code>{result.identifier}</code>
                          {result.detail ? ` · ${result.detail}` : ''}
                        </span>
                        {result.disabled && result.disabledReason && (
                          <span className="block truncate text-xs font-medium text-red-600">
                            {result.disabledReason}
                          </span>
                        )}
                      </span>

                      {result.badge && <span className="shrink-0">{result.badge}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-4 text-sm text-slate-500">
                Nobody matches “{value.trim()}”.
              </p>
            )}
          </div>
        )}
      </div>

      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
