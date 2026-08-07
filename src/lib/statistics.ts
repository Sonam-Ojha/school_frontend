/**
 * The statistics the analytics module runs on.
 *
 * Kept here rather than inside the feature because it is arithmetic, not
 * domain: a correlation coefficient knows nothing about attendance. Pure and
 * dependency-free, so the awkward cases — an empty series, a column with no
 * variance, a single observation — are testable without rendering anything,
 * and they are tested.
 *
 * Every function returns `null` rather than `NaN` where the answer is
 * genuinely undefined. `NaN` propagates silently through a chart and comes
 * out as an empty axis three components later; `null` has to be handled.
 */

export const mean = (values: number[]): number | null =>
  values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;

/**
 * Sample standard deviation, with Bessel's correction.
 *
 * `n - 1`, not `n`: these are always samples of a cohort rather than a
 * population measured exhaustively, and dividing by `n` understates the
 * spread — which in turn overstates every z-score built on it.
 */
export function stdDev(values: number[]): number | null {
  if (values.length < 2) return null;

  const average = mean(values)!;
  const variance =
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1);

  return Math.sqrt(variance);
}

/**
 * How many standard deviations from the mean.
 *
 * Null when the cohort has no spread — if every class collected exactly the
 * same share, no class is an outlier, and dividing by zero to say so would
 * make all of them infinitely unusual.
 */
export function zScore(value: number, values: number[]): number | null {
  const spread = stdDev(values);
  if (spread === null || spread === 0) return null;

  return round((value - mean(values)!) / spread, 3);
}

/**
 * Pearson's correlation between two series.
 *
 * Null below three pairs or where either series is flat: a coefficient drawn
 * through two points is always exactly ±1 and means nothing at all, which is
 * the most common way a dashboard ends up asserting a perfect relationship
 * between two numbers that have none.
 */
export function correlation(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length || xs.length < 3) return null;

  const xMean = mean(xs)!;
  const yMean = mean(ys)!;

  let covariance = 0;
  let xVariance = 0;
  let yVariance = 0;

  for (let index = 0; index < xs.length; index += 1) {
    const dx = xs[index] - xMean;
    const dy = ys[index] - yMean;
    covariance += dx * dy;
    xVariance += dx * dx;
    yVariance += dy * dy;
  }

  if (xVariance === 0 || yVariance === 0) return null;

  return round(covariance / Math.sqrt(xVariance * yVariance), 3);
}

export interface Regression {
  slope: number;
  intercept: number;
  /** How much of the variation the line accounts for, 0–1. */
  rSquared: number;
}

/**
 * Least-squares line through the points.
 *
 * The slope is the useful part: "each missing day costs about 0.8 marks" is a
 * sentence somebody can act on, where a correlation coefficient is not.
 */
export function linearRegression(xs: number[], ys: number[]): Regression | null {
  const r = correlation(xs, ys);
  if (r === null) return null;

  const xMean = mean(xs)!;
  const yMean = mean(ys)!;

  let covariance = 0;
  let xVariance = 0;

  for (let index = 0; index < xs.length; index += 1) {
    const dx = xs[index] - xMean;
    covariance += dx * (ys[index] - yMean);
    xVariance += dx * dx;
  }

  if (xVariance === 0) return null;

  const slope = covariance / xVariance;

  return {
    slope: round(slope, 4),
    intercept: round(yMean - slope * xMean, 4),
    rSquared: round(r * r, 3),
  };
}

/**
 * How much of a correlation to believe.
 *
 * Deliberately conservative and deliberately explicit: a coefficient printed
 * without a sample size beside it is how a school ends up reorganising around
 * eleven students. Below thirty pairs nothing here is called strong, however
 * tight the fit.
 */
export function confidenceFor(r: number | null, sampleSize: number): 'low' | 'moderate' | 'high' {
  if (r === null || sampleSize < 12) return 'low';

  const strength = Math.abs(r);
  if (sampleSize >= 30 && strength >= 0.5) return 'high';
  if (sampleSize >= 20 && strength >= 0.3) return 'moderate';

  return 'low';
}

/** Plain-language strength, so a screen never prints a bare coefficient. */
export function correlationLabel(r: number | null): string {
  if (r === null) return 'no measurable relationship';

  const strength = Math.abs(r);
  const direction = r < 0 ? 'negative' : 'positive';

  if (strength >= 0.7) return `strong ${direction}`;
  if (strength >= 0.4) return `moderate ${direction}`;
  if (strength >= 0.2) return `weak ${direction}`;

  return 'no measurable relationship';
}

/**
 * The value below which `fraction` of the sorted series falls.
 *
 * Linear interpolation between neighbours, which is what every statistics
 * package means by a percentile — taking the nearest element instead makes
 * the median of an even-sized series wrong.
 */
export function quantile(values: number[], fraction: number): number | null {
  if (values.length === 0) return null;
  if (values.length === 1) return values[0];

  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * Math.min(1, Math.max(0, fraction));
  const lower = Math.floor(position);
  const upper = Math.ceil(position);

  if (lower === upper) return sorted[lower];

  return round(sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower), 4);
}

export const median = (values: number[]): number | null => quantile(values, 0.5);

/**
 * A weighted score on 0–100 from parts that may be missing.
 *
 * Missing parts are dropped and the weights renormalised, rather than counted
 * as zero — a student with no exam marks yet is not a student who scored
 * nothing, and treating them the same would put every new admission at the
 * top of a risk list.
 */
export function weightedScore(
  parts: { value: number | null; weight: number }[],
): { score: number; coverage: number } | null {
  const present = parts.filter(
    (part) => part.value !== null && Number.isFinite(part.value) && part.weight > 0,
  );
  if (present.length === 0) return null;

  const totalWeight = present.reduce((sum, part) => sum + part.weight, 0);
  const score = present.reduce((sum, part) => sum + part.value! * part.weight, 0) / totalWeight;

  return {
    score: round(score, 2),
    // What share of the intended weight was actually available. A score built
    // from a third of its inputs deserves to say so.
    coverage: round(totalWeight / parts.reduce((sum, part) => sum + part.weight, 0), 3),
  };
}

/** Buckets a series into labelled ranges, for a histogram or an ageing table. */
export function bucketBy<T>(
  items: T[],
  value: (item: T) => number,
  edges: { label: string; upTo: number }[],
): { label: string; count: number; items: T[] }[] {
  const buckets = edges.map((edge) => ({ label: edge.label, count: 0, items: [] as T[] }));

  for (const item of items) {
    const measure = value(item);
    // The last bucket is open-ended, so nothing falls off the end unnoticed.
    const index = edges.findIndex((edge) => measure <= edge.upTo);
    const bucket = buckets[index === -1 ? buckets.length - 1 : index];
    bucket.count += 1;
    bucket.items.push(item);
  }

  return buckets;
}

export const round = (value: number, places = 2): number => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};
