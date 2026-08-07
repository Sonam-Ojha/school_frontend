import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { NotificationBell } from '@/features/notifications';
import { useUiStore } from '@/store/uiStore';

import { UserMenu } from './UserMenu';

/**
 * Sticky app bar: mobile nav trigger on the left, the bell and account menu
 * on the right. The bell lives here rather than in the sidebar because it has
 * to be visible on every screen at every width — a notification nobody can
 * see is a notification nobody got.
 */
export function Topbar() {
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <Button
        variant="ghost"
        size="md"
        iconOnly
        onClick={openMobileNav}
        aria-label="Open navigation"
        className="lg:hidden"
        leftIcon={<Menu className="size-5" />}
      />

      {/* Spacer keeps the account menu right-aligned once the nav button hides. */}
      <div className="flex-1" />

      <NotificationBell />

      <UserMenu onSignOut={() => logout.mutate()} isSigningOut={logout.isPending} />
    </header>
  );
}
