import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Mail, Phone, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { saasService } from '@/features/saas/services/saasService';
import { ApiError } from '@/lib/apiError';
import { applyServerErrors } from '@/lib/formErrors';

import { Section } from './Section';

const leadSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(120),
  school_name: z.string().trim().min(2, 'Enter your school’s name.').max(150),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number.'),
  city: z.string().trim().max(80),
  students: z.string().trim().regex(/^\d{0,6}$/, 'Enter a number.'),
  message: z.string().trim().max(2000),
});

type LeadForm = z.infer<typeof leadSchema>;

const FIELDS = ['name', 'school_name', 'email', 'phone', 'city', 'students', 'message'] as const;

interface ContactSectionProps {
  supportEmail: string | null;
  supportPhone: string | null;
}

/** "Book a demo": goes to the platform team's enquiries list. */
export function ContactSection({ supportEmail, supportPhone }: ContactSectionProps) {
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
            message: error instanceof ApiError ? error.message : 'Your message could not be sent. Please try again.',
          });
        },
      },
    );
  };

  return (
    <Section
      id="contact"
      eyebrow="Book a demo"
      title="See it with your own school’s numbers"
      lead="Tell us a little about your school and we will walk you through it — fees, exams, attendance, whatever matters most to you."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            We usually reply within one working day. Prefer to talk now?
          </p>
          {supportPhone && (
            <a href={`tel:${supportPhone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm font-medium text-slate-800 hover:text-brand-700">
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Phone className="size-4" aria-hidden />
              </span>
              {supportPhone}
            </a>
          )}
          {supportEmail && (
            <a href={`mailto:${supportEmail}`} className="flex items-center gap-3 text-sm font-medium text-slate-800 hover:text-brand-700">
              <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Mail className="size-4" aria-hidden />
              </span>
              {supportEmail}
            </a>
          )}
        </div>

        <Card>
          <CardBody>
            {send.isSuccess ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="size-10 text-emerald-600" aria-hidden />
                <h3 className="mt-3 text-base font-semibold text-slate-900">Thank you — we will be in touch</h3>
                <p className="mt-1 text-sm text-slate-500">{send.data.message}</p>
                <Button variant="outline" className="mt-5" onClick={() => send.reset()}>
                  Send another
                </Button>
              </div>
            ) : (
              <Form form={form} onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput<LeadForm> name="name" label="Your name" autoComplete="name" required />
                  <FormInput<LeadForm> name="school_name" label="School" autoComplete="organization" required />
                  <FormInput<LeadForm> name="email" type="email" label="Email" autoComplete="email" required />
                  <FormInput<LeadForm> name="phone" type="tel" label="Phone" autoComplete="tel" required />
                  <FormInput<LeadForm> name="city" label="City" />
                  <FormInput<LeadForm> name="students" label="Number of students" inputMode="numeric" />
                </div>
                <FormTextarea<LeadForm> name="message" label="Anything we should know?" rows={3} />
                <Button type="submit" isLoading={send.isPending} leftIcon={<Send className="size-4" aria-hidden />}>
                  Request a demo
                </Button>
              </Form>
            )}
          </CardBody>
        </Card>
      </div>
    </Section>
  );
}
