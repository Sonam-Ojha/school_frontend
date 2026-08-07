import { FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';

import { BOARD_OPTIONS } from '../../constants';
import type { StudentInput } from '../../schemas';

/**
 * Previous school details — optional throughout, since a student entering at
 * the first grade has none.
 */
export function PreviousSchoolSection() {
  return (
    <div className="space-y-5">
      <Alert tone="info">
        Leave this section blank for students joining at the entry grade.
      </Alert>

      <FormGrid cols={3}>
        <FormFullRow>
          <FormInput<StudentInput>
            name="previous_school.school_name"
            label="School name"
            placeholder="Previous institution"
          />
        </FormFullRow>

        <FormSelect<StudentInput>
          name="previous_school.board"
          label="Board"
          options={BOARD_OPTIONS}
          placeholder="Not specified"
        />
        <FormInput<StudentInput>
          name="previous_school.last_class"
          label="Last class attended"
          placeholder="Class 5"
        />
        <FormInput<StudentInput>
          name="previous_school.passing_year"
          label="Year of passing"
          inputMode="numeric"
          placeholder="2024"
        />

        <FormInput<StudentInput>
          name="previous_school.percentage"
          label="Percentage / grade"
          inputMode="decimal"
          placeholder="87.5"
        />
        <FormInput<StudentInput>
          name="previous_school.tc_number"
          label="Transfer certificate no."
          hint="Upload the certificate under Documents."
        />

        <FormFullRow>
          <FormTextarea<StudentInput>
            name="previous_school.reason_for_leaving"
            label="Reason for leaving"
            rows={2}
            placeholder="Relocation, transfer…"
          />
        </FormFullRow>
      </FormGrid>
    </div>
  );
}
