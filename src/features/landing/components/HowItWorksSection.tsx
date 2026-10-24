import { ArrowRight, KeyRound, Rocket, School } from 'lucide-react';

import { cn } from '@/lib/cn';

import { Section } from './Section';

const STEPS = [
  {
    title: 'Create your school',
    body: 'Pick a plan and an address such as /greenwood. Your school gets its own private workspace and database in under a minute.',
    icon: School,
    gradient: 'from-brand-500 to-brand-700',
    glow: 'shadow-brand-500/30',
    badge: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
  },
  {
    title: 'Add your people',
    body: 'Set up classes and fee structures, admit students and add staff. Give every teacher, accountant and parent a sign-in of their own.',
    icon: KeyRound,
    gradient: 'from-violet-500 to-purple-700',
    glow: 'shadow-violet-500/30',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  {
    title: 'Run the day',
    body: 'Attendance, fee collection, exams, homework and notices from any phone or computer. Pay for the plan only when the trial has convinced you.',
    icon: Rocket,
    gradient: 'from-emerald-500 to-teal-700',
    glow: 'shadow-emerald-500/30',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
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
          className="absolute top-9 left-0 right-0 hidden h-0.5 bg-gradient-to-r from-brand-200 via-violet-200 to-emerald-200 md:block"
          style={{ marginLeft: '12%', marginRight: '12%' }}
        />

        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-slate-300"
          >
            {/* Step number badge */}
            <div
              className={cn(
                'absolute -top-3.5 left-5 rounded-full border px-3 py-0.5 text-xs font-bold backdrop-blur-sm',
                step.badge,
              )}
            >
              Step {index + 1}
            </div>

            {/* Icon */}
            <div
              className={cn(
                'flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-105',
                step.gradient,
                step.glow,
              )}
            >
              <step.icon className="size-8" aria-hidden />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.body}</p>

            {/* Connector arrow — hidden on mobile */}
            {index < STEPS.length - 1 && (
              <div
                aria-hidden
                className="absolute -right-4 top-9 z-10 hidden size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm md:flex"
              >
                <ArrowRight className="size-3.5" />
              </div>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
