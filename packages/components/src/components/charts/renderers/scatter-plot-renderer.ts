/**
 * Pure scatter plot rendering module using D3.js
 *
 * Renders points as circles into an SVG group, following D3's enter/update/exit
 * pattern. Position carries the two quantitative variables; an optional `size`
 * field promotes points to bubbles via a square-root scale (area, not radius,
 * encodes magnitude), and `category` groups points into colour-coded series.
 *
 * Coordinate space: like the bar chart renderer, all scales map into the fixed
 * 600×300 viewBox (minus margins), NOT pixel dimensions. `D3Component` renders a
 * `viewBox="0 0 600 300"` SVG that CSS stretches to the container, so authoring
 * in viewBox space keeps points, axes and grid in one coordinate system.
 *
 * @see https://d3js.org/d3-scale/linear - scaleLinear documentation
 * @see https://d3js.org/d3-scale/pow#scaleSqrt - scaleSqrt for size encoding
 * @see https://d3js.org/d3-selection - D3 selection API
 */

import { select, Selection } from 'd3-selection';
import { scaleLinear, scaleSqrt, ScaleLinear, ScalePower } from 'd3-scale';
import { extent } from 'd3-array';
import { ScatterPlotData, ScatterPlotDataPoint, ChartDimensions } from '../base/chart-types.js';

/** viewBox the parent D3Component draws into; scales are authored in this space. */
const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 300;

export interface ScatterPlotConfig {
  /** Radius (viewBox units) for points when size encoding is off. */
  pointRadius: number;
  /** Encode a third variable as bubble area from the point `size` field. */
  showSize: boolean;
  /** [min, max] radius range (viewBox units) for the size scale. */
  sizeRange: [number, number];
}

export const defaultScatterPlotConfig: ScatterPlotConfig = {
  pointRadius: 5,
  showSize: false,
  sizeRange: [3, 18]
};

/**
 * Categorical colour ramp — the design system's CVD-validated categorical palette
 * (`--c-cat-*`, mode-aware, defined in styles/variables-palette.css and documented
 * in Foundations/Elements). Fixed order is the CVD-safety mechanism, so assign in
 * sequence and never reorder. A scatter plot is an all-pairs form: only the first
 * four slots are validated for it, so a scatter should carry at most four series
 * (beyond that, fold to "Other" or facet) — see the Scatter plot docs.
 */
const CATEGORY_COLORS = [
  'var(--c-cat-1)',
  'var(--c-cat-2)',
  'var(--c-cat-3)',
  'var(--c-cat-4)',
  'var(--c-cat-5)',
  'var(--c-cat-6)',
  'var(--c-cat-7)',
  'var(--c-cat-8)'
];

/**
 * Scales used for scatter plot rendering. `size` is present only when the
 * config enables size encoding and the data carries `size` values.
 */
export interface ScatterPlotScales {
  x: ScaleLinear<number, number>;
  y: ScaleLinear<number, number>;
  size?: ScalePower<number, number>;
}

export interface ScatterPlotRenderResult {
  scales: ScatterPlotScales;
  points: Selection<SVGCircleElement, ScatterPlotDataPoint, SVGGElement, unknown>;
  container: Selection<SVGGElement, unknown, null, undefined>;
}

/**
 * Maps a category to a stable colour from the ramp. Categories are ordered by
 * first appearance so the assignment is deterministic across renders.
 */
export function buildCategoryColorMap(data: ScatterPlotData): Map<string, string> {
  const map = new Map<string, string>();
  let i = 0;
  for (const point of data.data) {
    if (point.category != null && !map.has(point.category)) {
      map.set(point.category, CATEGORY_COLORS[i % CATEGORY_COLORS.length]);
      i++;
    }
  }
  return map;
}

function resolvePointColor(point: ScatterPlotDataPoint, categoryColors: Map<string, string>): string {
  if (point.color) return point.color;
  if (point.category != null && categoryColors.has(point.category)) {
    return categoryColors.get(point.category)!;
  }
  return 'var(--c-cat-1)';
}

/**
 * Creates scales for the scatter plot from data and dimensions.
 *
 * Domains use the data extent (padded a touch) rather than being anchored to
 * zero — a scatter plot's story is usually the cloud's shape, not its distance
 * from the origin.
 */
export function createScatterPlotScales(
  data: ScatterPlotData,
  dimensions: ChartDimensions,
  config: ScatterPlotConfig
): ScatterPlotScales {
  const { margin } = dimensions;
  const chartWidth = VIEWBOX_WIDTH - margin.left - margin.right;
  const chartHeight = VIEWBOX_HEIGHT - margin.top - margin.bottom;
  const inset = 8; // keep edge points off the axes

  const xValues = data.data.map(d => d.x);
  const yValues = data.data.map(d => d.y);

  const [xMin = 0, xMax = 0] = extent(xValues);
  const [yMin = 0, yMax = 0] = extent(yValues);

  const xScale = scaleLinear()
    .domain([xMin, xMax])
    .range([inset, chartWidth - inset])
    .nice();

  // Range is inverted: SVG y grows downward, data y grows upward.
  const yScale = scaleLinear()
    .domain([yMin, yMax])
    .range([chartHeight - inset, inset])
    .nice();

  const scales: ScatterPlotScales = { x: xScale, y: yScale };

  if (config.showSize) {
    const sizeValues = data.data
      .map(d => d.size)
      .filter((v): v is number => typeof v === 'number');
    if (sizeValues.length > 0) {
      const [sMin = 0, sMax = 0] = extent(sizeValues);
      // scaleSqrt so encoded area (not radius) is proportional to the value.
      scales.size = scaleSqrt().domain([sMin, sMax]).range(config.sizeRange);
    }
  }

  return scales;
}

function radiusFor(
  point: ScatterPlotDataPoint,
  scales: ScatterPlotScales,
  config: ScatterPlotConfig
): number {
  if (scales.size && typeof point.size === 'number') {
    return scales.size(point.size);
  }
  return config.pointRadius;
}

export function renderScatterPlot(
  container: Selection<SVGGElement, unknown, null, undefined>,
  data: ScatterPlotData,
  dimensions: ChartDimensions,
  config: Partial<ScatterPlotConfig> = {}
): ScatterPlotRenderResult {
  const mergedConfig = { ...defaultScatterPlotConfig, ...config };
  const scales = createScatterPlotScales(data, dimensions, mergedConfig);
  const categoryColors = buildCategoryColorMap(data);

  const pointsGroup = container
    .selectAll<SVGGElement, unknown>('.points-group')
    .data([null])
    .join('g')
    .attr('class', 'points-group');

  // Key by identity + coordinates so updates track the same logical point.
  const points = pointsGroup
    .selectAll<SVGCircleElement, ScatterPlotDataPoint>('circle')
    .data(data.data, (d, i) => (d.label ?? `${d.x},${d.y}`) + `#${i}`);

  points.exit().remove();

  const entering = points
    .enter()
    .append('circle')
    .attr('class', 'scatter-point');

  const allPoints = entering.merge(points);

  // Points are drawn at their resting state directly, with no entrance transition.
  // The host framework clears and rebuilds the chart on every render, so an
  // animation growing points from r=0 is fragile: a redundant render firing mid-
  // transition restarts it from zero and can leave the points collapsed and
  // invisible. Rendering the final state synchronously is correct and can't
  // strand the data.
  allPoints
    .attr('cx', d => scales.x(d.x))
    .attr('cy', d => scales.y(d.y))
    .attr('r', d => radiusFor(d, scales, mergedConfig))
    .attr('fill', d => resolvePointColor(d, categoryColors))
    .attr('fill-opacity', 0.72)
    .attr('stroke', 'var(--c-background)')
    .attr('stroke-width', 1)
    .attr('opacity', 1);

  return { scales, points: allPoints, container };
}

export function updateScatterPlot(
  renderResult: ScatterPlotRenderResult,
  data: ScatterPlotData,
  dimensions: ChartDimensions,
  config: Partial<ScatterPlotConfig> = {}
): ScatterPlotRenderResult {
  return renderScatterPlot(renderResult.container, data, dimensions, config);
}

export function addScatterPlotInteractions(
  renderResult: ScatterPlotRenderResult,
  onHover?: (data: ScatterPlotDataPoint, event: MouseEvent) => void,
  onLeave?: () => void,
  onClick?: (data: ScatterPlotDataPoint, event: MouseEvent) => void
): void {
  if (onHover) {
    renderResult.points.on('mouseenter', function (event, d) {
      select(this).attr('fill-opacity', 1).attr('stroke-width', 2);
      onHover(d, event);
    });
  }

  if (onLeave) {
    renderResult.points.on('mouseleave', function () {
      select(this).attr('fill-opacity', 0.72).attr('stroke-width', 1);
      onLeave();
    });
  }

  if (onClick) {
    renderResult.points.on('click', function (event, d) {
      onClick(d, event);
    });
  }
}

export function cleanupScatterPlot(renderResult: ScatterPlotRenderResult): void {
  renderResult.points.on('mouseenter', null);
  renderResult.points.on('mouseleave', null);
  renderResult.points.on('click', null);
}
