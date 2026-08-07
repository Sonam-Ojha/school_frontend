import type { Option, ToneName } from '@/types/common';

import type {
  CalculationMethod,
  ComponentType,
  EmployeeType,
  RunStatus,
} from './types';

/**
 * `approve` is the sign-off on a costed run, and it is deliberately separate
 * from `update`: processing a payroll is arithmetic, approving it is a
 * decision, and schools routinely give those two to different people.
 */
export const PAYROLL_PERMISSIONS = {
  read: 'payroll.read',
  create: 'payroll.create',
  update: 'payroll.update',
  delete: 'payroll.delete',
  export: 'payroll.export',
  print: 'payroll.print',
  approve: 'payroll.approve',
} as const;

// --- labels -----------------------------------------------------------------

export const EMPLOYEE_TYPE_LABELS: Record<EmployeeType, string> = {
  teacher: 'Teaching',
  staff: 'Non-teaching',
};

export const EMPLOYEE_TYPE_OPTIONS: Option<EmployeeType>[] = (
  Object.keys(EMPLOYEE_TYPE_LABELS) as EmployeeType[]
).map((type) => ({ label: EMPLOYEE_TYPE_LABELS[type], value: type }));

export const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  earning: 'Allowance',
  deduction: 'Deduction',
};

export const COMPONENT_TYPE_OPTIONS: Option<ComponentType>[] = (
  Object.keys(COMPONENT_TYPE_LABELS) as ComponentType[]
).map((type) => ({ label: COMPONENT_TYPE_LABELS[type], value: type }));

export const COMPONENT_TYPE_TONES: Record<ComponentType, ToneName> = {
  earning: 'success',
  deduction: 'danger',
};

export const CALCULATION_LABELS: Record<CalculationMethod, string> = {
  fixed: 'Fixed amount',
  percent_of_basic: 'Percentage of basic',
  percent_of_gross: 'Percentage of gross',
};

/**
 * An earning cannot be a share of the gross — it would be a share of itself.
 * Deductions may be, which is how professional tax slabs are usually written.
 */
export const CALCULATION_OPTIONS: Record<ComponentType, Option<CalculationMethod>[]> = {
  earning: [
    { label: CALCULATION_LABELS.fixed, value: 'fixed' },
    { label: CALCULATION_LABELS.percent_of_basic, value: 'percent_of_basic' },
  ],
  deduction: (Object.keys(CALCULATION_LABELS) as CalculationMethod[]).map((method) => ({
    label: CALCULATION_LABELS[method],
    value: method,
  })),
};

export const RUN_STATUS_LABELS: Record<RunStatus, string> = {
  draft: 'Draft',
  processed: 'Processed',
  approved: 'Approved',
  paid: 'Paid',
};

export const RUN_STATUS_TONES: Record<RunStatus, ToneName> = {
  draft: 'neutral',
  processed: 'info',
  approved: 'warning',
  paid: 'success',
};

export const RUN_STATUS_OPTIONS: Option<RunStatus>[] = (
  Object.keys(RUN_STATUS_LABELS) as RunStatus[]
).map((status) => ({ label: RUN_STATUS_LABELS[status], value: status }));

/**
 * What each state allows next.
 *
 * One place, so the buttons on the run screen and the guards on the API
 * cannot disagree about whether a run can still be approved.
 */
export const RUN_TRANSITIONS: Record<RunStatus, RunStatus[]> = {
  draft: ['processed'],
  // Re-processing is allowed while nobody has signed off — a correction to a
  // salary before approval is ordinary.
  processed: ['approved', 'processed'],
  approved: ['paid'],
  paid: [],
};

export const canTransition = (from: RunStatus, to: RunStatus): boolean =>
  RUN_TRANSITIONS[from].includes(to);

// --- policy -----------------------------------------------------------------

/** Guards against a component that would swallow a salary whole. */
export const MAX_COMPONENT_PERCENT = 100;
export const MAX_BASIC_SALARY = 5_000_000;

/**
 * Days a month is costed against when attendance has nothing to say.
 *
 * Payroll reads working days from the attendance module; this is the fallback
 * for a month it has no register for, so a payslip is never divided by zero.
 */
export const DEFAULT_WORKING_DAYS = 26;

/** Codes the module writes itself. They cannot be created or edited by hand. */
export const STATUTORY_CODES = ['PF', 'ESI', 'EPS'] as const;
