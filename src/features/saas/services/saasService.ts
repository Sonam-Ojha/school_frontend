import { http } from '@/lib/axios';
import { downloadFile } from '@/lib/download';
import { publicApi } from '@/lib/publicApi';
import type { ApiResource, CollectionResponse } from '@/types/api';

import type {
  BillingCycle,
  LeadInput,
  NewTicketInput,
  PublicPlan,
  SaasConfig,
  SchoolInfo,
  SchoolInvoice,
  SignupInput,
  SignupResult,
  Subscription,
  SupportTicket,
} from '../types';

/**
 * The platform's endpoints under `/saas`. The public ones go out with no
 * session; the subscription ones carry the school's session, which the
 * platform checks with the school before answering.
 */
export const saasService = {
  async config(signal?: AbortSignal): Promise<SaasConfig> {
    const { data } = await publicApi.get<ApiResource<SaasConfig>>('/saas/config', { signal });
    return data.data;
  },

  async plans(signal?: AbortSignal): Promise<PublicPlan[]> {
    const { data } = await publicApi.get<CollectionResponse<PublicPlan>>('/saas/plans', { signal });
    return data.data;
  },

  async school(code: string, signal?: AbortSignal): Promise<SchoolInfo> {
    const { data } = await publicApi.get<ApiResource<SchoolInfo>>(
      `/saas/schools/${encodeURIComponent(code)}`,
      { signal },
    );
    return data.data;
  },

  async checkCode(code: string, signal?: AbortSignal): Promise<{ available: boolean; reason: string | null }> {
    const { data } = await publicApi.get<ApiResource<{ available: boolean; reason: string | null }>>(
      '/saas/check-code',
      { params: { code }, signal },
    );
    return data.data;
  },

  async signup(input: SignupInput): Promise<SignupResult> {
    const { data } = await publicApi.post<ApiResource<SignupResult>>('/saas/signup', input);
    return data.data;
  },

  async lead(input: LeadInput): Promise<{ message: string }> {
    const { data } = await publicApi.post<{ message: string }>('/saas/leads', input);
    return data;
  },

  // --- the signed-in school's own subscription -------------------------------

  async subscription(signal?: AbortSignal): Promise<Subscription> {
    const { data } = await http.get<ApiResource<Subscription>>('/saas/subscription', { signal });
    return data.data;
  },

  /** Raises an invoice for the chosen plan; the switch happens once it is paid. */
  async changePlan(input: { plan_id: number; billing_cycle: BillingCycle }): Promise<{ invoice: SchoolInvoice; message: string }> {
    const { data } = await http.post<ApiResource<SchoolInvoice> & { message: string }>('/saas/subscription/change', input);
    return { invoice: data.data, message: data.message };
  },

  downloadInvoice(invoice: Pick<SchoolInvoice, 'id' | 'number'>): Promise<void> {
    return downloadFile(`/saas/invoices/${invoice.id}/pdf`, `${invoice.number.replace(/\//g, '-')}.pdf`);
  },

  async createPaymentOrder(invoiceId: number): Promise<PaymentOrder> {
    const { data } = await http.post<ApiResource<PaymentOrder>>(`/saas/invoices/${invoiceId}/pay`);
    return data.data;
  },

  async confirmPayment(
    invoiceId: number,
    input: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
  ): Promise<{ invoice: SchoolInvoice; message: string }> {
    const { data } = await http.post<ApiResource<SchoolInvoice> & { message: string }>(
      `/saas/invoices/${invoiceId}/pay/confirm`,
      input,
    );
    return { invoice: data.data, message: data.message };
  },

  // --- the school's support tickets -------------------------------------------

  async tickets(signal?: AbortSignal): Promise<SupportTicket[]> {
    const { data } = await http.get<CollectionResponse<SupportTicket>>('/saas/tickets', { signal });
    return data.data;
  },

  async ticket(id: number, signal?: AbortSignal): Promise<SupportTicket> {
    const { data } = await http.get<ApiResource<SupportTicket>>(`/saas/tickets/${id}`, { signal });
    return data.data;
  },

  async openTicket(input: NewTicketInput): Promise<{ ticket: SupportTicket; message: string }> {
    const { data } = await http.post<ApiResource<SupportTicket> & { message: string }>('/saas/tickets', input);
    return { ticket: data.data, message: data.message };
  },

  async replyToTicket(id: number, body: string): Promise<SupportTicket> {
    const { data } = await http.post<ApiResource<SupportTicket>>(`/saas/tickets/${id}/messages`, { body });
    return data.data;
  },

  async closeTicket(id: number): Promise<{ ticket: SupportTicket; message: string }> {
    const { data } = await http.post<ApiResource<SupportTicket> & { message: string }>(`/saas/tickets/${id}/close`);
    return { ticket: data.data, message: data.message };
  },
};

export interface PaymentOrder {
  order_id: string;
  key_id: string;
  amount_paise: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
}
