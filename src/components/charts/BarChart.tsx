import { ChartFrame, Gridlines } from './ChartFrame';
import { colourAt, type ChartDatum } from './palette';
import { axisTicks, maxFor } from './scale';

export interface BarSeries {
  label: string;
  data: ChartDatum[];
}

interface BarChartProps {
  /** One series draws plain bars; several draw them grouped per label. */
  series: BarSeries[];
  format?: (value: number) => string;
  /** Axis labels are usually terser than the tooltip — counts, not currency. */
  axisFormat?: (value: number) => string;
  isPercent?: boolean;
  /** Sets the aspect ratio the plot keeps as it scales. */
  height?: number;
  className?: string;
  emptyMessage?: string;
}

const PLOT_WIDTH = 640;
const PADDING_LEFT = 46;

/**
 * Grouped vertical bars.
 *
 * Categories sit on the x-axis and each series is a colour. The SVG carries a
 * `viewBox` and no pixel width, so it scales uniformly into whatever column it
 * lands in — stretching it instead would distort every label on a phone.
 */
export function BarChart({
  series,
  format = (value) => String(value),
  axisFormat,
  isPercent = false,
  height = 220,
  className,
  emptyMessage,
}: BarChartProps) {
  const labels = series[0]?.data.map((point) => point.label) ?? [];
  const values = series.flatMap((entry) => entry.data.map((point) => point.value));
  const isEmpty = labels.length === 0 || values.every((value) => value === 0);

  const max = maxFor(values, isPercent);
  const ticks = axisTicks(max);

  // Past eight categories horizontal labels start colliding, so they tilt —
  // and tilted labels need the room underneath that upright ones do not.
  const rotate = labels.length > 8;
  const paddingBottom = rotate ? 52 : 28;
  const plotHeight = height - paddingBottom;

  const groupWidth = PLOT_WIDTH / Math.max(1, labels.length);
  const barWidth = Math.max(3, (groupWidth * 0.68) / series.length);

  return (
    <ChartFrame
      ariaLabel={`Bar chart. ${series
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

          {labels.map((label, groupIndex) => {
            const groupX = groupIndex * groupWidth;
            const inset = (groupWidth - barWidth * series.length) / 2;
            const centre = groupX + groupWidth / 2;

            return (
              <g key={label}>
                {series.map((entry, seriesIndex) => {
                  const point = entry.data[groupIndex];
                  const value = point?.value ?? 0;
                  // A non-zero bar always draws at least a hairline, so a
                  // small reading is visible rather than looking like none.
                  const drawn =
                    value === 0 ? 0 : Math.max(1, max === 0 ? 0 : (value / max) * plotHeight);

                  return (
                    <rect
                      key={entry.label}
                      x={groupX + inset + seriesIndex * barWidth}
                      y={plotHeight - drawn}
                      width={Math.max(1, barWidth - 2)}
                      height={drawn}
                      rx={2}
                      fill={point?.colour ?? colourAt(seriesIndex)}
                    >
                      <title>{`${label} · ${entry.label}: ${format(value)}`}</title>
                    </rect>
                  );
                })}

                <text
                  x={centre}
                  y={plotHeight + 14}
                  textAnchor={rotate ? 'end' : 'middle'}
                  transform={rotate ? `rotate(-40 ${centre} ${plotHeight + 14})` : undefined}
                  className="fill-slate-500 text-[10px]"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </ChartFrame>
  );
}
