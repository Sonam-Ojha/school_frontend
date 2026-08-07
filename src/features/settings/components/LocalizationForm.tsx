import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { applyServerErrors } from '@/lib/formErrors';

import {
  CURRENCIES,
  CURRENCY_OPTIONS,
  CURRENCY_POSITION_OPTIONS,
  DATE_FORMAT_OPTIONS,
  LOCALE_OPTIONS,
  timezoneOptions,
} from '../constants';
import { useUpdateLocalization } from '../hooks/useSettings';
import { localizationSchema, type LocalizationInput } from '../schemas';
import type { LocalizationSettings } from '../types';

import { SettingsFormCard } from './SettingsFormCard';

const FIELDS = [
  'timezone',
  'locale',
  'date_format',
  'currency_code',
  'currency_symbol',
  'currency_position',
  'currency_decimals',
] as const;

/** Live money preview, so the four currency fields can be judged at a glance. */
function CurrencyPreview({ values }: { values: LocalizationInput }) {
  const formatted = useMemo(() => {
    const amount = (12500).toFixed(Math.min(4, Math.max(0, values.currency_decimals || 0)));
    const grouped = Number(amount).toLocaleString(values.locale || 'en-IN', {
      minimumFractionDigits: values.currency_decimals || 0,
      maximumFractionDigits: values.currency_decimals || 0,
    });

    return values.currency_position === 'suffix'
      ? `${grouped}${values.currency_symbol}`
      : `${values.currency_symbol}${grouped}`;
  }, [values.currency_decimals, values.currency_symbol, values.currency_position, values.locale]);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium text-slate-500">Preview</p>
      <p className="mt-0.5 text-lg font-semibold text-slate-900">{formatted}</p>
    </div>
  );
}

export function LocalizationForm({ localization }: { localization: LocalizationSettings }) {
  const updateLocalization = useUpdateLocalization();

  // Built once — the IANA list has several hundred entries.
  const timezones = useMemo(() => timezoneOptions(), []);

  const form = useForm<LocalizationInput>({
    resolver: zodResolver(localizationSchema),
    defaultValues: localization,
  });

  const watched = form.watch();

  const onSubmit = (values: LocalizationInput) => {
    updateLocalization.mutate(values, {
      onSuccess: (settings) => form.reset(settings.localization),
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  return (
    <SettingsFormCard
      title="Regional settings"
      description="Timezone, date format and currency used throughout the app."
      form={form}
      onSubmit={onSubmit}
      isPending={updateLocalization.isPending}
    >
      <FormGrid cols={2}>
        <FormSelect<LocalizationInput>
          name="timezone"
          label="Timezone"
          options={timezones}
          hint="Attendance times and report timestamps use this."
          required
        />
        <FormSelect<LocalizationInput>
          name="locale"
          label="Language & region"
          options={LOCALE_OPTIONS}
          required
        />
        <FormSelect<LocalizationInput>
          name="date_format"
          label="Date format"
          options={DATE_FORMAT_OPTIONS}
          required
        />
      </FormGrid>

      <div className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold text-slate-900">Currency</h3>

        <FormGrid cols={2} className="mt-3">
          <FormSelect<LocalizationInput>
            name="currency_code"
            label="Currency"
            options={CURRENCY_OPTIONS}
            required
            onChange={(event) => {
              // Keep the symbol in step with the chosen currency, but leave it
              // editable — some schools bill in a currency using a local glyph.
              const match = CURRENCIES.find((entry) => entry.code === event.target.value);
              if (match) {
                form.setValue('currency_symbol', match.symbol, { shouldDirty: true });
              }
            }}
          />
          <FormInput<LocalizationInput> name="currency_symbol" label="Symbol" required />
          <FormSelect<LocalizationInput>
            name="currency_position"
            label="Symbol position"
            options={CURRENCY_POSITION_OPTIONS}
            required
          />
          <FormInput<LocalizationInput>
            name="currency_decimals"
            type="number"
            label="Decimal places"
            min={0}
            max={4}
            required
          />
        </FormGrid>

        <div className="mt-4 max-w-xs">
          <CurrencyPreview values={watched} />
        </div>
      </div>
    </SettingsFormCard>
  );
}
