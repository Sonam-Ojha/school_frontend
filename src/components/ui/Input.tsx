import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { fieldBaseClass, fieldToneClass } from './fieldStyles';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  hasError?: boolean;
  /** Icon rendered inside the field's leading edge (e.g. search glyph). */
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

/**
 * Unlabelled input primitive. Use `FormInput` for form fields — it adds the
 * label, error text and React Hook Form binding on top of this.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hasError = false, leftIcon, rightSlot, className, ...rest },
  ref,
) {
  const field = (
    <input
      ref={ref}
      aria-invalid={hasError || undefined}
      className={cn(
        fieldBaseClass,
        fieldToneClass(hasError),
        'h-10 px-3 py-2',
        leftIcon && 'pl-9',
        rightSlot && 'pr-9',
        className,
      )}
      {...rest}
    />
  );

  if (!leftIcon && !rightSlot) return field;

  return (
    <div className="relative">
      {leftIcon && (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
          aria-hidden
        >
          {leftIcon}
        </span>
      )}
      {field}
      {rightSlot && (
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
          {rightSlot}
        </span>
      )}
    </div>
  );
});
