import { ListChecks, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

import { MAX_RUBRIC_CRITERIA } from '../constants';
import type { AssignmentInput } from '../schemas';

/** Array-level messages land on `errors.rubric` or, in newer RHF, its `root`. */
type ArrayError = { message?: string; root?: { message?: string } } | undefined;

/**
 * The marking scheme: what the marks are actually for.
 *
 * A rubric is optional — short coursework is fairly marked out of one total —
 * but once there is one, its criteria must add up to the assignment's maximum.
 * Criteria summing to 40 out of 50 silently cap every student at 80%, which is
 * the kind of error nobody notices until results are published.
 */
export function RubricBuilder({ maxMarks }: { maxMarks: number }) {
  const form = useFormContext<AssignmentInput>();
  const { fields, append, remove } = useFieldArray<AssignmentInput, 'rubric'>({
    control: form.control,
    name: 'rubric',
  });

  const rubric = form.watch('rubric') ?? [];
  const allocated = rubric.reduce(
    (total, criterion) => total + (Number(criterion?.max_marks) || 0),
    0,
  );
  const remaining = Math.round((maxMarks - allocated) * 100) / 100;
  const isBalanced = fields.length === 0 || Math.abs(remaining) < 0.001;

  const rubricError = form.formState.errors.rubric as ArrayError;
  const message = rubricError?.message ?? rubricError?.root?.message;

  return (
    <section className="border-t border-slate-200 pt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Marking scheme</h3>
          <p className="text-xs text-slate-500">
            Optional. With criteria, each one is scored separately and the total is worked out for
            you.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={fields.length >= MAX_RUBRIC_CRITERIA}
          onClick={() =>
            append({
              id: 0,
              name: '',
              description: '',
              // Offer whatever is left, so a scheme balances as it is built.
              max_marks: remaining > 0 ? remaining : 0,
            })
          }
          leftIcon={<Plus className="size-4" />}
        >
          Add criterion
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center">
          <ListChecks className="mx-auto size-5 text-slate-400" aria-hidden />
          <p className="mt-2 text-sm text-slate-600">No rubric</p>
          <p className="text-xs text-slate-500">
            Submissions will be marked out of {maxMarks} as a single total.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {fields.map((field, index) => (
            <li
              key={field.id}
              className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_7rem_auto] sm:items-start"
            >
              <FormInput<AssignmentInput>
                name={`rubric.${index}.name`}
                label={index === 0 ? 'Criterion' : undefined}
                placeholder="Research and sources"
                required
              />
              <FormInput<AssignmentInput>
                name={`rubric.${index}.description`}
                label={index === 0 ? 'What earns the marks' : undefined}
                placeholder="Range and reliability of sources cited"
              />
              <FormInput<AssignmentInput>
                name={`rubric.${index}.max_marks`}
                type="number"
                label={index === 0 ? 'Marks' : undefined}
                min={0.5}
                step={0.5}
                required
              />

              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={`Remove criterion ${index + 1}`}
                className={cn('text-red-600 hover:bg-red-50 hover:text-red-700', index === 0 && 'sm:mt-6')}
                onClick={() => remove(index)}
                leftIcon={<Trash2 className="size-4" />}
              />
            </li>
          ))}
        </ul>
      )}

      {fields.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
          <span className="text-xs text-slate-500">
            {fields.length} criteri{fields.length === 1 ? 'on' : 'a'}
          </span>
          <span className={cn('text-sm font-medium', isBalanced ? 'text-slate-900' : 'text-amber-700')}>
            {allocated} / {maxMarks} allocated
            {!isBalanced && (remaining > 0 ? ` · ${remaining} unassigned` : ` · ${-remaining} over`)}
          </span>
        </div>
      )}

      {message && (
        <Alert tone="danger" className="mt-3">
          {message}
        </Alert>
      )}
    </section>
  );
}
