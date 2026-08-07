import type { ToneName } from '@/types/common';

/**
 * The school's grade scale.
 *
 * Shared by every module that turns a percentage into a letter — assignments,
 * examinations, and report cards. A second copy would be a school where the
 * same 79% is a B on one screen and an A on another.
 *
 * Bands are a **floor** on the percentage, not a range, so adding one is a
 * single line and no gap can open between two of them.
 */
export const GRADE_BANDS = [
  { grade: 'A+', min_percent: 90, tone: 'success' },
  { grade: 'A', min_percent: 80, tone: 'success' },
  { grade: 'B', min_percent: 70, tone: 'info' },
  { grade: 'C', min_percent: 60, tone: 'info' },
  { grade: 'D', min_percent: 50, tone: 'warning' },
  { grade: 'E', min_percent: 40, tone: 'warning' },
  { grade: 'F', min_percent: 0, tone: 'danger' },
] as const satisfies readonly { grade: string; min_percent: number; tone: ToneName }[];

/** Below this a subject is failed. Matches the lowest passing band. */
export const PASS_PERCENT = 40;

/** The band a percentage falls in. Mirrors the backend's own calculation. */
export function gradeFor(percentage: number): string {
  return GRADE_BANDS.find((band) => percentage >= band.min_percent)?.grade ?? 'F';
}

export function toneForGrade(grade: string): ToneName {
  return GRADE_BANDS.find((band) => band.grade === grade)?.tone ?? 'neutral';
}

/**
 * A percentage from marks, rounded to two places.
 *
 * Rounded once at the end — averaging pre-rounded subject percentages and
 * rounding again drifts from the figure a parent recomputes by hand.
 */
export function percentFor(obtained: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((obtained / total) * 10_000) / 100;
}
