import { forwardRef, useCallback, useRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: ReactNode;
  /**
   * Tri-state "some but not all" — used by the select-all toggles in the
   * permission matrix. Only settable via the DOM, never as an attribute.
   */
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, className, id, indeterminate = false, ...rest },
  forwardedRef,
) {
  const innerRef = useRef<HTMLInputElement | null>(null);

  // Merge the forwarded ref with our own so callers keep their access while we
  // set `indeterminate`, which has no corresponding HTML attribute.
  const setRef = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (node) node.indeterminate = indeterminate;

      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef, indeterminate],
  );

  const input = (
    <input
      ref={setRef}
      id={id}
      type="checkbox"
      aria-checked={indeterminate ? 'mixed' : undefined}
      className={cn(
        'size-4 shrink-0 rounded border-slate-300 text-brand-600 shadow-xs',
        'checked:bg-brand-600 checked:border-brand-600',
        'indeterminate:bg-brand-600 indeterminate:border-brand-600',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    />
  );

  if (!label) return input;

  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 select-none">
      <span className="mt-0.5">{input}</span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {description && <span className="block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
});
