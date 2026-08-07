import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';

import type { HolidayInput } from '../schemas';
import { holidayService } from '../services/holidayService';

export const holidayKeys = createResourceKeys('holidays');

export function useHolidays(params: ListQueryParams) {
  return useQuery({
    queryKey: holidayKeys.list(params),
    queryFn: ({ signal }) => holidayService.list(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useHolidaysForYear(year: number) {
  return useQuery({
    queryKey: [...holidayKeys.all, 'year', year] as const,
    queryFn: ({ signal }) => holidayService.forYear(year, signal),
    staleTime: 10 * 60_000,
  });
}

/**
 * Holidays decide which days are working days, so any change invalidates the
 * sheets and the monthly totals as well as the holiday list itself.
 */
function useInvalidateHolidays() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: holidayKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['attendance'] }),
    ]);
  };
}

export function useCreateHoliday() {
  const invalidate = useInvalidateHolidays();

  return useMutation({
    mutationFn: (input: HolidayInput) => holidayService.create(input),
    onSuccess: async (holiday) => {
      await invalidate();
      toast.success(
        'Holiday added',
        `${holiday.name} — ${holiday.days_count} day${holiday.days_count === 1 ? '' : 's'}.`,
      );
    },
  });
}

export function useUpdateHoliday(id: number) {
  const invalidate = useInvalidateHolidays();

  return useMutation({
    mutationFn: (input: HolidayInput) => holidayService.update(id, input),
    onSuccess: async (holiday) => {
      await invalidate();
      toast.success('Holiday updated', holiday.name);
    },
  });
}

export function useDeleteHoliday() {
  const invalidate = useInvalidateHolidays();

  return useMutation({
    mutationFn: (id: number) => holidayService.remove(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Holiday removed');
    },
  });
}
