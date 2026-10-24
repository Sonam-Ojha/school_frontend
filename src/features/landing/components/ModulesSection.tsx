import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/cn';

import { MODULES } from '../content';

import { Section } from './Section';

const ICON_COLORS = [
  'bg-brand-500/10 text-brand-400',
  'bg-emerald-500/10 text-emerald-400',
  'bg-violet-500/10 text-violet-400',
  'bg-amber-500/10 text-amber-400',
  'bg-pink-500/10 text-pink-400',
  'bg-cyan-500/10 text-cyan-400',
];

export function ModulesSection() {
  return (
    <Section
      id="modules"
      eyebrow="What's inside"
      title="Every office in the school, in one application"
      lead="Each module is a working part of the same system: a student admitted at the front desk is the student the teacher marks present, the accountant bills and the librarian lends to."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map(({ name, summary, icon: Icon }, i) => (
          <li
            key={name}
            className="group relative flex gap-3.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md hover:shadow-brand-100/50"
          >
            {/* Hover glow */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-br from-brand-50/50 to-transparent" />

            <span
              className={cn(
                'relative flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110',
                ICON_COLORS[i % ICON_COLORS.length],
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="relative min-w-0">
              <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{summary}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* CTA to full features page */}
      <div className="mt-8 flex justify-center">
        <a
          href="/features"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md"
        >
          See every feature in detail
          <ArrowRight className="size-4" aria-hidden />
        </a>
      </div>
    </Section>
  );
}
