import { FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';

import { BLOOD_GROUP_OPTIONS } from '../../constants';
import type { StudentInput } from '../../schemas';

/**
 * Medical information. Every field is optional — a school cannot refuse
 * admission for want of a health record — but the emergency contact and
 * allergy fields are the ones staff actually reach for, so they lead.
 */
export function MedicalSection() {
  return (
    <div className="space-y-6">
      <Alert tone="info">
        All medical fields are optional. Anything recorded here appears on the student&apos;s
        profile for staff handling an emergency.
      </Alert>

      <section>
        <h3 className="text-sm font-semibold text-slate-900">Emergency contact</h3>
        <FormGrid cols={2} className="mt-3">
          <FormInput<StudentInput>
            name="medical.emergency_contact_name"
            label="Contact name"
            hint="Used when no guardian can be reached."
          />
          <FormInput<StudentInput>
            name="medical.emergency_contact_phone"
            type="tel"
            label="Contact phone"
          />
        </FormGrid>
      </section>

      <section className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold text-slate-900">Health</h3>
        <FormGrid cols={3} className="mt-3">
          <FormSelect<StudentInput>
            name="medical.blood_group"
            label="Blood group"
            options={BLOOD_GROUP_OPTIONS}
            placeholder="Not recorded"
          />
          <FormInput<StudentInput>
            name="medical.height_cm"
            label="Height (cm)"
            inputMode="decimal"
          />
          <FormInput<StudentInput>
            name="medical.weight_kg"
            label="Weight (kg)"
            inputMode="decimal"
          />

          <FormFullRow>
            <FormTextarea<StudentInput>
              name="medical.allergies"
              label="Allergies"
              rows={2}
              placeholder="Peanuts, penicillin…"
            />
          </FormFullRow>
          <FormFullRow>
            <FormTextarea<StudentInput>
              name="medical.chronic_conditions"
              label="Chronic conditions"
              rows={2}
              placeholder="Asthma, epilepsy…"
            />
          </FormFullRow>
          <FormFullRow>
            <FormTextarea<StudentInput>
              name="medical.medications"
              label="Regular medication"
              rows={2}
            />
          </FormFullRow>
        </FormGrid>
      </section>

      <section className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold text-slate-900">Family doctor</h3>
        <FormGrid cols={2} className="mt-3">
          <FormInput<StudentInput> name="medical.doctor_name" label="Doctor name" />
          <FormInput<StudentInput> name="medical.doctor_phone" type="tel" label="Doctor phone" />
          <FormFullRow>
            <FormTextarea<StudentInput>
              name="medical.notes"
              label="Additional notes"
              rows={3}
            />
          </FormFullRow>
        </FormGrid>
      </section>
    </div>
  );
}
