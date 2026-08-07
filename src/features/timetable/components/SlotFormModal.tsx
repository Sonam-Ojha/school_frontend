import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useSubjectOptions } from '@/features/academics/hooks/useAcademics';
import { applyServerErrors } from '@/lib/formErrors';
import { formatTimeRange } from '@/lib/time';
import type { Option } from '@/types/common';

import { WEEKDAY_LABELS } from '../constants';
import { useAvailability, useRemoveSlot, useRoomOptions, useSaveSlot } from '../hooks/useTimetable';
import type { SectionGridQuery } from '../services/timetableService';
import { slotSchema, type SlotInput } from '../schemas';
import type { AvailabilityEntry, Period, TimetableSlot, Weekday } from '../types';

const FIELDS = ['subject_id', 'teacher_id', 'room_id', 'period_id', 'day_of_week'] as const;

export interface SlotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: SectionGridQuery;
  /** Where in the grid this cell sits. */
  period: Period;
  day: Weekday;
  /** Null when the cell is free. */
  slot: TimetableSlot | null;
  /** Section strength, for the room-capacity warning. */
  sectionStrength: number;
  sectionLabel: string;
}

/**
 * Turn an availability list into select options.
 *
 * Busy entries stay in the list but are disabled and say who has them — a
 * name that silently vanishes reads as a data problem, while one greyed out
 * with "Class 8 — B, Mathematics" beside it answers the question being asked.
 */
function toOptions(entries: AvailabilityEntry[] | undefined): Option<number>[] {
  return (entries ?? []).map((entry) => ({
    label: entry.is_busy ? `${entry.name} — busy: ${entry.busy_with}` : entry.name,
    value: entry.id,
    disabled: entry.is_busy,
  }));
}

export function SlotFormModal({
  isOpen,
  onClose,
  query,
  period,
  day,
  slot,
  sectionStrength,
  sectionLabel,
}: SlotFormModalProps) {
  const isEdit = slot !== null;

  const saveSlot = useSaveSlot(query);
  const removeSlot = useRemoveSlot(query);

  const form = useForm<SlotInput>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      class_id: query.classId,
      section_id: query.sectionId,
      day_of_week: day,
      period_id: period.id,
      subject_id: slot?.subject_id ?? 0,
      teacher_id: slot?.teacher_id ?? 0,
      room_id: slot?.room_id ?? null,
    },
  });

  const subjectId = form.watch('subject_id');
  const roomId = form.watch('room_id');

  const { subjectOptions, isLoading: subjectsLoading } = useSubjectOptions();
  const { rooms } = useRoomOptions();

  // Asked per cell and per subject: who is free here, and qualified for this.
  const { data: availability, isLoading: availabilityLoading } = useAvailability(
    isOpen ? { dayOfWeek: day, periodId: period.id, subjectId, excludeSlotId: slot?.id } : null,
  );

  const teacherOptions = useMemo(
    () => toOptions(availability?.teachers),
    [availability?.teachers],
  );
  const roomOptions = useMemo(() => toOptions(availability?.rooms), [availability?.rooms]);

  const selectedRoom = rooms.find((room) => room.id === roomId) ?? null;
  const isTooSmall = selectedRoom !== null && selectedRoom.capacity < sectionStrength;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: SlotInput) => {
    saveSlot.mutate(values, {
      onSuccess: handleClose,
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  const isBusy = saveSlot.isPending || removeSlot.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title={isEdit ? 'Edit this lesson' : 'Add a lesson'}
      description={`${sectionLabel} · ${WEEKDAY_LABELS[day]}, ${period.name} · ${formatTimeRange(period.start_time, period.end_time)}`}
      closeOnOverlayClick={!isBusy}
      footer={
        <>
          {isEdit && (
            <Button
              variant="danger"
              className="mr-auto"
              isLoading={removeSlot.isPending}
              disabled={saveSlot.isPending}
              leftIcon={<Trash2 className="size-4" />}
              onClick={() => removeSlot.mutate(slot.id, { onSuccess: handleClose })}
            >
              Clear
            </Button>
          )}
          <Button variant="outline" onClick={handleClose} disabled={isBusy}>
            Cancel
          </Button>
          <Button type="submit" form="slot-form" isLoading={saveSlot.isPending}>
            {isEdit ? 'Save changes' : 'Add lesson'}
          </Button>
        </>
      }
    >
      <Form id="slot-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormSelect<SlotInput>
            name="subject_id"
            label="Subject"
            options={subjectOptions}
            placeholder={subjectsLoading ? 'Loading subjects…' : 'Select a subject'}
            valueAsNumber
            required
          />

          <FormSelect<SlotInput>
            name="teacher_id"
            label="Teacher"
            options={teacherOptions}
            placeholder={
              availabilityLoading
                ? 'Checking who is free…'
                : subjectId
                  ? 'Select a teacher'
                  : 'Select a subject first'
            }
            disabled={teacherOptions.length === 0}
            valueAsNumber
            hint={
              subjectId
                ? 'Only teachers qualified for this subject are listed.'
                : undefined
            }
            required
          />

          <FormSelect<SlotInput>
            name="room_id"
            label="Room"
            options={roomOptions}
            placeholder="The section's own room"
            valueAsNumber
            hint="Leave blank for lessons taught where the section normally sits."
          />
        </FormGrid>

        {subjectId > 0 && teacherOptions.length === 0 && !availabilityLoading && (
          <Alert tone="warning" title="Nobody is free for this subject">
            Every teacher qualified for it is already taking a lesson in this period. Assign
            another teacher to the subject, or move the lesson.
          </Alert>
        )}

        {isTooSmall && selectedRoom && (
          <Alert tone="warning" title="This room is smaller than the section">
            {selectedRoom.name} seats {selectedRoom.capacity}; {sectionLabel} has{' '}
            {sectionStrength} students. It will still save — some lessons legitimately split.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
