import { ArrowDown, ArrowRight } from 'lucide-react';
import { Fragment } from 'react';

import { FLOW, STACK } from '../content';

import { Section } from './Section';

export function StackSection() {
  return (
    <Section
      id="stack"
      eyebrow="How it is built"
      title="React in front, Node.js behind, MySQL underneath"
      lead="Two projects: a React single-page app and a Node.js API. They speak plain REST and JSON, so either side can be changed without touching the other."
      className="border-y border-slate-200 bg-white"
    >
      <ol className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {FLOW.map(({ title, body, icon: Icon }, index) => (
          <Fragment key={title}>
            {index > 0 && (
              <li aria-hidden className="flex items-center justify-center text-slate-300">
                <ArrowRight className="hidden size-5 lg:block" />
                <ArrowDown className="size-5 lg:hidden" />
              </li>
            )}
            <li className="rounded-card border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-slate-200">
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
            </li>
          </Fragment>
        ))}
      </ol>

      <dl className="mt-10 grid gap-8 md:grid-cols-3">
        {STACK.map(({ title, items }) => (
          <div key={title}>
            <dt className="text-sm font-semibold text-slate-900">{title}</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {items.map((item) => (
                <span
                  key={item}
                  className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {item}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
