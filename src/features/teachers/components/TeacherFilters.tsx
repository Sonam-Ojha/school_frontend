import { Select } from '@/components/ui/Select';
import { useSubjectOptions } from '@/features/academics/hooks/useAcademics';
import type { TableQueryState } from '@/hooks/useTableQueryState';

import { DEPARTMENT_OPTIONS, EMPLOYMENT_TYPE_OPTIONS, STATUS_OPTIONS } from '../constants';

/** Filter keys this table owns — passed to `useTableQueryState`. */
export const TEACHER_FILTER_KEYS = [
  'department',
  'status',
  'employment_type',
  'subject_id',
] as const;

export function TeacherFilters({ table }: { table: TableQueryState }) {
  const { subjectOptions } = useSubjectOptions();

  return (
    <>
      <Select
        aria-label="Filter by department"
        value={table.filters.department ?? ''}
        options={DEPARTMENT_OPTIONS}
        placeholder="All departments"
        onChange={(event) => table.setFilter('department', event.target.value || undefined)}
        className="h-9 w-auto min-w-40 text-sm"
      />

      <Select
        aria-label="Filter by subject"
        value={table.filters.subject_id ?? ''}
        options={subjectOptions}
        placeholder="All subjects"
        onChange={(event) => table.setFilter('subject_id', event.target.value || undefined)}
        className="h-9 w-auto min-w-36 text-sm"
      />

      <Select
        aria-label="Filter by employment type"
        value={table.filters.employment_type ?? ''}
        options={EMPLOYMENT_TYPE_OPTIONS}
        placeholder="Any type"
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
