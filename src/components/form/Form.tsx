import type { ReactNode } from 'react';
import {
  FormProvider,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';

import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/cn';

interface FormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Form shell: publishes the RHF context so nested fields self-register, and
 * renders any form-level server error (`root.serverError`) set by
 * `applyServerErrors`.
 */
export function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  id,
}: FormProps<TFieldValues>) {
  const rootError = form.formState.errors.root?.serverError?.message;

  return (
    <FormProvider {...form}>
      <form
        id={id}
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-5', className)}
      >
        {rootError && <Alert tone="danger">{rootError}</Alert>}
        {children}
      </form>
    </FormProvider>
  );
}

/** Responsive field grid — one column on mobile, `cols` from `sm` upward. */
export function FormGrid({
  children,
  cols = 2,
  className,
}: {
  children: ReactNode;
  cols?: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4',
        cols === 2 && 'sm:grid-cols-2',
        cols === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Full-width cell inside a `FormGrid` (textareas, addresses).
 *
 * `col-span-full` rather than a fixed span — a fixed `col-span-3` inside a
 * two-column grid would create a phantom third column.
 */
export function FormFullRow({ children }: { children: ReactNode }) {
  return <div className="col-span-full">{children}</div>;
}
