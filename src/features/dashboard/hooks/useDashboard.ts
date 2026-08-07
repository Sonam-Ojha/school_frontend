import { useQuery } from '@tanstack/react-query';

import { DASHBOARD_STALE_TIME } from '../constants';
import { dashboardService } from '../services/dashboardService';
import type { DashboardView } from '../types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  view: (view: DashboardView | undefined) => ['dashboard', view ?? 'default'] as const,
};

/**
 * The dashboard, kept briefly fresh.
 *
 * Nothing here invalidates anything — the module writes no data. It refetches
 * when the window regains focus instead, because the figure that matters on a
 * "right now" screen is the one from a moment ago, not from when the tab was
 * opened this morning.
 */
export function useDashboard(view?: DashboardView) {
  return useQuery({
    queryKey: dashboardKeys.view(view),
    queryFn: ({ signal }) => dashboardService.load(view, signal),
    staleTime: DASHBOARD_STALE_TIME,
    refetchOnWindowFocus: true,
    placeholderData: (previous) => previous,
  });
}
