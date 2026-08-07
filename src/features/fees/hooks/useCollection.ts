import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createResourceKeys } from '@/lib/queryKeys';
import { formatCurrency } from '@/lib/format';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import type { CancelPaymentInput, CollectPaymentInput } from '../schemas';
import { collectionService } from '../services/collectionService';

export const paymentKeys = createResourceKeys('fee-payments');
export const accountKeys = createResourceKeys('fee-account');
export const dueKeys = createResourceKeys('fee-dues');

/**
 * A student's fee account.
 *
 * `staleTime: 0` on purpose — another cashier may have taken a payment
 * seconds ago, and collecting against a stale balance is how a student ends
 * up over-paid.
 */
export function useStudentAccount(studentId: number | undefined) {
  return useQuery({
    queryKey: accountKeys.detail(studentId ?? ''),
    queryFn: ({ signal }) => collectionService.account(studentId!, signal),
    enabled: studentId !== undefined,
    staleTime: 0,
  });
}

/** Everything a payment touches: the account, the ledger and the dues report. */
function useInvalidateCollection() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: accountKeys.all }),
      queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
      queryClient.invalidateQueries({ queryKey: dueKeys.all }),
    ]);
  };
}

export function useCollectPayment() {
  const invalidate = useInvalidateCollection();

  return useMutation({
    mutationFn: (input: CollectPaymentInput) => collectionService.collect(input),
    onSuccess: async (payment) => {
      await invalidate();
      toast.success(
        `Receipt ${payment.receipt_no}`,
        `${formatCurrency(payment.amount)} collected from ${payment.student_name}.`,
      );
    },
  });
}

export function usePayments(params: ListQueryParams) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: ({ signal }) => collectionService.listPayments(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function usePayment(id: number | string | undefined) {
  return useQuery({
    queryKey: paymentKeys.detail(id ?? ''),
    queryFn: ({ signal }) => collectionService.showPayment(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

export function useCancelPayment(id: number) {
  const invalidate = useInvalidateCollection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CancelPaymentInput) => collectionService.cancelPayment(id, input),
    onSuccess: async (payment) => {
      // The cancelled receipt stays in the ledger, so its detail is replaced
      // rather than removed.
      queryClient.setQueryData(paymentKeys.detail(id), payment);
      await invalidate();
      toast.success(`Receipt ${payment.receipt_no} cancelled`, 'The dues it settled are payable again.');
    },
  });
}

export function useDueReport(params: ListQueryParams) {
  return useQuery({
    queryKey: dueKeys.list(params),
    queryFn: ({ signal }) => collectionService.dueReport(params, signal),
    placeholderData: (previous) => previous,
  });
}

/** Both outcomes are reported here, so the global error toast is suppressed. */
export function useExportDueReport() {
  return useMutation({
    mutationFn: ({ params, format }: { params: ListQueryParams; format: 'pdf' | 'excel' }) =>
      collectionService.exportDueReport(params, format),
    onSuccess: (_result, { format }) =>
      toast.success(`${format === 'excel' ? 'Excel' : 'PDF'} export ready`, 'Check your downloads.'),
    onError: (error) => toast.error('Export failed', error.message),
    meta: { skipGlobalError: true },
  });
}

export function useDownloadReceipt() {
  return useMutation({
    mutationFn: (payment: Parameters<typeof collectionService.downloadReceipt>[0]) =>
      collectionService.downloadReceipt(payment),
    onError: (error) => toast.error('Could not download the receipt', error.message),
    meta: { skipGlobalError: true },
  });
}
