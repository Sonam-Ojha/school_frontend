import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';
import type { Option } from '@/types/common';

import type { DiscountInput, FeeStructureInput, FeeTypeInput } from '../schemas';
import { feeService } from '../services/feeService';

export const feeTypeKeys = createResourceKeys('fee-types');
export const structureKeys = createResourceKeys('fee-structures');
export const discountKeys = createResourceKeys('fee-discounts');

/**
 * Catalogue changes ripple into what a student owes, so a write to any of the
 * three invalidates the collection caches as well as its own list.
 */
function useInvalidateCatalogue(scope: ReturnType<typeof createResourceKeys>) {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: scope.all }),
      queryClient.invalidateQueries({ queryKey: ['fee-account'] }),
      queryClient.invalidateQueries({ queryKey: ['fee-dues'] }),
    ]);
  };
}

// --- fee types --------------------------------------------------------------

export function useFeeTypes(params: ListQueryParams) {
  return useQuery({
    queryKey: feeTypeKeys.list(params),
    queryFn: ({ signal }) => feeService.listTypes(params, signal),
    placeholderData: (previous) => previous,
  });
}

/** Active fee types as select options, for building a structure. */
export function useFeeTypeOptions() {
  const query = useQuery({
    queryKey: feeTypeKeys.options(),
    queryFn: ({ signal }) => feeService.typeOptions(signal),
    staleTime: 5 * 60_000,
  });

  const feeTypes = useMemo(() => query.data ?? [], [query.data]);

  const feeTypeOptions = useMemo<Option<number>[]>(
    () => feeTypes.map((type) => ({ label: `${type.name} (${type.code})`, value: type.id })),
    [feeTypes],
  );

  return { ...query, feeTypes, feeTypeOptions };
}

export function useCreateFeeType() {
  const invalidate = useInvalidateCatalogue(feeTypeKeys);

  return useMutation({
    mutationFn: (input: FeeTypeInput) => feeService.createType(input),
    onSuccess: async (feeType) => {
      await invalidate();
      toast.success('Fee type created', `${feeType.name} (${feeType.code})`);
    },
  });
}

export function useUpdateFeeType(id: number) {
  const invalidate = useInvalidateCatalogue(feeTypeKeys);

  return useMutation({
    mutationFn: (input: FeeTypeInput) => feeService.updateType(id, input),
    onSuccess: async (feeType) => {
      await invalidate();
      toast.success('Fee type updated', feeType.name);
    },
  });
}

export function useDeleteFeeType() {
  const invalidate = useInvalidateCatalogue(feeTypeKeys);

  return useMutation({
    mutationFn: (id: number) => feeService.removeType(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Fee type deleted');
    },
  });
}

// --- discounts --------------------------------------------------------------

export function useDiscounts(params: ListQueryParams) {
  return useQuery({
    queryKey: discountKeys.list(params),
    queryFn: ({ signal }) => feeService.listDiscounts(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useDiscountOptions() {
  const query = useQuery({
    queryKey: discountKeys.options(),
    queryFn: ({ signal }) => feeService.discountOptions(signal),
    staleTime: 5 * 60_000,
  });

  const discounts = useMemo(() => query.data ?? [], [query.data]);

  const discountOptions = useMemo<Option<number>[]>(
    () =>
      discounts.map((discount) => ({
        label:
          discount.value_type === 'percentage'
            ? `${discount.name} — ${discount.value}%`
            : `${discount.name} — flat ${discount.value}`,
        value: discount.id,
      })),
    [discounts],
  );

  return { ...query, discounts, discountOptions };
}

export function useCreateDiscount() {
  const invalidate = useInvalidateCatalogue(discountKeys);

  return useMutation({
    mutationFn: (input: DiscountInput) => feeService.createDiscount(input),
    onSuccess: async (discount) => {
      await invalidate();
      toast.success('Discount created', discount.name);
    },
  });
}

export function useUpdateDiscount(id: number) {
  const invalidate = useInvalidateCatalogue(discountKeys);

  return useMutation({
    mutationFn: (input: DiscountInput) => feeService.updateDiscount(id, input),
    onSuccess: async (discount) => {
      await invalidate();
      toast.success('Discount updated', discount.name);
    },
  });
}

export function useDeleteDiscount() {
  const invalidate = useInvalidateCatalogue(discountKeys);

  return useMutation({
    mutationFn: (id: number) => feeService.removeDiscount(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Discount deleted');
    },
  });
}

// --- structures -------------------------------------------------------------

export function useFeeStructures(params: ListQueryParams) {
  return useQuery({
    queryKey: structureKeys.list(params),
    queryFn: ({ signal }) => feeService.listStructures(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useFeeStructure(id: number | string | undefined) {
  return useQuery({
    queryKey: structureKeys.detail(id ?? ''),
    queryFn: ({ signal }) => feeService.showStructure(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

export function useCreateStructure() {
  const invalidate = useInvalidateCatalogue(structureKeys);

  return useMutation({
    mutationFn: (input: FeeStructureInput) => feeService.createStructure(input),
    onSuccess: async (structure) => {
      await invalidate();
      toast.success('Fee structure created', structure.name);
    },
  });
}

export function useUpdateStructure(id: number) {
  const invalidate = useInvalidateCatalogue(structureKeys);

  return useMutation({
    mutationFn: (input: FeeStructureInput) => feeService.updateStructure(id, input),
    onSuccess: async (structure) => {
      await invalidate();
      toast.success('Fee structure updated', structure.name);
    },
  });
}

export function useDeleteStructure() {
  const invalidate = useInvalidateCatalogue(structureKeys);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => feeService.removeStructure(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: structureKeys.detail(id) });
      await invalidate();
      toast.success('Fee structure deleted');
    },
  });
}
