import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  BarChart3,
  Building2,
  CalendarClock,
  CreditCard,
  Inbox,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Receipt,
  Settings,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { AccountMenu } from '@/components/layout/AccountMenu';
import { Reveal } from '@/components/layout/Reveal';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { BrandMark } from '@/components/brand/BrandLogo';
import { env } from '@/config/env';
import { cn } from '@/lib/cn';

import { can, platformApi } from '../api';
import { usePlatformAuth } from '../store';
import type { PlatformRight } from '../types';

interface Tab {
  label: string;
  /** `/superadmin<to>` */
  to: string;
  icon: LucideIcon;
  right: PlatformRight;
}

interface TabGroup {
  title: string | null;
  tabs: Tab[];
}

/** The console's tabs, `/superadmin/<tab>`, grouped as a platform team works. */
export const PLATFORM_TABS: TabGroup[] = [
  { title: null, tabs: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, right: 'schools.read' }] },
  {
    title: 'Schools',
    tabs: [
      { label: 'Schools', to: '/schools', icon: Building2, right: 'schools.read' },
      { label: 'Plans & pricing', to: '/plans', icon: Layers, right: 'plans.read' },
    ],
  },
  {
    title: 'Billing',
    tabs: [
      { label: 'Invoices', to: '/invoices', icon: Receipt, right: 'billing.read' },
      { label: 'Payments', to: '/payments', icon: CreditCard, right: 'billing.read' },
      { label: 'Renewals', to: '/renewals', icon: CalendarClock, right: 'billing.read' },
      { label: 'Revenue reports', to: '/reports', icon: BarChart3, right: 'reports.read' },
    ],
  },
  {
    title: 'Customers',
    tabs: [
      { label: 'Support tickets', to: '/tickets', icon: LifeBuoy, right: 'tickets.read' },
      { label: 'Enquiries', to: '/enquiries', icon: Inbox, right: 'leads.read' },
    ],
  },
  {
    title: 'Platform',
    tabs: [
      { label: 'Audit logs', to: '/audit-logs', icon: Activity, right: 'audit.read' },
      { label: 'Team & roles', to: '/team', icon: Users, right: 'team.manage' },
      { label: 'Settings', to: '/settings', icon: Settings, right: 'settings.manage' },
    ],
  },
];

const ALL_TABS = PLATFORM_TABS.flatMap((group) => group.tabs);

function Brand({ rail }: { rail: boolean }) {
  return (
    <div className="flex items-center" title={`${env.appName} — Super Admin`}>
      <BrandMark />
      <Reveal rail={rail}>
        <span className="block pr-2 pl-2.5">
          <span className="block text-sm font-semibold whitespace-nowrap text-slate-900">{env.appName}</span>
          <span className="block text-xs whitespace-nowrap text-slate-500">Super Admin console</span>
        </span>
      </Reveal>
    </div>
  );
}

function Tabs({ rail, onNavigate }: { rail: boolean; onNavigate?: () => void }) {
  const user = usePlatformAuth((state) => state.user);
  return (
    <nav aria-label="Console" className="scrollbar-thin flex-1 space-y-4 overflow-x-hidden overflow-y-auto p-3">
      {PLATFORM_TABS.map((group) => {
        const tabs = group.tabs.filter((tab) => can(user, tab.right));
        if (tabs.length === 0) return null;
        return (
          <div key={group.title ?? 'top'} className="space-y-1">
            {group.title && (
              // The group's name keeps its line while folded, so nothing below moves as it opens.
              <Reveal rail={rail} className="block">
                <span className="block px-3 pb-1 text-[11px] font-semibold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                  {group.title}
                </span>
              </Reveal>
            )}
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                onClick={onNavigate}
                title={tab.label}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150',
                    isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                  )
                }
              >
                <tab.icon className="size-5 shrink-0" aria-hidden />
                <Reveal rail={rail}>
                  <span className="block pr-1 pl-3">{tab.label}</span>
                </Reveal>
              </NavLink>
            ))}
          </div>
        );
      })}
    </nav>
  );
}

/** The current tab, for the bar (`superadmin / Schools`) and the browser tab. */
function useTabTitle(): string {
  const { pathname } = useLocation();
  const tab = ALL_TABS.find((entry) => pathname === entry.to || pathname.startsWith(`${entry.to}/`));
  return tab?.label ?? 'Console';
}

export function PlatformLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = useTabTitle();
  const user = usePlatformAuth((state) => state.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${title} · Super Admin · ${env.appName}`;
  }, [title]);

  const logout = useMutation({
    mutationFn: () => platformApi.logout(),
    meta: { skipGlobalError: true },
    onSettled: () => {
      usePlatformAuth.getState().clear();
      queryClient.removeQueries({ queryKey: ['platform'] });
    },
  });

  return (
    <div className="flex min-h-dvh bg-slate-50">
      {/*
        As wide as what it shows — icons folded, its longest entry open — and
        part of the page's own row, so the page slides across with it.
      */}
      <aside className="group sticky top-0 z-30 hidden h-dvh w-max min-w-[4.5rem] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-[1.125rem]">
          <Brand rail />
        </div>
        <Tabs rail />
        {user && (
          <div className="shrink-0 border-t border-slate-200 p-3">
            <div className="flex items-center px-1.5">
              <Avatar name={user.name} size="sm" className="size-8" online />
              <Reveal rail>
                <span className="block pr-1 pl-3 text-xs whitespace-nowrap text-slate-500">
                  Signed in as <span className="font-medium text-slate-900">{user.role_label}</span>
                </span>
              </Reveal>
            </div>
          </div>
        )}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} aria-hidden />
          <div role="dialog" aria-modal="true" aria-label="Console navigation" className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-overlay">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <Brand rail={false} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close navigation"
              >
                <X className="size-5" />
              </button>
            </div>
            <Tabs rail={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            iconOnly
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="lg:hidden"
            leftIcon={<Menu className="size-5" />}
          />
          <p className="truncate text-sm text-slate-500">
            <span className="font-medium text-slate-400">superadmin</span>
            <span className="mx-1.5 text-slate-300">/</span>
            <span className="font-semibold text-slate-900">{title}</span>
          </p>
          <div className="flex-1" />
          {user && (
            <AccountMenu
              name={user.name}
              email={user.email}
              subtitle={user.role_label}
              items={can(user, 'settings.manage') ? [{ label: 'Settings & password', icon: Settings, onSelect: () => navigate('/settings') }] : []}
              onSignOut={() => logout.mutate()}
              isSigningOut={logout.isPending}
            />
          )}
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="flex justify-center py-20">
                  <Spinner size="lg" className="text-brand-600" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
