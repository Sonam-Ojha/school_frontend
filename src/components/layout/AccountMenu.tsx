import { ChevronDown, LogOut, type LucideIcon } from 'lucide-react';
import { useRef, type ReactNode } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useDismiss } from '@/hooks/useDismiss';
import { cn } from '@/lib/cn';

export interface AccountMenuItem {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
}

interface AccountMenuProps {
  name: string;
  email: string;
  /** What the person is here: their role or roles. */
  subtitle?: string;
  avatarUrl?: string | null;
  /** Shown under the details, e.g. "Demo account". */
  badge?: ReactNode;
  items?: AccountMenuItem[];
  onSignOut: () => void;
  isSigningOut?: boolean;
}

/**
 * The signed-in person at the top right of every screen, in a school and in
 * the Super Admin console alike: their avatar with the green online dot and
 * their name, opening a menu with their details, their account and Sign out.
 */
export function AccountMenu({ name, email, subtitle, avatarUrl, badge, items = [], onSignOut, isSigningOut = false }: AccountMenuProps) {
  const { isOpen, close, toggle } = useDisclosure();
  const containerRef = useRef<HTMLDivElement>(null);

  useDismiss(isOpen, containerRef, close);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn('flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100', isOpen && 'bg-slate-100')}
      >
        <Avatar name={name} src={avatarUrl} size="md" online />
        <span className="hidden max-w-36 truncate text-sm font-medium text-slate-700 sm:block">{name}</span>
        <ChevronDown className={cn('hidden size-4 text-slate-400 transition-transform sm:block', isOpen && 'rotate-180')} aria-hidden />
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white py-1 shadow-overlay">
          <div className="flex items-start gap-3 border-b border-slate-100 px-3 py-2.5">
            <Avatar name={name} src={avatarUrl} size="md" online />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{name}</p>
              <p className="truncate text-xs text-slate-500">{email}</p>
              {subtitle && <p className="mt-1 truncate text-xs text-brand-600">{subtitle}</p>}
              {badge && <div className="mt-2">{badge}</div>}
            </div>
          </div>

          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                item.onSelect();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </button>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              onSignOut();
            }}
            disabled={isSigningOut}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <LogOut className="size-4" aria-hidden />
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
