import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useClassOptions } from '@/features/academics/hooks/useAcademics';
import { toDateInputValue } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';
import { useQueryParams } from '@/hooks/useQueryParams';

import { AttendanceSheet } from '../components/AttendanceSheet';
import { ATTENDANCE_PERMISSIONS, ATTENDANCE_TYPE_LABELS } from '../constants';
import { useAttendanceSheet, useSaveAttendance } from '../hooks/useAttendance';
import type { AttendanceType } from '../types';

/** Shift an ISO date by whole days without a date library. */
function shiftDate(date: string, days: number): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return toDateInputValue(next);
}

interface DailyAttendancePageProps {
  type: AttendanceType;
}

/**
 * The daily marking screen for one population.
 *
 * Students, teachers and staff share it — only the class filter is
 * student-specific, and the sheet itself is identical. The date and filters
 * live in the URL so a particular day's sheet can be linked to.
 */
export function DailyAttendancePage({ type }: DailyAttendancePageProps) {
  const { searchParams, patch } = useQueryParams();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canMark = hasPermission(ATTENDANCE_PERMISSIONS.create);

  const today = toDateInputValue(new Date());
  const date = searchParams.get('date') ?? today;
  const classId = searchParams.get('class_id') ? Number(searchParams.get('class_id')) : null;
  const sectionId = searchParams.get('section_id') ? Number(searchParams.get('section_id')) : null;

  const { classOptions, sectionOptions } = useClassOptions(classId);


  const query = useMemo(
    () => ({ type, date, classId, sectionId }),
    [type, date, classId, sectionId],
  );

  // A student sheet without a class would be the whole school in one list.
  const needsClass = type === 'student' && !classId;

  const { data: sheet, isLoading, error } = useAttendanceSheet(query, !needsClass);
  const saveAttendance = useSaveAttendance();

  const isFuture = date > today;

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex items-end gap-1">
            <Button
              variant="outline"
              size="md"
              iconOnly
              aria-label="Previous day"
              onClick={() => patch({ date: shiftDate(date, -1) })}
              leftIcon={<ChevronLeft className="size-4" />}
            />

            <div>
              <label
                htmlFor="attendance-date"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Date
              </label>
              <Input
                id="attendance-date"
                type="date"
                value={date}
                // Marking a day that has not happened is never intended.
                max={today}
                onChange={(event) => patch({ date: event.target.value })}
                className="w-44"
              />
            </div>

            <Button
              variant="outline"
              size="md"
              iconOnly
              aria-label="Next day"
              disabled={date >= today}
              onClick={() => patch({ date: shiftDate(date, 1) })}
              leftIcon={<ChevronRight className="size-4" />}
            />
          </div>

          {date !== today && (
            <Button variant="ghost" size="sm" onClick={() => patch({ date: undefined })}>
              Back to today
            </Button>
          )}

          {type === 'student' && (
            <>
              <div>
                <label
                  htmlFor="attendance-class"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Class
                </label>
                <Select
                  id="attendance-class"
                  value={classId ?? ''}
                  options={classOptions}
                  placeholder="Select a class"
                  onChange={(event) =>
                    patch({ class_id: event.target.value || undefined, section_id: undefined })
                  }
                  className="w-44"
                />
              </div>

              <div>
                <label
                  htmlFor="attendance-section"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Section
                </label>
                <Select
                  id="attendance-section"
                  value={sectionId ?? ''}
                  options={sectionOptions}
                  placeholder={classId ? 'All sections' : 'Select a class first'}
                  disabled={sectionOptions.length === 0}
                  onChange={(event) => patch({ section_id: event.target.value || undefined })}
                  className="w-40"
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {isFuture && (
        <Alert tone="warning" title="That date has not happened yet">
          Attendance can only be marked for today or a past date.
        </Alert>
      )}

      {needsClass ? (
        <Card>
          <CardBody>
            <Alert tone="info">
              Choose a class to mark student attendance. Sheets are per class so a teacher marks
              only the group in front of them.
            </Alert>
          </CardBody>
        </Card>
      ) : (
        <AttendanceSheet
          sheet={sheet}
          isLoading={isLoading}
          error={error}
          isSaving={saveAttendance.isPending}
          canMark={canMark && !isFuture}
          emptyMessage={`No ${ATTENDANCE_TYPE_LABELS[type].toLowerCase()} found for this selection.`}
          onSave={(entries) =>
            saveAttendance.mutate({
              date,
              type,
              class_id: classId,
              section_id: sectionId,
              entries,
            })
          }
        />
      )}
    </div>
  );
}

export function StudentAttendancePage() {
  return <DailyAttendancePage type="student" />;
}

export function TeacherAttendancePage() {
  return <DailyAttendancePage type="teacher" />;
}

export function StaffAttendancePage() {
  return <DailyAttendancePage type="staff" />;
}
