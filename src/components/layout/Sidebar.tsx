import { GraduationCap, X } from 'lucide-react';
import { useEffect } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { env } from '@/config/env';
import { useSchool } from '@/features/saas/SchoolContext';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { roleLabel } from '@/types/auth';

import { Reveal } from './Reveal';
import { SidebarNav } from './SidebarNav';

/** The school's own name and logo, as set in its settings; the product's when unknown. */
function Brand({ rail }: { rail: boolean }) {
  const { info } = useSchool();
  const name = info?.name || env.appName;

  return (
    <div className="flex items-center" title={name}>
      {info?.logo_url ? (
        <img
          src={info.logo_url}
          alt=""
          className="size-9 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-0.5"
        />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
          <GraduationCap className="size-5" aria-hidden />
        </span>
      )}
      <Reveal rail={rail}>
        <span className="block pr-2 pl-2.5">
          {/* A long school name is cut short so it cannot stretch the menu; the full name is the tooltip. */}
          <span className="block max-w-[13rem] truncate text-sm font-semibold whitespace-nowrap text-slate-900">{name}</span>
          <span className="block text-xs whitespace-nowrap text-slate-500">{info?.city || 'School ERP'}</span>
        </span>
      </Reveal>
    </div>
  );
}

/** Who is signed in, at the foot of the menu. */
function SignedIn({ rail }: { rail: boolean }) {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  return (
    <div className="shrink-0 border-t border-slate-200 p-3">
      <div className="flex items-center px-1.5">
        <Avatar name={user.name} src={user.avatar_url} size="sm" className="size-8" online />
        <Reveal rail={rail}>
          <span className="block pr-1 pl-3 text-xs whitespace-nowrap text-slate-500">
            Signed in as <span className="font-medium text-slate-900">{roleLabel(user.roles[0] ?? '')}</span>
          </span>
        </Reveal>
      </div>
    </div>
  );
}

/**
 * The menu from `lg` up, the same as the Super Admin console's: a white rail
 * of icons that opens out to the width of its longest entry while the pointer
 * is on it and folds back when it leaves. It is part of the page's own row,
 * so the page slides across with it rather than being covered.
 */
export function DesktopSidebar() {
  return (
    <aside className="group sticky top-0 z-30 hidden h-dvh w-max min-w-[4.5rem] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-[1.125rem]">
        <Brand rail />
      </div>
      <SidebarNav rail />
      <SignedIn rail />
    </aside>
  );
}

/** Off-canvas drawer below `lg`, everything shown. Closes on Escape and on navigation. */
export function MobileSidebar() {
  const isOpen = useUiStore((state) => state.mobileNavOpen);
  const close = useUiStore((state) => state.closeMobileNav);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="absolute inset-0 bg-slate-900/40" onClick={close} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-overlay"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <Brand rail={false} />
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        <SidebarNav onNavigate={close} />
        <SignedIn rail={false} />
      </div>
    </div>
  );
}
