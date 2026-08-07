import { ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Avatar } from '@/components/ui/Avatar';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useDismiss } from '@/hooks/useDismiss';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';

interface UserMenuProps {
  /**
   * Sign-out handler. `Topbar` passes the auth module's API-backed logout
   * mutation; the fallback only clears local session state.
   */
  onSignOut?: () => void;
  /** Disables the sign-out item while the request is in flight. */
  isSigningOut?: boolean;
}

export function UserMenu({ onSignOut, isSigningOut = false }: UserMenuProps) {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const { isOpen, close, toggle } = useDisclosure();
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useDismiss(isOpen, containerRef, close);

  if (!user) return null;

  const handleSignOut = () => {
    close();
    (onSignOut ?? clearSession)();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          'flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100',
          isOpen && 'bg-slate-100',
        )}
      >
        <Avatar name={user.name} src={user.avatar_url} size="sm" />
        <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 sm:block">
          {user.name}
        </span>
        <ChevronDown className="hidden size-4 text-slate-400 sm:block" aria-hidden />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 rounded-lg border border-slate-200 bg-white py-1 shadow-overlay"
        >
          <div className="border-b border-slate-100 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            {user.roles.length > 0 && (
              <p className="mt-1 truncate text-xs text-brand-600 capitalize">
                {user.roles.join(', ').replace(/-/g, ' ')}
              </p>
            )}
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              navigate(PATHS.profile);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <UserCircle className="size-4" aria-hidden />
            My account
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
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
