import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormTextarea } from '@/components/form/FormTextarea';
import { applyServerErrors } from '@/lib/formErrors';

import { useUpdateProfile } from '../hooks/useSettings';
import { schoolProfileSchema, type SchoolProfileInput } from '../schemas';
import type { SchoolProfile } from '../types';

import { SettingsFormCard } from './SettingsFormCard';

const FIELDS = [
  'name',
  'code',
  'email',
  'phone',
  'website',
  'motto',
  'principal_name',
  'established_year',
] as const;

/** Nullable API fields map to empty strings so inputs stay controlled. */
const toFormValues = (profile: SchoolProfile): SchoolProfileInput => ({
  name: profile.name,
  code: profile.code,
  email: profile.email,
  phone: profile.phone,
  website: profile.website ?? '',
  motto: profile.motto ?? '',
  principal_name: profile.principal_name ?? '',
  established_year: profile.established_year ? String(profile.established_year) : '',
});

export function SchoolProfileForm({ profile }: { profile: SchoolProfile }) {
  const updateProfile = useUpdateProfile();
  const form = useForm<SchoolProfileInput>({
    resolver: zodResolver(schoolProfileSchema),
    defaultValues: toFormValues(profile),
  });

  const onSubmit = (values: SchoolProfileInput) => {
    updateProfile.mutate(values, {
      // Re-baseline so `isDirty` reflects the saved state again.
      onSuccess: (settings) => form.reset(toFormValues(settings.profile)),
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  return (
    <SettingsFormCard
      title="School profile"
      description="Identity details used across the app, reports and outgoing messages."
      form={form}
      onSubmit={onSubmit}
      isPending={updateProfile.isPending}
    >
      <FormGrid cols={2}>
        <FormInput<SchoolProfileInput> name="name" label="School name" required />
        <FormInput<SchoolProfileInput>
          name="code"
          label="School code"
          hint="Short identifier used on receipts and roll numbers."
          required
        />
        <FormInput<SchoolProfileInput>
          name="email"
          type="email"
          label="Official email"
          required
        />
        <FormInput<SchoolProfileInput> name="phone" type="tel" label="Phone number" required />
        <FormInput<SchoolProfileInput>
          name="website"
          type="url"
          label="Website"
          placeholder="https://example.edu"
          hint="Optional"
        />
        <FormInput<SchoolProfileInput>
          name="principal_name"
          label="Principal"
          hint="Optional — printed on certificates."
        />
        <FormInput<SchoolProfileInput>
          name="established_year"
          label="Established"
          placeholder="1998"
          inputMode="numeric"
          hint="Optional"
        />
      </FormGrid>

      <FormTextarea<SchoolProfileInput>
        name="motto"
        label="Motto"
        rows={2}
        placeholder="Knowledge is power"
        hint="Optional — appears beneath the school name on printed documents."
      />
    </SettingsFormCard>
  );
}
