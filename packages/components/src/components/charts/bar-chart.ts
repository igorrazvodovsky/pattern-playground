/**
 * Bar Chart Web Component
 *
 * A component that orchestrates bar chart rendering using the pure bar chart
 * renderer. Elena supplies props and lifecycle; D3 owns the DOM outright.
 *
 * @example
 * ```html
 * <pp-bar-chart
 *   orientation="vertical"
 *   show-legend
 *   show-grid>
 * </pp-bar-chart>
 * ```
 */

import { select, type Selection } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import type { Axis, AxisDomain, AxisScale } from 'd3-axis';
import { ChartComponent } from './base/chart-component.js';
import type { ElenaProp } from './base/d3-component.js';
import { VIEWBOX_WIDTH, VIEWBOX_HEIGHT } from './base/d3-component.js';
import type {
  BarChartData,
  BarChartDataPoint,
  ChartDimensions
} from './base/chart-types.js';
import { isBarChartData } from './base/chart-types.js';
import type { BarChartScales } from './renderers/bar-chart-renderer.js';
import { transformBarChartData } from './base/data-converters.js';
import {
  renderBarChart,
  addBarChartInteractions,
  cleanupBarChart,
  defaultBarChartConfig,
  createBarChartScales
} from './renderers/bar-chart-renderer.js';
import type {
  BarChartConfig,
  BarChartRenderResult
} from './renderers/bar-chart-renderer.js';
import {
  createScaleCoordinator
} from './services/scale-coordinator.js';
import type {
  ScaleCoordinator
} from './services/scale-coordinator.js';

export class BarChart extends ChartComponent {
  static tagName = 'pp-bar-chart';

  static props: ElenaProp[] = [
    ...ChartComponent.props,
    'orientation',
    'show-legend',
    'show-grid',
    'show-axes',
    'animate-chart',
    'animation-duration',
    'bar-padding',
    'sort',
    'show-value-labels',
    'show-category-labels',
  ];

  data: BarChartData = { data: [] };
  orientation: 'vertical' | 'horizontal' = 'vertical';
  'show-legend' = false;
  'show-grid' = false;
  'show-axes' = true;
  'animate-chart' = true;
  'animation-duration' = 300;
  'bar-padding' = 0.1;
  sort: 'asc' | 'desc' | 'none' = 'none';
  'show-value-labels' = false;
  'show-category-labels' = false;

  // Internal bookkeeping — plain fields; never trigger a render cycle.
  private renderResult?: BarChartRenderResult;
  private focusedIndex = 0;

  // Scale coordination
  private scaleCoordinator: ScaleCoordinator = createScaleCoordinator();

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.initBarChart();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.initBarChart());
  }

  private initBarChart() {
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'img');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', this.title || 'Bar chart');
    }
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeydown);
    if (this.renderResult) {
      cleanupBarChart(this.renderResult);
    }
    this.scaleCoordinator.destroy();
  }

  protected validateData(): boolean {
    return isBarChartData(this.data) && this.data.data.length > 0;
  }

  protected transformData(): BarChartData {
    return transformBarChartData(this.data, {
      orientation: this.orientation,
      sort: this.sort
    });
  }

  /** Scales are created in the renderer; nothing to precompute here. */
  protected setupScales(): void {}

  private createScalesForPrimitives(data: BarChartData, dimensions: ChartDimensions, config: Partial<BarChartConfig>) {
    const mergedConfig = { ...defaultBarChartConfig, ...config };
    return createBarChartScales(data, dimensions, mergedConfig);
  }

  protected renderChart(): void {
    if (!this.contentGroup || !this.validateData()) {
      return;
    }

    const transformedData = this.transformData();
    const dimensions: ChartDimensions = {
      width: this.width,
      height: this.height,
      margin: this.margin
    };

    const config: Partial<BarChartConfig> = {
      ...defaultBarChartConfig,
      orientation: this.orientation,
      animate: this['animate-chart'],
      animationDuration: this['animation-duration'],
      barPadding: this['bar-padding'],
      showValueLabels: this['show-value-labels'],
      showCategoryLabels: this['show-category-labels']
    };

    if (this.renderResult) {
      cleanupBarChart(this.renderResult);
    }

    const container = select(this.contentGroup);

    // Create scales first so axes and grid can render behind the bars.
    const scales = this.createScalesForPrimitives(transformedData, dimensions, config);

    this.scaleCoordinator.updateScale('x', scales.x);
    this.scaleCoordinator.updateScale('y', scales.y);

    // Primitives share the scales' coordinate system (viewBox-based).
    const viewBoxDimensions = {
      width: VIEWBOX_WIDTH - this.margin.left - this.margin.right,
      height: VIEWBOX_HEIGHT - this.margin.top - this.margin.bottom
    };

    if (this['show-axes']) {
      this.renderAxes(scales, viewBoxDimensions);
    }
    if (this['show-grid']) {
      this.renderGrid(scales, viewBoxDimensions);
    }

    this.renderResult = renderBarChart(container, transformedData, dimensions, config);
    this.addInteractions();

    this.setChartLabel(this.title || `Bar chart with ${transformedData.data.length} data points`);
    this.syncDataTable(transformedData.data.map(item => [item.category, item.value]));
  }

  private addInteractions(): void {
    if (!this.renderResult) return;

    addBarChartInteractions(
      this.renderResult,
      this.handleBarHover.bind(this),
      this.handleBarLeave.bind(this),
      this.handleBarClick.bind(this)
    );
  }

  private handleBarHover(data: BarChartDataPoint, event: MouseEvent): void {
    this.dispatchEvent(new CustomEvent('pp-bar-hover', {
      detail: { data, originalEvent: event },
      bubbles: true,
      composed: true
    }));
  }

  private handleBarLeave(): void {
    this.dispatchEvent(new CustomEvent('pp-bar-hover-end', {
      bubbles: true,
      composed: true
    }));
  }

  private handleBarClick(data: BarChartDataPoint, event: MouseEvent): void {
    this.dispatchEvent(new CustomEvent('pp-bar-click', {
      detail: { data, originalEvent: event },
      bubbles: true,
      composed: true
    }));
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (!this.validateData()) return;

    const data = this.transformData();
    const last = data.data.length - 1;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.focusBar(Math.min(this.focusedIndex + 1, last));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.focusBar(Math.max(this.focusedIndex - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        this.focusBar(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusBar(last);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.renderResult) {
          const currentData = data.data[this.focusedIndex];
          const syntheticEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          this.handleBarClick(currentData, syntheticEvent);
        }
        break;
    }
  };

  private focusBar(index: number): void {
    if (!this.renderResult) return;

    const data = this.transformData();
    if (index >= 0 && index < data.data.length) {
      this.focusedIndex = index;
      const currentData = data.data[index];

      this.setAttribute('aria-live', 'polite');
      this.setAttribute('aria-label', `Bar chart. Current: ${currentData.category}: ${currentData.value}. Use arrow keys to navigate.`);
    }
  }

  private renderAxes(scales: BarChartScales, dimensions: { width: number; height: number }): void {
    const container = select(this.contentGroup);
    container.selectAll('.axis-group').remove();

    const xAxisGroup = container
      .append('g')
      .attr('class', 'axis-group x-axis')
      .attr('transform', `translate(0, ${dimensions.height})`);

    const yAxisGroup = container
      .append('g')
      .attr('class', 'axis-group y-axis');

    this.renderAxis(xAxisGroup, scales, 'x');
    this.renderAxis(yAxisGroup, scales, 'y');
  }

  private renderAxis(container: Selection<SVGGElement, unknown, null, undefined>, scales: BarChartScales, axisType: 'x' | 'y'): void {
    let axis: Axis<AxisDomain>;

    if (axisType === 'x') {
      if (this.orientation === 'vertical') {
        // Categories on X-axis for vertical bars
        axis = axisBottom(scales.x as AxisScale<AxisDomain>).tickSize(6);
      } else {
        // Values on X-axis for horizontal bars
        axis = axisBottom(scales.y as AxisScale<AxisDomain>).ticks(5).tickSize(6);
      }
    } else {
      if (this.orientation === 'vertical') {
        // Values on Y-axis for vertical bars
        axis = axisLeft(scales.y as AxisScale<AxisDomain>).ticks(5).tickSize(6);
      } else {
        // Categories on Y-axis for horizontal bars
        axis = axisLeft(scales.x as AxisScale<AxisDomain>).tickSize(6);
      }
    }

    container.call(axis);
    this.applyAxisStyling(container, axisType);
  }

  private applyAxisStyling(container: Selection<SVGGElement, unknown, null, undefined>, axisType: 'x' | 'y'): void {
    container.select('.domain')
      .attr('stroke', 'var(--c-border)')
      .attr('stroke-width', 0)
      .attr('fill', 'none');

    container.selectAll('.tick line')
      .attr('stroke', 'var(--c-border)')
      .attr('stroke-width', 1);

    container.selectAll('.tick text')
      .attr('fill', 'var(--c-bodyDimmed)')
      .attr('font-size', 'var(--text-s)')
      .attr('font-family', 'var(--font)');

    // Text offsets match the chart-axis primitive so the two stay aligned.
    if (axisType === 'y') {
      container.selectAll('.tick text')
        .attr('text-anchor', 'end')
        .attr('x', -12)
        .attr('dy', '0.32em');
    } else {
      container.selectAll('.tick text')
        .attr('text-anchor', 'middle')
        .attr('y', 12)
        .attr('dy', '0.71em');
    }
  }

  private renderGrid(scales: BarChartScales, dimensions: { width: number; height: number }): void {
    const container = select(this.contentGroup);
    container.selectAll('.grid').remove();

    const gridGroup = container
      .append('g')
      .attr('class', 'grid');

    if (this.orientation === 'vertical') {
      // Horizontal grid lines for vertical bars
      const ticks = scales.y.ticks(5);
      gridGroup.selectAll('.grid-line')
        .data(ticks)
        .join('line')
        .attr('class', 'grid-line')
        .attr('x1', 0)
        .attr('x2', dimensions.width)
        .attr('y1', (d: number) => scales.y(d))
        .attr('y2', (d: number) => scales.y(d))
        .attr('stroke', 'var(--c-border)')
        .attr('stroke-opacity', 0.2)
        .attr('stroke-dasharray', '2,2');
    } else {
      // Vertical grid lines for horizontal bars
      const ticks = scales.y.ticks(5);
      gridGroup.selectAll('.grid-line')
        .data(ticks)
        .join('line')
        .attr('class', 'grid-line')
        .attr('x1', (d: number) => scales.y(d))
        .attr('x2', (d: number) => scales.y(d))
        .attr('y1', 0)
        .attr('y2', dimensions.height)
        .attr('stroke', 'var(--c-border)')
        .attr('stroke-opacity', 0.2)
        .attr('stroke-dasharray', '2,2');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-bar-chart': BarChart;
  }
}
