/** Public surface of the dashboard module. */

export { ActivityFeed } from './components/ActivityFeed';
export { AlertPanel } from './components/AlertPanel';
export { ListPanel } from './components/ListPanel';
export { StatCard, StatGrid } from './components/StatCard';

export {
  ACTIVITY_FEED_SIZE,
  ACTIVITY_ICONS,
  ALERT_ICON,
  DASHBOARD_STALE_TIME,
  LIST_PREVIEW_SIZE,
  STAT_ICONS,
  VIEW_FOR_ROLE,
  VIEW_LABELS,
  viewForRoles,
} from './constants';

export { dashboardKeys, useDashboard } from './hooks/useDashboard';

export { dashboardService } from './services/dashboardService';

export type {
  ActivityEntry,
  ActivityKind,
  DashboardAlert,
  DashboardData,
  DashboardList,
  DashboardListItem,
  DashboardPanel,
  DashboardStat,
  DashboardSubject,
  DashboardView,
  StatIcon,
} from './types';
