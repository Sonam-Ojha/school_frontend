import { ArrowRight, CircleCheck, PlayCircle, Sparkles } from 'lucide-react';

import { schoolUrl } from '@/app/tenant';
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
    <section id="top" className="relative overflow-hidden bg-slate-950">
      {/* Animated gradient orbs */}
      <div
        aria-hidden
        className="animate-pulse-glow pointer-events-none absolute -top-40 -left-40 size-[600px] rounded-full bg-brand-600/20 blur-[100px]"
      />
      <div
        aria-hidden
        className="animate-pulse-glow pointer-events-none absolute -right-40 top-1/3 size-[500px] rounded-full bg-purple-600/15 blur-[100px]"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 size-[400px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[80px]"
      />

      {/* Grid pattern overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div
        className={cn(
          CONTAINER,
          'relative grid items-center gap-12 pt-24 pb-16 sm:pt-32 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-24',
        )}
      >
        {/* Left column — copy */}
        <div className="animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-300 backdrop-blur-sm">
            <Sparkles className="size-3.5" aria-hidden />
            Cloud School ERP · Built for India
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
            Run the{' '}
            <span
              className="animate-shimmer bg-gradient-to-r from-brand-400 via-purple-400 to-brand-400 bg-clip-text text-transparent"
            >
              whole school
            </span>
            {' '}from one place.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            Admissions, attendance, fees, exams, payroll, library, transport and
            parent communication — in one secure cloud app with a personalised
            dashboard for every role.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={startTrial}
              rightIcon={<ArrowRight className="size-4" aria-hidden />}
              className="bg-brand-600 hover:bg-brand-500 shadow-[0_0_24px_rgba(99,102,241,0.4)]"
            >
              Start {trialDays}-day free trial
            </Button>
            {demoSchool ? (
              <a
                href={schoolUrl(demoSchool.code, '/login')}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                <PlayCircle className="size-4 text-brand-400" aria-hidden />
                Try the live demo
              </a>
            ) : (
              <a
                href="#modules"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                See what's inside
              </a>
            )}
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
            {['No credit card needed', 'Private workspace', 'Set up in minutes'].map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <CircleCheck className="size-4 text-emerald-400" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Right column — app preview */}
        <div className="animate-fade-up-delay-2 animate-float">
          <AppPreview />
        </div>
      </div>

      {/* Stats bar */}
      <div className={cn(CONTAINER, 'relative pb-16')}>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                'flex flex-col bg-white/[0.03] px-6 py-6 transition-colors hover:bg-white/[0.06]',
                `animate-fade-up-delay-${i + 1}`,
              )}
            >
              <dt className="text-sm text-slate-400">{stat.label}</dt>
              <dd className="order-first text-3xl font-bold tracking-tight text-white">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Bottom fade to next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-slate-50"
      />
    </section>
  );
}
