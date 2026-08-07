import type { ReactNode } from 'react';

import { Alert } from '@/components/ui/Alert';

import { AcademicYearsCard } from '../components/AcademicYearsCard';
import { AddressForm } from '../components/AddressForm';
import { EmailSettingsForm } from '../components/EmailSettingsForm';
import { LocalizationForm } from '../components/LocalizationForm';
import { LogoUploader } from '../components/LogoUploader';
import { SchoolProfileForm } from '../components/SchoolProfileForm';
import { SmsSettingsForm } from '../components/SmsSettingsForm';
import { useSettings } from '../hooks/useSettings';
import type { SchoolSettings } from '../types';

/**
 * The tab bodies. `SettingsLayout` has already resolved the query, so each of
 * these reads the same cache entry — no tab refetches on switch.
 *
 * They live in one file because each is a thin adapter between the cached
 * settings object and its form; splitting them would be six files of imports.
 */
function WithSettings({ children }: { children: (settings: SchoolSettings) => ReactNode }) {
  const { data: settings, error } = useSettings();

  if (error) {
    return (
      <Alert tone="danger" title="Could not load settings">
        {error.message}
      </Alert>
    );
  }

  // The layout gates on `isLoading`, so a missing value here means the cache
  // was cleared underneath us — render nothing rather than crash.
  if (!settings) return null;

  return <>{children(settings)}</>;
}

export function ProfileTab() {
  return (
    <WithSettings>
      {(settings) => (
        <div className="space-y-6">
          <SchoolProfileForm profile={settings.profile} />
          <LogoUploader logoUrl={settings.logo_url} />
        </div>
      )}
    </WithSettings>
  );
}

export function AddressTab() {
  return <WithSettings>{(settings) => <AddressForm address={settings.address} />}</WithSettings>;
}

export function SessionsTab() {
  return <AcademicYearsCard />;
}

export function LocalizationTab() {
  return (
    <WithSettings>
      {(settings) => <LocalizationForm localization={settings.localization} />}
    </WithSettings>
  );
}

export function EmailTab() {
  return <WithSettings>{(settings) => <EmailSettingsForm email={settings.email} />}</WithSettings>;
}

export function SmsTab() {
  return <WithSettings>{(settings) => <SmsSettingsForm sms={settings.sms} />}</WithSettings>;
}
