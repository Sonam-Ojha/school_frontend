import { ChartFrame, Gridlines } from './ChartFrame';
import { colourAt } from './palette';
import { axisTicks, maxFor } from './scale';

export interface ScatterPoint {
  x: number;
  y: number;
  /** Named on hover — a dot nobody can identify is a dot nobody can act on. */
  label: string;
  colour?: string;
}

interface ScatterChartProps {
  points: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  xIsPercent?: boolean;
  yIsPercent?: boolean;
  /** Drawn through the cloud when a regression was worth computing. */
  trend?: { slope: number; intercept: number } | null;
  format?: (value: number) => string;
  height?: number;
  className?: string;
  emptyMessage?: string;
}

const PLOT_WIDTH = 640;
const PADDING_LEFT = 46;
const PADDING_BOTTOM = 40;

/**
 * Two measures against each other, one dot per subject.
 *
 * The shape the other three charts cannot make: a bar compares categories and
 * a line follows time, but neither can show that attendance and marks move
 * together. The trend line is drawn only when the caller has decided a
 * regression is meaningful — a line through an uncorrelated cloud asserts a
 * relationship that is not there.
 */
export function ScatterChart({
  points,
  xLabel,
  yLabel,
  xIsPercent = false,
  yIsPercent = false,
  trend,
  format = (value) => String(Math.round(value * 10) / 10),
  height = 280,
  className,
  emptyMessage,
}: ScatterChartProps) {
  const plotHeight = height - PADDING_BOTTOM;

  const xMax = maxFor(points.map((point) => point.x), xIsPercent);
  const yMax = maxFor(points.map((point) => point.y), yIsPercent);
  const ticks = axisTicks(yMax);

  const toX = (value: number) => (xMax === 0 ? 0 : (value / xMax) * PLOT_WIDTH);
  const toY = (value: number) => plotHeight - (yMax === 0 ? 0 : (value / yMax) * plotHeight);

  // Clamped to the plot so a line with a steep slope leaves through the top
  // or bottom edge rather than being drawn outside the box.
  const trendPath = (() => {
    if (!trend) return null;

    const at = (x: number) => trend.intercept + trend.slope * x;
    const clamp = (value: number) => Math.min(yMax, Math.max(0, value));

    return {
      x1: 0,
      y1: toY(clamp(at(0))),
      x2: PLOT_WIDTH,
      y2: toY(clamp(at(xMax))),
    };
  })();

  return (
    <ChartFrame
      ariaLabel={`Scatter plot of ${yLabel} against ${xLabel}, ${points.length} points.`}
      height={height}
      className={className}
      isEmpty={points.length === 0}
      emptyMessage={emptyMessage}
    >
      <svg viewBox={`0 0 ${PLOT_WIDTH + PADDING_LEFT} ${height}`} className="h-auto w-full">
        <g transform={`translate(${PADDING_LEFT}, 0)`}>
          <Gridlines ticks={ticks} width={PLOT_WIDTH} height={plotHeight} format={format} />

          {trendPath && (
            <line
              {...trendPath}
              stroke={colourAt(2)}
              strokeWidth={2}
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
          )}

          {points.map((point, index) => (
            <circle
              key={`${point.label}-${index}`}
              cx={toX(point.x)}
              cy={toY(point.y)}
              r={4}
              fill={point.colour ?? colourAt(0)}
              fillOpacity={0.65}
            >
              <title>{`${point.label} — ${xLabel}: ${format(point.x)}, ${yLabel}: ${format(point.y)}`}</title>
            </circle>
          ))}

          {/* Axis titles, because a scatter's axes are never self-evident. */}
          <text
            x={PLOT_WIDTH / 2}
            y={height - 6}
            textAnchor="middle"
            className="fill-slate-500 text-[11px]"
          >
            {xLabel}
          </text>
          <text
            transform={`rotate(-90 ${-PADDING_LEFT + 12} ${plotHeight / 2})`}
            x={-PADDING_LEFT + 12}
            y={plotHeight / 2}
            textAnchor="middle"
            className="fill-slate-500 text-[11px]"
          >
            {yLabel}
          </text>
        </g>
      </svg>
    </ChartFrame>
  );
}
