import { FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { ageFrom } from '@/lib/format';
import { useFormContext } from 'react-hook-form';

import {
  BLOOD_GROUP_OPTIONS,
  DEPARTMENT_OPTIONS,
  DESIGNATION_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  STATUS_OPTIONS,
} from '../../constants';
import type { TeacherInput } from '../../schemas';

/** Identity, contact and employment — the core of the record. */
export function TeacherPersonalSection() {
  const form = useFormContext<TeacherInput>();
  const age = ageFrom(form.watch('date_of_birth'));

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold text-slate-900">Personal details</h3>
        <FormGrid cols={3} className="mt-3">
          <FormInput<TeacherInput> name="first_name" label="First name" required />
          <FormInput<TeacherInput> name="middle_name" label="Middle name" hint="Optional" />
          <FormInput<TeacherInput> name="last_name" label="Last name" required />

          <FormSelect<TeacherInput> name="gender" label="Gender" options={GENDER_OPTIONS} required />
          <FormInput<TeacherInput>
            name="date_of_birth"
            type="date"
            label="Date of birth"
            hint={age !== null ? `${age} years old` : undefined}
            required
          />
          <FormSelect<TeacherInput>
            name="blood_group"
            label="Blood group"
            options={BLOOD_GROUP_OPTIONS}
            placeholder="Not recorded"
          />

          <FormSelect<TeacherInput>
            name="marital_status"
            label="Marital status"
            options={MARITAL_STATUS_OPTIONS}
            placeholder="Not specified"
          />
          <FormInput<TeacherInput> name="nationality" label="Nationality" hint="Optional" />
          <FormInput<TeacherInput>
            name="aadhaar_no"
            label="Aadhaar number"
            inputMode="numeric"
            placeholder="12 digits"
            hint="Optional"
          />

          <FormInput<TeacherInput>
            name="pan_no"
            label="PAN"
            placeholder="ABCDE1234F"
            hint="Optional — required for payroll."
          />
        </FormGrid>
      </section>

      <section className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold text-slate-900">Employment</h3>
        <FormGrid cols={3} className="mt-3">
          <FormInput<TeacherInput>
            name="employee_id"
            label="Employee ID"
            placeholder="EMP-2025-001"
            required
          />
          <FormSelect<TeacherInput>
            name="designation"
            label="Designation"
            options={DESIGNATION_OPTIONS}
            required
          />
          <FormSelect<TeacherInput>
            name="department"
            label="Department"
            options={DEPARTMENT_OPTIONS}
            placeholder="Not assigned"
          />

          <FormInput<TeacherInput>
            name="joining_date"
            type="date"
            label="Joining date"
            required
          />
          <FormSelect<TeacherInput>
            name="employment_type"
            label="Employment type"
            options={EMPLOYMENT_TYPE_OPTIONS}
            required
          />
          <FormSelect<TeacherInput> name="status" label="Status" options={STATUS_OPTIONS} required />

          <FormInput<TeacherInput>
            name="highest_qualification"
            label="Highest qualification"
            placeholder="M.Sc. Physics"
            hint="Shown on the roster. Full list under Qualifications."
          />
        </FormGrid>
      </section>

      <section className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
        <FormGrid cols={3} className="mt-3">
          <FormInput<TeacherInput>
            name="email"
            type="email"
            label="Email"
            hint="Used to sign in once an account is created."
            required
          />
          <FormInput<TeacherInput> name="phone" type="tel" label="Phone" required />
          <FormInput<TeacherInput>
            name="alternate_phone"
            type="tel"
            label="Alternate phone"
            hint="Optional"
          />

          <FormInput<TeacherInput>
            name="emergency_contact_name"
            label="Emergency contact"
            hint="Optional"
          />
          <FormInput<TeacherInput>
            name="emergency_contact_phone"
            type="tel"
            label="Emergency phone"
            hint="Optional"
          />
        </FormGrid>
      </section>

      <section className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold text-slate-900">Address</h3>
        <FormGrid cols={3} className="mt-3">
          <FormFullRow>
            <FormInput<TeacherInput> name="address.line1" label="Address line 1" required />
          </FormFullRow>
          <FormFullRow>
            <FormInput<TeacherInput> name="address.line2" label="Address line 2" hint="Optional" />
          </FormFullRow>

          <FormInput<TeacherInput> name="address.city" label="City" required />
          <FormInput<TeacherInput> name="address.state" label="State" required />
          <FormInput<TeacherInput> name="address.postal_code" label="Postal code" required />
          <FormInput<TeacherInput> name="address.country" label="Country" required />
        </FormGrid>
      </section>
    </div>
  );
}
