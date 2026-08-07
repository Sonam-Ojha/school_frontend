import { useId } from 'react';
import { useController, useFormContext, type FieldValues, type Path } from 'react-hook-form';

import { MultiSelect } from '@/components/ui/MultiSelect';
import type { Option } from '@/types/common';

import { FormField } from './FormField';
import { useFieldError } from './useFieldError';

interface FormMultiSelectProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  options: Option<number>[];
  label?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
}

/**
 * `MultiSelect` bound to the surrounding `Form`.
 *
 * Driven through a controller rather than `register` — the control is not a
 * native input, so there is no change event for RHF to hook.
 */
export function FormMultiSelect<TFieldValues extends FieldValues = FieldValues>({
  name,
  options,
  label,
  hint,
  placeholder,
  required,
  disabled,
  emptyMessage,
}: FormMultiSelectProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>();
  const error = useFieldError<TFieldValues>(name);
  const id = useId();

  const { field } = useController({ name, control });

  return (
    <FormField htmlFor={id} label={label} hint={hint} error={error} required={required}>
      <MultiSelect
        id={id}
        options={options}
        value={(field.value as number[]) ?? []}
        onChange={field.onChange}
        placeholder={placeholder}
        disabled={disabled}
        hasError={Boolean(error)}
        emptyMessage={emptyMessage}
      />
    </FormField>
  );
}
