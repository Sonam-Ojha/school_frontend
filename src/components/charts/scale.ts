/**
 * Chart maths, kept out of the components.
 *
 * Everything here is pure: given numbers, produce coordinates and tick
 * labels. The components draw, this decides where — which keeps the SVG
 * readable and means the awkward parts (a nice axis, an all-zero series, a
 * single data point) are testable without rendering anything.
 */

/**
 * An axis maximum a human would have chosen.
 *
 * A series peaking at 437 gets an axis to 500, not to 437 — gridlines at
 * 437/4 are unreadable, and a bar that touches the top of its own chart looks
 * like a bar that has been cut off.
 */
export function niceMax(value: number, ticks = 4): number {
  if (!Number.isFinite(value) || value <= 0) return ticks;

  const rough = value / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;

  /**
   * 1, 2, 2.5, 5, 10 — the steps that divide into readable labels.
   *
   * 2.5 earns its place: without it a peak of 97 rounds up past 2 to a step of
   * 5 and an axis of 200, which draws every bar at half height. With it the
   * axis lands on 100 and the ticks are 0/25/50/75/100.
   */
  const step =
    normalised <= 1 ? 1
    : normalised <= 2 ? 2
    : normalised <= 2.5 ? 2.5
    : normalised <= 5 ? 5
    : 10;

  return step * magnitude * ticks;
}

/** Evenly spaced axis values from zero to `max`, `max` included. */
export function axisTicks(max: number, count = 4): number[] {
  return Array.from({ length: count + 1 }, (_, index) => (max / count) * index);
}

/**
 * A percentage series is always drawn against 100.
 *
 * Scaling attendance of 94–97% to its own range turns three points of
 * difference into the full height of the chart, which is how a healthy month
 * comes to look like a crisis.
 */
export const maxFor = (values: number[], isPercent: boolean): number =>
  isPercent ? 100 : niceMax(Math.max(0, ...values));

/** `points` mapped to a polyline, top-left origin. */
export function linePoints(
  values: number[],
  max: number,
  width: number,
  height: number,
): string {
  if (values.length === 0) return '';

  // A single reading is drawn as a flat line across the plot rather than a
  // dot in the corner, which is what dividing by zero would give.
  const step = values.length === 1 ? 0 : width / (values.length - 1);

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : index * step;
      const y = height - (max === 0 ? 0 : (value / max) * height);
      return `${round(x)},${round(y)}`;
    })
    .join(' ');
}

/** Arc segments for a donut, as SVG path strings. */
export function donutArcs(
  values: number[],
  size: number,
  thickness: number,
): { path: string; share: number }[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return [];

  const radius = (size - thickness) / 2;
  const centre = size / 2;
  let angle = -Math.PI / 2;

  return values.map((value) => {
    const share = value / total;
    // A full circle cannot be drawn as one arc — its start and end points are
    // the same, so the path collapses. Stop a hair short.
    const sweep = Math.min(share, 0.9999) * Math.PI * 2;
    const end = angle + sweep;

    const path = [
      'M', round(centre + radius * Math.cos(angle)), round(centre + radius * Math.sin(angle)),
      'A', round(radius), round(radius), 0, sweep > Math.PI ? 1 : 0, 1,
      round(centre + radius * Math.cos(end)), round(centre + radius * Math.sin(end)),
    ].join(' ');

    angle = end;
    return { path, share };
  });
}

const round = (value: number) => Math.round(value * 100) / 100;
