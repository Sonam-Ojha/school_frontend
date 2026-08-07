/**
 * The palette every chart draws from, in the order series are given.
 *
 * Literal colours rather than Tailwind's palette variables: Tailwind 4 only
 * emits a theme variable it has seen used as a class, and a `var()` inside a
 * TypeScript string is not a class — so `--color-emerald-500` would resolve to
 * nothing. The brand colour is read from the theme with a literal fallback, so
 * a rebrand reaches the charts while a missing variable still draws.
 *
 * Its own file so the chart components stay component-only, which is what the
 * fast-refresh rule wants.
 */
export const CHART_COLOURS = [
  'var(--color-brand-500, oklch(0.62 0.184 259.8))',
  'oklch(0.70 0.15 162.5)',
  'oklch(0.77 0.16 70.1)',
  'oklch(0.69 0.15 237.3)',
  'oklch(0.61 0.22 292.7)',
  'oklch(0.65 0.22 16.4)',
] as const;

export const colourAt = (index: number) => CHART_COLOURS[index % CHART_COLOURS.length];

export interface ChartDatum {
  label: string;
  value: number;
  /** Overrides the palette — used where a colour carries meaning. */
  colour?: string;
}
