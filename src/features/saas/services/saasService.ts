import { http } from '@/lib/axios';
import { publicApi } from '@/lib/publicApi';
import type { ApiResource, CollectionResponse } from '@/types/api';

import type {
  BillingCycle,
  LeadInput,
  PublicPlan,
  SaasConfig,
  SchoolInfo,
  SchoolInvoice,
  SignupInput,
  SignupResult,
  Subscription,
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

  async changePlan(input: { plan_id: number; billing_cycle: BillingCycle }): Promise<SchoolInvoice> {
    const { data } = await http.post<ApiResource<SchoolInvoice>>('/saas/subscription/change', input);
    return data.data;
  },

  async invoice(id: number, signal?: AbortSignal): Promise<SchoolInvoiceDocument> {
    const { data } = await http.get<ApiResource<SchoolInvoiceDocument>>(`/saas/invoices/${id}`, { signal });
    return data.data;
  },

  async createPaymentOrder(invoiceId: number): Promise<PaymentOrder> {
    const { data } = await http.post<ApiResource<PaymentOrder>>(`/saas/invoices/${invoiceId}/pay`);
    return data.data;
  },

  async confirmPayment(
    invoiceId: number,
    input: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
  ): Promise<SchoolInvoice> {
    const { data } = await http.post<ApiResource<SchoolInvoice>>(
      `/saas/invoices/${invoiceId}/pay/confirm`,
      input,
    );
    return data.data;
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

/** An invoice with everything needed to print it. */
export interface SchoolInvoiceDocument extends SchoolInvoice {
  seller: {
    company_name: string;
    address: string;
    gstin: string;
    email: string;
    phone: string;
  };
  buyer: {
    name: string;
    contact_name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
  };
  payments: Array<{ id: number; amount: number; method: string; reference: string; paid_on: string }>;
  payment_instructions: string;
}
