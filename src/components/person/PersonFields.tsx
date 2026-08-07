import type { FieldValues } from 'react-hook-form';

import { FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import type { Option } from '@/types/common';

/**
 * Field groups shared by every person-shaped form (teachers, staff, and any
 * future personnel module).
 *
 * These rely on the field names being identical across schemas — `first_name`,
 * `address.city`, and so on — which is exactly why the shared validation
 * fragments in `lib/validation.ts` exist. Modules keep their own section
 * wrappers and headings; only the repeated fields live here.
 */

const GENDER_OPTIONS: Option[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const MARITAL_STATUS_OPTIONS: Option[] = [
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Prefer not to say', value: 'other' },
];

const BLOOD_GROUP_OPTIONS: Option[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
  (group) => ({ label: group, value: group }),
);

interface PersonalDetailsFieldsProps {
  /** Age derived from the watched date of birth, shown as a hint. */
  ageHint?: string;
  /** Government ID fields are irrelevant for some records. */
  includeGovernmentIds?: boolean;
}

/** Name, gender, date of birth and personal identifiers. */
export function PersonalDetailsFields<TFieldValues extends FieldValues = FieldValues>({
  ageHint,
  includeGovernmentIds = true,
}: PersonalDetailsFieldsProps) {
  return (
    <FormGrid cols={3}>
      <FormInput<TFieldValues> name={'first_name' as never} label="First name" required />
      <FormInput<TFieldValues> name={'middle_name' as never} label="Middle name" hint="Optional" />
      <FormInput<TFieldValues> name={'last_name' as never} label="Last name" required />

      <FormSelect<TFieldValues>
        name={'gender' as never}
        label="Gender"
        options={GENDER_OPTIONS}
        required
      />
      <FormInput<TFieldValues>
        name={'date_of_birth' as never}
        type="date"
        label="Date of birth"
        hint={ageHint}
        required
      />
      <FormSelect<TFieldValues>
        name={'blood_group' as never}
        label="Blood group"
        options={BLOOD_GROUP_OPTIONS}
        placeholder="Not recorded"
      />

      <FormSelect<TFieldValues>
        name={'marital_status' as never}
        label="Marital status"
        options={MARITAL_STATUS_OPTIONS}
        placeholder="Not specified"
      />
      <FormInput<TFieldValues> name={'nationality' as never} label="Nationality" hint="Optional" />

      {includeGovernmentIds && (
        <>
          <FormInput<TFieldValues>
            name={'aadhaar_no' as never}
            label="Aadhaar number"
            inputMode="numeric"
            placeholder="12 digits"
            hint="Optional"
          />
          <FormInput<TFieldValues>
            name={'pan_no' as never}
            label="PAN"
            placeholder="ABCDE1234F"
            hint="Optional — required for payroll."
          />
        </>
      )}
    </FormGrid>
  );
}

interface ContactFieldsProps {
  emailHint?: string;
  /** Some records only ever need one number. */
  includeAlternatePhone?: boolean;
}

/** Email, phone numbers and the emergency contact. */
export function ContactFields<TFieldValues extends FieldValues = FieldValues>({
  emailHint,
  includeAlternatePhone = true,
}: ContactFieldsProps) {
  return (
    <FormGrid cols={3}>
      <FormInput<TFieldValues>
        name={'email' as never}
        type="email"
        label="Email"
        hint={emailHint}
        required
      />
      <FormInput<TFieldValues> name={'phone' as never} type="tel" label="Phone" required />
      {includeAlternatePhone && (
        <FormInput<TFieldValues>
          name={'alternate_phone' as never}
          type="tel"
          label="Alternate phone"
          hint="Optional"
        />
      )}

      <FormInput<TFieldValues>
        name={'emergency_contact_name' as never}
        label="Emergency contact"
        hint="Optional"
      />
      <FormInput<TFieldValues>
        name={'emergency_contact_phone' as never}
        type="tel"
        label="Emergency phone"
        hint="Optional"
      />
    </FormGrid>
  );
}

/** Postal address, matching the shared `addressSchema`. */
export function AddressFields<TFieldValues extends FieldValues = FieldValues>() {
  return (
    <FormGrid cols={3}>
      <FormFullRow>
        <FormInput<TFieldValues> name={'address.line1' as never} label="Address line 1" required />
      </FormFullRow>
      <FormFullRow>
        <FormInput<TFieldValues>
          name={'address.line2' as never}
          label="Address line 2"
          hint="Optional"
        />
      </FormFullRow>

      <FormInput<TFieldValues> name={'address.city' as never} label="City" required />
      <FormInput<TFieldValues> name={'address.state' as never} label="State" required />
      <FormInput<TFieldValues> name={'address.postal_code' as never} label="Postal code" required />
      <FormInput<TFieldValues> name={'address.country' as never} label="Country" required />
    </FormGrid>
  );
}
