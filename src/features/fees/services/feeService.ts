import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import type { ApiResource, CollectionResponse } from '@/types/api';

import type { DiscountInput, FeeStructureInput, FeeTypeInput } from '../schemas';
import type { Discount, FeeStructure, FeeStructureDetail, FeeType } from '../types';

const typeCrud = createCrudService<FeeType>('/fees/types');
const structureCrud = createCrudService<FeeStructure>('/fees/structures');
const discountCrud = createCrudService<Discount>('/fees/discounts');

const nullable = (value: string): string | null => value.trim() || null;

const toTypePayload = (input: FeeTypeInput) => ({
  name: input.name.trim(),
  code: input.code.trim().toUpperCase(),
  category: input.category,
  is_recurring: input.is_recurring,
  is_refundable: input.is_refundable,
  is_active: input.is_active,
  description: nullable(input.description),
});

const toDiscountPayload = (input: DiscountInput) => ({
  name: input.name.trim(),
  code: input.code.trim().toUpperCase(),
  value_type: input.value_type,
  value: input.value,
  description: nullable(input.description),
  is_active: input.is_active,
});

const toStructurePayload = (input: FeeStructureInput) => ({
  name: input.name.trim(),
  academic_year_id: input.academic_year_id,
  class_id: input.class_id,
  section_id: input.section_id,
  is_active: input.is_active,
  items: input.items.map((item) => ({
    fee_type_id: item.fee_type_id,
    amount: item.amount,
    frequency: item.frequency,
  })),
  installments: input.installments.map((installment, index) => ({
    // Sequence comes from position, not from the form — reordering rows must
    // not leave gaps or duplicates in the schedule.
    sequence: index + 1,
    name: installment.name.trim(),
    due_date: installment.due_date,
    amount: installment.amount,
  })),
});

/** Fee catalogue: types, structures and discounts. */
export const feeService = {
  // --- fee types ---
  listTypes: typeCrud.list,

  async typeOptions(signal?: AbortSignal): Promise<FeeType[]> {
    const { data } = await http.get<CollectionResponse<FeeType>>('/fees/types', {
      params: { per_page: 'all', status: 'active' },
      signal,
    });
    return data.data;
  },

  async createType(input: FeeTypeInput): Promise<FeeType> {
    const { data } = await http.post<ApiResource<FeeType>>('/fees/types', toTypePayload(input));
    return data.data;
  },

  async updateType(id: number, input: FeeTypeInput): Promise<FeeType> {
    const { data } = await http.put<ApiResource<FeeType>>(`/fees/types/${id}`, toTypePayload(input));
    return data.data;
  },

  removeType: typeCrud.remove,

  // --- structures ---
  listStructures: structureCrud.list,

  async showStructure(id: number | string, signal?: AbortSignal): Promise<FeeStructureDetail> {
    const { data } = await http.get<ApiResource<FeeStructureDetail>>(`/fees/structures/${id}`, {
      signal,
    });
    return data.data;
  },

  async createStructure(input: FeeStructureInput): Promise<FeeStructureDetail> {
    const { data } = await http.post<ApiResource<FeeStructureDetail>>(
      '/fees/structures',
      toStructurePayload(input),
    );
    return data.data;
  },

  async updateStructure(id: number, input: FeeStructureInput): Promise<FeeStructureDetail> {
    const { data } = await http.put<ApiResource<FeeStructureDetail>>(
      `/fees/structures/${id}`,
      toStructurePayload(input),
    );
    return data.data;
  },

  removeStructure: structureCrud.remove,

  // --- discounts ---
  listDiscounts: discountCrud.list,

  async discountOptions(signal?: AbortSignal): Promise<Discount[]> {
    const { data } = await http.get<CollectionResponse<Discount>>('/fees/discounts', {
      params: { per_page: 'all', status: 'active' },
      signal,
    });
    return data.data;
  },

  async createDiscount(input: DiscountInput): Promise<Discount> {
    const { data } = await http.post<ApiResource<Discount>>(
      '/fees/discounts',
      toDiscountPayload(input),
    );
    return data.data;
  },

  async updateDiscount(id: number, input: DiscountInput): Promise<Discount> {
    const { data } = await http.put<ApiResource<Discount>>(
      `/fees/discounts/${id}`,
      toDiscountPayload(input),
    );
    return data.data;
  },

  removeDiscount: discountCrud.remove,
};
