import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';

import { schoolUrl } from '@/app/tenant';
import { Button } from '@/components/ui/Button';

import { useEntry } from '../hooks/useEntry';

import { CONTAINER } from './Section';

interface ClosingSectionProps {
  demoSchool: { code: string; name: string } | null;
  trialDays: number;
}

/** The last word: a dramatic dark CTA section. */
export function ClosingSection({ demoSchool, trialDays }: ClosingSectionProps) {
  const { startTrial } = useEntry();

  return (
    <section aria-labelledby="closing-title" className="py-20 sm:py-28 bg-white">
      <div className={CONTAINER}>
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-16 text-center sm:px-16 sm:py-24">
          {/* Glowing orbs */}
          <div
            aria-hidden
            className="animate-pulse-glow pointer-events-none absolute -top-32 left-1/4 size-[400px] rounded-full bg-brand-600/25 blur-[80px]"
          />
          <div
            aria-hidden
            className="animate-pulse-glow pointer-events-none absolute -bottom-32 right-1/4 size-[400px] rounded-full bg-purple-600/20 blur-[80px]"
            style={{ animationDelay: '1.5s' }}
          />

          {/* Grid overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-300 backdrop-blur-sm">
              <Sparkles className="size-3.5" aria-hidden />
              Start for free · No card needed
            </div>

            <h2
              id="closing-title"
              className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Your school, ready{' '}
              <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                in a minute
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
              Start a {trialDays}-day free trial with every module switched on. Bring your classes,
              students and fee structures, or begin with sample data and explore.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                onClick={startTrial}
                rightIcon={<ArrowRight className="size-4" aria-hidden />}
                className="bg-brand-600 hover:bg-brand-500 shadow-[0_0_32px_rgba(99,102,241,0.5)]"
              >
                Start free trial
              </Button>
              {demoSchool && (
                <a
                  href={schoolUrl(demoSchool.code, '/login')}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  <PlayCircle className="size-5 text-brand-400" aria-hidden />
                  Open the live demo
                </a>
              )}
            </div>

            {/* Floating trust badges */}
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              {[
                '✓ 14-day free trial',
                '✓ No card required',
                '✓ Every module on day 1',
                '✓ Cancel any time',
              ].map((badge) => (
                <span key={badge} className="text-sm text-slate-500">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
