import { Search, ShieldOff } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

import { ACTION_LABELS, type PermissionAction } from '../constants';
import type { PermissionGroup } from '../types';

interface PermissionMatrixProps {
  groups: PermissionGroup[];
  /** Action columns to render, in order. */
  actions: string[];
  /** Currently granted permission names. */
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

const actionLabel = (action: string) =>
  ACTION_LABELS[action as PermissionAction] ?? action.charAt(0).toUpperCase() + action.slice(1);

/**
 * Resource × action grid for granting permissions to a role.
 *
 * A cell only renders a checkbox where the backend actually seeded that
 * permission, so the grid can never grant something that does not exist.
 * Row and column headers double as select-all toggles with a tri-state
 * indicator, and the whole grid scrolls horizontally inside its own container
 * with the resource column pinned.
 */
export function PermissionMatrix({
  groups,
  actions,
  value,
  onChange,
  disabled = false,
}: PermissionMatrixProps) {
  const [search, setSearch] = useState('');

  // Set lookup keeps the per-cell checks O(1) across a grid that can reach
  // several hundred checkboxes.
  const granted = useMemo(() => new Set(value), [value]);

  const visibleGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groups;
    return groups.filter(
      (group) =>
        group.label.toLowerCase().includes(term) || group.resource.toLowerCase().includes(term),
    );
  }, [groups, search]);

  const allNames = useMemo(() => groups.flatMap((group) => group.names), [groups]);

  const setMany = (names: string[], checked: boolean) => {
    const next = new Set(granted);
    for (const name of names) {
      if (checked) next.add(name);
      else next.delete(name);
    }
    onChange([...next]);
  };

  const toggleOne = (name: string) => setMany([name], !granted.has(name));

  /** How many of `names` are granted — drives the tri-state toggles. */
  const tally = (names: string[]) => {
    const count = names.reduce((total, name) => total + (granted.has(name) ? 1 : 0), 0);
    return { count, all: names.length > 0 && count === names.length, some: count > 0 };
  };

  const columnNames = (action: string) =>
    visibleGroups.map((group) => group.byAction[action]).filter((name): name is string => !!name);

  const overall = tally(allNames);

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={<ShieldOff className="size-6" />}
        title="No permissions available"
        description="Run the backend permission seeder to populate the matrix."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter modules…"
          aria-label="Filter modules"
          leftIcon={<Search className="size-4" />}
          className="sm:max-w-xs"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {overall.count} of {allNames.length} granted
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => setMany(allNames, !overall.all)}
          >
            {overall.all ? 'Clear all' : 'Select all'}
          </Button>
        </div>
      </div>

      <div className="scrollbar-thin overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-slate-50 px-4 py-2.5 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase"
              >
                Module
              </th>

              {actions.map((action) => {
                const names = columnNames(action);
                const state = tally(names);

                return (
                  <th key={action} scope="col" className="px-3 py-2.5 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                        {actionLabel(action)}
                      </span>
                      <Checkbox
                        checked={state.all}
                        indeterminate={!state.all && state.some}
                        disabled={disabled || names.length === 0}
                        onChange={() => setMany(names, !state.all)}
                        aria-label={`Toggle ${actionLabel(action)} for all visible modules`}
                      />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {visibleGroups.map((group) => {
              const state = tally(group.names);

              return (
                <tr key={group.resource} className="border-b border-slate-100 last:border-0">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-white px-4 py-2.5 text-left font-normal"
                  >
                    <label className="flex cursor-pointer items-center gap-2.5">
                      <Checkbox
                        checked={state.all}
                        indeterminate={!state.all && state.some}
                        disabled={disabled}
                        onChange={() => setMany(group.names, !state.all)}
                        aria-label={`Toggle all permissions for ${group.label}`}
                      />
                      <span
                        className={cn(
                          'truncate text-sm',
                          state.some ? 'font-medium text-slate-900' : 'text-slate-600',
                        )}
                      >
                        {group.label}
                      </span>
                    </label>
                  </th>

                  {actions.map((action) => {
                    const name = group.byAction[action];

                    return (
                      <td key={action} className="px-3 py-2.5 text-center">
                        {name ? (
                          <Checkbox
                            checked={granted.has(name)}
                            disabled={disabled}
                            onChange={() => toggleOne(name)}
                            aria-label={name}
                          />
                        ) : (
                          // No such permission for this resource — an em dash
                          // reads as "not applicable", a disabled box would not.
                          <span className="text-slate-300" aria-hidden>
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {visibleGroups.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No modules match “{search}”.
          </p>
        )}
      </div>
    </div>
  );
}
