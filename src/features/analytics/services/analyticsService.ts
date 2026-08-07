import { http } from '@/lib/axios';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type { ApiResource, CollectionResponse } from '@/types/api';

import type { Analysis, AnalysisKey, FeatureVector, IntelligenceProvider } from '../types';

export type AnalysisParams = Record<string, string | number | undefined>;

const clean = (params: AnalysisParams): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    out[key] = String(value);
  }
  return out;
};

export const analyticsService = {
  async run(key: AnalysisKey, params: AnalysisParams, signal?: AbortSignal): Promise<Analysis> {
    const { data } = await http.get<ApiResource<Analysis>>(`/analytics/${key}`, {
      params: clean(params),
      signal,
    });
    return data.data;
  },

  /**
   * Which intelligence providers this deployment could use.
   *
   * The same shape the communication module reports a channel in, and for the
   * same reason: "we could do this but nobody has set it up" is a different
   * message from "this build cannot".
   */
  async providers(signal?: AbortSignal): Promise<IntelligenceProvider[]> {
    const { data } = await http.get<CollectionResponse<IntelligenceProvider>>(
      '/analytics/providers',
      { signal },
    );
    return data.data;
  },

  /**
   * The feature matrix on its own.
   *
   * Separate from the analysis because it has a different consumer: a screen
   * wants the findings, a notebook or a training job wants the columns. Same
   * numbers, and the analysis carries a copy so the two cannot drift.
   */
  async features(
    key: AnalysisKey,
    params: AnalysisParams,
    signal?: AbortSignal,
  ): Promise<FeatureVector> {
    const { data } = await http.get<ApiResource<FeatureVector>>(`/analytics/${key}/features`, {
      params: clean(params),
      signal,
    });
    return data.data;
  },

  async exportCohort(key: AnalysisKey, params: AnalysisParams, format: string): Promise<void> {
    await downloadFile(
      `/analytics/${key}/export`,
      timestampedFilename(key, format === 'excel' ? 'xlsx' : 'pdf'),
      { params: { ...clean(params), format } },
    );
  },
};
