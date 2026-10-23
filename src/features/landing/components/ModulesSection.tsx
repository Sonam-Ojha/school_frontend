import { MODULES } from '../content';

import { Section } from './Section';

export function ModulesSection() {
  return (
    <Section
      id="modules"
      eyebrow="What is inside"
      title="Every office in the school, in one application"
      lead="Each module is a working part of the same system: a student admitted at the front desk is the student the teacher marks present, the accountant bills and the librarian lends to."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map(({ name, summary, icon: Icon }) => (
          <li
            key={name}
            className="flex gap-3.5 rounded-card border border-slate-200 bg-white p-4 shadow-card"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon className="size-[18px]" aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{summary}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
