import { FileSpreadsheet, FileText } from 'lucide-react';
import { useMemo } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useClassOptions } from '@/features/academics/hooks/useAcademics';
import { useQueryParams } from '@/hooks/useQueryParams';

import { MonthlyGrid } from '../components/MonthlyGrid';
import {
  ATTENDANCE_PERMISSIONS,
  ATTENDANCE_TYPE_LABELS,
  MONTH_OPTIONS,
  STATUS_INITIALS,
  STATUS_LABELS,
} from '../constants';
import { useExportMonthly, useMonthlyReport } from '../hooks/useAttendance';
import type { AttendanceStatus, AttendanceType } from '../types';

const TYPE_OPTIONS = (['student', 'teacher', 'staff'] as const).map((value) => ({
  label: ATTENDANCE_TYPE_LABELS[value],
  value,
}));

/** Last six years is enough for any report anyone asks for. */
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { label: String(year), value: year };
});

const LEGEND_ORDER: AttendanceStatus[] = ['present', 'absent', 'late', 'half_day', 'leave'];

export default function MonthlyReportPage() {
  const { searchParams, patch } = useQueryParams();
  const now = new Date();

  const type = (searchParams.get('type') as AttendanceType) ?? 'student';
  const year = Number(searchParams.get('year')) || now.getFullYear();
  const month = Number(searchParams.get('month')) || now.getMonth() + 1;
  const classId = searchParams.get('class_id') ? Number(searchParams.get('class_id')) : null;
  const sectionId = searchParams.get('section_id') ? Number(searchParams.get('section_id')) : null;

  const { classOptions, sectionOptions } = useClassOptions(classId);


  const query = useMemo(
    () => ({ type, year, month, classId, sectionId }),
    [type, year, month, classId, sectionId],
  );

  const { data: report, isLoading, error } = useMonthlyReport(query);
  const exportReport = useExportMonthly();

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label htmlFor="report-type" className="mb-1.5 block text-sm font-medium text-slate-700">
              Population
            </label>
            <Select
              id="report-type"
              value={type}
              options={TYPE_OPTIONS}
              onChange={(event) =>
                // Class filters mean nothing for employees.
                patch({ type: event.target.value, class_id: undefined, section_id: undefined })
              }
              className="w-36"
            />
          </div>

          <div>
            <label htmlFor="report-month" className="mb-1.5 block text-sm font-medium text-slate-700">
              Month
            </label>
            <Select
              id="report-month"
              value={month}
              options={MONTH_OPTIONS}
              onChange={(event) => patch({ month: event.target.value })}
              className="w-40"
            />
          </div>

          <div>
            <label htmlFor="report-year" className="mb-1.5 block text-sm font-medium text-slate-700">
              Year
            </label>
            <Select
              id="report-year"
              value={year}
              options={YEAR_OPTIONS}
              onChange={(event) => patch({ year: event.target.value })}
              className="w-28"
            />
          </div>

          {type === 'student' && (
            <>
              <div>
                <label
                  htmlFor="report-class"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Class
                </label>
                <Select
                  id="report-class"
                  value={classId ?? ''}
                  options={classOptions}
                  placeholder="All classes"
                  onChange={(event) =>
                    patch({ class_id: event.target.value || undefined, section_id: undefined })
                  }
                  className="w-40"
                />
              </div>

              <div>
                <label
                  htmlFor="report-section"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Section
                </label>
                <Select
                  id="report-section"
                  value={sectionId ?? ''}
                  options={sectionOptions}
                  placeholder={classId ? 'All sections' : 'Select a class first'}
                  disabled={sectionOptions.length === 0}
                  onChange={(event) => patch({ section_id: event.target.value || undefined })}
                  className="w-36"
                />
              </div>
            </>
          )}

          <Can permissions={[ATTENDANCE_PERMISSIONS.export]}>
            <div className="flex items-end gap-2 sm:ml-auto">
              <Button
                variant="outline"
                isLoading={exportReport.isPending}
                onClick={() => exportReport.mutate({ query, format: 'excel' })}
                leftIcon={<FileSpreadsheet className="size-4" />}
              >
                Excel
              </Button>
              <Button
                variant="outline"
                isLoading={exportReport.isPending}
                onClick={() => exportReport.mutate({ query, format: 'pdf' })}
                leftIcon={<FileText className="size-4" />}
              >
                PDF
              </Button>
            </div>
          </Can>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={`${ATTENDANCE_TYPE_LABELS[type]} — ${MONTH_OPTIONS[month - 1]?.label} ${year}`}
          description={
            report
              ? `${report.working_days} working day${report.working_days === 1 ? '' : 's'} this month`
              : undefined
          }
          actions={
            <div className="hidden flex-wrap items-center gap-3 lg:flex">
              {LEGEND_ORDER.map((status) => (
                <span key={status} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{STATUS_INITIALS[status]}</span>
                  {STATUS_LABELS[status]}
                </span>
              ))}
            </div>
          }
        />

        <CardBody className="p-0">
          {error ? (
            <div className="p-4 sm:p-6">
              <Alert tone="danger" title="Could not load the report">
                {error.message}
              </Alert>
            </div>
          ) : isLoading ? (
            <div className="space-y-2 p-4 sm:p-6">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : report ? (
            <>
              <MonthlyGrid report={report} />

              {/* The legend is hidden in the header below `lg`. */}
              <div className="flex flex-wrap gap-3 border-t border-slate-200 px-4 py-3 lg:hidden sm:px-6">
                {LEGEND_ORDER.map((status) => (
                  <span key={status} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{STATUS_INITIALS[status]}</span>
                    {STATUS_LABELS[status]}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
