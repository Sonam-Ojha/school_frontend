import { ChevronDown, FlaskConical } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { useDisclosure } from '@/hooks/useDisclosure';
import { roleLabel } from '@/types/auth';

/**
 * Lists the mock API's sign-in accounts on the login screen.
 *
 * Rendered only by a caller that has already checked `import.meta.env.DEV`,
 * so it never reaches a production bundle. Delete alongside `src/mocks/`.
 */

const ACCOUNTS: ReadonlyArray<{ email: string; role: string }> = [
  { email: 'superadmin@school.test', role: 'super-admin' },
  { email: 'admin@school.test', role: 'school-admin' },
  { email: 'principal@school.test', role: 'principal' },
  { email: 'viceprincipal@school.test', role: 'vice-principal' },
  { email: 'teacher@school.test', role: 'teacher' },
  { email: 'accountant@school.test', role: 'accountant' },
  { email: 'receptionist@school.test', role: 'receptionist' },
  { email: 'librarian@school.test', role: 'librarian' },
  { email: 'staff@school.test', role: 'staff' },
  { email: 'parent@school.test', role: 'parent' },
  { email: 'student@school.test', role: 'student' },
];

const PASSWORD = 'Password123';

interface DevCredentialsHintProps {
  /** Fills the sign-in form with the chosen account. */
  onPick: (email: string, password: string) => void;
}

export function DevCredentialsHint({ onPick }: DevCredentialsHintProps) {
  const { isOpen, toggle } = useDisclosure();

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 text-left"
      >
        <FlaskConical className="size-4 shrink-0 text-amber-600" aria-hidden />
        <span className="flex-1 text-xs font-semibold text-amber-900">
          Development accounts — no backend required
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-amber-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      <p className="mt-1.5 pl-6 text-xs text-amber-800">
        Password for every account: <code className="font-semibold">{PASSWORD}</code>
      </p>

      {isOpen && (
        <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto pl-6">
          {ACCOUNTS.map(({ email, role }) => (
            <li key={email}>
              <button
                type="button"
                onClick={() => onPick(email, PASSWORD)}
                className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-amber-100"
              >
                <code className="truncate text-xs text-amber-900">{email}</code>
                <Badge tone="warning" className="shrink-0">
                  {roleLabel(role)}
                </Badge>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
