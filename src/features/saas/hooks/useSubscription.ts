import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import { ROLES } from '@/types/auth';

import { CheckoutDismissed, openCheckout } from '../razorpay';
import { saasService } from '../services/saasService';
import { useSchool } from '../SchoolContext';
import type { BillingCycle, ModuleKey, NewTicketInput } from '../types';

/**
 * Who the platform treats as the school's administrator: the full-access
 * role, or anybody who may change the school's settings. Mirrors the API.
 */
export function useIsSchoolAdmin(): boolean {
  return useAuthStore(
    (state) =>
      Boolean(state.user?.roles.includes(ROLES.superAdmin)) || Boolean(state.user?.permissions.includes('settings.update')),
  );
}

/**
 * The school's plan, standing and (for its administrators) invoices.
 *
 * Fails quietly: a school served without the platform in front of it has no
 * subscription at all, and every screen that reads this carries on without.
 */
export function useSubscription() {
  const signedIn = useAuthStore((state) => state.status === 'authenticated');
  return useQuery({
    queryKey: queryKeys.saas.subscription(),
    queryFn: ({ signal }) => saasService.subscription(signal),
    enabled: signedIn,
    staleTime: 5 * 60_000,
    retry: false,
    meta: { skipGlobalError: true },
  });
}

/**
 * The optional modules the school's plan includes, or null when unknown — in
 * which case nothing is hidden and the API remains the judge.
 */
export function usePlanModules(): ModuleKey[] | null {
  const subscription = useSubscription();
  const { info } = useSchool();
  return subscription.data?.modules ?? info?.modules ?? null;
}

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.saas.plans(),
    queryFn: ({ signal }) => saasService.plans(signal),
    staleTime: 15 * 60_000,
  });
}

function useRefreshSubscription() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.saas.subscription() });
}

export function useChangePlan() {
  const refresh = useRefreshSubscription();
  return useMutation({
    mutationFn: (input: { plan_id: number; billing_cycle: BillingCycle }) => saasService.changePlan(input),
    onSuccess: async ({ message }) => {
      await refresh();
      toast.success('Invoice raised', message);
    },
  });
}

/** Opens Razorpay for an invoice and, once paid, has the platform check the payment. */
export function usePayInvoice() {
  const refresh = useRefreshSubscription();
  return useMutation({
    mutationFn: async (invoiceId: number) => {
      const order = await saasService.createPaymentOrder(invoiceId);
      const paid = await openCheckout(order);
      return saasService.confirmPayment(invoiceId, paid);
    },
    meta: { skipGlobalError: true },
    onSuccess: async ({ message }) => {
      await refresh();
      toast.success('Payment received', message);
    },
    onError: (error) => {
      if (error instanceof CheckoutDismissed) {
        toast.info('Payment not completed', error.message);
        return;
      }
      toast.error('Payment failed', error.message);
    },
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: (invoice: { id: number; number: string }) => saasService.downloadInvoice(invoice),
  });
}

// --- support tickets -----------------------------------------------------------

export function useTickets() {
  return useQuery({
    queryKey: queryKeys.saas.tickets(),
    queryFn: ({ signal }) => saasService.tickets(signal),
  });
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: queryKeys.saas.ticket(id),
    queryFn: ({ signal }) => saasService.ticket(id, signal),
    enabled: id > 0,
  });
}

function useRefreshTickets() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.saas.tickets() });
}

export function useOpenTicket() {
  const refresh = useRefreshTickets();
  return useMutation({
    mutationFn: (input: NewTicketInput) => saasService.openTicket(input),
    onSuccess: async ({ message }) => {
      await refresh();
      toast.success('Ticket raised', message);
    },
  });
}

export function useReplyToTicket(id: number) {
  const queryClient = useQueryClient();
  const refresh = useRefreshTickets();
  return useMutation({
    mutationFn: (body: string) => saasService.replyToTicket(id, body),
    onSuccess: async (ticket) => {
      queryClient.setQueryData(queryKeys.saas.ticket(id), ticket);
      await refresh();
      toast.success('Reply sent', 'The support team will answer here.');
    },
  });
}

export function useCloseTicket(id: number) {
  const queryClient = useQueryClient();
  const refresh = useRefreshTickets();
  return useMutation({
    mutationFn: () => saasService.closeTicket(id),
    onSuccess: async ({ ticket, message }) => {
      queryClient.setQueryData(queryKeys.saas.ticket(id), ticket);
      await refresh();
      toast.success('Ticket closed', message);
    },
  });
}
