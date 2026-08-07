import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

import type { TeacherInput } from '../../schemas';
import { emptyQualification } from '../../utils/defaults';

/**
 * Academic qualifications.
 *
 * At least one is required — a teaching record with no qualification on file
 * is not something a school can act on.
 */
export function QualificationsSection() {
  const form = useFormContext<TeacherInput>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'qualifications',
  });

  const arrayError = form.formState.errors.qualifications?.message;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Qualifications</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Degrees and certifications, most recent first.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => append(emptyQualification())}
          leftIcon={<Plus className="size-4" />}
        >
          Add qualification
        </Button>
      </div>

      {typeof arrayError === 'string' && <Alert tone="danger">{arrayError}</Alert>}

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-6 py-8 text-center">
          <GraduationCap className="mx-auto size-6 text-slate-300" aria-hidden />
          <p className="mt-2 text-sm text-slate-500">No qualifications added yet.</p>
        </div>
      ) : (
        fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-800">Qualification {index + 1}</p>

              {/* The schema requires at least one. */}
              {fields.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={`Remove qualification ${index + 1}`}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => remove(index)}
                  leftIcon={<Trash2 className="size-4" />}
                />
              )}
            </div>

            <FormGrid cols={3}>
              <FormInput<TeacherInput>
                name={`qualifications.${index}.degree`}
                label="Degree"
                placeholder="M.Sc."
                required
              />
              <FormInput<TeacherInput>
                name={`qualifications.${index}.specialization`}
                label="Specialization"
                placeholder="Physics"
                hint="Optional"
              />
              <FormInput<TeacherInput>
                name={`qualifications.${index}.year_of_passing`}
                label="Year of passing"
                inputMode="numeric"
                placeholder="2016"
                required
              />

              <FormInput<TeacherInput>
                name={`qualifications.${index}.institution`}
                label="Institution"
                placeholder="St. Joseph's College"
                required
              />
              <FormInput<TeacherInput>
                name={`qualifications.${index}.board_university`}
                label="Board / University"
                hint="Optional"
              />
              <FormInput<TeacherInput>
                name={`qualifications.${index}.grade`}
                label="Grade / percentage"
                placeholder="First class"
                hint="Optional"
              />
            </FormGrid>
          </div>
        ))
      )}
    </div>
  );
}
