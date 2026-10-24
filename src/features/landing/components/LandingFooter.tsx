import { GraduationCap, Mail, Phone, Globe } from 'lucide-react';

import { env } from '@/config/env';
import { cn } from '@/lib/cn';

import { CONTAINER } from './Section';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Who it\'s for', href: '/#roles' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About us', href: '/about' },
    { label: 'Book a demo', href: '/contact' },
  ],
  Company: [
    { label: 'Start free trial', href: '/signup' },
    { label: 'Sign in to your school', href: '/login' },
    { label: 'Platform admin', href: '/superadmin/login' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950">
      <div className={cn(CONTAINER, 'py-14')}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <a href="/" className="inline-flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.4)]">
                <GraduationCap className="size-5" aria-hidden />
              </span>
              <span className="text-base font-semibold text-white">{env.appName}</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              A cloud-based, multi-tenant School Management ERP built for Indian schools. One
              system for every office, every role, every device.
            </p>
            <div className="mt-6 space-y-2.5">
              <a
                href="mailto:info@klimb.agency"
                className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
              >
                <Mail className="size-4 text-brand-500" aria-hidden />
                info@klimb.agency
              </a>
              <a
                href="tel:+917310249234"
                className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
              >
                <Phone className="size-4 text-brand-500" aria-hidden />
                +91 7310 249 234
              </a>
              <a
                href="https://www.klimb.agency"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
              >
                <Globe className="size-4 text-brand-500" aria-hidden />
                www.klimb.agency
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {group}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {env.appName} · Designed by{' '}
            <a
              href="https://www.klimb.agency"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300"
            >
              KLIMB AGENCY
            </a>
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
