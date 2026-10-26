import { NavLink } from 'react-router-dom';

import { NAVIGATION, type NavItem } from '@/app/router/navigation';
import { usePlanModules } from '@/features/saas/hooks/useSubscription';
import { moduleOfPath } from '@/features/saas/modules';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';

import { Reveal } from './Reveal';

interface SidebarNavProps {
  /** The desktop rail: icons only until the pointer is on it. The mobile drawer shows everything. */
  rail?: boolean;
  onNavigate?: () => void;
}

/**
 * Navigation list shared by the desktop sidebar and the mobile drawer, so the
 * two can never drift apart. Entries the user cannot access are filtered out,
 * and so are modules the school's plan does not include. Laid out and
 * animated exactly as the Super Admin console's menu is.
 */
export function SidebarNav({ rail = false, onNavigate }: SidebarNavProps) {
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);
  const isPortal = useAuthStore((state) => Boolean(state.user?.is_portal));
  const modules = usePlanModules();

  const inPlan = (item: NavItem) => {
    const module = moduleOfPath(item.to);
    return module === null || modules === null || modules.includes(module);
  };

  const isVisible = (item: NavItem) =>
    (!item.roles || hasAnyRole(item.roles)) &&
    (!item.permissions || hasAnyPermission(item.permissions)) &&
    (!item.staffOnly || !isPortal) &&
    inPlan(item);

  return (
    <nav aria-label="School" className="scrollbar-thin flex-1 space-y-4 overflow-x-hidden overflow-y-auto p-3">
      {NAVIGATION.map((section, index) => {
        const items = section.items.filter(isVisible);
        if (items.length === 0) return null;

        return (
          <div key={section.title ?? index} className="space-y-1">
            {section.title && (
              // The section's name keeps its line while folded, so nothing below moves as it opens.
              <Reveal rail={rail} className="block">
                <span className="block px-3 pb-1 text-[11px] font-semibold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                  {section.title}
                </span>
              </Reveal>
            )}

            {items.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onNavigate}
                title={label}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150',
                    isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                  )
                }
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <Reveal rail={rail}>
                  <span className="block pr-1 pl-3">{label}</span>
                </Reveal>
              </NavLink>
            ))}
          </div>
        );
      })}
    </nav>
  );
}
