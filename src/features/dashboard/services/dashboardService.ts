import { http } from '@/lib/axios';
import type { ApiResource } from '@/types/api';

import type { DashboardData, DashboardView } from '../types';

export const dashboardService = {
  /**
   * The dashboard for the signed-in user.
   *
   * The view is the server's decision, made from the user's roles — asking
   * the client which dashboard it would like is asking it to authorise
   * itself. `view` is a *preference* among the views that user already holds,
   * and the API is free to ignore it.
   */
  async load(view: DashboardView | undefined, signal?: AbortSignal): Promise<DashboardData> {
    const { data } = await http.get<ApiResource<DashboardData>>('/dashboard', {
      params: view ? { view } : {},
      signal,
    });
    return data.data;
  },
};
