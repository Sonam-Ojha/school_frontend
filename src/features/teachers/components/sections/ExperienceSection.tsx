import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { FormFullRow, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

import type { TeacherInput } from '../../schemas';
import { emptyExperience } from '../../utils/defaults';

/**
 * Prior employment. Entirely optional — a first-time teacher has none.
 *
 * Marking a role current clears and disables its end date, so the record
 * cannot claim to be both ongoing and finished.
 */
export function ExperienceSection() {
  const form = useFormContext<TeacherInput>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'experiences' });

  const experiences = form.watch('experiences');

  useEffect(() => {
    experiences?.forEach((experience, index) => {
      if (experience.is_current && experience.to_date) {
        form.setValue(`experiences.${index}.to_date`, '', { shouldDirty: true });
      }
    });
  }, [experiences, form]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Work experience</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Previous roles. Leave empty for a first appointment.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => append(emptyExperience())}
          leftIcon={<Plus className="size-4" />}
        >
          Add experience
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-6 py-8 text-center">
          <Briefcase className="mx-auto size-6 text-slate-300" aria-hidden />
          <p className="mt-2 text-sm text-slate-500">No previous experience recorded.</p>
        </div>
      ) : (
        fields.map((field, index) => {
          const isCurrent = experiences?.[index]?.is_current ?? false;

          return (
            <div key={field.id} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-800">Role {index + 1}</p>

                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={`Remove experience ${index + 1}`}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => remove(index)}
                  leftIcon={<Trash2 className="size-4" />}
                />
              </div>

              <FormGrid cols={2}>
                <FormInput<TeacherInput>
                  name={`experiences.${index}.organisation`}
                  label="Organisation"
                  placeholder="Previous school"
                  required
                />
                <FormInput<TeacherInput>
                  name={`experiences.${index}.designation`}
                  label="Designation"
                  placeholder="Senior Teacher"
                  required
                />

                <FormInput<TeacherInput>
                  name={`experiences.${index}.from_date`}
                  type="date"
                  label="From"
                  required
                />
                <FormInput<TeacherInput>
                  name={`experiences.${index}.to_date`}
                  type="date"
                  label="To"
                  disabled={isCurrent}
                  hint={isCurrent ? 'Not applicable while marked current' : undefined}
                  required={!isCurrent}
                />

                <FormFullRow>
                  <FormCheckbox<TeacherInput>
                    name={`experiences.${index}.is_current`}
                    label="This is their current role"
                    description="Leave unchecked for a role they have left."
                  />
                </FormFullRow>

                <FormFullRow>
                  <FormTextarea<TeacherInput>
                    name={`experiences.${index}.responsibilities`}
                    label="Responsibilities"
                    rows={2}
                    placeholder="Subjects taught, classes handled, additional duties…"
                  />
                </FormFullRow>
              </FormGrid>
            </div>
          );
        })
      )}

      {fields.length > 0 && (
        <Alert tone="info">
          Total experience is calculated from these dates and shown on the teacher&apos;s profile.
        </Alert>
      )}
    </div>
  );
}
