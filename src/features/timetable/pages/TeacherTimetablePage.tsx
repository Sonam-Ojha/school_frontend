import { FileDown, Printer, UserSearch } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

import { GridSummary } from '../components/GridSummary';
import { SlotCell } from '../components/SlotCell';
import { WeeklyGrid } from '../components/WeeklyGrid';
import { WorkloadTable } from '../components/WorkloadTable';
import { MAX_PERIODS_PER_WEEK, TIMETABLE_PERMISSIONS } from '../constants';
import { useExportTimetable, useTeacherGrid, useWorkload } from '../hooks/useTimetable';

/**
 * A teacher's week, and the staff workload it comes out of.
 *
 * Nothing here is editable: a teacher's timetable is not a record, it is the
 * lessons they appear in. Moving one means moving it on the class timetable,
 * which is where the clash rules live — an edit here would need a second copy
 * of them.
 */
export default function TeacherTimetablePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const teacherId = Number(searchParams.get('teacher_id')) || null;

  const { data: workload, isLoading: workloadLoading } = useWorkload();
  const { data: grid, isLoading, error } = useTeacherGrid(teacherId);
  const exportGrid = useExportTimetable();

  const selectTeacher = (id: number) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set('teacher_id', String(id));
        return next;
      },
      { replace: true },
    );
  };

  const overloaded = (workload ?? []).filter((row) => row.is_overloaded);

  return (
    <div className="space-y-4">
      {overloaded.length > 0 && (
        <Alert
          tone="warning"
          title={`${overloaded.length} teacher${overloaded.length === 1 ? ' is' : 's are'} over the weekly limit`}
          className="print-hidden"
        >
          {overloaded.map((row) => row.teacher_name).join(', ')} — more than{' '}
          {MAX_PERIODS_PER_WEEK} periods a week. Move a lesson on the class timetable to bring
          them back inside it.
        </Alert>
      )}

      <Card className="print-hidden">
        <CardHeader
          title="Staff workload"
          description="Select a teacher to see their week."
        />
        <CardBody className="p-0">
          <WorkloadTable
            rows={workload}
            isLoading={workloadLoading}
            selectedTeacherId={teacherId}
            onSelect={(row) => selectTeacher(row.teacher_id)}
          />
        </CardBody>
      </Card>

      {teacherId === null ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<UserSearch className="size-6" />}
              title="No teacher selected"
              description="Pick someone from the table above to see their timetable."
            />
          </CardBody>
        </Card>
      ) : error ? (
        <Alert tone="danger" title="Could not load this timetable">
          {error.message}
        </Alert>
      ) : isLoading ? (
        <Card>
          <CardBody className="space-y-2">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className="h-11 w-full" />
            ))}
          </CardBody>
        </Card>
      ) : grid ? (
        <>
          <GridSummary summary={grid.summary} loadLabel="Classes" />

          <Card>
            <CardHeader
              title={grid.title}
              description={grid.subtitle}
              className="print-hidden"
              actions={
                <div className="flex gap-2">
                  <Can permissions={[TIMETABLE_PERMISSIONS.export]}>
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={exportGrid.isPending}
                      onClick={() =>
                        exportGrid.mutate({
                          scope: 'teacher',
                          id: teacherId,
                          label: grid.title.replace(/\s+/g, '-').toLowerCase(),
                        })
                      }
                      leftIcon={<FileDown className="size-4" />}
                    >
                      Export
                    </Button>
                  </Can>

                  <Can permissions={[TIMETABLE_PERMISSIONS.print]}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      leftIcon={<Printer className="size-4" />}
                    >
                      Print
                    </Button>
                  </Can>
                </div>
              }
            />

            <CardBody className="p-0 sm:p-2">
              <div className="print-target">
                <h2 className="hidden text-base font-semibold text-slate-900 print:block">
                  {grid.title}
                  {grid.subtitle ? ` — ${grid.subtitle}` : ''}
                </h2>

                <WeeklyGrid grid={grid} renderCell={(slot) => <SlotCell slot={slot} scope="teacher" />} />
              </div>
            </CardBody>
          </Card>
        </>
      ) : null}
    </div>
  );
}
