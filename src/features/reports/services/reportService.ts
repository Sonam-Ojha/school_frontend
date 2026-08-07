import { http } from '@/lib/axios';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type { ApiResource } from '@/types/api';

import type { ExportFormat } from '../constants';
import type { ReportKey, ReportResult, ReportsOverview } from '../types';

/** Whatever filters the report declared, flattened for the query string. */
export type ReportParams = Record<string, string | number | undefined>;

/** Blank and undefined mean "not filtered", and neither belongs on the wire. */
const clean = (params: ReportParams): Record<string, string> => {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    out[key] = String(value);
  }

  return out;
};

export const reportService = {
  /**
   * Run one report.
   *
   * Every report returns the same envelope, which is the whole reason this
   * module is a registry and three components rather than six screens.
   */
  async run(key: ReportKey, params: ReportParams, signal?: AbortSignal): Promise<ReportResult> {
    const { data } = await http.get<ApiResource<ReportResult>>(`/reports/${key}`, {
      params: clean(params),
      signal,
    });
    return data.data;
  },

  /** The headline chart from each family, for the overview. */
  async overview(signal?: AbortSignal): Promise<ReportsOverview> {
    const { data } = await http.get<ApiResource<ReportsOverview>>('/reports/overview', { signal });
    return data.data;
  },

  /**
   * The same report as a file.
   *
   * Deliberately generated server-side rather than by turning the rendered
   * table into a spreadsheet in the browser: the export must contain what the
   * report *is*, not the page of it somebody happened to be looking at.
   */
  async export(key: ReportKey, params: ReportParams, format: ExportFormat): Promise<void> {
    await downloadFile(
      `/reports/${key}/export`,
      timestampedFilename(key, format === 'excel' ? 'xlsx' : 'pdf'),
      { params: { ...clean(params), format } },
    );
  },
};
