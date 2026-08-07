import { IdCard } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';

import {
  DEFAULT_DESIGNATIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  LICENCE_REQUIRED_TYPES,
  SHIFT_OPTIONS,
  STAFF_TYPE_LABELS,
  STAFF_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from '../constants';
import type { StaffInput } from '../schemas';
import type { StaffType } from '../types';

/**
 * Employment details, including the licence fields that only apply to
 * driving roles.
 *
 * Changing the staff type fills in the usual designation for it, but leaves
 * the field editable — schools name the same job differently.
 */
export function StaffEmploymentSection() {
  const form = useFormContext<StaffInput>();
  const staffType = form.watch('staff_type');
  const needsLicence = LICENCE_REQUIRED_TYPES.includes(staffType);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold text-slate-900">Employment</h3>
        <FormGrid cols={3} className="mt-3">
          <FormInput<StaffInput>
            name="employee_id"
            label="Employee ID"
            placeholder="STF-2025-001"
            required
          />
          <FormSelect<StaffInput>
            name="staff_type"
            label="Staff type"
            options={STAFF_TYPE_OPTIONS}
            required
            onChange={(event) => {
              const nextType = event.target.value as StaffType;
              const previousDefault = DEFAULT_DESIGNATIONS[staffType];

              // Only overwrite the designation if it is still the previous
              // type's default — never clobber something typed by hand.
              if (form.getValues('designation') === previousDefault) {
                form.setValue('designation', DEFAULT_DESIGNATIONS[nextType], {
                  shouldDirty: true,
                });
              }
            }}
          />
          <FormInput<StaffInput>
            name="designation"
            label="Designation"
            hint="Job title as it appears on their letter."
            required
          />

          <FormInput<StaffInput> name="joining_date" type="date" label="Joining date" required />
          <FormSelect<StaffInput>
            name="employment_type"
            label="Employment type"
            options={EMPLOYMENT_TYPE_OPTIONS}
            required
          />
          <FormSelect<StaffInput> name="shift" label="Shift" options={SHIFT_OPTIONS} required />

          <FormSelect<StaffInput> name="status" label="Status" options={STATUS_OPTIONS} required />
          <FormInput<StaffInput>
            name="reports_to"
            label="Reports to"
            placeholder="Administrator"
            hint="Optional"
          />
        </FormGrid>
      </section>

      {needsLicence && (
        <section className="border-t border-slate-200 pt-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <IdCard className="size-4 text-slate-400" aria-hidden />
            Driving licence
          </h3>

          <Alert tone="warning" className="mt-3">
            Required for {STAFF_TYPE_LABELS[staffType].toLowerCase()}s. An expired licence cannot
            be saved.
          </Alert>

          <FormGrid cols={2} className="mt-3">
            <FormInput<StaffInput>
              name="licence_number"
              label="Licence number"
              placeholder="KA0120150001234"
              required
            />
            <FormInput<StaffInput>
              name="licence_expiry"
              type="date"
              label="Valid until"
              required
            />
          </FormGrid>
        </section>
      )}

      <section className="border-t border-slate-200 pt-5">
        <FormGrid cols={1}>
          <FormFullRow>
            <FormTextarea<StaffInput>
              name="notes"
              label="Notes"
              rows={3}
              placeholder="Duties, assigned area, or anything else worth recording."
              hint="Optional"
            />
          </FormFullRow>
        </FormGrid>
      </section>
    </div>
  );
}
