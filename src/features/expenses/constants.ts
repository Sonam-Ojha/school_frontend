import type { ToneName } from '@/types/common';

import type { ExpenseStatus } from './types';

/** Permissions gating the expense book. Mirror these in the backend policy. */
export const EXPENSE_PERMISSIONS = {
  read: 'expenses.read',
  create: 'expenses.create',
  update: 'expenses.update',
  delete: 'expenses.delete',
  export: 'expenses.export',
  approve: 'expenses.approve',
} as const;

export const EXPENSE_STATUS: Record<ExpenseStatus, { label: string; tone: ToneName }> = {
  pending: { label: 'Awaiting approval', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export const EXPENSE_STATUS_OPTIONS = [
  { label: 'Any status', value: '' },
  { label: 'Awaiting approval', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
];
