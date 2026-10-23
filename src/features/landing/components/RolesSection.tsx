import { KeyRound, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { roleLabel } from '@/types/auth';

import { ROLE_SUMMARIES } from '../content';

import { Section } from './Section';

interface RoleCellProps {
  icon: LucideIcon;
  name: string;
  children: ReactNode;
  /** The one cell that is not a built-in role. */
  muted?: boolean;
}

function RoleCell({ icon: Icon, name, children, muted = false }: RoleCellProps) {
  return (
    <li className="flex gap-3">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full ring-1',
          muted
            ? 'bg-slate-100 text-slate-600 ring-slate-200'
            : 'bg-brand-50 text-brand-600 ring-brand-100',
        )}
      >
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
        <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{children}</p>
      </div>
    </li>
  );
}

export function RolesSection() {
  return (
    <Section
      id="roles"
      eyebrow="Who it is for"
      title="Eleven roles, each with its own school"
      lead="A role decides which dashboard opens, what the sidebar lists and which buttons exist. The API checks the same permissions again on every request."
      className="border-y border-slate-200 bg-white"
    >
      <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {ROLE_SUMMARIES.map(({ role, summary, icon }) => (
          <RoleCell key={role} icon={icon} name={roleLabel(role)}>
            {summary}
          </RoleCell>
        ))}

        {/* The twelfth cell: the built-in roles are a starting point, not a limit. */}
        <RoleCell icon={KeyRound} name="Your own roles" muted>
          Build a new one from the matrix of 137 permissions, down to who may approve what.
        </RoleCell>
      </ul>
    </Section>
  );
}
