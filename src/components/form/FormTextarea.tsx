import { useId } from 'react';
import { useFormContext, type FieldValues, type Path } from 'react-hook-form';

import { Textarea, type TextareaProps } from '@/components/ui/Textarea';

import { FormField } from './FormField';
import { useFieldError } from './useFieldError';

interface FormTextareaProps<TFieldValues extends FieldValues>
  extends Omit<TextareaProps, 'name' | 'hasError'> {
  name: Path<TFieldValues>;
  label?: string;
  hint?: string;
}

export function FormTextarea<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  hint,
  required,
  ...rest
}: FormTextareaProps<TFieldValues>) {
  const { register } = useFormContext<TFieldValues>();
  const error = useFieldError<TFieldValues>(name);
  const id = useId();

  return (
    <FormField htmlFor={id} label={label} hint={hint} error={error} required={required}>
      <Textarea id={id} hasError={Boolean(error)} {...register(name)} {...rest} />
    </FormField>
  );
}
