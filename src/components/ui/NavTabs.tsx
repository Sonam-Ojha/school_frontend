import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';

export interface NavTabItem {
  label: string;
  to: string;
  icon?: LucideIcon;
  /** Hidden unless the user holds one of these permissions. */
  permissions?: string[];
  /** Hidden unless the user holds one of these roles. */
  roles?: string[];
}

interface NavTabsProps {
  items: NavTabItem[];
  className?: string;
}

/**
 * Route-driven tab bar. Each tab is a real URL, so a tab is linkable and
 * survives a refresh — which a `useState` tab index would not.
 *
 * Scrolls horizontally on small screens rather than wrapping, keeping the
 * tab row one line tall at every width.
 *
 * Tabs the user cannot open are dropped rather than disabled, on the same
 * terms as `Can` and the sidebar: a tab that leads to a 403 is worse than no
 * tab at all. Like both, this is advisory — the API remains the authority.
 */
export function NavTabs({ items, className }: NavTabsProps) {
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);

  const visible = items.filter(
    (item) =>
      (!item.roles || hasAnyRole(item.roles)) &&
      (!item.permissions || hasAnyPermission(item.permissions)),
  );

  return (
    <div className={cn('border-b border-slate-200', className)}>
      <nav
        className="scrollbar-thin -mb-px flex gap-1 overflow-x-auto"
        aria-label="Section navigation"
      >
        {visible.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium',
                'transition-colors duration-150',
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800',
              )
            }
          >
            {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
