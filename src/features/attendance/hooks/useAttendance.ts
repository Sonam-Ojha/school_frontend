import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';

import type { AttendanceSheetInput } from '../schemas';
import {
  attendanceService,
  type MonthlyQuery,
  type SheetQuery,
} from '../services/attendanceService';

export const attendanceKeys = {
  ...createResourceKeys('attendance'),
  sheet: (query: SheetQuery) => ['attendance', 'sheet', query] as const,
  monthly: (query: MonthlyQuery) => ['attendance', 'monthly', query] as const,
};

export function useAttendanceSheet(query: SheetQuery, enabled = true) {
  return useQuery({
    queryKey: attendanceKeys.sheet(query),
    queryFn: ({ signal }) => attendanceService.sheet(query, signal),
    enabled,
    // A sheet is edited live by several people; a stale one loses marks.
    staleTime: 0,
  });
}

export function useSaveAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AttendanceSheetInput) => attendanceService.save(input),
    onSuccess: async (sheet, input) => {
      // The response is the recomputed sheet, so it replaces the cache entry
      // rather than triggering a refetch.
      queryClient.setQueryData(
        attendanceKeys.sheet({
          type: input.type,
          date: input.date,
          classId: input.class_id,
          sectionId: input.section_id,
        }),
        sheet,
      );

      // Monthly totals are now stale.
      await queryClient.invalidateQueries({ queryKey: ['attendance', 'monthly'] });

      const saved = input.entries.length;
      toast.success(
        'Attendance saved',
        `${saved} record${saved === 1 ? '' : 's'} updated. ${sheet.summary.unmarked} still unmarked.`,
      );
    },
  });
}

export function useMonthlyReport(query: MonthlyQuery, enabled = true) {
  return useQuery({
    queryKey: attendanceKeys.monthly(query),
    queryFn: ({ signal }) => attendanceService.monthlyReport(query, signal),
    enabled,
    staleTime: 60_000,
  });
}

/** Reports its own outcome, so the global error toast is suppressed. */
export function useExportMonthly() {
  return useMutation({
    mutationFn: ({ query, format }: { query: MonthlyQuery; format: 'pdf' | 'excel' }) =>
      attendanceService.exportMonthly(query, format),
    onSuccess: (_result, { format }) =>
      toast.success(`${format === 'excel' ? 'Excel' : 'PDF'} export ready`, 'Check your downloads.'),
    onError: (error) => toast.error('Export failed', error.message),
    meta: { skipGlobalError: true },
  });
}
