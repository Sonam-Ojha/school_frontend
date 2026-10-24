import { ArrowRight, Building2, GraduationCap, Globe, Rocket } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { LandingNav } from '@/features/landing/components/LandingNav';
import { LandingFooter } from '@/features/landing/components/LandingFooter';
import { CONTAINER } from '@/features/landing/components/Section';
import { useEntry } from '@/features/landing/hooks/useEntry';

const VALUES = [
  {
    icon: GraduationCap,
    title: 'Built for India',
    body: 'Indian rupees, Indian number formatting (lakh and crore), April–March academic sessions, CBSE and State Board class structures, and GST-compliant invoices. Not an international system forced to fit.',
    gradient: 'from-brand-500 to-brand-700',
  },
  {
    icon: Rocket,
    title: 'Honest about what works',
    body: 'Every feature on our features page is built and connected. What is still being built is listed under Roadmap — not in the marketing copy.',
    gradient: 'from-violet-500 to-purple-700',
  },
  {
    icon: Building2,
    title: 'One system, every office',
    body: 'The student the receptionist admits is the one the teacher marks present, the accountant bills, and the librarian lends to. Data is shared, not copied.',
    gradient: 'from-emerald-500 to-teal-700',
  },
  {
    icon: Globe,
    title: 'Works everywhere',
    body: 'A phone browser on mobile data, an old laptop in the office — the app is built to be fast and useful on whatever hardware your school already has. No app installation required.',
    gradient: 'from-amber-500 to-orange-600',
  },
];

const TIMELINE = [
  { year: '2024', event: 'KLIMB AGENCY starts building the School ERP after hearing the same pain points from six different schools.' },
  { year: 'Early 2025', event: 'First version with students, attendance and fee collection live in production.' },
  { year: 'Mid 2025', event: 'Payroll, library, transport, hostel and the parent portal added.' },
  { year: 'Late 2025', event: 'Examinations, report cards, analytics and the multi-tenant Super Admin console completed.' },
  { year: 'Oct 2026', event: 'White-label SaaS platform launched for school groups and agency partners.' },
];

export default function AboutPage() {
  const { startTrial } = useEntry();

  return (
    <div className="min-h-dvh bg-white">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-1/4 size-[500px] rounded-full bg-purple-600/20 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className={cn(CONTAINER, 'relative')}>
          <p className="text-sm font-semibold text-brand-400">About us</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            A school ERP built by people who listened to schools
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-400">
            KLIMB AGENCY is a technology studio focused on software that works the way the people who use
            it actually work. The School ERP is our largest and most detailed product — designed with
            input from principals, accountants, class teachers and parents.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-20">
        <div className={CONTAINER}>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold text-brand-600">Our mission</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Every school deserves modern software
              </h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                Most school software in India was designed in the 2000s, runs only on Windows, and
                requires a dedicated server in the server room. Schools spend money on it every year
                and still keep paper registers as backup, because the software is too fragile to trust.
              </p>
              <p className="mt-4 leading-relaxed text-slate-600">
                We set out to build something that a school could trust with its real data: fast, secure,
                and honest about what it does and does not do. The result runs in any browser, on any
                device, and handles everything from the admission form to the payslip.
              </p>
              <Button
                className="mt-8"
                onClick={startTrial}
                rightIcon={<ArrowRight className="size-4" />}
              >
                Start free trial
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '25+', label: 'Modules built' },
                { value: '16', label: 'Built-in roles' },
                { value: '63', label: 'Database tables' },
                { value: '1 min', label: 'To set up a school' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                  <span className="mt-1 text-sm text-slate-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className={CONTAINER}>
          <p className="text-sm font-semibold text-brand-600">What we stand for</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Four things we will not compromise on
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-200 group-hover:scale-105',
                    v.gradient,
                  )}
                >
                  <v.icon className="size-6" aria-hidden />
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{v.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 sm:py-20">
        <div className={CONTAINER}>
          <p className="text-sm font-semibold text-brand-600">How we got here</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Our story</h2>
          <div className="relative mt-10 space-y-8">
            {/* Vertical line */}
            <div
              aria-hidden
              className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-200 to-slate-100"
            />
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-6 pl-12">
                {/* Dot */}
                <div
                  aria-hidden
                  className={cn(
                    'absolute left-0 flex size-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold shadow-sm',
                    i === TIMELINE.length - 1
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {i + 1}
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                    {item.year}
                  </span>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / contact */}
      <section className="bg-slate-950 py-16 sm:py-20">
        <div className={cn(CONTAINER, 'grid gap-12 lg:grid-cols-2 lg:items-center')}>
          <div>
            <p className="text-sm font-semibold text-brand-400">The team</p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Built by KLIMB AGENCY</h2>
            <p className="mt-4 leading-relaxed text-slate-400">
              We are a small, focused team of designers and engineers. The School ERP is designed and
              developed by us; we do not resell or rebrand a third-party system.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { label: 'Contact', value: 'info@klimb.agency' },
                { label: 'Phone', value: '+91 7310 249 234' },
                { label: 'Website', value: 'www.klimb.agency' },
              ].map((item) => (
                <div key={item.label} className="flex gap-3 text-sm">
                  <span className="w-16 shrink-0 text-slate-500">{item.label}</span>
                  <span className="text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white">Ready to see it?</h3>
            <p className="mt-2 text-sm text-slate-400">
              Start a 14-day free trial — every module on, no card needed — or book a walkthrough
              with our team.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button
                fullWidth
                onClick={startTrial}
                rightIcon={<ArrowRight className="size-4" />}
                className="bg-brand-600 hover:bg-brand-500"
              >
                Start free trial
              </Button>
              <a
                href="/#contact"
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-white/15 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Book a demo
              </a>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
