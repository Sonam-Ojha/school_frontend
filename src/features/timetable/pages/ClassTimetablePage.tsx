import { CalendarRange, FileDown, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useClassOptions } from '@/features/academics/hooks/useAcademics';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useAuthStore } from '@/store/authStore';
import { useQueryParams } from '@/hooks/useQueryParams';

import { SlotCell } from '../components/SlotCell';
import { SlotFormModal } from '../components/SlotFormModal';
import { GridSummary } from '../components/GridSummary';
import { WeeklyGrid } from '../components/WeeklyGrid';
import { TIMETABLE_PERMISSIONS } from '../constants';
import { useExportTimetable, useSectionGrid } from '../hooks/useTimetable';
import type { Period, TimetableSlot, Weekday } from '../types';

interface OpenCell {
  period: Period;
  day: Weekday;
  slot: TimetableSlot | null;
}

/**
 * A section's week — the student timetable, and the one screen where the
 * timetable is actually built. Every other view reads the slots written here.
 */
export default function ClassTimetablePage() {
  const { searchParams, patch } = useQueryParams();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canEdit = hasPermission(TIMETABLE_PERMISSIONS.update);

  const classId = Number(searchParams.get('class_id')) || 0;
  const sectionId = Number(searchParams.get('section_id')) || 0;

  const { classes, classOptions, sectionOptions } = useClassOptions(classId || null);
  const query = useMemo(() => ({ classId, sectionId }), [classId, sectionId]);

  const { data: grid, isLoading, error } = useSectionGrid(query);
  const exportGrid = useExportTimetable();
  const slotForm = useDisclosure();
  const [openCell, setOpenCell] = useState<OpenCell | null>(null);

  const section = classes
    .find((entry) => entry.id === classId)
    ?.sections.find((entry) => entry.id === sectionId);


  const openCellForm = (period: Period, day: Weekday, slot: TimetableSlot | null) => {
    setOpenCell({ period, day, slot });
    slotForm.open();
  };

  const closeCellForm = () => {
    slotForm.close();
    setOpenCell(null);
  };

  const hasSelection = classId > 0 && sectionId > 0;

  return (
    <>
      <Card className="mb-4 print-hidden">
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label
              htmlFor="timetable-class"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Class
            </label>
            <Select
              id="timetable-class"
              value={classId || ''}
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
              htmlFor="timetable-section"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Section
            </label>
            <Select
              id="timetable-section"
              value={sectionId || ''}
              options={sectionOptions}
              placeholder={classId ? 'Select a section' : 'Select a class first'}
              disabled={sectionOptions.length === 0}
              onChange={(event) => patch({ section_id: event.target.value || undefined })}
              className="w-40"
            />
          </div>

          {grid && hasSelection && (
            <div className="flex flex-wrap items-end gap-2 sm:ml-auto">
              <Can permissions={[TIMETABLE_PERMISSIONS.export]}>
                <Button
                  variant="outline"
                  isLoading={exportGrid.isPending}
                  onClick={() =>
                    exportGrid.mutate({
                      scope: 'section',
                      id: sectionId,
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
                  onClick={() => window.print()}
                  leftIcon={<Printer className="size-4" />}
                >
                  Print
                </Button>
              </Can>
            </div>
          )}
        </CardBody>
      </Card>

      {!hasSelection ? (
        <Card>
          <CardBody>
            <Alert tone="info">
              Choose a class and section to see its timetable. Every other view — a teacher's
              week, a room's allocation — is built from the lessons entered here.
            </Alert>
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
        <div className="space-y-4">
          <GridSummary summary={grid.summary} loadLabel="Subjects" />

          <Card>
            <CardHeader
              title={grid.title}
              description={grid.subtitle}
              actions={
                canEdit ? (
                  <Badge tone="info">Click a cell to edit</Badge>
                ) : (
                  <Badge tone="neutral">Read only</Badge>
                )
              }
              className="print-hidden"
            />

            <CardBody className="p-0 sm:p-2">
              {/* Only the grid prints — the pickers and summary are screen furniture. */}
              <div className="print-target">
                <h2 className="hidden text-base font-semibold text-slate-900 print:block">
                  {grid.title}
                  {grid.subtitle ? ` — ${grid.subtitle}` : ''}
                </h2>

                <WeeklyGrid
                  grid={grid}
                  onCellClick={canEdit ? openCellForm : undefined}
                  renderCell={(slot) => (
                    <SlotCell slot={slot} scope="section" isEditable={canEdit} />
                  )}
                />
              </div>
            </CardBody>
          </Card>
        </div>
      ) : (
        <Card>
          <CardBody>
            <EmptyState
              icon={<CalendarRange className="size-6" />}
              title="No timetable yet"
              description="Nothing has been scheduled for this section."
            />
          </CardBody>
        </Card>
      )}

      {openCell && (
        <SlotFormModal
          isOpen={slotForm.isOpen}
          onClose={closeCellForm}
          query={query}
          period={openCell.period}
          day={openCell.day}
          slot={openCell.slot}
          sectionStrength={section?.students_count ?? 0}
          sectionLabel={grid?.title ?? 'This section'}
        />
      )}
    </>
  );
}
