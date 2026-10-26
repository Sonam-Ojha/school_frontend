import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { CycleToggle, highestStudentLimit, PlanCard, yearlySaving } from '@/features/saas/components/PlanCard';
import { saasService } from '@/features/saas/services/saasService';
import type { BillingCycle } from '@/features/saas/types';
import { queryKeys } from '@/lib/queryKeys';
import { cn } from '@/lib/cn';
import { LandingNav } from '@/features/landing/components/LandingNav';
import { LandingFooter } from '@/features/landing/components/LandingFooter';
import { CONTAINER } from '@/features/landing/components/Section';
import { useEntry } from '@/features/landing/hooks/useEntry';

const FAQ = [
  {
    q: 'Is there a free trial?',
    a: 'Yes — every plan starts with a 14-day free trial of everything in that plan. No credit card needed.',
  },
  {
    q: 'Is pricing per user or per school?',
    a: 'Per school. Teachers, parents and students sign in at no extra cost, up to the login limit shown on each plan. Only the school pays.',
  },
  {
    q: 'What does each plan add?',
    a: 'Starter is the core school system with assignments and leave. Growth adds library, transport, HR & payroll, analytics, WhatsApp messages and priority support. Enterprise adds hostel, biometric attendance, live bus GPS, your own domain and a dedicated account manager. A school only sees what its plan includes.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes, any time. Upgrading credits the days already paid for. Downgrading takes effect at your next renewal.',
  },
  {
    q: 'Is GST included?',
    a: 'No. All prices are exclusive of 18% GST, which will be charged extra. Tax invoices (CGST/SGST or IGST) are generated automatically.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Bank transfer, UPI, cheque and online payment through Razorpay are all supported.',
  },
  {
    q: 'What happens when the trial ends?',
    a: 'Your data is kept. You pick a plan and continue — or get a 7-day grace period before read-only mode.',
  },
];

const INCLUDED = [
  'Students, staff, fees, attendance & exams',
  'Teacher, parent and student logins',
  'Your own school address',
  'Email & SMS to parents',
  'Reports',
  'PDF receipts & report cards',
  'Daily database backup',
  '12-month support included',
];

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { startTrial } = useEntry();

  const plans = useQuery({
    queryKey: queryKeys.saas.plans(),
    queryFn: ({ signal }) => saasService.plans(signal),
    staleTime: 10 * 60_000,
  });

  const saving = Math.max(0, ...(plans.data ?? []).map(yearlySaving));

  return (
    <div className="min-h-dvh bg-white">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/3 size-[500px] rounded-full bg-brand-600/20 blur-[100px]"
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
        <div className={cn(CONTAINER, 'relative text-center')}>
          <p className="text-sm font-semibold text-brand-400">Simple, honest pricing</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Plans that{' '}
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              grow with your school
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
            Every plan starts with a 14-day free trial of everything in it. Prices are per school,
            not per user — teachers, parents and students sign in at no extra cost.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-16 sm:py-20">
        <div className={CONTAINER}>
          <div className="mb-10 flex justify-center">
            <CycleToggle value={cycle} onChange={setCycle} saving={saving} />
          </div>

          {plans.isPending ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[0, 1, 2].map((key) => (
                <Skeleton key={key} className="h-96" />
              ))}
            </div>
          ) : plans.isError ? (
            <Alert tone="warning">Plans could not be loaded just now. Please refresh the page.</Alert>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {plans.data.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  cycle={cycle}
                  studentsAbove={highestStudentLimit(plans.data)}
                  action={
                    <Button
                      fullWidth
                      variant={plan.is_featured ? 'primary' : 'outline'}
                      onClick={startTrial}
                      rightIcon={<ArrowRight className="size-4" />}
                    >
                      Start free trial
                    </Button>
                  }
                />
              ))}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            All prices in Indian rupees, exclusive of 18% GST.{' '}
            <a href="#contact-pricing" className="font-medium text-brand-600 hover:underline">
              Running a group of schools?
            </a>
          </p>
        </div>
      </section>

      {/* What's included */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className={CONTAINER}>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-brand-600">Every plan includes</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                No hidden charges
              </h2>
              <p className="mt-3 text-slate-600">
                Every plan comes with the core school system. Bigger plans add modules, WhatsApp,
                priority support and room for more students.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Enterprise / groups */}
            <div
              id="contact-pricing"
              className="flex flex-col justify-center rounded-2xl bg-slate-900 p-8 text-white"
            >
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-600/20 text-brand-400">
                <svg viewBox="0 0 24 24" fill="none" className="size-6" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 21h18M9 8h1m-1 4h1m4-4h1m-1 4h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-bold">School groups & trusts</h3>
              <p className="mt-2 text-slate-400">
                Running a chain of schools or a white-label platform for other schools? Get a
                custom plan with volume pricing, a shared Super Admin console and dedicated
                support.
              </p>
              <Button
                className="mt-6 self-start bg-brand-600 hover:bg-brand-500"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Talk to us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className={CONTAINER}>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-brand-600">FAQ</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Questions about pricing
            </h2>
          </div>
          <div className="mt-10 max-w-2xl divide-y divide-slate-200">
            {FAQ.map((item, i) => (
              <div key={i} className="py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-medium text-slate-900">{item.q}</span>
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-transform duration-200',
                      openFaq === i && 'rotate-45',
                    )}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
