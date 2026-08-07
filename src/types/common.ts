import type { ReactNode } from 'react';

export type Nullable<T> = T | null;

export type Option<TValue extends string | number = string> = {
  label: string;
  value: TValue;
  disabled?: boolean;
};

export type Size = 'sm' | 'md' | 'lg';

export type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

export type ToneName = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface WithChildren {
  children?: ReactNode;
}

/** Any entity returned by the API that has a stable identity. */
export interface Identifiable {
  id: number | string;
}

/**
 * Postal address as the API returns it.
 *
 * Distinct from the form shape inferred from `addressSchema`: an absent
 * `line2` is `null` on the wire but `''` in a controlled input, and conflating
 * the two is how a "not recorded" row ends up rendering as blank.
 */
export interface PostalAddress {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}
