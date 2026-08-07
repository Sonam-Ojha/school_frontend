import { GraduationCap, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { env } from '@/config/env';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/store/uiStore';

import { SidebarNav } from './SidebarNav';

function Brand({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', isCollapsed && 'justify-center')}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
        <GraduationCap className="size-5" aria-hidden />
      </span>
      {!isCollapsed && (
        <span className="truncate text-sm font-semibold text-slate-900">{env.appName}</span>
      )}
    </div>
  );
}

/** Permanent rail from `lg` up. Collapsible to icons to reclaim table width. */
export function DesktopSidebar() {
  const isCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col',
        'transition-[width] duration-200',
        isCollapsed ? 'w-[4.5rem]' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
        <Brand isCollapsed={isCollapsed} />
      </div>

      <SidebarNav isCollapsed={isCollapsed} />

      <div className="border-t border-slate-200 p-3">
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          leftIcon={
            isCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )
          }
          className={cn(isCollapsed && 'px-0')}
        >
          {!isCollapsed && 'Collapse'}
        </Button>
      </div>
    </aside>
  );
}

/** Off-canvas drawer below `lg`. Closes on Escape and on navigation. */
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
      <div className="absolute inset-0 bg-slate-900/50" onClick={close} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-overlay"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <Brand isCollapsed={false} />
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={close}
            aria-label="Close navigation"
            leftIcon={<X className="size-5" />}
          />
        </div>

        <SidebarNav onNavigate={close} />
      </div>
    </div>
  );
}
