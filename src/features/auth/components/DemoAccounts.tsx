import {
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Calculator,
  ClipboardList,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  Library,
  PersonStanding,
  School,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { ApiError } from '@/lib/apiError';
import { cn } from '@/lib/cn';
import { roleLabel } from '@/types/auth';

import { useDemoLogin } from '../hooks/useLogin';
import type { DemoAccount } from '../types';

interface DemoAccountsProps {
  accounts: DemoAccount[];
}

/** Icon + colour for each role slug — keys must match backend slugs exactly */
const ROLE_META: Record<string, { icon: LucideIcon; gradient: string; bg: string }> = {
  'super-admin':          { icon: ShieldCheck,      gradient: 'from-brand-500 to-brand-700',    bg: 'bg-brand-50 border-brand-200 hover:bg-brand-100' },
  'school-admin':         { icon: ShieldCheck,      gradient: 'from-brand-500 to-brand-700',    bg: 'bg-brand-50 border-brand-200 hover:bg-brand-100' },
  principal:              { icon: School,            gradient: 'from-violet-500 to-purple-700',  bg: 'bg-violet-50 border-violet-200 hover:bg-violet-100' },
  'vice-principal':       { icon: Building2,         gradient: 'from-purple-500 to-fuchsia-700', bg: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
  'academic-coordinator': { icon: ClipboardList,     gradient: 'from-sky-500 to-blue-700',      bg: 'bg-sky-50 border-sky-200 hover:bg-sky-100' },
  'exam-coordinator':     { icon: BookOpen,          gradient: 'from-cyan-500 to-teal-700',     bg: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100' },
  'class-teacher':        { icon: UserCheck,         gradient: 'from-emerald-500 to-teal-700',  bg: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
  teacher:                { icon: Users,             gradient: 'from-green-500 to-emerald-700', bg: 'bg-green-50 border-green-200 hover:bg-green-100' },
  accountant:             { icon: Calculator,        gradient: 'from-amber-500 to-orange-600',  bg: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
  'hr-manager':           { icon: BriefcaseBusiness, gradient: 'from-orange-500 to-red-600',    bg: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
  receptionist:           { icon: HeartHandshake,    gradient: 'from-pink-500 to-rose-600',     bg: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
  librarian:              { icon: Library,           gradient: 'from-indigo-500 to-brand-700',  bg: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
  'transport-manager':    { icon: Truck,             gradient: 'from-slate-500 to-slate-700',   bg: 'bg-slate-50 border-slate-200 hover:bg-slate-100' },
  'hostel-warden':        { icon: Building2,         gradient: 'from-lime-500 to-green-700',    bg: 'bg-lime-50 border-lime-200 hover:bg-lime-100' },
  staff:                  { icon: PersonStanding,    gradient: 'from-stone-500 to-stone-700',   bg: 'bg-stone-50 border-stone-200 hover:bg-stone-100' },
  parent:                 { icon: HeartHandshake,    gradient: 'from-rose-500 to-pink-700',     bg: 'bg-rose-50 border-rose-200 hover:bg-rose-100' },
  student:                { icon: GraduationCap,     gradient: 'from-teal-500 to-cyan-700',     bg: 'bg-teal-50 border-teal-200 hover:bg-teal-100' },
};

const FALLBACK_META = { icon: KeyRound, gradient: 'from-slate-400 to-slate-600', bg: 'bg-slate-50 border-slate-200 hover:bg-slate-100' };

function getMeta(role: string) {
  return ROLE_META[role] ?? FALLBACK_META;
}

/**
 * Premium demo account showcase — one rich card per role.
 * Clicking any card signs in immediately with no password.
 */
export function DemoAccounts({ accounts }: DemoAccountsProps) {
  const demoLogin = useDemoLogin();
  const entering = demoLogin.isPending ? demoLogin.variables : null;

  const refusal =
    demoLogin.error instanceof ApiError && demoLogin.error.isValidationError
      ? (demoLogin.error.fieldError('email') ?? demoLogin.error.message)
      : null;

  return (
    <div className="space-y-4">
      {refusal && <Alert tone="warning">{refusal}</Alert>}

      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {accounts.map((account) => {
          const { icon: Icon, gradient, bg } = getMeta(account.role);
          const role = roleLabel(account.role);
          const isEntering = entering === account.email;

          return (
            <li key={account.email}>
              <button
                type="button"
                disabled={demoLogin.isPending}
                onClick={() => demoLogin.mutate(account.email)}
                aria-label={`Sign in as ${role}`}
                aria-busy={isEntering || undefined}
                className={cn(
                  'group flex w-full flex-col items-start gap-3 rounded-2xl border p-4 text-left',
                  'transition-all duration-150',
                  'disabled:pointer-events-none',
                  demoLogin.isPending && !isEntering && 'opacity-40',
                  isEntering ? 'scale-[.98] ring-2 ring-brand-400 ring-offset-1' : bg,
                )}
              >
                {/* Icon badge */}
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
                    'transition-transform duration-150 group-hover:scale-105',
                    gradient,
                  )}
                >
                  {isEntering ? (
                    <Spinner size="sm" className="text-white" label="Signing in" />
                  ) : (
                    <Icon className="size-5" aria-hidden />
                  )}
                </span>

                {/* Role name */}
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-tight text-slate-900">
                    {role}
                  </span>
                  {account.name !== role && (
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {account.name}
                    </span>
                  )}
                </div>

                {/* Tap hint */}
                {!demoLogin.isPending && (
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 group-hover:text-brand-500">
                    One click →
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
