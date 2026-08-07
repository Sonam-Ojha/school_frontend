import { useFormContext, type FieldValues, type Path } from 'react-hook-form';

/**
 * Read the error message for a field, including dotted/indexed paths such as
 * `guardians.0.phone` that Laravel emits for nested validation rules.
 */
export function useFieldError<TFieldValues extends FieldValues = FieldValues>(
  name: Path<TFieldValues>,
): string | undefined {
  const {
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const message = name
    .split('.')
    .reduce<unknown>(
      (node, segment) =>
        node && typeof node === 'object' ? (node as Record<string, unknown>)[segment] : undefined,
      errors,
    );

  if (message && typeof message === 'object' && 'message' in message) {
    const value = (message as { message?: unknown }).message;
    return typeof value === 'string' ? value : undefined;
  }

  return undefined;
}
