import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { PersonSearch, type PersonResult } from '@/components/person/PersonSearch';
import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStaffList } from '@/features/staff/hooks/useStaff';
import { useStudents } from '@/features/students/hooks/useStudents';
import { useTeachers } from '@/features/teachers/hooks/useTeachers';
import { useDebounce } from '@/hooks/useDebounce';
import { applyServerErrors } from '@/lib/formErrors';
import { cn } from '@/lib/cn';
import { formatDate, todayInputValue } from '@/lib/format';
import type { Option } from '@/types/common';

import {
  APPLICANT_TYPE_LABELS,
  APPLICANT_TYPE_OPTIONS,
  DAY_PORTION_OPTIONS,
  LONG_LEAVE_DAYS,
  MAX_BACKDATED_DAYS,
} from '../constants';
import {
  useApplyForLeave,
  useBalance,
  useDaysPreview,
  useLeaveTypeCatalogue,
} from '../hooks/useLeave';
import { applicationSchema, type ApplicationInput } from '../schemas';
import type { ApplicantType } from '../types';

const FIELDS = [
  'applicant_type', 'applicant_id', 'leave_type_id',
  'from_date', 'to_date', 'day_portion', 'reason', 'document_name',
] as const;

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Preselected when applying from a filtered register. */
  defaultApplicantType?: ApplicantType;
}

const today = () => todayInputValue();

/**
 * File a leave application.
 *
 * The applicant is chosen first because everything after it depends on them:
 * which leave types they may ask for, and what balance they have left. The
 * day count is asked of the API as the dates are picked — holidays and
 * weekends come out, so a "week off" over the mid-term break costs two days,
 * and knowing that before applying is worth more than finding it in a balance
 * afterwards.
 */
export function ApplyModal({
  isOpen,
  onClose,
  defaultApplicantType = 'student',
}: ApplyModalProps) {
  const apply = useApplyForLeave();
  const { forApplicant } = useLeaveTypeCatalogue();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [chosen, setChosen] = useState<{ id: number; name: string } | null>(null);

  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      applicant_type: defaultApplicantType,
      applicant_id: 0,
      leave_type_id: 0,
      from_date: today(),
      to_date: today(),
      day_portion: 'full',
      reason: '',
      document_name: '',
    },
  });

  const applicantType = form.watch('applicant_type');
  const leaveTypeId = form.watch('leave_type_id');
  const fromDate = form.watch('from_date');
  const toDate = form.watch('to_date');
  const dayPortion = form.watch('day_portion');

  // One roster query each; only the chosen one is enabled.
  const canSearch = debouncedSearch.trim().length >= 2;
  const students = useStudents({
    search: debouncedSearch,
    per_page: 8,
    status: 'active',
  });
  const teachers = useTeachers({ search: debouncedSearch, per_page: 8, status: 'active' });
  const staff = useStaffList({ search: debouncedSearch, per_page: 8, status: 'active' });

  const roster = applicantType === 'student' ? students : applicantType === 'teacher' ? teachers : staff;

  const personResults = useMemo<PersonResult[]>(() => {
    if (!canSearch) return [];

    if (applicantType === 'student') {
      return (students.data?.data ?? []).map((student) => ({
        key: String(student.id),
        name: student.full_name,
        photoUrl: student.photo_url,
        identifier: student.admission_no,
        detail: `${student.class_name}${student.section_name ? ` — ${student.section_name}` : ''}`,
      }));
    }

    const rows = applicantType === 'teacher' ? (teachers.data?.data ?? []) : (staff.data?.data ?? []);

    return rows.map((person) => ({
      key: String(person.id),
      name: person.full_name,
      photoUrl: person.photo_url,
      identifier: person.employee_id,
      detail: person.designation,
    }));
  }, [applicantType, canSearch, students.data, teachers.data, staff.data]);

  const typeOptions = useMemo<Option<number>[]>(
    () =>
      forApplicant(applicantType).map((type) => ({
        label: type.annual_quota === null ? type.name : `${type.name} (${type.annual_quota} days)`,
        value: type.id,
      })),
    [forApplicant, applicantType],
  );

  const leaveType = forApplicant(applicantType).find((type) => type.id === leaveTypeId) ?? null;

  const { data: preview, isFetching: previewLoading } = useDaysPreview(
    fromDate,
    toDate,
    applicantType,
    dayPortion,
  );
  const { data: balance } = useBalance(chosen ? applicantType : null, chosen?.id ?? null);

  const entitlement = balance?.entitlements.find((entry) => entry.leave_type_id === leaveTypeId);

  // Switching roster invalidates both the person and the leave type.
  useEffect(() => {
    setChosen(null);
    setSearch('');
    form.setValue('applicant_id', 0);
    form.setValue('leave_type_id', 0);
  }, [applicantType, form]);

  const isBackdated = fromDate < today();
  const backdatedTooFar =
    isBackdated &&
    Math.round((Date.parse(today()) - Date.parse(fromDate)) / 86_400_000) > MAX_BACKDATED_DAYS;

  const days = preview?.days ?? 0;
  const overBalance =
    entitlement?.available !== null && entitlement?.available !== undefined
      ? days > entitlement.available
      : false;

  const handleClose = () => {
    form.reset();
    setSearch('');
    setChosen(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title="Apply for leave"
      description="Choose who it is for — that decides which leave they may ask for."
      closeOnOverlayClick={!apply.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={apply.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="leave-form"
            isLoading={apply.isPending}
            disabled={chosen === null}
          >
            File application
          </Button>
        </>
      }
    >
      <Form
        id="leave-form"
        form={form}
        onSubmit={(values) =>
          apply.mutate(values, {
            onSuccess: handleClose,
            onError: (error) => {
              if (applyServerErrors(error, form.setError, FIELDS)) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        <FormGrid cols={2}>
          <FormSelect<ApplicationInput>
            name="applicant_type"
            label="Applicant"
            options={APPLICANT_TYPE_OPTIONS}
            required
          />
          <FormSelect<ApplicationInput>
            name="leave_type_id"
            label="Leave type"
            options={typeOptions}
            placeholder={
              typeOptions.length === 0
                ? `No leave type applies to a ${APPLICANT_TYPE_LABELS[applicantType].toLowerCase()}`
                : 'Choose a type'
            }
            disabled={typeOptions.length === 0}
            valueAsNumber
            required
          />
        </FormGrid>

        <PersonSearch
          label={APPLICANT_TYPE_LABELS[applicantType]}
          placeholder="Name or identifier…"
          value={search}
          onChange={(value) => {
            setSearch(value);
            if (chosen) {
              setChosen(null);
              form.setValue('applicant_id', 0);
            }
          }}
          results={personResults}
          isLoading={roster.isLoading}
          onSelect={(result) => {
            const id = Number(result.key);
            setChosen({ id, name: result.name });
            setSearch(result.name);
            form.setValue('applicant_id', id, { shouldValidate: true });
          }}
        />

        <FormGrid cols={3}>
          <FormInput<ApplicationInput> name="from_date" type="date" label="From" required />
          <FormInput<ApplicationInput>
            name="to_date"
            type="date"
            label="To"
            min={fromDate}
            required
          />
          <FormSelect<ApplicationInput>
            name="day_portion"
            label="Portion"
            options={DAY_PORTION_OPTIONS}
            disabled={fromDate !== toDate}
            hint={fromDate !== toDate ? 'Half days apply to one date.' : undefined}
            required
          />

          <FormFullRow>
            <FormTextarea<ApplicationInput>
              name="reason"
              label="Reason"
              rows={3}
              placeholder="Family function out of town"
              required
            />
          </FormFullRow>

          {leaveType?.requires_document && (
            <FormFullRow>
              <FormInput<ApplicationInput>
                name="document_name"
                label="Supporting document"
                placeholder="medical-certificate.pdf"
                hint={`${leaveType.name} normally comes with one.`}
              />
            </FormFullRow>
          )}
        </FormGrid>

        {previewLoading && !preview ? (
          <Skeleton className="h-16 w-full" />
        ) : preview ? (
          <div
            className={cn(
              'rounded-lg border p-3',
              overBalance ? 'border-red-200 bg-red-50/60' : 'border-slate-200 bg-slate-50',
            )}
          >
            <p className="text-sm">
              <span className="font-semibold text-slate-900">
                {preview.days} working day{preview.days === 1 ? '' : 's'}
              </span>
              {preview.excluded.length > 0 && (
                <span className="text-slate-500">
                  {' '}
                  — {preview.excluded.length} day{preview.excluded.length === 1 ? '' : 's'}{' '}
                  excluded as holidays or weekends
                </span>
              )}
            </p>

            {preview.excluded.length > 0 && (
              <p className="mt-1 truncate text-xs text-slate-500">
                {preview.excluded.slice(0, 4).map((date) => formatDate(date)).join(', ')}
                {preview.excluded.length > 4 && ` and ${preview.excluded.length - 4} more`}
              </p>
            )}

            {entitlement && entitlement.available !== null && (
              <p className="mt-1.5 text-xs">
                <Badge tone={overBalance ? 'danger' : 'success'}>
                  {entitlement.available} of {entitlement.quota} days left
                </Badge>
                {entitlement.pending > 0 && (
                  <span className="ml-2 text-slate-500">
                    ({entitlement.pending} already awaiting a decision)
                  </span>
                )}
              </p>
            )}
          </div>
        ) : null}

        {preview?.days === 0 && (
          <Alert tone="warning" title="That range has no working days in it">
            Every day of it is a holiday or a weekend, so there is no leave to grant.
          </Alert>
        )}

        {overBalance && entitlement && (
          <Alert tone="danger" title="Not enough balance">
            {chosen?.name} has {entitlement.available} day
            {entitlement.available === 1 ? '' : 's'} of {entitlement.leave_type_name} left and
            this request is for {days}.
          </Alert>
        )}

        {isBackdated && leaveType && !leaveType.allows_backdated && (
          <Alert tone="danger" title="This type cannot be backdated">
            {leaveType.name} has to be applied for in advance. Sick leave is the usual exception.
          </Alert>
        )}

        {backdatedTooFar && (
          <Alert tone="warning" title="That is a long way back">
            More than {MAX_BACKDATED_DAYS} days ago. A request this old is tidying a register
            rather than reporting an absence.
          </Alert>
        )}

        {days > LONG_LEAVE_DAYS && (
          <Alert tone="info">
            {days} days is a long stretch — it will stand out in the approval queue.
          </Alert>
        )}

        {leaveType?.max_consecutive_days !== null &&
          leaveType !== null &&
          days > (leaveType.max_consecutive_days ?? Infinity) && (
            <Alert tone="danger" title="Longer than this type allows">
              {leaveType.name} is capped at {leaveType.max_consecutive_days} consecutive days.
            </Alert>
          )}
      </Form>
    </Modal>
  );
}
