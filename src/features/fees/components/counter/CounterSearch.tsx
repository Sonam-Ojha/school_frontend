import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { forwardRef, useEffect, useState, type KeyboardEvent } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { studentService } from '@/features/students/services/studentService';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';

interface CounterSearchProps {
  onSelect: (studentId: number) => void;
}

/**
 * The first thing the desk does: find the student. A parent gives the
 * child's name, the admission number, or their own name or phone number —
 * all four are searched. Arrow keys move through the results and Enter takes
 * the highlighted one, so a busy counter never needs the mouse.
 */
export const CounterSearch = forwardRef<HTMLInputElement, CounterSearchProps>(function CounterSearch({ onSelect }, ref) {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(0);
  const debounced = useDebounce(search.trim());
  const canSearch = debounced.length >= 2;

  // Nothing is asked for until there are two letters to narrow on: one would return the school.
  const { data, isFetching } = useQuery({
    queryKey: ['fee-counter-search', debounced],
    queryFn: ({ signal }) => studentService.list({ search: debounced, per_page: 8, status: 'active' }, signal),
    enabled: canSearch,
    staleTime: 30_000,
  });
  const results = canSearch ? (data?.data ?? []) : [];

  useEffect(() => setActive(0), [debounced]);

  const choose = (id: number) => {
    onSelect(id);
    setSearch('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      choose(results[active].id);
    } else if (event.key === 'Escape') {
      setSearch('');
    }
  };

  return (
    <div className="relative">
      <label htmlFor="counter-search" className="sr-only">
        Find a student
      </label>
      <Input
        ref={ref}
        id="counter-search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        autoFocus
        placeholder="Student name, admission no., father’s name or phone…"
        leftIcon={<Search className="size-4" />}
        rightSlot={
          search ? (
            <button type="button" onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600" aria-label="Clear the search">
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="hidden rounded border border-slate-200 px-1.5 text-[10px] text-slate-400 sm:block">Enter ↵</kbd>
          )
        }
        className="h-12 text-base"
        role="combobox"
        aria-expanded={canSearch}
        aria-controls="counter-search-results"
        aria-activedescendant={results[active] ? `counter-result-${results[active].id}` : undefined}
      />

      {canSearch && (
        <div
          id="counter-search-results"
          role="listbox"
          className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-overlay"
        >
          {isFetching && results.length === 0 ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-500">No active student matches “{debounced}”.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((student, index) => (
                <li key={student.id} id={`counter-result-${student.id}`} role="option" aria-selected={index === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(student.id)}
                    className={cn('flex w-full items-center gap-3 px-4 py-2.5 text-left', index === active ? 'bg-brand-50' : 'hover:bg-slate-50')}
                  >
                    <Avatar name={student.full_name} src={student.photo_url} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">{student.full_name}</span>
                      <span className="block truncate text-xs text-slate-500">
                        <code>{student.admission_no}</code> · {student.class_name}
                        {student.section_name ? ` — ${student.section_name}` : ''}
                        {student.primary_guardian_name ? ` · ${student.primary_guardian_name}` : ''}
                        {student.primary_guardian_phone ? ` · ${student.primary_guardian_phone}` : ''}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
});
