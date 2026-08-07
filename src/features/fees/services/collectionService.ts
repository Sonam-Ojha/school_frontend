import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type { ApiResource, ListQueryParams } from '@/types/api';

import type { CancelPaymentInput, CollectPaymentInput } from '../schemas';
import type { DueReportRow, DueReportTotals, Payment, StudentFeeAccount } from '../types';

const paymentCrud = createCrudService<Payment>('/fees/payments');

export interface DueReportResponse {
  data: DueReportRow[];
  totals: DueReportTotals;
  meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null; path: string };
}

/** Collection, receipts and the outstanding-dues report. */
export const collectionService = {
  /**
   * A student's whole fee position — structure, dues and running totals.
   *
   * Fetched fresh on every open: a second cashier may have taken a payment in
   * the meantime, and collecting against a stale balance is how a student ends
   * up over-paid.
   */
  async account(studentId: number, signal?: AbortSignal): Promise<StudentFeeAccount> {
    const { data } = await http.get<ApiResource<StudentFeeAccount>>(
      `/fees/students/${studentId}/account`,
      { signal },
    );
    return data.data;
  },

  /**
   * Take a payment.
   *
   * Allocation across dues is the backend's job — it holds the row locks and
   * must settle oldest-first inside the same transaction that writes the
   * receipt. Sending a client-computed split would race a concurrent payment.
   */
  async collect(input: CollectPaymentInput): Promise<Payment> {
    const { data } = await http.post<ApiResource<Payment>>('/fees/payments', {
      student_id: input.student_id,
      amount: input.amount,
      mode: input.mode,
      reference: input.reference.trim() || null,
      discount_id: input.discount_id,
      fine_amount: input.fine_amount,
      paid_at: input.paid_at,
      remarks: input.remarks.trim() || null,
    });
    return data.data;
  },

  listPayments: paymentCrud.list,

  async showPayment(id: number | string, signal?: AbortSignal): Promise<Payment> {
    const { data } = await http.get<ApiResource<Payment>>(`/fees/payments/${id}`, { signal });
    return data.data;
  },

  /**
   * Cancels a receipt.
   *
   * Never a delete — a cancelled receipt stays in the ledger with its reason,
   * because the receipt number was already handed to a parent.
   */
  async cancelPayment(id: number, input: CancelPaymentInput): Promise<Payment> {
    const { data } = await http.post<ApiResource<Payment>>(`/fees/payments/${id}/cancel`, {
      reason: input.reason.trim(),
    });
    return data.data;
  },

  /** Server-rendered receipt, for a print run that must match exactly. */
  async downloadReceipt(payment: Payment): Promise<void> {
    await downloadFile(`/fees/payments/${payment.id}/receipt`, `receipt-${payment.receipt_no}.pdf`);
  },

  async dueReport(params: ListQueryParams, signal?: AbortSignal): Promise<DueReportResponse> {
    const { data } = await http.get<DueReportResponse>('/fees/reports/dues', { params, signal });
    return data;
  },

  async exportDueReport(params: ListQueryParams, format: 'pdf' | 'excel'): Promise<void> {
    const { page: _page, per_page: _perPage, ...filters } = params;
    const extension = format === 'excel' ? 'xlsx' : 'pdf';

    await downloadFile('/fees/reports/dues/export', timestampedFilename('fee-dues', extension), {
      params: { ...filters, format },
    });
  },
};
