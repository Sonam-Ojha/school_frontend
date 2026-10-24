import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { FEATURE_GROUPS, ROADMAP } from '@/features/landing/catalog';
import { useEntry } from '@/features/landing/hooks/useEntry';
import { LandingNav } from '@/features/landing/components/LandingNav';
import { LandingFooter } from '@/features/landing/components/LandingFooter';
import { CONTAINER } from '@/features/landing/components/Section';

const ICON_GRADIENTS = [
  'from-brand-500 to-brand-700',
  'from-violet-500 to-purple-700',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
];

export default function FeaturesPage() {
  const { startTrial } = useEntry();

  return (
    <div className="min-h-dvh bg-white">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/4 size-[500px] rounded-full bg-brand-600/20 blur-[100px]"
        />
        <div className={cn(CONTAINER, 'relative text-center')}>
          <p className="text-sm font-semibold text-brand-400">Everything that's built</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Every feature,{' '}
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              honestly listed
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            What is not built, or not connected to anything yet, is listed under Roadmap — not
            above it. Nothing here is aspirational.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button
              size="lg"
              onClick={startTrial}
              rightIcon={<ArrowRight className="size-4" />}
              className="bg-brand-600 hover:bg-brand-500 shadow-[0_0_24px_rgba(99,102,241,0.4)]"
            >
              Start free trial
            </Button>
          </div>
        </div>
      </section>

      {/* Sub-nav */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className={cn(CONTAINER, 'flex gap-1 overflow-x-auto py-3 scrollbar-thin')}>
          {FEATURE_GROUPS.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {g.short}
            </a>
          ))}
        </div>
      </div>

      {/* Feature groups */}
      <div className="py-16 sm:py-20">
        {FEATURE_GROUPS.map((group, gi) => (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`${group.id}-title`}
            className={cn(
              'scroll-mt-28 py-14',
              gi % 2 === 1 ? 'bg-slate-50' : 'bg-white',
            )}
          >
            <div className={CONTAINER}>
              {/* Group header */}
              <div className="mb-10 flex items-start gap-4">
                <span
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md',
                    ICON_GRADIENTS[gi % ICON_GRADIENTS.length],
                  )}
                >
                  <group.icon className="size-6" aria-hidden />
                </span>
                <div>
                  <h2
                    id={`${group.id}-title`}
                    className="text-xl font-bold text-slate-900 sm:text-2xl"
                  >
                    {group.title}
                  </h2>
                  <p className="mt-1 text-slate-500">{group.lead}</p>
                </div>
              </div>

              {/* Module cards */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.modules.map((mod) => (
                  <div
                    key={mod.name}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform duration-200 group-hover:scale-105',
                          ICON_GRADIENTS[gi % ICON_GRADIENTS.length],
                        )}
                      >
                        <mod.icon className="size-4.5" aria-hidden />
                      </span>
                      <h3 className="font-semibold text-slate-900">{mod.name}</h3>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{mod.summary}</p>
                    <ul className="mt-3 space-y-1.5">
                      {mod.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-400" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Roadmap */}
      <section className="bg-slate-950 py-16 sm:py-20">
        <div className={cn(CONTAINER, 'text-center')}>
          <p className="text-sm font-semibold text-amber-400">What's next</p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Roadmap</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            On the way, and said so plainly — not mixed into the feature list.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {ROADMAP.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-sm"
              >
                <Icon className="size-3.5 text-amber-400" aria-hidden />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
