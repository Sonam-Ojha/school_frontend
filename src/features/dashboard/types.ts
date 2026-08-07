import type { ReportSeries, ReportStat } from '@/features/reports/types';
import type { ToneName } from '@/types/common';

/**
 * The dashboard.
 *
 * Deliberately not a second reporting surface. Reports answer a question you
 * came to ask; a dashboard tells you what needs attention before you knew to
 * ask — which is why it is shaped by *who is looking* rather than by subject,
 * and why almost everything on it is a link to the screen where the work
 * happens.
 *
 * It owns no data. Every figure comes from the module that owns it, and the
 * statistics and charts reuse the reports module's own `ReportStat` and
 * `ReportSeries` shapes so a percentage is written the same way on both.
 */

export type DashboardView = 'admin' | 'principal' | 'teacher' | 'student' | 'parent';

/**
 * Icon vocabulary, as keys rather than components.
 *
 * The API says what a figure *is*; the frontend decides what that looks like.
 * Sending a component name over the wire would make the backend own an icon
 * set it cannot see.
 */
export type StatIcon =
  | 'students'
  | 'teachers'
  | 'staff'
  | 'attendance'
  | 'money'
  | 'outstanding'
  | 'exam'
  | 'homework'
  | 'timetable'
  | 'leave'
  | 'library'
  | 'transport'
  | 'notice';

/**
 * A headline figure.
 *
 * Extends the reports module's stat rather than restating it: the value
 * formats (`money`, `percent`, `number`) and the tone vocabulary are the same
 * decision, and two copies would be two places to change how a rupee is
 * written. What a dashboard adds is an icon and somewhere to go.
 */
export interface DashboardStat extends ReportStat {
  key: string;
  icon: StatIcon;
  /** Where the figure comes from — the screen that can act on it. */
  to: string | null;
}

/** Something that needs doing, with the count and the way to do it. */
export interface DashboardAlert {
  key: string;
  tone: ToneName;
  title: string;
  detail: string;
  to: string | null;
  action_label: string | null;
  /** Sorts the list — the most pressing thing first, whatever module it came from. */
  urgency: number;
}

/** One row of a list widget: today's lesson, an overdue fee, a book due back. */
export interface DashboardListItem {
  id: string;
  title: string;
  detail: string | null;
  /** The right-hand figure or time — kept short. */
  meta: string | null;
  tone: ToneName | null;
  to: string | null;
}

export interface DashboardList {
  key: string;
  title: string;
  description: string | null;
  /** Where the full version lives. A dashboard list is always a preview. */
  to: string | null;
  /** Said instead of the rows when there are none, in words that fit the case. */
  empty: string;
  items: DashboardListItem[];
}

/** A chart. The series is the reports module's own shape, drawn by its component. */
export interface DashboardPanel {
  key: string;
  title: string;
  description: string | null;
  to: string | null;
  series: ReportSeries;
}

export type ActivityKind =
  | 'admission'
  | 'payment'
  | 'leave'
  | 'exam'
  | 'homework'
  | 'notice'
  | 'library'
  | 'payroll'
  | 'transport';

/**
 * One thing that happened.
 *
 * Drawn from the records the modules already write — a payment, an admission,
 * a leave decision — rather than a separate audit log. A feed that needed its
 * own table would be a second place for the truth to live, and it would go
 * stale the first time somebody wrote to a module without remembering it.
 */
export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string | null;
  /** ISO timestamp. Rendered as "2 hours ago" — the feed is about recency. */
  at: string;
  to: string | null;
  tone: ToneName | null;
}

/** Who a student or parent dashboard is about. */
export interface DashboardSubject {
  student_id: number;
  student_name: string;
  admission_no: string;
  photo_url: string | null;
  class_name: string;
  section_name: string | null;
  /** Set on the parent view — "your daughter", by name. */
  relation: string | null;
}

export interface DashboardData {
  view: DashboardView;
  /**
   * Other views this user could switch to.
   *
   * A head who also teaches holds two roles and wants both dashboards. The
   * API decides which is the default; the switch is only offered where there
   * is genuinely more than one.
   */
  available_views: DashboardView[];
  generated_at: string;
  greeting: string;
  subject: DashboardSubject | null;

  stats: DashboardStat[];
  alerts: DashboardAlert[];
  panels: DashboardPanel[];
  lists: DashboardList[];
  activities: ActivityEntry[];
}
