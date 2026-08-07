import { ChartFrame } from './ChartFrame';
import { colourAt, type ChartDatum } from './palette';
import { donutArcs } from './scale';

interface DonutChartProps {
  data: ChartDatum[];
  format?: (value: number) => string;
  /** Shown in the hole. The total, usually — which is the question a donut raises. */
  centreLabel?: string;
  centreValue?: string;
  height?: number;
  className?: string;
  emptyMessage?: string;
}

const SIZE = 180;
const THICKNESS = 30;

/**
 * A composition — how a whole divides.
 *
 * Deliberately not offered for anything but a share of a total: a donut of
 * six unrelated figures is a chart that answers nothing. The legend carries
 * the values, because reading a number off an arc is guesswork.
 */
export function DonutChart({
  data,
  format = (value) => String(value),
  centreLabel,
  centreValue,
  height = 200,
  className,
  emptyMessage,
}: DonutChartProps) {
  const total = data.reduce((sum, point) => sum + point.value, 0);
  const arcs = donutArcs(data.map((point) => point.value), SIZE, THICKNESS);

  return (
    <ChartFrame
      ariaLabel={`Donut chart. ${data
        .map((point) => `${point.label}: ${format(point.value)}`)
        .join(', ')}`}
      height={height}
      className={className}
      isEmpty={total <= 0}
      emptyMessage={emptyMessage}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-40 shrink-0">
          {arcs.map((arc, index) => (
            <path
              key={data[index].label}
              d={arc.path}
              fill="none"
              stroke={data[index].colour ?? colourAt(index)}
              strokeWidth={THICKNESS}
            >
              <title>{`${data[index].label}: ${format(data[index].value)}`}</title>
            </path>
          ))}

          {(centreValue || centreLabel) && (
            <>
              <text
                x={SIZE / 2}
                y={SIZE / 2 - 2}
                textAnchor="middle"
                className="fill-slate-900 text-[20px] font-semibold"
              >
                {centreValue}
              </text>
              <text
                x={SIZE / 2}
                y={SIZE / 2 + 16}
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                {centreLabel}
              </text>
            </>
          )}
        </svg>

        {/* The legend carries the numbers — an arc is not a readable value. */}
        <ul className="min-w-0 flex-1 space-y-1.5">
          {data.map((point, index) => (
            <li key={point.label} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-sm"
                style={{ background: point.colour ?? colourAt(index) }}
              />
              <span className="min-w-0 flex-1 truncate text-slate-600">{point.label}</span>
              <span className="font-medium text-slate-900">{format(point.value)}</span>
              <span className="w-10 text-right text-xs text-slate-400">
                {total === 0 ? '—' : `${Math.round((point.value / total) * 100)}%`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartFrame>
  );
}
