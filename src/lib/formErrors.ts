import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { ApiError } from './apiError';

/**
 * Project Laravel's 422 `errors` bag onto React Hook Form fields.
 *
 * Validation lives in Zod on the client and in FormRequests on the server;
 * this is the one place the server's verdict is mapped back to the form, so
 * no module reimplements it. Errors for unknown fields fall back to the form
 * root so nothing is silently swallowed.
 */
export function applyServerErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  knownFields?: readonly string[],
): boolean {
  if (!(error instanceof ApiError) || !error.isValidationError) return false;

  const entries = Object.entries(error.errors);
  if (entries.length === 0) return false;

  for (const [field, messages] of entries) {
    const message = messages[0];
    if (!message) continue;

    // Laravel reports nested rules as `addresses.0.city`; RHF uses the same
    // dot path, so it maps across directly.
    const isKnown = !knownFields || knownFields.includes(field);

    setError(isKnown ? (field as Path<TFieldValues>) : ('root.serverError' as Path<TFieldValues>), {
      type: 'server',
      message,
    });
  }

  return true;
}
