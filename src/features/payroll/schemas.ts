import { z } from 'zod';

import { optionalText } from '@/lib/validation';

import { MAX_BASIC_SALARY, MAX_COMPONENT_PERCENT } from './constants';

/**
 * Payroll validation.
 *
 * Transform-free like every other module: optional numbers are held as
 * strings and converted in the service, because a numeric input left blank
 * yields `NaN` rather than null.
 */

const baseComponentSchema = z.object({
  name: z.string().min(2, 'Component name is required').max(60, 'Name is too long'),
  code: z
    .string()
    .min(2, 'A payslip code is required')
    .max(8, 'Keep the code to eight characters')
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),
  type: z.enum(['earning', 'deduction'], { invalid_type_error: 'Allowance or deduction?' }),
  calculation: z.enum(['fixed', 'percent_of_basic', 'percent_of_gross'], {
    invalid_type_error: 'How is it worked out?',
  }),
  value: z
    .number({ invalid_type_error: 'Enter an amount or a percentage' })
    .min(0, 'That cannot be negative'),
  is_taxable: z.boolean(),
  affects_pf: z.boolean(),
  is_active: z.boolean(),
  sort_order: z
    .number({ invalid_type_error: 'Enter a position' })
    .int('Position must be a whole number')
    .min(1, 'Positions start at 1')
    .max(99, 'That is a very long payslip'),
});

export const componentSchema = baseComponentSchema
  .refine(
    (data) => data.calculation === 'fixed' || data.value <= MAX_COMPONENT_PERCENT,
    { message: `A percentage cannot exceed ${MAX_COMPONENT_PERCENT}`, path: ['value'] },
  )
  .refine(
    // An earning defined as a share of the gross would be a share of itself.
    (data) => data.type === 'deduction' || data.calculation !== 'percent_of_gross',
    {
      message: 'An allowance cannot be a percentage of the gross — use the basic',
      path: ['calculation'],
    },
  )
  .refine((data) => data.type === 'earning' || !data.affects_pf, {
    message: 'Only an allowance can count toward PF wages',
    path: ['affects_pf'],
  });

/** One component as it applies to one employee, at their own rate. */
export const structureLineSchema = z.object({
  component_id: z.number().int().positive(),
  value: z
    .number({ invalid_type_error: 'Enter an amount or a percentage' })
    .min(0, 'That cannot be negative'),
});

export const structureSchema = z.object({
  employee_type: z.enum(['teacher', 'staff'], { invalid_type_error: 'Choose an employee' }),
  employee_id: z
    .number({ invalid_type_error: 'Choose an employee' })
    .int()
    .positive('Choose an employee'),
  basic: z
    .number({ invalid_type_error: 'Enter the basic salary' })
    .min(1, 'A basic salary is required')
    .max(MAX_BASIC_SALARY, 'That basic looks wrong'),
  effective_from: z.string().min(1, 'An effective date is required'),
  /**
   * PF above the ceiling is a choice the employer makes per employee, so it
   * sits on the structure rather than in a global setting.
   */
  pf_on_full_wage: z.boolean(),
  pf_excluded: z.boolean(),
  lines: z.array(structureLineSchema),
  is_active: z.boolean(),
});

/**
 * Opening a month's payroll.
 *
 * A month, and nothing else — the figures come from the structures, and a
 * form that let somebody type a total would be a form that disagreed with
 * them.
 */
export const runSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Choose a month'),
  notes: optionalText(300, 'Notes are too long'),
});

export const approveRunSchema = z.object({
  run_id: z.number().int().positive(),
  /** A sign-off nobody explains is a sign-off nobody can defend. */
  remarks: optionalText(300, 'Remarks are too long'),
});

export const markPaidSchema = z.object({
  run_id: z.number().int().positive(),
  paid_on: z.string().min(1, 'A payment date is required'),
  reference: optionalText(60, 'Reference is too long'),
});

export type ComponentInput = z.infer<typeof componentSchema>;
export type StructureLineInput = z.infer<typeof structureLineSchema>;
export type StructureInput = z.infer<typeof structureSchema>;
export type RunInput = z.infer<typeof runSchema>;
export type ApproveRunInput = z.infer<typeof approveRunSchema>;
export type MarkPaidInput = z.infer<typeof markPaidSchema>;
