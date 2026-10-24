import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, Clock, Mail, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';
import { saasService } from '@/features/saas/services/saasService';
import { ApiError } from '@/lib/apiError';
import { applyServerErrors } from '@/lib/formErrors';
import { cn } from '@/lib/cn';
import { LandingNav } from '@/features/landing/components/LandingNav';
import { LandingFooter } from '@/features/landing/components/LandingFooter';
import { CONTAINER } from '@/features/landing/components/Section';
import { useEntry } from '@/features/landing/hooks/useEntry';

const leadSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(120),
  school_name: z.string().trim().min(2, "Enter your school's name.").max(150),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number.'),
  city: z.string().trim().max(80),
  students: z.string().trim().regex(/^\d{0,6}$/, 'Enter a number.'),
  message: z.string().trim().max(2000),
});

type LeadForm = z.infer<typeof leadSchema>;
const FIELDS = ['name', 'school_name', 'email', 'phone', 'city', 'students', 'message'] as const;

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'info@klimb.agency',
    href: 'mailto:info@klimb.agency',
    gradient: 'from-brand-500 to-brand-700',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 7310 249 234',
    href: 'tel:+917310249234',
    gradient: 'from-violet-500 to-purple-700',
  },
  {
    icon: Clock,
    label: 'Response time',
    value: 'Usually within 1 working day',
    href: null,
    gradient: 'from-emerald-500 to-teal-700',
  },
];

const BENEFITS = [
  'We walk through the system with your school\'s own data',
  'You choose which modules matter most: fees, exams, payroll…',
  'No sales pressure — it works or it doesn\'t',
  'We answer every question on the call',
];

export default function ContactPage() {
  const { startTrial } = useEntry();

  const form = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: '', school_name: '', email: '', phone: '', city: '', students: '', message: '' },
  });

  const send = useMutation({ mutationFn: saasService.lead, meta: { skipGlobalError: true } });

  const onSubmit = (values: LeadForm) => {
    send.mutate(
      { ...values, students: values.students ? Number(values.students) : null },
      {
        onSuccess: () => form.reset(),
        onError: (error) => {
          if (applyServerErrors(error, form.setError, FIELDS)) return;
          form.setError('root.serverError', {
            type: 'server',
            message:
              error instanceof ApiError
                ? error.message
                : 'Your message could not be sent. Please try again.',
          });
        },
      },
    );
  };

  return (
    <div className="min-h-dvh bg-white">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/4 size-[500px] rounded-full bg-brand-600/20 blur-[100px]"
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
          <p className="text-sm font-semibold text-brand-400">Get in touch</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Book a demo with{' '}
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              your school's numbers
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-400">
            Tell us a little about your school and we will walk you through the system — fees,
            exams, attendance, whatever matters most to you.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 sm:py-20">
        <div className={CONTAINER}>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
            {/* Left */}
            <div className="space-y-8">
              {/* Benefits */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900">What to expect on the demo</h2>
                <ul className="mt-4 space-y-3">
                  {BENEFITS.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Or try yourself */}
              <div className="rounded-2xl bg-brand-50 border border-brand-100 p-5">
                <h3 className="text-sm font-semibold text-slate-900">Prefer to explore yourself?</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Start a 14-day free trial with every module on — no card needed.
                </p>
                <Button
                  className="mt-4"
                  size="sm"
                  onClick={startTrial}
                  rightIcon={<ArrowRight className="size-3.5" />}
                >
                  Start free trial
                </Button>
              </div>

              {/* Contact info */}
              <div className="space-y-3">
                {CONTACT_INFO.map((info) => (
                  <div key={info.label} className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                        info.gradient,
                      )}
                    >
                      <info.icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <div className="text-xs text-slate-400">{info.label}</div>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-sm font-medium text-slate-900 hover:text-brand-600"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <span className="text-sm font-medium text-slate-900">{info.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              {send.isSuccess ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="size-8 text-emerald-600" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    Thank you — we will be in touch
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">{send.data.message}</p>
                  <Button variant="outline" className="mt-6" onClick={() => send.reset()}>
                    Send another
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-slate-900">Request a demo</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    We usually reply within one working day.
                  </p>
                  <Form form={form} onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput<LeadForm> name="name" label="Your name" autoComplete="name" required />
                      <FormInput<LeadForm> name="school_name" label="School name" autoComplete="organization" required />
                      <FormInput<LeadForm> name="email" type="email" label="Email" autoComplete="email" required />
                      <FormInput<LeadForm> name="phone" type="tel" label="Phone" autoComplete="tel" required />
                      <FormInput<LeadForm> name="city" label="City" />
                      <FormInput<LeadForm> name="students" label="Number of students" inputMode="numeric" />
                    </div>
                    <FormTextarea<LeadForm>
                      name="message"
                      label="Anything we should know?"
                      rows={3}
                    />
                    <Button
                      type="submit"
                      isLoading={send.isPending}
                      size="lg"
                      fullWidth
                      rightIcon={<ArrowRight className="size-4" />}
                      className="bg-brand-600 hover:bg-brand-500"
                    >
                      Request a demo
                    </Button>
                  </Form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
