import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface FormFieldProps {
  /** Must match the control's `id` so clicking the label focuses it. */
  htmlFor: string;
  label?: ReactNode;
  /** Helper text shown when there is no error. */
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Label + control + message layout shared by every field type. Field
 * components compose this so spacing and error presentation never diverge.
 */
export function FormField({
  htmlFor,
  label,
  hint,
  error,
  required = false,
  children,
  className,
}: FormFieldProps) {
  const messageId = `${htmlFor}-message`;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
          {label}
          {required && (
            <span className="ml-0.5 text-red-500" aria-hidden>
              *
            </span>
          )}
        </label>
      )}

      {children}

      {error ? (
        <p id={messageId} role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="text-xs text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
