import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { useClassOptions } from '@/features/academics/hooks/useAcademics';
import { ageFrom } from '@/lib/format';

import {
  BLOOD_GROUP_OPTIONS,
  CATEGORY_OPTIONS,
  GENDER_OPTIONS,
  STATUS_OPTIONS,
} from '../../constants';
import type { StudentInput } from '../../schemas';

/** Personal details, enrolment and contact — the identity of the record. */
export function PersonalSection() {
  const form = useFormContext<StudentInput>();

  const classId = form.watch('class_id');
  const dateOfBirth = form.watch('date_of_birth');
  const { classOptions, sectionOptions, isLoading } = useClassOptions(classId);

  // A section from the previous class would be invalid for the new one.
  useEffect(() => {
    const current = form.getValues('section_id');
    if (current && !sectionOptions.some((option) => option.value === current)) {
      form.setValue('section_id', null, { shouldDirty: true });
    }
  }, [sectionOptions, form]);

  const age = ageFrom(dateOfBirth);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold text-slate-900">Personal details</h3>
        <FormGrid cols={3} className="mt-3">
          <FormInput<StudentInput> name="first_name" label="First name" required />
          <FormInput<StudentInput> name="middle_name" label="Middle name" hint="Optional" />
          <FormInput<StudentInput> name="last_name" label="Last name" required />

          <FormSelect<StudentInput>
            name="gender"
            label="Gender"
            options={GENDER_OPTIONS}
            required
          />
          <FormInput<StudentInput>
            name="date_of_birth"
            type="date"
            label="Date of birth"
            hint={age !== null ? `${age} years old` : undefined}
            required
          />
          <FormSelect<StudentInput>
            name="blood_group"
            label="Blood group"
            options={BLOOD_GROUP_OPTIONS}
            placeholder="Not recorded"
          />

          <FormSelect<StudentInput>
            name="category"
            label="Category"
            options={CATEGORY_OPTIONS}
            placeholder="Not specified"
          />
          <FormInput<StudentInput> name="religion" label="Religion" hint="Optional" />
          <FormInput<StudentInput> name="nationality" label="Nationality" hint="Optional" />

          <FormInput<StudentInput> name="mother_tongue" label="Mother tongue" hint="Optional" />
          <FormInput<StudentInput>
            name="aadhaar_no"
            label="Aadhaar number"
            inputMode="numeric"
            placeholder="12 digits"
            hint="Optional"
          />
        </FormGrid>
      </section>

      <section className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold text-slate-900">Enrolment</h3>
        <FormGrid cols={3} className="mt-3">
          <FormInput<StudentInput>
            name="admission_no"
            label="Admission number"
            placeholder="ADM-2025-001"
            required
          />
          <FormInput<StudentInput> name="roll_no" label="Roll number" hint="Optional" />
          <FormInput<StudentInput>
            name="admission_date"
            type="date"
            label="Admission date"
            required
          />

          <FormSelect<StudentInput>
            name="class_id"
            label="Class"
            options={classOptions}
            placeholder={isLoading ? 'Loading classes…' : 'Select a class'}
            valueAsNumber
            required
          />
          <FormSelect<StudentInput>
            name="section_id"
            label="Section"
            options={sectionOptions}
            placeholder={classId ? 'No section' : 'Select a class first'}
            disabled={sectionOptions.length === 0}
            valueAsNumber
          />
          <FormSelect<StudentInput>
            name="status"
            label="Status"
            options={STATUS_OPTIONS}
            required
          />
        </FormGrid>
      </section>

      <section className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          The student&apos;s own contact details. Parent contacts come next.
        </p>

        <FormGrid cols={2} className="mt-3">
          <FormInput<StudentInput> name="email" type="email" label="Email" hint="Optional" />
          <FormInput<StudentInput> name="phone" type="tel" label="Phone" hint="Optional" />
        </FormGrid>
      </section>

      <section className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold text-slate-900">Address</h3>
        <FormGrid cols={3} className="mt-3">
          <FormFullRow>
            <FormInput<StudentInput> name="address.line1" label="Address line 1" required />
          </FormFullRow>
          <FormFullRow>
            <FormInput<StudentInput> name="address.line2" label="Address line 2" hint="Optional" />
          </FormFullRow>

          <FormInput<StudentInput> name="address.city" label="City" required />
          <FormInput<StudentInput> name="address.state" label="State" required />
          <FormInput<StudentInput> name="address.postal_code" label="Postal code" required />
          <FormInput<StudentInput> name="address.country" label="Country" required />
        </FormGrid>
      </section>
    </div>
  );
}
