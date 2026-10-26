import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { CycleToggle, highestStudentLimit, PlanCard, yearlySaving } from '@/features/saas/components/PlanCard';
import { saasService } from '@/features/saas/services/saasService';
import type { BillingCycle } from '@/features/saas/types';
import { queryKeys } from '@/lib/queryKeys';

import { Section } from './Section';

/** The plans, as the platform currently sells them. */
export function PricingSection({ trialDays }: { trialDays: number }) {
  const [cycle, setCycle] = useState<BillingCycle>('yearly');
  const plans = useQuery({
    queryKey: queryKeys.saas.plans(),
    queryFn: ({ signal }) => saasService.plans(signal),
    staleTime: 10 * 60_000,
  });

  const saving = Math.max(0, ...(plans.data ?? []).map(yearlySaving));

  return (
    <Section
      id="pricing"
      eyebrow="Pricing"
      title="Simple plans that grow with your school"
      lead={`Every plan starts with a ${trialDays}-day free trial of everything in it. Prices are per school, not per user — teachers, parents and students sign in at no extra cost.`}
      className="bg-white"
    >
      <div className="mb-8 flex justify-center">
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
                  onClick={() => window.location.assign('/signup')}
                >
                  Start free trial
                </Button>
              }
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        All prices in Indian rupees, exclusive of 18% GST. Need something bigger, such as a group of schools?{' '}
        <a href="#contact" className="font-medium text-brand-600 hover:underline">
          Talk to us
        </a>
        .
      </p>
    </Section>
  );
}
