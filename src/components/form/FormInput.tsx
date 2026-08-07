import { Eye, EyeOff } from 'lucide-react';
import { useId, useState, type ChangeEvent, type FocusEvent } from 'react';
import { useFormContext, type FieldValues, type Path } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Input, type InputProps } from '@/components/ui/Input';

import { FormField } from './FormField';
import { useFieldError } from './useFieldError';

interface FormInputProps<TFieldValues extends FieldValues>
  extends Omit<InputProps, 'name' | 'hasError'> {
  name: Path<TFieldValues>;
  label?: string;
  hint?: string;
  /** Coerce to a number on change so Zod receives the right primitive. */
  valueAsNumber?: boolean;
}

/**
 * Text/email/number/date/password input wired to the surrounding `Form`.
 * Password fields get a reveal toggle automatically.
 */
export function FormInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  hint,
  required,
  type = 'text',
  valueAsNumber = false,
  className,
  onChange,
  onBlur,
  ...rest
}: FormInputProps<TFieldValues>) {
  const { register } = useFormContext<TFieldValues>();
  const error = useFieldError<TFieldValues>(name);
  const id = useId();
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === 'password';
  const resolvedType = isPassword && revealed ? 'text' : type;

  const {
    onChange: registerChange,
    onBlur: registerBlur,
    ...field
  } = register(name, {
    valueAsNumber: valueAsNumber || type === 'number',
  });

  // Register's handlers must run first — spreading a caller's `onChange` over
  // them would stop React Hook Form seeing the change at all.
  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await registerChange(event);
    onChange?.(event);
  };

  const handleBlur = async (event: FocusEvent<HTMLInputElement>) => {
    await registerBlur(event);
    onBlur?.(event);
  };

  return (
    <FormField htmlFor={id} label={label} hint={hint} error={error} required={required}>
      <Input
        id={id}
        type={resolvedType}
        hasError={Boolean(error)}
        className={className}
        rightSlot={
          isPassword ? (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              tabIndex={-1}
              aria-label={revealed ? 'Hide password' : 'Show password'}
              onClick={() => setRevealed((prev) => !prev)}
              leftIcon={revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            />
          ) : undefined
        }
        {...field}
        {...rest}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </FormField>
  );
}
