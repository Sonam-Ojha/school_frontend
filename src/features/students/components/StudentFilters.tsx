import { Select } from '@/components/ui/Select';
import { useClassOptions } from '@/features/academics/hooks/useAcademics';
import type { TableQueryState } from '@/hooks/useTableQueryState';

import { GENDER_OPTIONS, STATUS_OPTIONS } from '../constants';

/** Filter keys this table owns — passed to `useTableQueryState`. */
export const STUDENT_FILTER_KEYS = ['class_id', 'section_id', 'status', 'gender'] as const;

/**
 * Filter controls for the student list.
 *
 * Every value lives in the URL through `useTableQueryState`, so a filtered
 * view is shareable and the export sends the same filters the user is seeing.
 */
export function StudentFilters({ table }: { table: TableQueryState }) {
  const selectedClassId = table.filters.class_id ? Number(table.filters.class_id) : null;
  const { classOptions, sectionOptions } = useClassOptions(selectedClassId);

  return (
    <>
      <Select
        aria-label="Filter by class"
        value={table.filters.class_id ?? ''}
        options={classOptions}
        placeholder="All classes"
        onChange={(event) => {
          table.setFilter('class_id', event.target.value || undefined);
          // A section from the old class would exclude every row.
          table.setFilter('section_id', undefined);
        }}
        className="h-9 w-auto min-w-36 text-sm"
      />

      <Select
        aria-label="Filter by section"
        value={table.filters.section_id ?? ''}
        options={sectionOptions}
        placeholder="All sections"
        disabled={sectionOptions.length === 0}
        onChange={(event) => table.setFilter('section_id', event.target.value || undefined)}
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

      <Select
        aria-label="Filter by gender"
        value={table.filters.gender ?? ''}
        options={GENDER_OPTIONS}
        placeholder="Any gender"
        onChange={(event) => table.setFilter('gender', event.target.value || undefined)}
        className="h-9 w-auto min-w-28 text-sm"
      />
    </>
  );
}
