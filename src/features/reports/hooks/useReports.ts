import { useMutation, useQuery } from '@tanstack/react-query';

import { toast } from '@/store/toastStore';

import type { ExportFormat } from '../constants';
import { reportService, type ReportParams } from '../services/reportService';
import type { ReportKey } from '../types';

export const reportKeys = {
  all: ['reports'] as const,
  overview: () => ['reports', 'overview'] as const,
  run: (key: ReportKey, params: ReportParams) => ['reports', 'run', key, params] as const,
};

/**
 * Reports are read-only and derived, so they are cached generously — a head
 * flipping between two of them should not re-run both. Nothing here
 * invalidates anything: this module writes no data.
 */
const REPORT_STALE_TIME = 5 * 60_000;

export function useReport(key: ReportKey, params: ReportParams, enabled = true) {
  return useQuery({
    queryKey: reportKeys.run(key, params),
    queryFn: ({ signal }) => reportService.run(key, params, signal),
    enabled,
    staleTime: REPORT_STALE_TIME,
    // Keeps the previous report on screen while a filter change re-runs, so
    // the page does not collapse to a skeleton on every dropdown.
    placeholderData: (previous) => previous,
  });
}

export function useReportsOverview() {
  return useQuery({
    queryKey: reportKeys.overview(),
    queryFn: ({ signal }) => reportService.overview(signal),
    staleTime: REPORT_STALE_TIME,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({
      key,
      params,
      format,
    }: {
      key: ReportKey;
      params: ReportParams;
      format: ExportFormat;
    }) => reportService.export(key, params, format),
    onError: (error: Error) => toast.error('Could not export the report', error.message),
  });
}
