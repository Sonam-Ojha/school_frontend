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
import { formatTime } from '@/lib/time';

import { TRIP_FARE_MULTIPLIER, TRIP_OPTIONS } from '../constants';
import { useAssignStudent } from '../hooks/useTransport';
import { assignmentSchema, type AssignmentInput } from '../schemas';
import type { RouteDetail } from '../types';

const FIELDS = ['student_id', 'route_id', 'stop_id', 'trip', 'start_date'] as const;

interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteDetail;
}

export function AssignStudentModal({ isOpen, onClose, route }: AssignStudentModalProps) {
  const assign = useAssignStudent();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [chosen, setChosen] = useState<{ id: number; name: string } | null>(null);

  const { data: results, isLoading: isSearching } = useStudents({
    search: debouncedSearch,
    per_page: 8,
    status: 'active',
  });

  const form = useForm<AssignmentInput>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      student_id: 0,
      route_id: route.id,
      stop_id: route.stops[0]?.id ?? 0,
      trip: 'both',
      start_date: todayInputValue(),
    },
  });

  const stopId = form.watch('stop_id');
  const trip = form.watch('trip');

  const stop = route.stops.find((entry) => entry.id === stopId) ?? null;
  const fare = stop ? stop.fare * TRIP_FARE_MULTIPLIER[trip] : 0;

  const stopOptions = useMemo(
    () =>
      [...route.stops]
        .sort((left, right) => left.sequence - right.sequence)
        .map((entry) => ({
          label: `${entry.sequence}. ${entry.name} — ${formatTime(entry.pickup_time)}`,
          value: entry.id,
        })),
    [route.stops],
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

  const isFull = route.seats_available <= 0;

  const handleClose = () => {
    form.reset();
    setSearch('');
    setChosen(null);
    onClose();
  };

  const onSubmit = (values: AssignmentInput) => {
    assign.mutate(values, {
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
      title="Put a student on this route"
      description={`${route.code} — ${route.name}`}
      closeOnOverlayClick={!assign.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={assign.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="assign-form"
            isLoading={assign.isPending}
            disabled={chosen === null || isFull}
          >
            Assign
          </Button>
        </>
      }
    >
      <Form id="assign-form" form={form} onSubmit={onSubmit}>
        {isFull ? (
          <Alert tone="danger" title="This route is full">
            Every seat on {route.vehicle_name ?? 'the assigned bus'} is taken. Move somebody off,
            or put a larger bus on the route.
          </Alert>
        ) : (
          <Alert tone="info">
            {route.seats_available} seat{route.seats_available === 1 ? '' : 's'} left of{' '}
            {route.capacity}.
          </Alert>
        )}

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
            const id = Number(result.key);
            setChosen({ id, name: result.name });
            setSearch(result.name);
            form.setValue('student_id', id, { shouldValidate: true });
          }}
        />

        <FormGrid cols={2}>
          <FormSelect<AssignmentInput>
            name="stop_id"
            label="Boards at"
            options={stopOptions}
            placeholder={stopOptions.length === 0 ? 'This route has no stops yet' : 'Choose a stop'}
            disabled={stopOptions.length === 0}
            valueAsNumber
            required
          />
          <FormSelect<AssignmentInput>
            name="trip"
            label="Trips taken"
            options={TRIP_OPTIONS}
            required
          />

          <FormInput<AssignmentInput>
            name="start_date"
            type="date"
            label="From"
            required
          />
        </FormGrid>

        {stop && (
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="text-slate-600">
              {stop.name} · pickup {formatTime(stop.pickup_time)} · drop{' '}
              {formatTime(stop.drop_time)}
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {formatCurrency(fare)} a month
              {trip !== 'both' && (
                <span className="ml-1 text-xs font-normal text-slate-500">
                  (half of {formatCurrency(stop.fare)} — one way)
                </span>
              )}
            </p>
          </div>
        )}
      </Form>
    </Modal>
  );
}
