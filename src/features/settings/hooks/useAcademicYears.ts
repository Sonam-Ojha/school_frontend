import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';

import type { AcademicYearInput } from '../schemas';
import { academicYearService } from '../services/academicYearService';

import { settingsKeys } from './useSettings';

export const academicYearKeys = createResourceKeys('academic-years');

export function useAcademicYears() {
  return useQuery({
    queryKey: academicYearKeys.all,
    queryFn: ({ signal }) => academicYearService.all(signal),
    staleTime: 5 * 60_000,
  });
}

/**
 * Any session write can change which session is current, and that value is
 * embedded in the settings object — so both caches are invalidated together.
 */
function useInvalidateSessions() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: academicYearKeys.all }),
      queryClient.invalidateQueries({ queryKey: settingsKeys.all }),
    ]);
  };
}

export function useCreateAcademicYear() {
  const invalidate = useInvalidateSessions();

  return useMutation({
    mutationFn: (input: AcademicYearInput) => academicYearService.create(input),
    onSuccess: async (year) => {
      await invalidate();
      toast.success('Session created', `${year.name} has been added.`);
    },
  });
}

export function useUpdateAcademicYear(id: number) {
  const invalidate = useInvalidateSessions();

  return useMutation({
    mutationFn: (input: AcademicYearInput) => academicYearService.update(id, input),
    onSuccess: async (year) => {
      await invalidate();
      toast.success('Session updated', `Changes to ${year.name} have been saved.`);
    },
  });
}

export function useDeleteAcademicYear() {
  const invalidate = useInvalidateSessions();

  return useMutation({
    mutationFn: (id: number) => academicYearService.remove(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Session deleted');
    },
  });
}

export function useActivateAcademicYear() {
  const invalidate = useInvalidateSessions();

  return useMutation({
    mutationFn: (id: number) => academicYearService.activate(id),
    onSuccess: async (year) => {
      await invalidate();
      toast.success('Current session changed', `${year.name} is now the active session.`);
    },
  });
}
