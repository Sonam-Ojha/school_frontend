import { NavLink } from 'react-router-dom';

import { NAVIGATION, type NavItem } from '@/app/router/navigation';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';

interface SidebarNavProps {
  /** Icon-only rail. Ignored on the mobile drawer. */
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

/**
 * Navigation list shared by the desktop sidebar and the mobile drawer, so the
 * two can never drift apart. Entries the user cannot access are filtered out.
 */
export function SidebarNav({ isCollapsed = false, onNavigate }: SidebarNavProps) {
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);

  const isVisible = (item: NavItem) =>
    (!item.roles || hasAnyRole(item.roles)) &&
    (!item.permissions || hasAnyPermission(item.permissions));

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {NAVIGATION.map((section, index) => {
        const items = section.items.filter(isVisible);
        if (items.length === 0) return null;

        return (
          <div key={section.title ?? index}>
            {section.title && !isCollapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {section.title}
              </p>
            )}

            <ul className="space-y-1">
              {items.map(({ label, to, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={onNavigate}
                    title={isCollapsed ? label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                        'transition-colors duration-150',
                        isCollapsed && 'justify-center px-2',
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                      )
                    }
                  >
                    <Icon className="size-5 shrink-0" aria-hidden />
                    {!isCollapsed && <span className="truncate">{label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
