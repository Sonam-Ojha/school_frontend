import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useClassOptions } from '@/features/academics/hooks/useAcademics';
import { useExams } from '@/features/exams/hooks/useExams';

import {
  EMPLOYEE_TYPE_OPTIONS,
  MONTH_OPTIONS,
  yearOptions,
} from '../constants';
import type { ReportParam } from '../types';

export type FilterValues = Record<string, string>;

interface ReportFiltersProps {
  params: ReportParam[];
  values: FilterValues;
  onChange: (key: string, value: string | undefined) => void;
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * The controls a report asked for, and no others.
 *
 * The registry declares `params`, this renders them — so adding a report is a
 * catalogue entry rather than another filter bar. The lookups come from the
 * modules that own them: classes and sections from academics, exams from the
 * examinations module. Nothing here keeps its own copy of a roster.
 */
export function ReportFilters({ params, values, onChange }: ReportFiltersProps) {
  const classId = values.class_id ? Number(values.class_id) : null;
  const { classOptions, sectionOptions } = useClassOptions(classId);

  // Only fetched when a report actually asks to be filtered by exam.
  const { data: exams } = useExams({ per_page: 50, sort_by: 'start_date', sort_dir: 'desc' });

  const has = (param: ReportParam) => params.includes(param);

  if (params.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      {has('month') && (
        <>
          <Field id="report-month" label="Month">
            <Select
              id="report-month"
              value={values.month ?? ''}
              options={MONTH_OPTIONS}
              onChange={(event) => onChange('month', event.target.value)}
              className="w-36"
            />
          </Field>
          <Field id="report-month-year" label="Year">
            <Select
              id="report-month-year"
              value={values.year ?? ''}
              options={yearOptions()}
              onChange={(event) => onChange('year', event.target.value)}
              className="w-28"
            />
          </Field>
        </>
      )}

      {has('year') && !has('month') && (
        <Field id="report-year" label="Year">
          <Select
            id="report-year"
            value={values.year ?? ''}
            options={yearOptions()}
            onChange={(event) => onChange('year', event.target.value)}
            className="w-28"
          />
        </Field>
      )}

      {has('exam') && (
        <Field id="report-exam" label="Exam">
          <Select
            id="report-exam"
            value={values.exam_id ?? ''}
            options={(exams?.data ?? []).map((exam) => ({ label: exam.name, value: exam.id }))}
            placeholder={exams?.data.length === 0 ? 'No exams yet' : 'Choose an exam'}
            disabled={(exams?.data.length ?? 0) === 0}
            onChange={(event) => onChange('exam_id', event.target.value || undefined)}
            className="w-56"
          />
        </Field>
      )}

      {has('class') && (
        <Field id="report-class" label="Class">
          <Select
            id="report-class"
            value={values.class_id ?? ''}
            options={classOptions}
            placeholder="All classes"
            onChange={(event) => {
              // A section belongs to a class — keeping the old one after the
              // class changes would filter on a section that is not in it.
              onChange('section_id', undefined);
              onChange('class_id', event.target.value || undefined);
            }}
            className="w-40"
          />
        </Field>
      )}

      {has('section') && (
        <Field id="report-section" label="Section">
          <Select
            id="report-section"
            value={values.section_id ?? ''}
            options={sectionOptions}
            placeholder={classId ? 'All sections' : 'Choose a class first'}
            disabled={sectionOptions.length === 0}
            onChange={(event) => onChange('section_id', event.target.value || undefined)}
            className="w-36"
          />
        </Field>
      )}

      {has('employee_type') && (
        <Field id="report-employee-type" label="Population">
          <Select
            id="report-employee-type"
            value={values.employee_type ?? ''}
            options={EMPLOYEE_TYPE_OPTIONS}
            placeholder="Everybody"
            onChange={(event) => onChange('employee_type', event.target.value || undefined)}
            className="w-36"
          />
        </Field>
      )}

      {has('date_range') && (
        <>
          <Field id="report-from" label="From">
            <Input
              id="report-from"
              type="date"
              value={values.from ?? ''}
              max={values.to}
              onChange={(event) => onChange('from', event.target.value)}
            />
          </Field>
          <Field id="report-to" label="To">
            <Input
              id="report-to"
              type="date"
              value={values.to ?? ''}
              min={values.from}
              onChange={(event) => onChange('to', event.target.value)}
            />
          </Field>
        </>
      )}
    </div>
  );
}
