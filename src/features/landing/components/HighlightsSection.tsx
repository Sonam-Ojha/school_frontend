import { HIGHLIGHTS } from '../content';

import { Section } from './Section';

export function HighlightsSection() {
  return (
    <Section
      id="highlights"
      eyebrow="Why schools choose us"
      title="Built for the way schools really work"
      lead="The parts nobody sees are where a school system earns its keep: whose data is whose, who may do what, and whether yesterday’s entries are still there today."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HIGHLIGHTS.map(({ title, body, icon: Icon }) => (
          <li key={title} className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Icon className="size-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
          </li>
        ))}
      </ul>

    </Section>
  );
}
