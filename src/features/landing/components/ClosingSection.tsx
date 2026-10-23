import { ArrowRight } from 'lucide-react';

import { schoolUrl } from '@/app/tenant';
import { Button } from '@/components/ui/Button';

import { useEntry } from '../hooks/useEntry';

import { CONTAINER } from './Section';

interface ClosingSectionProps {
  demoSchool: { code: string; name: string } | null;
  trialDays: number;
}

/** The last word: one more way in, and what to expect behind it. */
export function ClosingSection({ demoSchool, trialDays }: ClosingSectionProps) {
  const { startTrial } = useEntry();

  return (
    <section aria-labelledby="closing-title" className="py-16 sm:py-20">
      <div className={CONTAINER}>
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-brand-600/40 blur-3xl"
          />

          <div className="relative">
            <h2
              id="closing-title"
              className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              Your school, ready in a minute
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-slate-300">
              Start a {trialDays}-day free trial with every module switched on. Bring your classes, students and
              fee structures, or begin with sample data and explore.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={startTrial} rightIcon={<ArrowRight className="size-4" aria-hidden />}>
                Start free trial
              </Button>
              {demoSchool && (
                <a
                  href={schoolUrl(demoSchool.code, '/login')}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-white/20 px-5 text-sm font-medium text-white hover:bg-white/10"
                >
                  Open the live demo
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
