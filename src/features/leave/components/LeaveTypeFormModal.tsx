import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';

import { APPLICANT_TYPE_LABELS, APPLICANT_TYPE_OPTIONS } from '../constants';
import { useCreateLeaveType, useUpdateLeaveType } from '../hooks/useLeave';
import { leaveTypeSchema, type LeaveTypeInput } from '../schemas';
import type { LeaveType } from '../types';

const FIELDS = [
  'name', 'code', 'applies_to', 'annual_quota', 'is_paid',
  'requires_document', 'allows_backdated', 'max_consecutive_days', 'is_active',
] as const;

interface LeaveTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Null to add a new one. */
  leaveType: LeaveType | null;
}

const emptyValues: LeaveTypeInput = {
  name: '',
  code: '',
  applies_to: ['teacher', 'staff'],
  annual_quota: '',
  is_paid: true,
  requires_document: false,
  allows_backdated: false,
  max_consecutive_days: '',
  is_active: true,
};

const toValues = (type: LeaveType): LeaveTypeInput => ({
  name: type.name,
  code: type.code,
  applies_to: type.applies_to,
  annual_quota: type.annual_quota === null ? '' : String(type.annual_quota),
  is_paid: type.is_paid,
  requires_document: type.requires_document,
  allows_backdated: type.allows_backdated,
  max_consecutive_days:
    type.max_consecutive_days === null ? '' : String(type.max_consecutive_days),
  is_active: type.is_active,
});

/**
 * Add or edit a kind of leave.
 *
 * `applies_to` is a checkbox group rather than a picker because it is the
 * field that shapes every form downstream: a maternity type students could
 * request would be a dropdown full of nonsense.
 */
export function LeaveTypeFormModal({ isOpen, onClose, leaveType }: LeaveTypeFormModalProps) {
  const isEdit = leaveType !== null;
  const create = useCreateLeaveType();
  const update = useUpdateLeaveType(leaveType?.id ?? 0);
  const mutation = isEdit ? update : create;

  const form = useForm<LeaveTypeInput>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: leaveType ? toValues(leaveType) : emptyValues,
  });

  useEffect(() => {
    if (isOpen) form.reset(leaveType ? toValues(leaveType) : emptyValues);
  }, [isOpen, leaveType, form]);

  const quota = form.watch('annual_quota');
  const appliesTo = form.watch('applies_to');
  const appliesToError = form.formState.errors.applies_to?.message;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title={isEdit ? `Edit ${leaveType.name}` : 'Add a leave type'}
      description="The rules here decide what the application form will and will not allow."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="leave-type-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add leave type'}
          </Button>
        </>
      }
    >
      <Form
        id="leave-type-form"
        form={form}
        onSubmit={(values) =>
          mutation.mutate(values, {
            onSuccess: handleClose,
            onError: (error) => {
              if (applyServerErrors(error, form.setError, FIELDS)) return;
              form.setError('root.serverError', { type: 'server', message: error.message });
            },
          })
        }
      >
        <FormGrid cols={2}>
          <FormInput<LeaveTypeInput>
            name="name"
            label="Name"
            placeholder="Casual leave"
            required
          />
          <FormInput<LeaveTypeInput>
            name="code"
            label="Code"
            placeholder="CL"
            hint="Short, for the register."
            className="uppercase"
            required
          />
        </FormGrid>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">
            Who may apply for it <span className="text-red-600">*</span>
          </legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {APPLICANT_TYPE_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                id={`applies-${option.value}`}
                value={option.value}
                label={option.label}
                {...form.register('applies_to')}
              />
            ))}
          </div>
          {appliesToError && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
              {appliesToError}
            </p>
          )}
        </fieldset>

        <FormGrid cols={2}>
          {/* Held as strings — a blank numeric input yields NaN, not null. */}
          <FormInput<LeaveTypeInput>
            name="annual_quota"
            inputMode="numeric"
            label="Days a year"
            placeholder="12"
            hint="Leave blank for a type with no entitlement behind it."
          />
          <FormInput<LeaveTypeInput>
            name="max_consecutive_days"
            inputMode="numeric"
            label="Longest single stretch"
            placeholder="No limit"
            hint="Blank for no limit."
          />

          <FormFullRow>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormCheckbox<LeaveTypeInput>
                name="is_paid"
                label="Paid"
                description="Unpaid leave still shows on the report, marked as such."
              />
              <FormCheckbox<LeaveTypeInput>
                name="requires_document"
                label="Needs a document"
                description="A medical certificate, say. Prompted for, not enforced."
              />
              <FormCheckbox<LeaveTypeInput>
                name="allows_backdated"
                label="May be applied for afterwards"
                description="Sick leave has to be — nobody files before falling ill."
              />
              <FormCheckbox<LeaveTypeInput>
                name="is_active"
                label="Available"
                description="Turning this off hides it from new applications."
              />
            </div>
          </FormFullRow>
        </FormGrid>

        {quota.trim() === '' && (
          <Alert tone="info">
            With no quota there is no balance to run down — every application is simply judged on
            its merits. That is how student leave normally works.
          </Alert>
        )}

        {appliesTo.includes('student') && quota.trim() !== '' && (
          <Alert tone="warning" title="A quota for students?">
            Students are usually granted leave on the reason rather than a yearly allowance.
            Leaving the quota blank avoids refusing a genuinely ill child on a technicality.
          </Alert>
        )}

        {isEdit && leaveType.applications_count > 0 && (
          <Alert tone="warning">
            {leaveType.applications_count} application
            {leaveType.applications_count === 1 ? ' uses' : 's use'} this type. Changing the quota
            re-prices everybody&rsquo;s balance; it does not reopen decisions already made.
          </Alert>
        )}

        {isEdit &&
          leaveType.applies_to.some((type) => !appliesTo.includes(type)) && (
            <Alert tone="warning" title="You are narrowing who may apply">
              {leaveType.applies_to
                .filter((type) => !appliesTo.includes(type))
                .map((type) => APPLICANT_TYPE_LABELS[type])
                .join(' and ')}{' '}
              will no longer see this type. Applications already filed are left alone.
            </Alert>
          )}
      </Form>
    </Modal>
  );
}
