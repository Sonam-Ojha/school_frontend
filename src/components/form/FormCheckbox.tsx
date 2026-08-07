import { useId } from 'react';
import { useFormContext, type FieldValues, type Path } from 'react-hook-form';

import { Checkbox, type CheckboxProps } from '@/components/ui/Checkbox';

import { useFieldError } from './useFieldError';

interface FormCheckboxProps<TFieldValues extends FieldValues>
  extends Omit<CheckboxProps, 'name' | 'id'> {
  name: Path<TFieldValues>;
}

export function FormCheckbox<TFieldValues extends FieldValues = FieldValues>({
  name,
  ...rest
}: FormCheckboxProps<TFieldValues>) {
  const { register } = useFormContext<TFieldValues>();
  const error = useFieldError<TFieldValues>(name);
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Checkbox id={id} {...register(name)} {...rest} />
      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
