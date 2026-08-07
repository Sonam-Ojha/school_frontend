import { BarChart, DonutChart, LineChart } from '@/components/charts';

import { formatAxis, formatValue } from '../format';
import type { ReportSeries } from '../types';

interface ReportChartProps {
  series: ReportSeries;
  height?: number;
}

/**
 * A series drawn as whatever it declared itself to be.
 *
 * The report decides the shape, not this component: a trend is a line, a
 * comparison is bars, a composition is a donut, and that judgement belongs
 * with whoever knows what the numbers mean.
 */
export function ReportChart({ series, height = 220 }: ReportChartProps) {
  const value = (input: number) => formatValue(input, series.format);
  const axis = (input: number) => formatAxis(input, series.format);
  const isPercent = series.format === 'percent';

  if (series.chart === 'donut') {
    const total = series.points.reduce((sum, point) => sum + point.value, 0);

    return (
      <DonutChart
        data={series.points}
        format={value}
        centreValue={formatValue(total, series.format)}
        centreLabel="total"
        height={height}
        emptyMessage="Nothing to break down yet."
      />
    );
  }

  const data = [
    { label: series.label, data: series.points },
    ...(series.companion ? [{ label: series.companion.label, data: series.companion.points }] : []),
  ];

  if (series.chart === 'line') {
    return (
      <LineChart
        series={data}
        format={value}
        axisFormat={axis}
        isPercent={isPercent}
        height={height}
      />
    );
  }

  return (
    <BarChart
      series={data}
      format={value}
      axisFormat={axis}
      isPercent={isPercent}
      height={height}
    />
  );
}
