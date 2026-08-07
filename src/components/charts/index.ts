/**
 * Charts.
 *
 * Hand-rolled SVG rather than a charting library: the whole set is three
 * shapes and a scale, a dependency would be the largest thing in the bundle,
 * and every alternative wants either a canvas the print stylesheet cannot see
 * or a CDN the page is not allowed to reach.
 */

export { BarChart, type BarSeries } from './BarChart';
export { DonutChart } from './DonutChart';
export { LineChart, type LineSeries } from './LineChart';
export { ScatterChart, type ScatterPoint } from './ScatterChart';
export { ChartFrame, Gridlines, type ChartFrameProps } from './ChartFrame';
export { CHART_COLOURS, colourAt, type ChartDatum } from './palette';
export { axisTicks, donutArcs, linePoints, maxFor, niceMax } from './scale';
