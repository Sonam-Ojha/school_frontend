import { cn } from '@/lib/cn';

import { HIGHLIGHTS } from '../content';

import { CONTAINER } from './Section';

const CARD_GRADIENTS = [
  { card: 'from-brand-50 border-brand-100', icon: 'from-brand-500 to-brand-700', dot: 'bg-brand-500' },
  { card: 'from-violet-50 border-violet-100', icon: 'from-violet-500 to-purple-700', dot: 'bg-violet-500' },
  { card: 'from-emerald-50 border-emerald-100', icon: 'from-emerald-500 to-teal-700', dot: 'bg-emerald-500' },
  { card: 'from-amber-50 border-amber-100', icon: 'from-amber-500 to-orange-600', dot: 'bg-amber-500' },
  { card: 'from-pink-50 border-pink-100', icon: 'from-pink-500 to-rose-600', dot: 'bg-pink-500' },
  { card: 'from-cyan-50 border-cyan-100', icon: 'from-cyan-500 to-blue-600', dot: 'bg-cyan-500' },
];

export function HighlightsSection() {
  return (
    <section
      id="highlights"
      aria-labelledby="highlights-title"
      className="scroll-mt-16 bg-white py-16 sm:py-20"
    >
      <div className={CONTAINER}>
        {/* Centered header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-brand-600">Why schools choose us</p>
          <h2
            id="highlights-title"
            className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            Built for the way schools really work
          </h2>
          <p className="mt-3 text-base text-slate-600">
            The parts nobody sees are where a school system earns its keep: whose data is whose,
            who may do what, and whether yesterday's entries are still there today.
          </p>
        </div>

        {/* Cards */}
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map(({ title, body, icon: Icon }, i) => {
            const { card, icon: iconGrad } = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
            return (
              <li
                key={title}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border bg-gradient-to-br to-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl',
                  card,
                )}
              >
                {/* Decorative circle */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.12] bg-current"
                />

                {/* Number chip */}
                <span className="absolute top-4 right-4 text-[10px] font-bold text-slate-300">
                  0{i + 1}
                </span>

                <span
                  className={cn(
                    'flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110',
                    iconGrad,
                  )}
                >
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
