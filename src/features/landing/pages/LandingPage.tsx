import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { saasService } from '@/features/saas/services/saasService';
import { queryKeys } from '@/lib/queryKeys';

import { ClosingSection } from '../components/ClosingSection';
import { ContactSection } from '../components/ContactSection';
import { Hero } from '../components/Hero';
import { HighlightsSection } from '../components/HighlightsSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { LandingFooter } from '../components/LandingFooter';
import { LandingNav } from '../components/LandingNav';
import { ModulesSection } from '../components/ModulesSection';
import { PricingSection } from '../components/PricingSection';
import { RolesSection } from '../components/RolesSection';
import { TestimonialsSection } from '../components/TestimonialsSection';

// Named in full so Tailwind generates it; applied to <html> only while this
// page is open, and not at all for somebody who has asked for less motion.
const SMOOTH_SCROLL = 'motion-safe:scroll-smooth';

/**
 * The public face of the product, at `/`: what it does, who it is for, what
 * it costs, and the ways in — a free trial, the live demo school, or a demo
 * with the team.
 */
export default function LandingPage() {
  const config = useQuery({
    queryKey: queryKeys.saas.config(),
    queryFn: ({ signal }) => saasService.config(signal),
    staleTime: 10 * 60_000,
    meta: { skipGlobalError: true },
  });

  const demoSchool = config.data?.demo_school ?? null;
  const trialDays = config.data?.trial_days ?? 14;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(SMOOTH_SCROLL);
    return () => root.classList.remove(SMOOTH_SCROLL);
  }, []);

  // Arriving at `/#pricing` from another page: the section loads after the
  // first paint, so the browser's own jump would land short of it.
  useEffect(() => {
    if (!window.location.hash) return;
    const timer = window.setTimeout(() => {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    }, 300);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-dvh bg-slate-50">
      <LandingNav />

      <main>
        <Hero demoSchool={demoSchool} trialDays={trialDays} />
        <ModulesSection />
        <RolesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection trialDays={trialDays} />
        <HighlightsSection />
        <ContactSection
          supportEmail={config.data?.support_email || null}
          supportPhone={config.data?.support_phone || null}
        />
        <ClosingSection demoSchool={demoSchool} trialDays={trialDays} />
      </main>

      <LandingFooter />
    </div>
  );
}
