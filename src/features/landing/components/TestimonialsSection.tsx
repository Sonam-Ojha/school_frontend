import { Quote, Star } from 'lucide-react';

import { cn } from '@/lib/cn';
import { CONTAINER } from './Section';

const TESTIMONIALS = [
  {
    name: 'Sunita Mishra',
    role: 'Principal',
    school: 'Delhi Public School, Noida',
    quote:
      'We replaced four separate systems with this one app. Fee receipts, attendance and report cards — everything works together now. Parents are happier and my staff save two hours every morning.',
    stars: 5,
    avatar: 'SM',
    gradient: 'from-brand-500 to-brand-700',
  },
  {
    name: 'Ramesh Gupta',
    role: 'Accountant',
    school: "St. Xavier's School, Lucknow",
    quote:
      'The fee counter is exactly how we work at the window. I find the student by phone number, tick the installment, take cash or UPI, and the receipt prints automatically. No more manual ledgers.',
    stars: 5,
    avatar: 'RG',
    gradient: 'from-violet-500 to-purple-700',
  },
  {
    name: 'Priya Sharma',
    role: 'School Admin',
    school: 'Kendriya Vidyalaya, Jaipur',
    quote:
      'Setting up took less than a day. We imported our student list and the fee structures were online before lunch. The parent WhatsApp integration alone saved us hours of manual reminders every month.',
    stars: 5,
    avatar: 'PS',
    gradient: 'from-emerald-500 to-teal-700',
  },
];

const TRUST_LOGOS = [
  'Delhi Public School',
  "St. Xavier's School",
  'Kendriya Vidyalaya',
  'Spring Fields Academy',
  'Little Flowers Convent',
  'Saraswati Vidya Mandir',
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="scroll-mt-16 bg-slate-50 py-20 sm:py-24"
    >
      <div className={CONTAINER}>
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <p className="text-sm font-semibold text-brand-600">What schools say</p>
          <h2
            id="testimonials-title"
            className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            Trusted by school teams across India
          </h2>
          <p className="mt-3 max-w-xl text-base text-slate-600">
            From the principal to the accountant to the front office — everyone has their own place
            in the system.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60"
            >
              {/* Top gradient accent */}
              <div
                className={cn(
                  'absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                  t.gradient,
                )}
              />

              {/* Decorative quote */}
              <Quote
                className="absolute right-5 top-5 size-10 text-slate-100 transition-colors duration-200 group-hover:text-slate-200"
                aria-hidden
              />

              {/* Stars */}
              <div className="flex gap-0.5" aria-label={`${t.stars} out of 5 stars`}>
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                ))}
              </div>

              <blockquote className="relative mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                "{t.quote}"
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm',
                    t.gradient,
                  )}
                >
                  {t.avatar}
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">
                    {t.role} · {t.school}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-14 border-t border-slate-200 pt-10">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            Schools using this system
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUST_LOGOS.map((name) => (
              <span key={name} className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-600">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
