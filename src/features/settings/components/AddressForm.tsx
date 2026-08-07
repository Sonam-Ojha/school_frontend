import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { applyServerErrors } from '@/lib/formErrors';

import { useUpdateAddress } from '../hooks/useSettings';
import { schoolAddressSchema, type SchoolAddressInput } from '../schemas';
import type { SchoolAddress } from '../types';

import { SettingsFormCard } from './SettingsFormCard';

const FIELDS = ['line1', 'line2', 'city', 'state', 'postal_code', 'country'] as const;

const toFormValues = (address: SchoolAddress): SchoolAddressInput => ({
  line1: address.line1,
  line2: address.line2 ?? '',
  city: address.city,
  state: address.state,
  postal_code: address.postal_code,
  country: address.country,
});

export function AddressForm({ address }: { address: SchoolAddress }) {
  const updateAddress = useUpdateAddress();
  const form = useForm<SchoolAddressInput>({
    resolver: zodResolver(schoolAddressSchema),
    defaultValues: toFormValues(address),
  });

  const onSubmit = (values: SchoolAddressInput) => {
    updateAddress.mutate(values, {
      onSuccess: (settings) => form.reset(toFormValues(settings.address)),
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  return (
    <SettingsFormCard
      title="Address"
      description="Printed on receipts, certificates and official correspondence."
      form={form}
      onSubmit={onSubmit}
      isPending={updateAddress.isPending}
    >
      <FormGrid cols={2}>
        <FormFullRow>
          <FormInput<SchoolAddressInput>
            name="line1"
            label="Address line 1"
            placeholder="Street and building"
            required
          />
        </FormFullRow>
        <FormFullRow>
          <FormInput<SchoolAddressInput>
            name="line2"
            label="Address line 2"
            placeholder="Area or landmark"
            hint="Optional"
          />
        </FormFullRow>

        <FormInput<SchoolAddressInput> name="city" label="City" required />
        <FormInput<SchoolAddressInput> name="state" label="State / Province" required />
        <FormInput<SchoolAddressInput> name="postal_code" label="Postal code" required />
        <FormInput<SchoolAddressInput> name="country" label="Country" required />
      </FormGrid>
    </SettingsFormCard>
  );
}
