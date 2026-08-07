import { http } from '@/lib/axios';
import type { ApiResource } from '@/types/api';

import type {
  EmailSettingsInput,
  LocalizationInput,
  SchoolAddressInput,
  SchoolProfileInput,
  SmsSettingsInput,
  TestEmailInput,
  TestSmsInput,
} from '../schemas';
import type { SchoolSettings } from '../types';

interface MessageResponse {
  message: string;
}

/** Blank optional text means "not set", which the API stores as null. */
const nullable = (value: string): string | null => value.trim() || null;

/**
 * Settings I/O.
 *
 * Every group PUT returns the full settings object, so one cache entry stays
 * authoritative and no screen has to merge partial responses.
 */
export const settingsService = {
  async show(signal?: AbortSignal): Promise<SchoolSettings> {
    const { data } = await http.get<ApiResource<SchoolSettings>>('/settings', { signal });
    return data.data;
  },

  async updateProfile(input: SchoolProfileInput): Promise<SchoolSettings> {
    const { data } = await http.put<ApiResource<SchoolSettings>>('/settings/profile', {
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      website: nullable(input.website),
      motto: nullable(input.motto),
      principal_name: nullable(input.principal_name),
      established_year: input.established_year.trim() ? Number(input.established_year) : null,
    });
    return data.data;
  },

  async updateAddress(input: SchoolAddressInput): Promise<SchoolSettings> {
    const { data } = await http.put<ApiResource<SchoolSettings>>('/settings/address', {
      line1: input.line1.trim(),
      line2: nullable(input.line2),
      city: input.city.trim(),
      state: input.state.trim(),
      postal_code: input.postal_code.trim().toUpperCase(),
      country: input.country.trim(),
    });
    return data.data;
  },

  async updateLocalization(input: LocalizationInput): Promise<SchoolSettings> {
    const { data } = await http.put<ApiResource<SchoolSettings>>('/settings/localization', {
      ...input,
      currency_code: input.currency_code.toUpperCase(),
    });
    return data.data;
  },

  /**
   * A blank password field means "keep the stored one", so the key is omitted
   * entirely rather than sent empty — an empty string would wipe it.
   */
  async updateEmail(input: EmailSettingsInput): Promise<SchoolSettings> {
    const { password, ...rest } = input;

    const { data } = await http.put<ApiResource<SchoolSettings>>('/settings/email', {
      ...rest,
      username: rest.username.trim(),
      from_address: rest.from_address.trim().toLowerCase(),
      from_name: rest.from_name.trim(),
      ...(password ? { password } : {}),
    });
    return data.data;
  },

  /** Same "blank means unchanged" rule as the SMTP password. */
  async updateSms(input: SmsSettingsInput): Promise<SchoolSettings> {
    const { api_key: apiKey, ...rest } = input;

    const { data } = await http.put<ApiResource<SchoolSettings>>('/settings/sms', {
      ...rest,
      sender_id: rest.sender_id.trim().toUpperCase(),
      // Only the custom provider uses a caller-supplied endpoint.
      endpoint: rest.provider === 'custom' ? nullable(rest.endpoint) : null,
      ...(apiKey ? { api_key: apiKey } : {}),
    });
    return data.data;
  },

  async uploadLogo(file: File): Promise<SchoolSettings> {
    const body = new FormData();
    body.append('logo', file);

    const { data } = await http.post<ApiResource<SchoolSettings>>('/settings/logo', body);
    return data.data;
  },

  async removeLogo(): Promise<SchoolSettings> {
    const { data } = await http.delete<ApiResource<SchoolSettings>>('/settings/logo');
    return data.data;
  },

  /** Sends a real message through the saved SMTP config. */
  async sendTestEmail(input: TestEmailInput): Promise<MessageResponse> {
    const { data } = await http.post<MessageResponse>('/settings/email/test', {
      email: input.email.trim().toLowerCase(),
    });
    return data;
  },

  async sendTestSms(input: TestSmsInput): Promise<MessageResponse> {
    const { data } = await http.post<MessageResponse>('/settings/sms/test', {
      phone: input.phone.trim(),
    });
    return data;
  },
};
