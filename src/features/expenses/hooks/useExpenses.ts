import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { dayBookKeys } from '@/features/fees/hooks/useCollection';
import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import { expenseService } from '../services/expenseService';
import type { ExpensePayload } from '../types';

export const expenseKeys = createResourceKeys('expenses');
export const expenseCategoryKeys = createResourceKeys('expense-categories');

export function useExpenses(params: ListQueryParams) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: ({ signal }) => expenseService.list(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useExpenseCategories() {
  return useQuery({
    queryKey: expenseCategoryKeys.all,
    queryFn: ({ signal }) => expenseService.categories(signal),
    staleTime: 5 * 60_000,
  });
}

/** An expense changes the book, its categories' totals and the day book's cash. */
function useRefresh() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
      queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all }),
      queryClient.invalidateQueries({ queryKey: dayBookKeys.all }),
    ]);
}

export function useSaveExpense(id: number | null) {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: ExpensePayload) => (id ? expenseService.update(id, input) : expenseService.create(input)),
    onSuccess: async ({ message }) => {
      await refresh();
      toast.success(id ? 'Expense saved' : 'Expense recorded', message);
    },
  });
}

export function useDecideExpense() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: 'approve' | 'reject' | 'cancel'; reason?: string }) =>
      expenseService.decide(id, action, reason),
    onSuccess: async ({ message }, { action }) => {
      await refresh();
      toast.success(action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Cancelled', message);
    },
  });
}

export function useDeleteExpense() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: number) => expenseService.remove(id),
    onSuccess: async (message) => {
      await refresh();
      toast.success('Deleted', message);
    },
  });
}

export function useExportExpenses() {
  return useMutation({
    mutationFn: ({ params, format }: { params: ListQueryParams; format: 'pdf' | 'excel' }) => expenseService.exportList(params, format),
    onSuccess: (_result, { format }) => toast.success(`${format === 'excel' ? 'Excel' : 'PDF'} export ready`, 'Check your downloads.'),
    onError: (error) => toast.error('Export failed', error.message),
    meta: { skipGlobalError: true },
  });
}

export function useSaveCategory(id: number | null) {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: { name: string; description: string | null; is_active: boolean }) =>
      id ? expenseService.updateCategory(id, input) : expenseService.createCategory(input),
    onSuccess: async (message) => {
      await refresh();
      toast.success('Category saved', message);
    },
  });
}

export function useDeleteCategory() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: number) => expenseService.removeCategory(id),
    onSuccess: async (message) => {
      await refresh();
      toast.success('Category deleted', message);
    },
  });
}
