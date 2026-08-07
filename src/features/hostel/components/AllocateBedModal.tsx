import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { PersonSearch, type PersonResult } from '@/components/person/PersonSearch';
import { Form, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useStudents } from '@/features/students/hooks/useStudents';
import { useDebounce } from '@/hooks/useDebounce';
import { applyServerErrors } from '@/lib/formErrors';
import { formatCurrency, todayInputValue } from '@/lib/format';
import type { Option } from '@/types/common';

import {
  GENDER_FOR_HOSTEL,
  HOSTEL_TYPE_LABELS,
  MESS_PLAN_OPTIONS,
  messChargeFor,
} from '../constants';
import { useAllocateBed, useHostels, useVacancies } from '../hooks/useHostel';
import { allocationSchema, type AllocationInput } from '../schemas';
import type { MessPlan } from '../types';

const FIELDS = ['student_id', 'hostel_id', 'room_id', 'bed_id', 'mess_plan', 'allocated_on'] as const;

interface AllocateBedModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Preselected when allocating from a hostel's own screen. */
  defaultHostelId?: number | null;
}

/**
 * Put a student in a bed.
 *
 * The hostel is chosen first because it decides everything after it: which
 * students are eligible (a boys' block takes boys), which rooms have a free
 * bed, and what the mess costs. Narrowing the pickers is the point — a
 * refusal after the fact would be a scolding.
 */
export function AllocateBedModal({
  isOpen,
  onClose,
  defaultHostelId = null,
}: AllocateBedModalProps) {
  const allocate = useAllocateBed();
  const { hostels, hostelOptions } = useHostels();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [chosen, setChosen] = useState<string | null>(null);

  const form = useForm<AllocationInput>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      student_id: 0,
      hostel_id: defaultHostelId ?? 0,
      room_id: 0,
      bed_id: 0,
      mess_plan: 'full',
      allocated_on: todayInputValue(),
    },
  });

  const hostelId = form.watch('hostel_id');
  const roomId = form.watch('room_id');
  const messPlan = form.watch('mess_plan');

  const hostel = hostels.find((entry) => entry.id === hostelId) ?? null;
  const { data: rooms, isLoading: vacanciesLoading } = useVacancies(hostelId || null);

  // Only students of the block's gender are offered — the rule is applied by
  // the search, not by a message after the save.
  const { data: results, isLoading: isSearching } = useStudents({
    search: debouncedSearch,
    per_page: 8,
    status: 'active',
    ...(hostel ? { gender: GENDER_FOR_HOSTEL[hostel.type] } : {}),
  });

  const roomOptions = useMemo<Option<number>[]>(
    () =>
      (rooms ?? []).map((room) => ({
        label: `${room.room_no} — ${room.available_beds} free · ${formatCurrency(room.monthly_rent)}`,
        value: room.id,
      })),
    [rooms],
  );

  const room = (rooms ?? []).find((entry) => entry.id === roomId) ?? null;

  const bedOptions = useMemo<Option<number>[]>(
    () =>
      (room?.beds ?? [])
        .filter((bed) => bed.status === 'vacant')
        .map((bed) => ({ label: `Bed ${bed.bed_no}`, value: bed.id })),
    [room],
  );

  const personResults = useMemo<PersonResult[]>(
    () =>
      (results?.data ?? []).map((student) => ({
        key: String(student.id),
        name: student.full_name,
        photoUrl: student.photo_url,
        identifier: student.admission_no,
        detail: `${student.class_name}${student.section_name ? ` — ${student.section_name}` : ''}`,
      })),
    [results],
  );

  const rent = room?.monthly_rent ?? 0;
  const mess = hostel ? messChargeFor(messPlan as MessPlan, hostel.mess_charge) : 0;

  const handleClose = () => {
    form.reset();
    setSearch('');
    setChosen(null);
    onClose();
  };

  const onSubmit = (values: AllocationInput) => {
    allocate.mutate(values, {
      onSuccess: handleClose,
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  const noVacancy = hostelId > 0 && !vacanciesLoading && roomOptions.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Allocate a bed"
      description="Choose the block first — it decides who is eligible and what it costs."
      closeOnOverlayClick={!allocate.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={allocate.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="allocate-form"
            isLoading={allocate.isPending}
            disabled={chosen === null || noVacancy}
          >
            Allocate
          </Button>
        </>
      }
    >
      <Form id="allocate-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormSelect<AllocationInput>
            name="hostel_id"
            label="Hostel"
            options={hostelOptions}
            placeholder="Select a hostel"
            valueAsNumber
            onChange={() => {
              // The rooms and beds below belong to the old block.
              form.setValue('room_id', 0);
              form.setValue('bed_id', 0);
              setChosen(null);
              form.setValue('student_id', 0);
              setSearch('');
            }}
            required
          />
          <FormInput<AllocationInput>
            name="allocated_on"
            type="date"
            label="From"
            required
          />
        </FormGrid>

        {hostel && (
          <PersonSearch
            label="Student"
            placeholder="Name or admission number…"
            value={search}
            onChange={(value) => {
              setSearch(value);
              if (chosen) {
                setChosen(null);
                form.setValue('student_id', 0);
              }
            }}
            results={personResults}
            isLoading={isSearching}
            onSelect={(result) => {
              setChosen(result.key);
              setSearch(result.name);
              form.setValue('student_id', Number(result.key), { shouldValidate: true });
            }}
            hint={`Only ${HOSTEL_TYPE_LABELS[hostel.type].toLowerCase()} students are listed — this is a ${HOSTEL_TYPE_LABELS[hostel.type].toLowerCase()} block.`}
          />
        )}

        <FormGrid cols={2}>
          <FormSelect<AllocationInput>
            name="room_id"
            label="Room"
            options={roomOptions}
            placeholder={
              !hostelId
                ? 'Choose a hostel first'
                : vacanciesLoading
                  ? 'Finding free beds…'
                  : roomOptions.length === 0
                    ? 'No free beds'
                    : 'Choose a room'
            }
            disabled={roomOptions.length === 0}
            valueAsNumber
            onChange={() => form.setValue('bed_id', 0)}
            required
          />
          <FormSelect<AllocationInput>
            name="bed_id"
            label="Bed"
            options={bedOptions}
            placeholder={roomId ? 'Choose a bed' : 'Choose a room first'}
            disabled={bedOptions.length === 0}
            valueAsNumber
            required
          />

          <FormSelect<AllocationInput>
            name="mess_plan"
            label="Mess plan"
            options={MESS_PLAN_OPTIONS}
            required
          />
        </FormGrid>

        {noVacancy && (
          <Alert tone="warning" title="This block is full">
            Every bed is taken. Free one up, or add rooms to the block.
          </Alert>
        )}

        {room && hostel && (
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="text-slate-600">
              Room {room.room_no} · {formatCurrency(rent)} rent + {formatCurrency(mess)} mess
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {formatCurrency(rent + mess)} a month
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Raised against the hostel fee head on the student's fee account.
            </p>
          </div>
        )}
      </Form>
    </Modal>
  );
}
