import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useClassOptions, useSubjectOptions } from '@/features/academics/hooks/useAcademics';
import { applyServerErrors } from '@/lib/formErrors';
import { formatDate } from '@/lib/format';

import { DURATION_OPTIONS } from '../constants';
import { useAddPaper, useUpdatePaper } from '../hooks/useExams';
import { paperSchemaFor, type PaperInput } from '../schemas';
import type { ExamDetail, ExamPaper } from '../types';

const FIELDS = [
  'class_id', 'section_id', 'subject_id', 'exam_date',
  'start_time', 'duration_minutes', 'room', 'max_marks', 'pass_marks',
] as const;

interface PaperFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamDetail;
  /** Omit to add. */
  paper?: ExamPaper | null;
}

/** `09:00` + 180 → `12:00`, so the end of the slot is visible while typing. */
function endTime(start: string, minutes: number): string | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(start);
  if (!match || !Number.isFinite(minutes)) return null;

  const total = Number(match[1]) * 60 + Number(match[2]) + minutes;
  if (total >= 24 * 60) return null;

  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function PaperFormModal({ isOpen, onClose, exam, paper = null }: PaperFormModalProps) {
  const isEdit = paper !== null;

  const addPaper = useAddPaper(exam.id);
  const updatePaper = useUpdatePaper(exam.id, paper?.id ?? 0);
  const mutation = isEdit ? updatePaper : addPaper;

  // The valid date window belongs to the exam, so the schema is built from it.
  const schema = useMemo(
    () => paperSchemaFor(exam.start_date, exam.end_date),
    [exam.start_date, exam.end_date],
  );

  const form = useForm<PaperInput>({
    resolver: zodResolver(schema),
    defaultValues: paper
      ? {
          class_id: paper.class_id,
          section_id: paper.section_id,
          subject_id: paper.subject_id,
          exam_date: paper.exam_date,
          start_time: paper.start_time,
          duration_minutes: paper.duration_minutes,
          room: paper.room ?? '',
          max_marks: paper.max_marks,
          pass_marks: paper.pass_marks,
        }
      : {
          class_id: 0,
          section_id: null,
          subject_id: 0,
          exam_date: exam.start_date,
          start_time: '09:00',
          duration_minutes: 180,
          room: '',
          max_marks: 100,
          pass_marks: 33,
        },
  });

  const classId = form.watch('class_id');
  const { classOptions, sectionOptions } = useClassOptions(classId);
  const { subjectOptions, isLoading: subjectsLoading } = useSubjectOptions();

  const start = form.watch('start_time');
  const duration = form.watch('duration_minutes');
  const finishes = endTime(start, duration);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: PaperInput) => {
    mutation.mutate(values, {
      onSuccess: handleClose,
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title={isEdit ? `Edit ${paper.subject_name} paper` : 'Schedule a paper'}
      description={`${exam.name} — ${formatDate(exam.start_date)} to ${formatDate(exam.end_date)}`}
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="paper-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add paper'}
          </Button>
        </>
      }
    >
      <Form id="paper-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormSelect<PaperInput>
            name="class_id"
            label="Class"
            options={classOptions}
            placeholder="Select a class"
            valueAsNumber
            required
          />
          <FormSelect<PaperInput>
            name="section_id"
            label="Section"
            options={sectionOptions}
            placeholder={classId ? 'All sections' : 'Select a class first'}
            disabled={sectionOptions.length === 0}
            valueAsNumber
            hint="Leave blank if the whole class sits together."
          />

          <FormSelect<PaperInput>
            name="subject_id"
            label="Subject"
            options={subjectOptions}
            placeholder={subjectsLoading ? 'Loading subjects…' : 'Select a subject'}
            valueAsNumber
            required
          />
          <FormInput<PaperInput>
            name="exam_date"
            type="date"
            label="Date"
            min={exam.start_date}
            max={exam.end_date}
            required
          />

          <FormInput<PaperInput>
            name="start_time"
            type="time"
            label="Starts at"
            hint={finishes ? `Finishes ${finishes}` : undefined}
            required
          />
          <FormSelect<PaperInput>
            name="duration_minutes"
            label="Duration"
            options={DURATION_OPTIONS}
            valueAsNumber
            required
          />

          <FormInput<PaperInput>
            name="max_marks"
            type="number"
            label="Maximum marks"
            min={1}
            required
          />
          <FormInput<PaperInput>
            name="pass_marks"
            type="number"
            label="Pass marks"
            min={0}
            hint="A student below this fails the subject."
            required
          />

          <FormInput<PaperInput>
            name="room"
            label="Room"
            placeholder="Hall A"
            hint="Optional"
          />
        </FormGrid>

        <Alert tone="info">
          A class cannot sit two papers at overlapping times. If this slot clashes with one
          already scheduled, saving will say so.
        </Alert>
      </Form>
    </Modal>
  );
}
