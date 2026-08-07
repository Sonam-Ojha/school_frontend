import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Shift } from '@/features/academics/types';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useAuthStore } from '@/store/authStore';

import { PeriodFormModal } from '../components/PeriodFormModal';
import { PeriodList } from '../components/PeriodList';
import { SHIFT_LABELS, TIMETABLE_PERMISSIONS } from '../constants';
import { useDeletePeriod, usePeriods } from '../hooks/useTimetable';
import type { Period } from '../types';

const SHIFTS = Object.keys(SHIFT_LABELS) as Shift[];

/**
 * The school's daily time grid.
 *
 * One set of periods per shift, because a morning section and an afternoon
 * section run different clocks — and a single shared grid would put an
 * afternoon class's first lesson at half past eight in the morning.
 */
export default function PeriodManagementPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(TIMETABLE_PERMISSIONS.update);
  const canDelete = hasPermission(TIMETABLE_PERMISSIONS.delete);

  const { periods, isLoading } = usePeriods();
  const deletePeriod = useDeletePeriod();

  const periodForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editing, setEditing] = useState<Period | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Period | null>(null);
  const [addingShift, setAddingShift] = useState<Shift>('morning');

  /** Next free position on a shift, so a new period lands at the end of it. */
  const nextSortOrder = (shift: Shift) =>
    periods
      .filter((period) => period.shift === shift)
      .reduce((highest, period) => Math.max(highest, period.sort_order), 0) + 1;

  const openAdd = (shift: Shift) => {
    setEditing(null);
    setAddingShift(shift);
    periodForm.open();
  };

  const inUse = pendingDelete !== null && pendingDelete.slots_count > 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }, (_, index) => (
          <Skeleton key={index} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert tone="info">
        Periods define when lessons happen. Every section on a shift shares its grid, so a change
        here reaches every timetable in the school at once.
      </Alert>

      {SHIFTS.map((shift) => {
        const shiftPeriods = periods.filter((period) => period.shift === shift);

        // An unused evening shift is worth offering, not worth a whole card.
        if (shiftPeriods.length === 0 && shift === 'evening') {
          return (
            <Card key={shift}>
              <CardHeader
                title={`${SHIFT_LABELS[shift]} shift`}
                description="No periods defined."
                actions={
                  <Can permissions={[TIMETABLE_PERMISSIONS.create]}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAdd(shift)}
                      leftIcon={<Plus className="size-4" />}
                    >
                      Add period
                    </Button>
                  </Can>
                }
              />
            </Card>
          );
        }

        return (
          <div key={shift}>
            <div className="mb-2 flex justify-end">
              <Can permissions={[TIMETABLE_PERMISSIONS.create]}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAdd(shift)}
                  leftIcon={<Plus className="size-4" />}
                >
                  Add {SHIFT_LABELS[shift].toLowerCase()} period
                </Button>
              </Can>
            </div>

            <PeriodList
              shift={shift}
              periods={shiftPeriods}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onEdit={(period) => {
                setEditing(period);
                periodForm.open();
              }}
              onDelete={(period) => {
                setPendingDelete(period);
                deleteDialog.open();
              }}
            />
          </div>
        );
      })}

      <PeriodFormModal
        isOpen={periodForm.isOpen}
        onClose={() => {
          periodForm.close();
          setEditing(null);
        }}
        period={editing}
        nextSortOrder={editing?.sort_order ?? nextSortOrder(addingShift)}
        defaultShift={addingShift}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          deletePeriod.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={deletePeriod.isPending}
        isDestructive
        title={`Delete ${pendingDelete?.name ?? 'this period'}?`}
        confirmLabel="Delete period"
        message={
          inUse ? (
            <Alert tone="warning">
              {pendingDelete.slots_count} lesson
              {pendingDelete.slots_count === 1 ? '' : 's'} are scheduled in this period across the
              school. Clear them before removing it.
            </Alert>
          ) : (
            'It will disappear from every timetable on this shift.'
          )
        }
      />
    </div>
  );
}
