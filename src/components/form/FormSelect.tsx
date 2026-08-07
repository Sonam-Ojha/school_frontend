import { useId, type ChangeEvent, type FocusEvent } from 'react';
import { useFormContext, type FieldValues, type Path } from 'react-hook-form';

import { Select, type SelectProps } from '@/components/ui/Select';

import { FormField } from './FormField';
import { useFieldError } from './useFieldError';

interface FormSelectProps<TFieldValues extends FieldValues>
  extends Omit<SelectProps, 'name' | 'hasError'> {
  name: Path<TFieldValues>;
  label?: string;
  hint?: string;
  /** Set when the option values are numeric foreign keys. */
  valueAsNumber?: boolean;
}

export function FormSelect<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  hint,
  required,
  valueAsNumber = false,
  onChange,
  onBlur,
  ...rest
}: FormSelectProps<TFieldValues>) {
  const { register } = useFormContext<TFieldValues>();
  const error = useFieldError<TFieldValues>(name);
  const id = useId();

  const {
    onChange: registerChange,
    onBlur: registerBlur,
    ...field
  } = register(name, {
    // `valueAsNumber` would yield NaN for the empty placeholder option.
    setValueAs: valueAsNumber
      ? (value) => (value === '' || value === null ? null : Number(value))
      : undefined,
  });

  // Register's handlers must run first — spreading a caller's `onChange` over
  // them would stop React Hook Form seeing the change at all.
  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    await registerChange(event);
    onChange?.(event);
  };

  const handleBlur = async (event: FocusEvent<HTMLSelectElement>) => {
    await registerBlur(event);
    onBlur?.(event);
  };

  return (
    <FormField htmlFor={id} label={label} hint={hint} error={error} required={required}>
      <Select
        id={id}
        hasError={Boolean(error)}
        {...field}
        {...rest}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </FormField>
  );
}
