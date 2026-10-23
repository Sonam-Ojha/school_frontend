import { ArrowRight, CircleCheck, PlayCircle } from 'lucide-react';

import { schoolUrl } from '@/app/tenant';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

import { STATS } from '../content';
import { useEntry } from '../hooks/useEntry';

import { AppPreview } from './AppPreview';
import { CONTAINER } from './Section';

interface HeroProps {
  /** The school the "live demo" opens, when there is one. */
  demoSchool: { code: string; name: string } | null;
  trialDays: number;
}

export function Hero({ demoSchool, trialDays }: HeroProps) {
  const { startTrial } = useEntry();

  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-brand-50 via-white to-slate-50"
      />
      <div
        aria-hidden
        className="absolute -top-32 right-0 size-[28rem] rounded-full bg-brand-100/60 blur-3xl"
      />

      <div
        className={cn(
          CONTAINER,
          'relative grid items-center gap-12 pt-14 pb-12 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-16',
        )}
      >
        <div>
          <Badge tone="info">Cloud school management for Indian schools</Badge>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-slate-900 sm:text-5xl">
            Run the whole school from <span className="text-brand-600">one place</span>.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Admissions, attendance, fees, examinations, payroll, library, transport, hostel and parent
            communication in one secure app — with a home screen of their own for everyone from the principal
            to a parent.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={startTrial} rightIcon={<ArrowRight className="size-4" aria-hidden />}>
              Start {trialDays}-day free trial
            </Button>
            {demoSchool ? (
              <a
                href={schoolUrl(demoSchool.code, '/login')}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <PlayCircle className="size-4 text-brand-600" aria-hidden />
                Try the live demo
              </a>
            ) : (
              <a
                href="#modules"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                See what is inside
              </a>
            )}
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            {['No card needed', 'Your own private workspace', 'Set up in minutes'].map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <CircleCheck className="size-4 text-emerald-600" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <AppPreview />
      </div>

      <div className={cn(CONTAINER, 'relative pb-4')}>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-slate-200 bg-slate-200 shadow-card lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col bg-white px-5 py-5">
              <dt className="text-sm text-slate-500">{stat.label}</dt>
              {/* Shown above its label, while a screen reader still hears the label first. */}
              <dd className="order-first text-3xl font-semibold tracking-tight text-slate-900">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
