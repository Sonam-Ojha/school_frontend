import { z } from 'zod';

import { amountsEqual, fromMinor, sumAmounts, toMinor } from '@/lib/money';
import { optionalText } from '@/lib/validation';

import { MAX_FEE_AMOUNT, MAX_INSTALLMENTS, REFERENCE_PROMPTS, REFERENCE_REQUIRED_MODES } from './constants';

/** A required money field. Blank numeric inputs yield `NaN`, hence the message. */
const money = (label: string) =>
  z
    .number({ invalid_type_error: `Enter ${label} as a number` })
    .min(0, `${label} cannot be negative`)
    .max(MAX_FEE_AMOUNT, `${label} is unrealistically large`)
    // Half a paisa is not a thing. Round-tripping through minor units is the
    // check — `Number.isInteger(Math.round(x))` would always be true.
    .refine((value) => fromMinor(toMinor(value)) === value, 'At most two decimal places');

export const feeTypeSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100, 'Name is too long'),
  code: z
    .string()
    .min(2, 'Code is required')
    .max(15, 'Code is too long')
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),
  category: z.enum(
    ['tuition', 'admission', 'transport', 'hostel', 'examination', 'library', 'laboratory', 'activity', 'other'],
    { invalid_type_error: 'Select a category' },
  ),
  is_recurring: z.boolean(),
  is_refundable: z.boolean(),
  is_active: z.boolean(),
  description: optionalText(300, 'Description is too long'),
});

export const discountSchema = z
  .object({
    name: z.string().min(2, 'Name is required').max(100, 'Name is too long'),
    code: z
      .string()
      .min(2, 'Code is required')
      .max(15, 'Code is too long')
      .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),
    value_type: z.enum(['percentage', 'fixed'], { invalid_type_error: 'Select a discount type' }),
    value: z.number({ invalid_type_error: 'Enter the discount value' }).min(0, 'Cannot be negative'),
    description: optionalText(300, 'Description is too long'),
    is_active: z.boolean(),
  })
  .refine((data) => data.value_type !== 'percentage' || data.value <= 100, {
    message: 'A percentage discount cannot exceed 100%',
    path: ['value'],
  })
  .refine((data) => data.value > 0, { message: 'A discount of zero has no effect', path: ['value'] });

export const structureItemSchema = z.object({
  fee_type_id: z.number({ invalid_type_error: 'Select a fee type' }).int().positive('Select a fee type'),
  amount: money('the amount'),
  frequency: z.enum(['one_time', 'monthly', 'quarterly', 'half_yearly', 'annual']),
});

export const installmentSchema = z.object({
  name: z.string().min(1, 'Instalment name is required').max(50, 'Name is too long'),
  due_date: z.string().min(1, 'Due date is required'),
  amount: money('the instalment amount'),
});

export const feeStructureSchema = z
  .object({
    name: z.string().min(2, 'Structure name is required').max(100, 'Name is too long'),
    academic_year_id: z
      .number({ invalid_type_error: 'Select an academic year' })
      .int()
      .positive('Select an academic year'),
    class_id: z.number({ invalid_type_error: 'Select a class' }).int().positive('Select a class'),
    section_id: z.number().int().positive().nullable(),
    is_active: z.boolean(),
    items: z.array(structureItemSchema).min(1, 'Add at least one fee line'),
    installments: z
      .array(installmentSchema)
      .min(1, 'Add at least one instalment')
      .max(MAX_INSTALLMENTS, `At most ${MAX_INSTALLMENTS} instalments`),
  })
  .refine(
    (data) => {
      const ids = data.items.map((item) => item.fee_type_id);
      return new Set(ids).size === ids.length;
    },
    { message: 'The same fee type is listed twice', path: ['items'] },
  )
  // The schedule must account for the whole bill — a structure whose
  // instalments do not add up silently under- or over-charges every student
  // assigned to it.
  .refine(
    (data) =>
      amountsEqual(
        sumAmounts(data.items.map((item) => item.amount)),
        sumAmounts(data.installments.map((installment) => installment.amount)),
      ),
    { message: 'Instalments must add up to the total of the fee lines', path: ['installments'] },
  )
  .refine(
    (data) => {
      const dates = data.installments.map((installment) => installment.due_date);
      return dates.every((date, index) => index === 0 || date > dates[index - 1]);
    },
    { message: 'Instalment due dates must run in order', path: ['installments'] },
  );

export const collectPaymentSchema = z
  .object({
    student_id: z.number().int().positive(),
    amount: money('the amount').refine((value) => value > 0, 'Enter an amount greater than zero'),
    mode: z.enum(['cash', 'upi', 'card', 'cheque', 'bank_transfer', 'online'], {
      invalid_type_error: 'Select a payment mode',
    }),
    reference: optionalText(60, 'Reference is too long'),
    discount_id: z.number().int().positive().nullable(),
    /** Ad-hoc fine waiver or addition, entered by the collector. */
    fine_amount: money('the fine'),
    paid_at: z.string().min(1, 'Payment date is required'),
    remarks: optionalText(200, 'Remarks are too long'),
    /** The dues being paid; empty means the oldest first, as far as the money goes. */
    due_ids: z.array(z.number().int().positive()).default([]),
    received_from: optionalText(120, 'Keep the name under 120 characters').default(''),
    bank_name: optionalText(80, 'Keep the bank name under 80 characters').default(''),
    instrument_date: z.string().default(''),
  })
  // Cash is the only mode with no reference to record; for the rest the
  // reference is the only trace that the money actually moved.
  .refine(
    (data) => !REFERENCE_REQUIRED_MODES.includes(data.mode) || data.reference.trim() !== '',
    (data) => ({ message: REFERENCE_PROMPTS[data.mode], path: ['reference'] }),
  );

/** A charge added at the desk: books, uniform, a lost ID card. */
export const addChargeSchema = z.object({
  label: z.string().trim().min(2, 'Say what the charge is for').max(80, 'Keep it under 80 characters'),
  amount: money('the amount').refine((value) => value > 0, 'Enter an amount greater than zero'),
  due_date: z.string().min(1, 'Choose the due date'),
});


export const cancelPaymentSchema = z.object({
  reason: z
    .string()
    .min(5, 'Give a reason — a cancelled receipt must be explainable')
    .max(200, 'Reason is too long'),
});

export type FeeTypeInput = z.infer<typeof feeTypeSchema>;
export type DiscountInput = z.infer<typeof discountSchema>;
export type StructureItemInput = z.infer<typeof structureItemSchema>;
export type InstallmentInput = z.infer<typeof installmentSchema>;
export type FeeStructureInput = z.infer<typeof feeStructureSchema>;
export type CollectPaymentInput = z.infer<typeof collectPaymentSchema>;
export type CancelPaymentInput = z.infer<typeof cancelPaymentSchema>;
export type AddChargeInput = z.infer<typeof addChargeSchema>;
