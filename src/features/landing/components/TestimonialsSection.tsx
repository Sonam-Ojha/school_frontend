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

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="scroll-mt-16 bg-slate-50 py-20 sm:py-24"
    >
      <div className={CONTAINER}>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand-600">What schools say</p>
          <h2
            id="testimonials-title"
            className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            Trusted by school teams across India
          </h2>
          <p className="mt-3 text-base text-slate-600">
            From the principal to the accountant to the front office — everyone has their own place
            in the system.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Decorative quote */}
              <Quote
                className="absolute right-5 top-5 size-8 text-slate-100 transition-colors duration-200 group-hover:text-slate-200"
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

              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white',
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
      </div>
    </section>
  );
}
