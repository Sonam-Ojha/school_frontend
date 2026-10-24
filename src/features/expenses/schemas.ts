import { z } from 'zod';

import { REFERENCE_PROMPTS } from '@/features/fees/constants';
import { optionalText } from '@/lib/validation';

export const expenseSchema = z
  .object({
    date: z.string().min(1, 'Choose the date it was paid'),
    category_id: z.number({ invalid_type_error: 'Choose a category' }).int().positive('Choose a category'),
    amount: z
      .number({ invalid_type_error: 'Enter the amount as a number' })
      .positive('Enter an amount greater than zero')
      .max(100_000_000, 'That amount is unrealistically large'),
    paid_to: z.string().trim().min(2, 'Say who was paid').max(120, 'Keep it under 120 characters'),
    mode: z.enum(['cash', 'upi', 'card', 'cheque', 'bank_transfer', 'online']),
    reference: optionalText(60, 'Keep the reference under 60 characters'),
    bank_name: optionalText(80, 'Keep the bank name under 80 characters'),
    bill_no: optionalText(60, 'Keep the bill number under 60 characters'),
    description: optionalText(500, 'Keep the description under 500 characters'),
  })
  .refine((data) => data.mode === 'cash' || data.reference.trim() !== '', (data) => ({
    message: REFERENCE_PROMPTS[data.mode],
    path: ['reference'],
  }));

export type ExpenseInput = z.infer<typeof expenseSchema>;
