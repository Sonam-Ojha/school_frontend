import { http } from '@/lib/axios';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type { ApiResource, ListQueryParams, PaginatedResponse } from '@/types/api';

import type { Expense, ExpenseCategory, ExpensePayload, ExpenseTotals } from '../types';

export type ExpenseListResponse = PaginatedResponse<Expense> & { totals: ExpenseTotals };

type WithMessage<T> = ApiResource<T> & { message: string };

export const expenseService = {
  async list(params: ListQueryParams, signal?: AbortSignal): Promise<ExpenseListResponse> {
    const { data } = await http.get<ExpenseListResponse>('/expenses', { params, signal });
    return data;
  },

  async create(input: ExpensePayload): Promise<{ expense: Expense; message: string }> {
    const { data } = await http.post<WithMessage<Expense>>('/expenses', input);
    return { expense: data.data, message: data.message };
  },

  async update(id: number, input: ExpensePayload): Promise<{ expense: Expense; message: string }> {
    const { data } = await http.put<WithMessage<Expense>>(`/expenses/${id}`, input);
    return { expense: data.data, message: data.message };
  },

  async decide(id: number, action: 'approve' | 'reject' | 'cancel', reason?: string): Promise<{ expense: Expense; message: string }> {
    const { data } = await http.post<WithMessage<Expense>>(`/expenses/${id}/${action}`, reason ? { reason } : {});
    return { expense: data.data, message: data.message };
  },

  async remove(id: number): Promise<string> {
    const { data } = await http.delete<{ message: string }>(`/expenses/${id}`);
    return data.message;
  },

  async exportList(params: ListQueryParams, format: 'pdf' | 'excel'): Promise<void> {
    const { page: _page, per_page: _perPage, ...filters } = params;
    await downloadFile('/expenses/export', timestampedFilename('expenses', format === 'excel' ? 'xlsx' : 'pdf'), {
      params: { ...filters, format },
    });
  },

  async categories(signal?: AbortSignal): Promise<ExpenseCategory[]> {
    const { data } = await http.get<{ data: ExpenseCategory[] }>('/expenses/categories', { signal });
    return data.data;
  },

  async createCategory(input: { name: string; description: string | null }): Promise<string> {
    const { data } = await http.post<{ message: string }>('/expenses/categories', input);
    return data.message;
  },

  async updateCategory(id: number, input: { name: string; description: string | null; is_active: boolean }): Promise<string> {
    const { data } = await http.put<{ message: string }>(`/expenses/categories/${id}`, input);
    return data.message;
  },

  async removeCategory(id: number): Promise<string> {
    const { data } = await http.delete<{ message: string }>(`/expenses/categories/${id}`);
    return data.message;
  },
};
