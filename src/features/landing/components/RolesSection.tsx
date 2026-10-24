import { KeyRound, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { roleLabel } from '@/types/auth';

import { ROLE_SUMMARIES } from '../content';

import { Section } from './Section';

const ROLE_COLORS = [
  'from-brand-500 to-brand-700',
  'from-violet-500 to-purple-700',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
];

interface RoleCellProps {
  icon: LucideIcon;
  name: string;
  children: ReactNode;
  colorClass?: string;
  muted?: boolean;
}

function RoleCell({ icon: Icon, name, children, colorClass, muted = false }: RoleCellProps) {
  return (
    <li className="group flex gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-200 group-hover:scale-105',
          muted
            ? 'bg-slate-200 text-slate-500 shadow-none'
            : `bg-gradient-to-br ${colorClass}`,
        )}
      >
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{children}</p>
      </div>
    </li>
  );
}

export function RolesSection() {
  return (
    <Section
      id="roles"
      eyebrow="Who it is for"
      title="Sixteen roles, each with its own responsibilities"
      lead="A role decides which dashboard opens, what the menu lists and which buttons exist. The School Admin can adjust any role, give one person extra rights, limit a teacher to their own classes, and hide sensitive details — and every change is logged."
      className="border-y border-slate-100 bg-slate-50"
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ROLE_SUMMARIES.map(({ role, summary, icon }, i) => (
          <RoleCell
            key={role}
            icon={icon}
            name={roleLabel(role)}
            colorClass={ROLE_COLORS[i % ROLE_COLORS.length]}
          >
            {summary}
          </RoleCell>
        ))}

        {/* Custom roles */}
        <RoleCell icon={KeyRound} name="Your own roles" muted>
          Build a new one from the permission matrix — view, create, edit, delete, approve, export
          — and give one person several roles.
        </RoleCell>
      </ul>
    </Section>
  );
}
