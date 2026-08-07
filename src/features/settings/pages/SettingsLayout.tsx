import { Building2, CalendarRange, Globe2, Mail, MapPin, MessageSquare } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateTime } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { SETTINGS_PERMISSIONS } from '../constants';
import { useSettings } from '../hooks/useSettings';

const TABS: NavTabItem[] = [
  { label: 'Profile', to: PATHS.settingsProfile, icon: Building2 },
  { label: 'Address', to: PATHS.settingsAddress, icon: MapPin },
  { label: 'Sessions', to: PATHS.settingsSessions, icon: CalendarRange },
  { label: 'Regional', to: PATHS.settingsLocalization, icon: Globe2 },
  { label: 'Email', to: PATHS.settingsEmail, icon: Mail },
  { label: 'SMS', to: PATHS.settingsSms, icon: MessageSquare },
];

/**
 * Shell for the settings area.
 *
 * Fetches the settings object once and lets each tab read it from the shared
 * cache, so switching tabs never refetches. Tabs are real routes, so a
 * specific tab is linkable and survives a refresh.
 */
export function SettingsLayout() {
  const { data: settings, isLoading } = useSettings();
  const canUpdate = useAuthStore((state) => state.hasPermission)(SETTINGS_PERMISSIONS.update);

  return (
    <>
      <PageHeader
        title="School settings"
        description={
          settings
            ? `Last updated ${formatDateTime(settings.updated_at)}`
            : 'Configure your school profile, sessions and messaging.'
        }
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Settings' }]}
      />

      {!canUpdate && (
        <Alert tone="info" className="mb-4">
          You have read-only access to these settings.
        </Alert>
      )}

      <NavTabs items={TABS} className="mb-6" />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
}
