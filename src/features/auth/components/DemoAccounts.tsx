import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { ApiError } from '@/lib/apiError';
import { cn } from '@/lib/cn';
import { roleLabel } from '@/types/auth';

import { useDemoLogin } from '../hooks/useLogin';
import type { DemoAccount } from '../types';

interface DemoAccountsProps {
  accounts: DemoAccount[];
}

/**
 * The demo accounts as one-click buttons: pressing one signs straight in as
 * that person. Nothing is typed, and the sign-in form is left untouched.
 */
export function DemoAccounts({ accounts }: DemoAccountsProps) {
  const demoLogin = useDemoLogin();
  const entering = demoLogin.isPending ? demoLogin.variables : null;

  // An account switched off a moment ago is refused as a field error, which
  // the global mutation handler leaves to the caller. Anything else is a toast.
  const refusal =
    demoLogin.error instanceof ApiError && demoLogin.error.isValidationError
      ? (demoLogin.error.fieldError('email') ?? demoLogin.error.message)
      : null;

  return (
    <div className="space-y-3">
      {refusal && <Alert tone="warning">{refusal}</Alert>}

      <ul className="grid grid-cols-2 gap-2">
        {accounts.map((account, index) => {
          const role = roleLabel(account.role);
          const isEntering = entering === account.email;

          return (
            // With an odd number the first, most senior account takes a full
            // row, so no tile is left on its own at the bottom.
            <li
              key={account.email}
              className={cn(index === 0 && accounts.length % 2 === 1 && 'col-span-2')}
            >
              <button
                type="button"
                disabled={demoLogin.isPending}
                onClick={() => demoLogin.mutate(account.email)}
                aria-label={`Sign in as ${role}, ${account.name}`}
                aria-busy={isEntering || undefined}
                className={cn(
                  'flex h-full w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-white',
                  'px-2.5 py-2 text-left transition-colors',
                  'hover:border-brand-300 hover:bg-brand-50',
                  'disabled:pointer-events-none',
                  demoLogin.isPending && !isEntering && 'opacity-50',
                  isEntering && 'border-brand-300 bg-brand-50',
                )}
              >
                {isEntering ? (
                  <span className="flex size-7 shrink-0 items-center justify-center">
                    <Spinner size="sm" className="text-brand-600" label="Signing in" />
                  </span>
                ) : (
                  <Avatar name={account.name} size="sm" />
                )}

                {/* The role is what a visitor is choosing, so it wraps rather
                    than being cut short; the name underneath may be. */}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-tight font-medium text-slate-900">
                    {role}
                  </span>
                  {account.name !== role && (
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {account.name}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
