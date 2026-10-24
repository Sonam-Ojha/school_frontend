import { KeyRound, Rocket, School } from 'lucide-react';

import { Section } from './Section';

const STEPS = [
  {
    title: 'Create your school',
    body: 'Pick a plan and an address such as /greenwood. Your school gets its own private workspace and database in under a minute.',
    icon: School,
    gradient: 'from-brand-500 to-brand-700',
    glow: 'shadow-brand-500/30',
  },
  {
    title: 'Add your people',
    body: 'Set up classes and fee structures, admit students and add staff. Give every teacher, accountant and parent a sign-in of their own.',
    icon: KeyRound,
    gradient: 'from-violet-500 to-purple-700',
    glow: 'shadow-violet-500/30',
  },
  {
    title: 'Run the day',
    body: 'Attendance, fee collection, exams, homework and notices from any phone or computer. Pay for the plan only when the trial has convinced you.',
    icon: Rocket,
    gradient: 'from-emerald-500 to-teal-700',
    glow: 'shadow-emerald-500/30',
  },
];

export function HowItWorksSection() {
  return (
    <Section
      id="how-it-works"
      eyebrow="How it works"
      title="From sign-up to first fee receipt in a day"
      lead="Nothing to install and no servers to look after. Everything runs in the browser, on every device your staff already have."
      className="bg-white"
    >
      <ol className="relative grid gap-8 md:grid-cols-3">
        {/* Connecting line on desktop */}
        <div
          aria-hidden
          className="absolute top-8 left-0 right-0 hidden h-0.5 bg-gradient-to-r from-brand-200 via-violet-200 to-emerald-200 md:block"
          style={{ marginLeft: '10%', marginRight: '10%' }}
        />

        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Step number chip */}
            <div className="absolute -top-3 left-6 rounded-full bg-white px-3 py-0.5 text-xs font-semibold text-slate-400 ring-1 ring-slate-200">
              Step {index + 1}
            </div>

            <div
              className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${step.gradient} ${step.glow}`}
            >
              <step.icon className="size-7" aria-hidden />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.body}</p>

            {/* Connector arrow — hidden on mobile */}
            {index < STEPS.length - 1 && (
              <div
                aria-hidden
                className="absolute -right-4 top-8 z-10 hidden size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 md:flex"
              >
                →
              </div>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
