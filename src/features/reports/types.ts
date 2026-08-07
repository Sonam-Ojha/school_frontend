import type { ToneName } from '@/types/common';

/**
 * Reports.
 *
 * This module owns no data. Attendance owns attendance, fees own the ledger,
 * payroll owns payslips — and every one of them already has the operational
 * screen a clerk works in. What was missing is the layer above: the questions
 * a head asks across all of them, in one shape, with one chart set and one
 * export path.
 *
 * That one shape is `ReportResult`. Every report — a class attendance
 * summary, a collection trend, a grade spread — comes back as the same
 * columns/rows/series/stats envelope, which is why the module is a registry
 * and three components rather than six screens.
 */

export type ReportFamily =
  | 'attendance'
  | 'fees'
  | 'students'
  | 'teachers'
  | 'payroll'
  | 'exams';

export type ReportKey =
  | 'attendance-by-class'
  | 'attendance-trend'
  | 'fee-collection'
  | 'fee-defaulters'
  | 'student-strength'
  | 'student-admissions'
  | 'teacher-departments'
  | 'teacher-workload'
  | 'payroll-cost'
  | 'payroll-statutory'
  | 'exam-performance'
  | 'exam-grade-spread';

/** How a figure is written. Drives the table cell, the axis and the tooltip. */
export type ValueFormat = 'text' | 'number' | 'money' | 'percent' | 'date';

/** Which filter control a report needs. The registry declares them; the runner renders them. */
export type ReportParam =
  | 'academic_year'
  | 'month'
  | 'year'
  | 'date_range'
  | 'class'
  | 'section'
  | 'exam'
  | 'employee_type';

export interface ReportColumn {
  key: string;
  label: string;
  format: ValueFormat;
  align?: 'left' | 'right' | 'center';
  /** Summed into the footer. Meaningless on a percentage, which is why it is opt-in. */
  total?: boolean;
  /** Hidden on narrow screens — the same column-priority rule the tables use. */
  hideBelow?: 'sm' | 'md' | 'lg';
}

export type ReportCell = string | number | null;
export type ReportRow = Record<string, ReportCell>;

export interface ReportPoint {
  label: string;
  value: number;
  /** Overrides the palette where the colour carries meaning — a grade, a status. */
  colour?: string;
}

export interface ReportSeries {
  key: string;
  label: string;
  chart: 'bar' | 'line' | 'donut';
  format: ValueFormat;
  points: ReportPoint[];
  /** Bars of a second series are drawn beside the first, not stacked. */
  companion?: { label: string; points: ReportPoint[] };
}

/** A headline figure above the chart — the answer before the detail. */
export interface ReportStat {
  label: string;
  value: number;
  format: ValueFormat;
  tone?: ToneName;
  /** Context rather than another number: "of 940 students". */
  hint?: string;
}

export interface ReportResult {
  key: ReportKey;
  title: string;
  subtitle: string | null;
  /** Frozen at generation — a printed report has to say when it was true. */
  generated_at: string;
  /** Echoed back so an export and a screen cannot disagree about the filters. */
  params: Record<string, string>;

  stats: ReportStat[];
  series: ReportSeries[];
  columns: ReportColumn[];
  rows: ReportRow[];
  /** Keyed by column. Absent where a total would be nonsense. */
  totals: ReportRow | null;

  /**
   * Why the report is empty, when it is.
   *
   * "No marks entered for this exam yet" and "no students in this class" are
   * different problems, and a blank table says neither.
   */
  empty_reason: string | null;
}

/** One card on the overview — a report reduced to a single chart. */
export interface OverviewPanel {
  key: ReportKey;
  family: ReportFamily;
  title: string;
  stat: ReportStat;
  series: ReportSeries;
}

export interface ReportsOverview {
  generated_at: string;
  panels: OverviewPanel[];
}
