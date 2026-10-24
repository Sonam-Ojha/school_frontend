import { ArrowDown, ArrowRight } from 'lucide-react';
import { Fragment } from 'react';

import { cn } from '@/lib/cn';

import { FLOW, STACK } from '../content';

import { CONTAINER } from './Section';

const FLOW_GRADIENTS = [
  { icon: 'from-brand-500 to-brand-700', glow: 'shadow-brand-500/40' },
  { icon: 'from-violet-500 to-purple-700', glow: 'shadow-violet-500/40' },
  { icon: 'from-emerald-500 to-teal-700', glow: 'shadow-emerald-500/40' },
];

const TAG_COLORS = [
  'bg-brand-500/15 text-brand-300 border-brand-500/20',
  'bg-violet-500/15 text-violet-300 border-violet-500/20',
  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
];

export function StackSection() {
  return (
    <section
      id="stack"
      aria-labelledby="stack-title"
      className="scroll-mt-16 bg-slate-950 py-16 sm:py-20"
    >
      <div className={CONTAINER}>
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand-400">How it is built</p>
          <h2
            id="stack-title"
            className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            React in front, Node.js behind, MySQL underneath
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Two projects: a React single-page app and a Node.js API. They speak plain REST and JSON,
            so either side can be changed without touching the other.
          </p>
        </div>

        {/* Flow diagram */}
        <ol className="mt-10 grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {FLOW.map(({ title, body, icon: Icon }, index) => (
            <Fragment key={title}>
              {index > 0 && (
                <li
                  aria-hidden
                  className="flex items-center justify-center text-slate-600"
                >
                  <ArrowRight className="hidden size-6 lg:block" />
                  <ArrowDown className="size-6 lg:hidden" />
                </li>
              )}
              <li className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/8">
                {/* subtle gradient orb */}
                <div
                  className={cn(
                    'pointer-events-none absolute -right-8 -top-8 size-24 rounded-full blur-2xl opacity-20 transition-opacity duration-200 group-hover:opacity-40',
                    index === 0 ? 'bg-brand-500' : index === 1 ? 'bg-violet-500' : 'bg-emerald-500',
                  )}
                />
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-200 group-hover:scale-105',
                      FLOW_GRADIENTS[index].icon,
                      FLOW_GRADIENTS[index].glow,
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="text-base font-semibold text-white">{title}</h3>
                </div>
                <p className="relative mt-3 text-sm leading-relaxed text-slate-400">{body}</p>
              </li>
            </Fragment>
          ))}
        </ol>

        {/* Tech stacks */}
        <dl className="mt-10 grid gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 md:grid-cols-3">
          {STACK.map(({ title, items }, gi) => (
            <div key={title}>
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {title}
              </dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150',
                      TAG_COLORS[gi % TAG_COLORS.length],
                    )}
                  >
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
