import { useMutation, useQuery } from '@tanstack/react-query';

import { toast } from '@/store/toastStore';

import { analyticsService, type AnalysisParams } from '../services/analyticsService';
import type { AnalysisKey } from '../types';

export const analyticsKeys = {
  all: ['analytics'] as const,
  providers: () => ['analytics', 'providers'] as const,
  run: (key: AnalysisKey, params: AnalysisParams) => ['analytics', 'run', key, params] as const,
  features: (key: AnalysisKey, params: AnalysisParams) =>
    ['analytics', 'features', key, params] as const,
};

/**
 * An analysis is expensive and changes slowly — it reads every roster in the
 * school — so it is cached hard. Nothing here invalidates anything: this
 * module writes no data at all.
 */
const ANALYSIS_STALE_TIME = 10 * 60_000;

export function useAnalysis(key: AnalysisKey, params: AnalysisParams, enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.run(key, params),
    queryFn: ({ signal }) => analyticsService.run(key, params, signal),
    enabled,
    staleTime: ANALYSIS_STALE_TIME,
    placeholderData: (previous) => previous,
  });
}

export function useIntelligenceProviders() {
  return useQuery({
    queryKey: analyticsKeys.providers(),
    queryFn: ({ signal }) => analyticsService.providers(signal),
    staleTime: ANALYSIS_STALE_TIME,
  });
}

/** Only fetched when somebody opens the feature panel — it is the big payload. */
export function useFeatureVector(key: AnalysisKey, params: AnalysisParams, enabled: boolean) {
  return useQuery({
    queryKey: analyticsKeys.features(key, params),
    queryFn: ({ signal }) => analyticsService.features(key, params, signal),
    enabled,
    staleTime: ANALYSIS_STALE_TIME,
  });
}

export function useExportCohort() {
  return useMutation({
    mutationFn: ({
      key,
      params,
      format,
    }: {
      key: AnalysisKey;
      params: AnalysisParams;
      format: string;
    }) => analyticsService.exportCohort(key, params, format),
    onError: (error: Error) => toast.error('Could not export the cohort', error.message),
  });
}
