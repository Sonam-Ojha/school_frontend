import { ChartFrame, Gridlines } from './ChartFrame';
import { colourAt, type ChartDatum } from './palette';
import { axisTicks, linePoints, maxFor } from './scale';

export interface LineSeries {
  label: string;
  data: ChartDatum[];
}

interface LineChartProps {
  series: LineSeries[];
  format?: (value: number) => string;
  axisFormat?: (value: number) => string;
  isPercent?: boolean;
  height?: number;
  className?: string;
  emptyMessage?: string;
}

const PLOT_WIDTH = 640;
const PADDING_LEFT = 46;
const PADDING_BOTTOM = 28;

/**
 * A trend over time.
 *
 * Used where the *shape* is the point — attendance month by month, payroll
 * cost across a year. Anything where the reader compares categories rather
 * than following a movement should be bars instead.
 */
export function LineChart({
  series,
  format = (value) => String(value),
  axisFormat,
  isPercent = false,
  height = 220,
  className,
  emptyMessage,
}: LineChartProps) {
  const labels = series[0]?.data.map((point) => point.label) ?? [];
  const values = series.flatMap((entry) => entry.data.map((point) => point.value));
  const isEmpty = labels.length === 0;

  const max = maxFor(values, isPercent);
  const ticks = axisTicks(max);
  const plotHeight = height - PADDING_BOTTOM;

  // Enough labels to read, never so many they collide.
  const labelStep = Math.max(1, Math.ceil(labels.length / 8));

  return (
    <ChartFrame
      ariaLabel={`Line chart. ${series
        .map(
          (entry) =>
            `${entry.label}: ${entry.data.map((point) => `${point.label} ${format(point.value)}`).join(', ')}`,
        )
        .join('. ')}`}
      height={height}
      className={className}
      isEmpty={isEmpty}
      emptyMessage={emptyMessage}
      legend={
        series.length > 1
          ? series.map((entry, index) => ({ label: entry.label, colour: colourAt(index) }))
          : undefined
      }
    >
      <svg viewBox={`0 0 ${PLOT_WIDTH + PADDING_LEFT} ${height}`} className="h-auto w-full">
        <g transform={`translate(${PADDING_LEFT}, 0)`}>
          <Gridlines
            ticks={ticks}
            width={PLOT_WIDTH}
            height={plotHeight}
            format={axisFormat ?? format}
          />

          {series.map((entry, seriesIndex) => {
            const points = entry.data.map((point) => point.value);
            const step = points.length === 1 ? 0 : PLOT_WIDTH / (points.length - 1);

            return (
              <g key={entry.label}>
                <polyline
                  points={linePoints(points, max, PLOT_WIDTH, plotHeight)}
                  fill="none"
                  stroke={colourAt(seriesIndex)}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {points.map((value, index) => (
                  <circle
                    key={entry.data[index].label}
                    cx={points.length === 1 ? PLOT_WIDTH / 2 : index * step}
                    cy={plotHeight - (max === 0 ? 0 : (value / max) * plotHeight)}
                    r={3}
                    fill={colourAt(seriesIndex)}
                  >
                    <title>{`${entry.data[index].label} · ${entry.label}: ${format(value)}`}</title>
                  </circle>
                ))}
              </g>
            );
          })}

          {labels.map((label, index) =>
            index % labelStep === 0 ? (
              <text
                key={label}
                x={labels.length === 1 ? PLOT_WIDTH / 2 : index * (PLOT_WIDTH / (labels.length - 1))}
                y={plotHeight + 16}
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                {label}
              </text>
            ) : null,
          )}
        </g>
      </svg>
    </ChartFrame>
  );
}
