import type { PaymentMode } from '@/features/fees/types';

/**
 * The expense book: what the school pays out. The accountant records a
 * voucher; somebody holding `expenses.approve` (usually the principal) signs
 * it off. Salaries are not here — they are the payroll's.
 */

export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Expense {
  id: number;
  /** EXP-2026-00001 */
  voucher_no: string;
  date: string;
  category_id: number;
  category_name: string;
  amount: number;
  paid_to: string;
  mode: PaymentMode;
  mode_label: string;
  reference: string | null;
  bank_name: string | null;
  bill_no: string | null;
  description: string | null;
  status: ExpenseStatus;
  recorded_by: string;
  recorded_at: string;
  decided_by: string | null;
  decided_at: string | null;
  /** Why it was rejected or cancelled. */
  decision_note: string | null;
  can_edit: boolean;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  expenses_count: number;
  total_amount: number;
}

export interface ExpenseTotals {
  count: number;
  amount: number;
  cash: number;
  pending: number;
  pending_amount: number;
  by_category: Array<{ category_id: number; name: string; count: number; amount: number }>;
}

export interface ExpensePayload {
  date: string;
  category_id: number;
  amount: number;
  paid_to: string;
  mode: PaymentMode;
  reference: string | null;
  bank_name: string | null;
  bill_no: string | null;
  description: string | null;
}
