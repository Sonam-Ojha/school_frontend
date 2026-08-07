import { BookOpen, Plus, Star, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { FormGrid } from '@/components/form/Form';
import { FormMultiSelect } from '@/components/form/FormMultiSelect';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useClassOptions, useSubjectOptions } from '@/features/academics/hooks/useAcademics';
import { cn } from '@/lib/cn';

import type { TeacherInput } from '../../schemas';
import { emptyClassAssignment } from '../../utils/defaults';

/** One assignment row. Sections depend on the class chosen in the same row. */
function AssignmentRow({
  index,
  isClassTeacher,
  canRemove,
  onMakeClassTeacher,
  onRemove,
}: {
  index: number;
  isClassTeacher: boolean;
  canRemove: boolean;
  onMakeClassTeacher: () => void;
  onRemove: () => void;
}) {
  const form = useFormContext<TeacherInput>();
  const classId = form.watch(`class_assignments.${index}.class_id`);
  const { classOptions, sectionOptions } = useClassOptions(classId);

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        isClassTeacher ? 'border-brand-300 bg-brand-50/40' : 'border-slate-200',
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-800">
          Assignment {index + 1}
          {isClassTeacher && (
            <span className="ml-2 text-xs font-semibold text-brand-700">Class teacher</span>
          )}
        </p>

        <div className="flex items-center gap-1">
          {!isClassTeacher && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMakeClassTeacher}
              leftIcon={<Star className="size-3.5" />}
            >
              Make class teacher
            </Button>
          )}

          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Remove assignment ${index + 1}`}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onRemove}
              leftIcon={<Trash2 className="size-4" />}
            />
          )}
        </div>
      </div>

      <FormGrid cols={2}>
        <FormSelect<TeacherInput>
          name={`class_assignments.${index}.class_id`}
          label="Class"
          options={classOptions}
          placeholder="Select a class"
          valueAsNumber
          required
        />
        <FormSelect<TeacherInput>
          name={`class_assignments.${index}.section_id`}
          label="Section"
          options={sectionOptions}
          placeholder={classId ? 'All sections' : 'Select a class first'}
          disabled={sectionOptions.length === 0}
          valueAsNumber
          hint="Leave blank to teach every section of this class."
        />
      </FormGrid>
    </div>
  );
}

/**
 * Subjects taught and classes assigned.
 *
 * A teacher can be class teacher of at most one class-section — the schema
 * enforces it, and marking one here clears the others rather than trusting
 * the user to untick.
 */
export function AssignmentsSection() {
  const form = useFormContext<TeacherInput>();
  const { subjectOptions, isLoading: subjectsLoading } = useSubjectOptions();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'class_assignments',
  });

  const assignments = form.watch('class_assignments');
  const arrayError = form.formState.errors.class_assignments?.message;

  const makeClassTeacher = (index: number) => {
    assignments.forEach((_assignment, i) => {
      form.setValue(`class_assignments.${i}.is_class_teacher`, i === index, { shouldDirty: true });
    });
    void form.trigger('class_assignments');
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold text-slate-900">Subjects</h3>
        <p className="mt-0.5 mb-3 text-xs text-slate-500">
          Subjects this teacher is qualified to teach.
        </p>

        <div className="max-w-xl">
          <FormMultiSelect<TeacherInput>
            name="subject_ids"
            options={subjectOptions}
            placeholder={subjectsLoading ? 'Loading subjects…' : 'Select subjects'}
            emptyMessage="No subjects have been created yet."
            hint="Used when building the timetable."
          />
        </div>
      </section>

      <section className="border-t border-slate-200 pt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Classes</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Which classes they teach, and which one they are responsible for.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => append(emptyClassAssignment())}
            leftIcon={<Plus className="size-4" />}
          >
            Add class
          </Button>
        </div>

        {typeof arrayError === 'string' && (
          <Alert tone="danger" className="mb-3">
            {arrayError}
          </Alert>
        )}

        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-6 py-8 text-center">
            <BookOpen className="mx-auto size-6 text-slate-300" aria-hidden />
            <p className="mt-2 text-sm text-slate-500">No classes assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <AssignmentRow
                key={field.id}
                index={index}
                isClassTeacher={assignments?.[index]?.is_class_teacher ?? false}
                canRemove={fields.length > 0}
                onMakeClassTeacher={() => makeClassTeacher(index)}
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
