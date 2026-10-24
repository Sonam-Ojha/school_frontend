import { UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { roleLabel } from '@/types/auth';

import { AccountMenu } from './AccountMenu';

interface UserMenuProps {
  /**
   * Sign-out handler. `Topbar` passes the auth module's API-backed logout
   * mutation; the fallback only clears local session state.
   */
  onSignOut?: () => void;
  /** Disables the sign-out item while the request is in flight. */
  isSigningOut?: boolean;
}

/** The signed-in school user at the top right: avatar with the online dot, their account, Sign out. */
export function UserMenu({ onSignOut, isSigningOut = false }: UserMenuProps) {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <AccountMenu
      name={user.name}
      email={user.email}
      avatarUrl={user.avatar_url}
      subtitle={user.roles.map(roleLabel).join(', ') || undefined}
      badge={user.is_demo ? <Badge tone="warning">Demo account</Badge> : undefined}
      items={[{ label: 'My account', icon: UserCircle, onSelect: () => navigate(PATHS.profile) }]}
      onSignOut={onSignOut ?? clearSession}
      isSigningOut={isSigningOut}
    />
  );
}
