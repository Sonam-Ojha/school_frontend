import { cn } from '@/lib/cn';

/**
 * Shared field chrome for `Input`, `Select` and `Textarea` so the three stay
 * visually identical. Lives outside the components so Fast Refresh keeps
 * working on each of them.
 */
export const fieldBaseClass = cn(
  'block w-full rounded-lg border bg-white text-sm text-slate-900 shadow-xs',
  'placeholder:text-slate-400',
  'transition-colors duration-150',
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
  'read-only:bg-slate-50',
);

export const fieldToneClass = (hasError: boolean) =>
  hasError
    ? 'border-red-400 focus:border-red-500 focus-visible:outline-red-500'
    : 'border-slate-300 focus:border-brand-500 focus-visible:outline-brand-600';
