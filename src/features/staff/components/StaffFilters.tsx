import { Select } from '@/components/ui/Select';
import type { TableQueryState } from '@/hooks/useTableQueryState';

import {
  EMPLOYMENT_TYPE_OPTIONS,
  SHIFT_OPTIONS,
  STAFF_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from '../constants';

/** Filter keys this table owns — passed to `useTableQueryState`. */
export const STAFF_FILTER_KEYS = [
  'staff_type',
  'status',
  'employment_type',
  'shift',
] as const;

export function StaffFilters({ table }: { table: TableQueryState }) {
  return (
    <>
      <Select
        aria-label="Filter by staff type"
        value={table.filters.staff_type ?? ''}
        options={STAFF_TYPE_OPTIONS}
        placeholder="All types"
        onChange={(event) => table.setFilter('staff_type', event.target.value || undefined)}
        className="h-9 w-auto min-w-36 text-sm"
      />

      <Select
        aria-label="Filter by shift"
        value={table.filters.shift ?? ''}
        options={SHIFT_OPTIONS}
        placeholder="Any shift"
        onChange={(event) => table.setFilter('shift', event.target.value || undefined)}
        className="h-9 w-auto min-w-32 text-sm"
      />

      <Select
        aria-label="Filter by employment type"
        value={table.filters.employment_type ?? ''}
        options={EMPLOYMENT_TYPE_OPTIONS}
        placeholder="Any contract"
        onChange={(event) => table.setFilter('employment_type', event.target.value || undefined)}
        className="h-9 w-auto min-w-32 text-sm"
      />

      <Select
        aria-label="Filter by status"
        value={table.filters.status ?? ''}
        options={STATUS_OPTIONS}
        placeholder="All statuses"
        onChange={(event) => table.setFilter('status', event.target.value || undefined)}
        className="h-9 w-auto min-w-32 text-sm"
      />
    </>
  );
}
