/** Public surface of the reports module. */

export { ReportChart } from './components/ReportChart';
export { ReportFilters, type FilterValues } from './components/ReportFilters';
export { ReportRunner } from './components/ReportRunner';
export { ReportStats } from './components/ReportStats';
export { ReportTable } from './components/ReportTable';

export {
  ATTENDANCE_CONCERN_PERCENT,
  EMPLOYEE_TYPE_OPTIONS,
  EXPORT_FORMATS,
  FAMILY_KEYS,
  HEAVY_LOAD_PERIODS,
  MONTH_LABELS,
  MONTH_OPTIONS,
  MONTH_SHORT,
  REPORT_CATALOGUE,
  REPORT_FAMILIES,
  REPORT_PERMISSIONS,
  familyOf,
  findReport,
  isReportFamily,
  reportsOf,
  yearOptions,
  type ExportFormat,
  type FamilyDefinition,
  type ReportDefinition,
} from './constants';

export { formatAxis, formatValue } from './format';

export { reportKeys, useExportReport, useReport, useReportsOverview } from './hooks/useReports';

export { reportService, type ReportParams } from './services/reportService';

export type {
  OverviewPanel,
  ReportCell,
  ReportColumn,
  ReportFamily,
  ReportKey,
  ReportParam,
  ReportPoint,
  ReportResult,
  ReportRow,
  ReportSeries,
  ReportStat as ReportStatValue,
  ReportsOverview,
  ValueFormat,
} from './types';
