import type { Option, ToneName } from '@/types/common';

import type {
  DiscountValueType,
  DueStatus,
  FeeCategory,
  FeeFrequency,
  PaymentMode,
} from './types';

export const FEE_PERMISSIONS = {
  read: 'fees.read',
  create: 'fees.create',
  update: 'fees.update',
  delete: 'fees.delete',
  export: 'fees.export',
  print: 'fees.print',
  approve: 'fees.approve',
} as const;

export const FEE_CATEGORY_OPTIONS: Option<FeeCategory>[] = [
  { label: 'Tuition', value: 'tuition' },
  { label: 'Admission', value: 'admission' },
  { label: 'Transport', value: 'transport' },
  { label: 'Hostel', value: 'hostel' },
  { label: 'Examination', value: 'examination' },
  { label: 'Library', value: 'library' },
  { label: 'Laboratory', value: 'laboratory' },
  { label: 'Activity', value: 'activity' },
  { label: 'Other', value: 'other' },
];

export const FEE_CATEGORY_LABELS: Record<FeeCategory, string> = Object.fromEntries(
  FEE_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<FeeCategory, string>;

export const FREQUENCY_OPTIONS: Option<FeeFrequency>[] = [
  { label: 'One time', value: 'one_time' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Half yearly', value: 'half_yearly' },
  { label: 'Annual', value: 'annual' },
];

export const FREQUENCY_LABELS: Record<FeeFrequency, string> = Object.fromEntries(
  FREQUENCY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<FeeFrequency, string>;

export const DISCOUNT_TYPE_OPTIONS: Option<DiscountValueType>[] = [
  { label: 'Percentage', value: 'percentage' },
  { label: 'Fixed amount', value: 'fixed' },
];

export const PAYMENT_MODE_OPTIONS: Option<PaymentMode>[] = [
  { label: 'Cash', value: 'cash' },
  { label: 'UPI', value: 'upi' },
  { label: 'Card', value: 'card' },
  { label: 'Cheque / DD', value: 'cheque' },
  { label: 'Bank transfer', value: 'bank_transfer' },
  { label: 'Online', value: 'online' },
];

/** What each mode's reference is called on the form and the receipt. */
export const REFERENCE_LABELS: Record<PaymentMode, string> = {
  cash: 'Reference',
  upi: 'UPI transaction ID',
  card: 'Card approval code',
  cheque: 'Cheque / DD number',
  bank_transfer: 'UTR / transfer reference',
  online: 'Online payment ID',
};

/** What the form says when the reference is missing — the backend says the same. */
export const REFERENCE_PROMPTS: Record<PaymentMode, string> = {
  cash: 'Enter the reference',
  upi: 'Enter the UPI transaction ID',
  card: 'Enter the card approval code',
  cheque: 'Enter the cheque or DD number',
  bank_transfer: 'Enter the bank transfer reference (UTR)',
  online: 'Enter the online payment ID',
};

/** Modes that come from a bank, so the bank's name is worth writing down. */
export const BANK_MODES: readonly PaymentMode[] = ['cheque', 'bank_transfer'];

/** Notes the counter counts at the end of the day, largest first. Coins are counted as one amount. */
export const NOTE_VALUES = [500, 200, 100, 50, 20, 10] as const;

/** Things a desk is asked to collect outside the fee structure. */
export const CHARGE_SUGGESTIONS = [
  'Books and notebooks',
  'School uniform',
  'ID card replacement',
  'Transfer certificate fee',
  'Exam re-appear fee',
  'Annual day costume',
  'Educational tour',
  'Late admission fee',
];

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = Object.fromEntries(
  PAYMENT_MODE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<PaymentMode, string>;

/** Modes where a transaction reference is the only proof the money moved. */
export const REFERENCE_REQUIRED_MODES: readonly PaymentMode[] = [
  'cheque',
  'card',
  'upi',
  'bank_transfer',
  'online',
];

export const DUE_STATUS_LABELS: Record<DueStatus, string> = {
  pending: 'Pending',
  partial: 'Partly paid',
  paid: 'Paid',
  overdue: 'Overdue',
  waived: 'Waived',
};

export const DUE_STATUS_TONES: Record<DueStatus, ToneName> = {
  pending: 'neutral',
  partial: 'info',
  paid: 'success',
  overdue: 'danger',
  waived: 'warning',
};

/** Bounds that keep a typo from becoming a ledger entry. */
export const MAX_FEE_AMOUNT = 10_000_000;
export const MAX_INSTALLMENTS = 12;
