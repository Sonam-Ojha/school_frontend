import { PATHS } from '@/app/router/paths';
import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuthStore } from '@/store/authStore';

import { ActiveSessionsCard } from '../components/ActiveSessionsCard';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { ProfileForm } from '../components/ProfileForm';

/**
 * Account settings: personal details, password, and signed-in devices.
 * Reachable from the topbar account menu.
 */
export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  // `ProtectedRoute` guarantees a session, so this only covers the brief
  // window while a session refresh is in flight.
  if (!user) return <FullPageLoader />;

  return (
    <>
      <PageHeader
        title="My account"
        description="Manage your details, password and active sessions."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'My account' }]}
      />

      <div className="max-w-3xl space-y-6">
        <ProfileForm user={user} />
        <ChangePasswordForm />
        <ActiveSessionsCard />
      </div>
    </>
  );
}
