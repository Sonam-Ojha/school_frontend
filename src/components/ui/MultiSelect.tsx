import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useDismiss } from '@/hooks/useDismiss';
import { cn } from '@/lib/cn';
import type { Option } from '@/types/common';

interface MultiSelectProps<TValue extends string | number> {
  options: Option<TValue>[];
  value: TValue[];
  onChange: (next: TValue[]) => void;
  placeholder?: string;
  /** Show a filter box once the list is long enough to need one. */
  searchable?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  id?: string;
  emptyMessage?: string;
  className?: string;
}

/**
 * Checkbox-list dropdown for picking several options.
 *
 * Selections render as removable chips in the trigger, so what is chosen stays
 * visible without opening the panel — the failure mode of a plain multi-select,
 * where the user cannot see their own choices.
 */
export function MultiSelect<TValue extends string | number>({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchable = true,
  disabled = false,
  hasError = false,
  id,
  emptyMessage = 'No options available',
  className,
}: MultiSelectProps<TValue>) {
  const { isOpen, close, toggle } = useDisclosure();
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');

  useDismiss(isOpen, containerRef, close);

  // Set lookup keeps per-row checks O(1) on long lists.
  const selected = useMemo(() => new Set(value), [value]);

  const visibleOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, search]);

  const selectedOptions = useMemo(
    () => options.filter((option) => selected.has(option.value)),
    [options, selected],
  );

  const toggleValue = (optionValue: TValue) => {
    const next = new Set(selected);
    if (next.has(optionValue)) next.delete(optionValue);
    else next.add(optionValue);
    onChange([...next]);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={hasError || undefined}
        className={cn(
          'flex min-h-10 w-full items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-left text-sm shadow-xs',
          'transition-colors duration-150',
          'disabled:cursor-not-allowed disabled:bg-slate-50',
          hasError
            ? 'border-red-400 focus-visible:outline-red-500'
            : 'border-slate-300 focus-visible:outline-brand-600',
        )}
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1">
          {selectedOptions.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : (
            selectedOptions.map((option) => (
              <Badge key={option.value} tone="info" className="gap-1">
                <span className="truncate">{option.label}</span>
                {!disabled && (
                  // A span, not a button — nested buttons are invalid markup.
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label={`Remove ${option.label}`}
                    className="cursor-pointer rounded-full hover:bg-brand-200"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleValue(option.value);
                    }}
                  >
                    <X className="size-3" aria-hidden />
                  </span>
                )}
              </Badge>
            ))
          )}
        </span>

        <ChevronDown className="size-4 shrink-0 text-slate-400" aria-hidden />
      </button>

      {isOpen && (
        <div className="absolute z-40 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-overlay">
          {searchable && options.length > 6 && (
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  type="search"
                  autoFocus
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Filter…"
                  aria-label="Filter options"
                  className="h-8 w-full rounded-md border border-slate-200 pr-2 pl-8 text-sm"
                />
              </div>
            </div>
          )}

          <ul role="listbox" aria-multiselectable className="max-h-56 overflow-y-auto py-1">
            {visibleOptions.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-slate-500">
                {options.length === 0 ? emptyMessage : `No matches for “${search}”`}
              </li>
            ) : (
              visibleOptions.map((option) => {
                const isSelected = selected.has(option.value);

                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onClick={() => toggleValue(option.value)}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm',
                        'hover:bg-slate-50 disabled:opacity-50',
                        isSelected && 'font-medium text-brand-700',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded border',
                          isSelected
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-slate-300',
                        )}
                      >
                        {isSelected && <Check className="size-3" aria-hidden />}
                      </span>
                      <span className="truncate">{option.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
