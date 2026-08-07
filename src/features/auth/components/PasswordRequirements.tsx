import { Check, Circle } from 'lucide-react';

import { cn } from '@/lib/cn';

/** Mirrors the `password` rules in `schemas.ts`. Keep the two in step. */
const RULES: ReadonlyArray<{ label: string; test: (value: string) => boolean }> = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'Contains a letter', test: (value) => /[A-Za-z]/.test(value) },
  { label: 'Contains a number', test: (value) => /[0-9]/.test(value) },
];

/**
 * Live checklist shown while choosing a password. Shared by the reset and
 * change-password forms so the stated rules cannot drift between them.
 */
export function PasswordRequirements({ value }: { value: string }) {
  return (
    <ul className="space-y-1" aria-label="Password requirements">
      {RULES.map(({ label, test }) => {
        const met = test(value);

        return (
          <li
            key={label}
            className={cn('flex items-center gap-2 text-xs', met ? 'text-emerald-600' : 'text-slate-500')}
          >
            {met ? (
              <Check className="size-3.5 shrink-0" aria-hidden />
            ) : (
              <Circle className="size-3.5 shrink-0 opacity-40" aria-hidden />
            )}
            <span>{label}</span>
            <span className="sr-only">{met ? '— met' : '— not met'}</span>
          </li>
        );
      })}
    </ul>
  );
}
