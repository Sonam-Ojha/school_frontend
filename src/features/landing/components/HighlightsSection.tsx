import { cn } from '@/lib/cn';

import { HIGHLIGHTS } from '../content';

import { Section } from './Section';

const CARD_GRADIENTS = [
  'from-brand-50 border-brand-100',
  'from-violet-50 border-violet-100',
  'from-emerald-50 border-emerald-100',
  'from-amber-50 border-amber-100',
  'from-pink-50 border-pink-100',
  'from-cyan-50 border-cyan-100',
];

const ICON_GRADIENTS = [
  'from-brand-500 to-brand-700',
  'from-violet-500 to-purple-700',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
];

export function HighlightsSection() {
  return (
    <Section
      id="highlights"
      eyebrow="Why schools choose us"
      title="Built for the way schools really work"
      lead="The parts nobody sees are where a school system earns its keep: whose data is whose, who may do what, and whether yesterday's entries are still there today."
      className="bg-white"
    >
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {HIGHLIGHTS.map(({ title, body, icon: Icon }, i) => (
          <li
            key={title}
            className={cn(
              'group relative overflow-hidden rounded-2xl border bg-gradient-to-br to-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
              CARD_GRADIENTS[i % CARD_GRADIENTS.length],
            )}
          >
            {/* Decorative circle */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-10 transition-opacity duration-200 group-hover:opacity-20"
              style={{ background: 'currentColor' }}
            />

            <span
              className={cn(
                'flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-200 group-hover:scale-105',
                ICON_GRADIENTS[i % ICON_GRADIENTS.length],
              )}
            >
              <Icon className="size-6" aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
