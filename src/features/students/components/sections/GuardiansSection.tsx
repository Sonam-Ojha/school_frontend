import { Plus, Star, Trash2, Users } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

import { RELATION_LABELS, RELATION_OPTIONS } from '../../constants';
import type { StudentInput } from '../../schemas';
import { emptyGuardian } from '../../utils/defaults';

/**
 * Parent and guardian contacts.
 *
 * Exactly one is the primary contact — the number the school calls first.
 * Marking one primary clears the others rather than trusting the user to
 * uncheck, because two primaries is the failure the schema rejects.
 */
export function GuardiansSection() {
  const form = useFormContext<StudentInput>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'guardians' });

  const guardians = form.watch('guardians');
  const arrayError = form.formState.errors.guardians?.message;

  const setPrimary = (index: number) => {
    guardians.forEach((_guardian, i) => {
      form.setValue(`guardians.${i}.is_primary`, i === index, { shouldDirty: true });
    });
    // Clears the "exactly one primary" error as soon as it is satisfied.
    void form.trigger('guardians');
  };

  const removeGuardian = (index: number) => {
    const wasPrimary = guardians[index]?.is_primary;
    remove(index);

    // Never leave the record without a primary contact.
    if (wasPrimary && guardians.length > 1) {
      form.setValue('guardians.0.is_primary', true, { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Parents & guardians</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            The primary contact is called first in an emergency.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => append(emptyGuardian('guardian'))}
          leftIcon={<Plus className="size-4" />}
        >
          Add guardian
        </Button>
      </div>

      {typeof arrayError === 'string' && <Alert tone="danger">{arrayError}</Alert>}

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-6 py-8 text-center">
          <Users className="mx-auto size-6 text-slate-300" aria-hidden />
          <p className="mt-2 text-sm text-slate-500">No guardians added yet.</p>
        </div>
      ) : (
        fields.map((field, index) => {
          const isPrimary = guardians[index]?.is_primary ?? false;

          return (
            <div
              key={field.id}
              className={cn(
                'rounded-lg border p-4',
                isPrimary ? 'border-brand-300 bg-brand-50/40' : 'border-slate-200',
              )}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-800">
                  {RELATION_LABELS[guardians[index]?.relation ?? 'guardian']}
                  {isPrimary && (
                    <span className="ml-2 text-xs font-semibold text-brand-700">
                      Primary contact
                    </span>
                  )}
                </p>

                <div className="flex items-center gap-1">
                  {!isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPrimary(index)}
                      leftIcon={<Star className="size-3.5" />}
                    >
                      Make primary
                    </Button>
                  )}

                  {/* The schema requires at least one guardian. */}
                  {fields.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label={`Remove guardian ${index + 1}`}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => removeGuardian(index)}
                      leftIcon={<Trash2 className="size-4" />}
                    />
                  )}
                </div>
              </div>

              <FormGrid cols={3}>
                <FormSelect<StudentInput>
                  name={`guardians.${index}.relation`}
                  label="Relation"
                  options={RELATION_OPTIONS}
                  required
                />
                <FormInput<StudentInput>
                  name={`guardians.${index}.name`}
                  label="Full name"
                  required
                />
                <FormInput<StudentInput>
                  name={`guardians.${index}.occupation`}
                  label="Occupation"
                  hint="Optional"
                />

                <FormInput<StudentInput>
                  name={`guardians.${index}.phone`}
                  type="tel"
                  label="Phone"
                  required
                />
                <FormInput<StudentInput>
                  name={`guardians.${index}.email`}
                  type="email"
                  label="Email"
                  hint="Optional"
                />
                <FormInput<StudentInput>
                  name={`guardians.${index}.annual_income`}
                  label="Annual income"
                  inputMode="numeric"
                  hint="Optional — used for fee concessions."
                />
              </FormGrid>
            </div>
          );
        })
      )}
    </div>
  );
}
