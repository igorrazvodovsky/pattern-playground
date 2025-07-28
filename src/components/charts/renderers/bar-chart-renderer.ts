/**
 * Pure bar chart rendering module using D3.js
 *
 * This module provides rendering functions for bar charts without component lifecycle.
 * It follows D3's enter/update/exit pattern for efficient DOM updates.
 *
 * @see https://d3js.org/d3-scale/band - scaleBand documentation
 * @see https://d3js.org/d3-scale/linear - scaleLinear documentation
 * @see https://d3js.org/d3-selection - D3 selection API
 */

import { select, Selection } from 'd3-selection';
import { scaleBand, scaleLinear, ScaleBand, ScaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';
import { BarChartData, BarChartDataPoint, ChartDimensions } from '../base/chart-types.js';

// Import d3-transition to extend Selection prototype with .transition() and .interrupt() methods
// This must be imported to add transition capabilities to D3 selections
import 'd3-transition';


/**
 * Bar chart renderer configuration
 */
export interface BarChartConfig {
  orientation: 'vertical' | 'horizontal';
  grouped: boolean;
  stacked: boolean;
  barPadding: number;
  groupPadding: number;
  animate: boolean;
  animationDuration: number;
  showValueLabels: boolean;
  showCategoryLabels: boolean;
}

/**
 * Default configuration for bar charts
 */
export const defaultBarChartConfig: BarChartConfig = {
  orientation: 'vertical',
  grouped: false,
  stacked: false,
  barPadding: 0.1,
  groupPadding: 0.05,
  animate: true,
  animationDuration: 300,
  showValueLabels: false,
  showCategoryLabels: false
};

/**
 * Scales used for bar chart rendering
 */
export interface BarChartScales {
  x: ScaleBand<string>;
  y: ScaleLinear<number, number>;
}

/**
 * Result returned by bar chart renderer
 */
export interface BarChartRenderResult {
  scales: BarChartScales;
  bars: Selection<SVGRectElement, BarChartDataPoint, SVGGElement, unknown>;
  container: Selection<SVGGElement, unknown, null, undefined>;
}

/**
 * Creates scales for bar chart based on data and dimensions
 */
export function createBarChartScales(
  data: BarChartData,
  dimensions: ChartDimensions,
  config: BarChartConfig
): BarChartScales {
  // Use fixed dimensions that match the viewBox (600x300)
  const viewBoxWidth = 600;
  const viewBoxHeight = 300;
  const { margin } = dimensions;

  const chartWidth = viewBoxWidth - margin.left - margin.right;
  const chartHeight = viewBoxHeight - margin.top - margin.bottom;

  // Create band scale for categories (x-axis for vertical, y-axis for horizontal)
  const categories = data.data.map(d => d.category);
  const padding = 4; // Add padding from chart edges
  const xScale = scaleBand<string>()
    .domain(categories)
    .range(config.orientation === 'vertical' ? [padding, chartWidth - padding] : [chartHeight - padding, padding])
    .padding(config.barPadding);

  // Create linear scale for values (y-axis for vertical, x-axis for horizontal)
  const values = data.data.map(d => d.value);
  const yDomain = [
    Math.min(0, min(values) || 0),
    max(values) || 0
  ];

  const yScale = scaleLinear()
    .domain(yDomain)
    .range(config.orientation === 'vertical' ? [chartHeight - padding, padding] : [padding, chartWidth - padding])
    .nice();

  return { x: xScale, y: yScale };
}

/**
 * Renders value labels for bar chart
 */
function renderValueLabels(
  container: Selection<SVGGElement, unknown, null, undefined>,
  data: BarChartData,
  scales: BarChartScales,
  config: BarChartConfig
): void {
  // Create or select labels group
  const labelsGroup = container
    .selectAll<SVGGElement, unknown>('.value-labels-group')
    .data([null])
    .join('g')
    .attr('class', 'value-labels-group');

  // Bind data to text elements
  const labels = labelsGroup
    .selectAll<SVGTextElement, BarChartDataPoint>('text')
    .data(data.data, d => d.category);

  // Remove exiting labels
  labels.exit().remove();

  // Add entering labels
  const enteringLabels = labels
    .enter()
    .append('text')
    .attr('class', 'value-label')
    .attr('opacity', 0);

  // Merge entering and updating labels
  const allLabels = enteringLabels.merge(labels);

  // Position and style labels based on orientation
  if (config.orientation === 'vertical') {
    allLabels
      .attr('x', d => (scales.x(d.category) || 0) + scales.x.bandwidth() / 2)
      .attr('y', d => scales.y(Math.max(0, d.value)) - 8)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'baseline')
      .text(d => d.value.toString())
      .attr('fill', 'var(--c-body)')
      .attr('font-size', 'var(--text-s)')
      .attr('font-family', 'var(--font)')
      .attr('opacity', 1);
  } else {
    // Horizontal orientation
    allLabels
      .attr('x', d => scales.y(d.value) + 8)
      .attr('y', d => (scales.x(d.category) || 0) + scales.x.bandwidth() / 2)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .text(d => d.value.toString())
      .attr('fill', 'var(--c-body)')
      .attr('font-size', 'var(--text-s)')
      .attr('font-family', 'var(--font)')
      .attr('opacity', 1);
  }
}

/**
 * Renders category labels on bar chart
 */
function renderCategoryLabels(
  container: Selection<SVGGElement, unknown, null, undefined>,
  data: BarChartData,
  scales: BarChartScales,
  config: BarChartConfig
): void {
  // Create or select category labels group
  const categoryLabelsGroup = container
    .selectAll<SVGGElement, unknown>('.category-labels-group')
    .data([null])
    .join('g')
    .attr('class', 'category-labels-group');

  // Bind data to text elements
  const categoryLabels = categoryLabelsGroup
    .selectAll<SVGTextElement, BarChartDataPoint>('text')
    .data(data.data, d => d.category);

  // Remove exiting labels
  categoryLabels.exit().remove();

  // Add entering labels
  const enteringLabels = categoryLabels
    .enter()
    .append('text')
    .attr('class', 'category-label')
    .attr('opacity', 0);

  // Merge entering and updating labels
  const allLabels = enteringLabels.merge(categoryLabels);

  // Position and style labels based on orientation
  if (config.orientation === 'vertical') {
    // For vertical bars, place category labels at the bottom of bars
    allLabels
      .attr('x', d => (scales.x(d.category) || 0) + scales.x.bandwidth() / 2)
      .attr('y', d => scales.y(Math.min(0, d.value)) + 20)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .text(d => d.category)
      .attr('fill', 'white')
      .attr('font-size', 'var(--text-s)')
      .attr('font-family', 'var(--font)')
      .attr('font-weight', '500')
      .attr('opacity', 1);
  } else {
    // For horizontal bars, place category labels inside bars on the left
    allLabels
      .attr('x', scales.y(0) + 12)
      .attr('y', d => (scales.x(d.category) || 0) + scales.x.bandwidth() / 2)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .text(d => d.category)
      .attr('fill', 'white')
      .attr('font-size', 'var(--text-s)')
      .attr('font-family', 'var(--font)')
      .attr('font-weight', '500')
      .attr('opacity', 1);
  }
}

/**
 * Renders bar chart into SVG container
 */
export function renderBarChart(
  container: Selection<SVGGElement, unknown, null, undefined>,
  data: BarChartData,
  dimensions: ChartDimensions,
  config: Partial<BarChartConfig> = {}
): BarChartRenderResult {
  const mergedConfig = { ...defaultBarChartConfig, ...config };
  const scales = createBarChartScales(data, dimensions, mergedConfig);

  // Create or select bars group
  const barsGroup = container
    .selectAll<SVGGElement, unknown>('.bars-group')
    .data([null])
    .join('g')
    .attr('class', 'bars-group');

  // Bind data to rectangles
  const bars = barsGroup
    .selectAll<SVGRectElement, BarChartDataPoint>('rect')
    .data(data.data, d => d.category);

  // Remove exiting bars
  const exitingBars = bars.exit();
  if (mergedConfig.animate && exitingBars.transition) {
    exitingBars
      .transition()
      .duration(mergedConfig.animationDuration)
      .attr('opacity', 0)
      .remove();
  } else {
    exitingBars.remove();
  }

  // Add entering bars
  const enteringBars = bars
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('opacity', 0);

  // Merge entering and updating bars
  const allBars = enteringBars.merge(bars);

  // Position and size bars based on orientation
  if (mergedConfig.orientation === 'vertical') {
    allBars
      .attr('x', d => scales.x(d.category) || 0)
      .attr('width', scales.x.bandwidth())
      .attr('fill', 'var(--c-accent-200)')
      .attr('rx', 4)
      .attr('ry', 4)

    // Animate bars if enabled
    if (mergedConfig.animate && allBars.transition) {
      allBars
        .transition()
        .duration(mergedConfig.animationDuration)
        .attr('y', d => scales.y(Math.max(0, d.value)))
        .attr('height', d => Math.abs(scales.y(d.value) - scales.y(0)))
        .attr('opacity', 1);
    } else {
      allBars
        .attr('y', d => scales.y(Math.max(0, d.value)))
        .attr('height', d => Math.abs(scales.y(d.value) - scales.y(0)))
        .attr('opacity', 1);
    }
  } else {
    // Horizontal orientation
    allBars
      .attr('y', d => scales.x(d.category) || 0)
      .attr('height', scales.x.bandwidth())
      .attr('fill', d => d.color || 'var(--c-accent-200)')
      .attr('rx', 4)
      .attr('ry', 4);

    // Animate bars if enabled
    if (mergedConfig.animate && allBars.transition) {
      allBars
        .transition()
        .duration(mergedConfig.animationDuration)
        .attr('x', scales.y(0))
        .attr('width', d => Math.abs(scales.y(d.value) - scales.y(0)))
        .attr('opacity', 1);
    } else {
      allBars
        .attr('x', scales.y(0))
        .attr('width', d => Math.abs(scales.y(d.value) - scales.y(0)))
        .attr('opacity', 1);
    }
  }

  // Add value labels if enabled
  if (mergedConfig.showValueLabels) {
    renderValueLabels(container, data, scales, mergedConfig);
  }

  // Add category labels if enabled
  if (mergedConfig.showCategoryLabels) {
    renderCategoryLabels(container, data, scales, mergedConfig);
  }

  return {
    scales,
    bars: allBars,
    container
  };
}

/**
 * Updates existing bar chart with new data
 */
export function updateBarChart(
  renderResult: BarChartRenderResult,
  data: BarChartData,
  dimensions: ChartDimensions,
  config: Partial<BarChartConfig> = {}
): BarChartRenderResult {
  return renderBarChart(renderResult.container, data, dimensions, config);
}

/**
 * Adds hover interactions to bar chart
 */
export function addBarChartInteractions(
  renderResult: BarChartRenderResult,
  onHover?: (data: BarChartDataPoint, event: MouseEvent) => void,
  onLeave?: () => void,
  onClick?: (data: BarChartDataPoint, event: MouseEvent) => void
): void {
  if (onHover) {
    renderResult.bars.on('mouseenter', function(event, d) {
      select(this).attr('opacity', 0.8);
      onHover(d, event);
    });
  }

  if (onLeave) {
    renderResult.bars.on('mouseleave', function() {
      select(this).attr('opacity', 1);
      onLeave();
    });
  }

  if (onClick) {
    renderResult.bars.on('click', function(event, d) {
      onClick(d, event);
    });
  }
}

/**
 * Cleans up bar chart event listeners and transitions
 */
export function cleanupBarChart(renderResult: BarChartRenderResult): void {
  renderResult.bars.on('mouseenter', null);
  renderResult.bars.on('mouseleave', null);
  renderResult.bars.on('click', null);

  // Interrupt any running transitions
  const allElements = renderResult.container.selectAll('*');
  if (allElements.interrupt) {
    allElements.interrupt();
  }
}