import { KeyRound, Rocket, School, type LucideIcon } from 'lucide-react';

import { Section } from './Section';

interface Step {
  title: string;
  body: string;
  icon: LucideIcon;
}

const STEPS: Step[] = [
  {
    title: 'Create your school',
    body: 'Pick a plan and an address such as /greenwood. Your school gets its own private workspace and database in under a minute.',
    icon: School,
  },
  {
    title: 'Add your people',
    body: 'Set up classes and fee structures, admit students and add staff. Give every teacher, accountant and parent a sign-in of their own.',
    icon: KeyRound,
  },
  {
    title: 'Run the day',
    body: 'Attendance, fee collection, exams, homework and notices from any phone or computer. Pay for the plan only when the trial has convinced you.',
    icon: Rocket,
  },
];

export function HowItWorksSection() {
  return (
    <Section
      id="how-it-works"
      eyebrow="How it works"
      title="From sign-up to first fee receipt in a day"
      lead="Nothing to install and no servers to look after. Everything runs in the browser, on every device your staff already have."
    >
      <ol className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <step.icon className="size-5" aria-hidden />
              </span>
              <span className="text-sm font-semibold text-slate-400">Step {index + 1}</span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
