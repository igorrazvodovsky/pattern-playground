/**
 * Scatter Plot Web Component
 *
 * A component that orchestrates scatter plot rendering using the pure
 * scatter plot renderer. Two numeric variables ride on position; an optional
 * `size` field turns points into bubbles, and `category` colours them into
 * series. Elena supplies props and lifecycle; D3 owns the DOM outright.
 *
 * @example
 * ```html
 * <pp-scatter-plot
 *   show-axes
 *   show-grid>
 * </pp-scatter-plot>
 * ```
 */

import { select, type Selection } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import { ChartComponent } from './base/chart-component.js';
import type { ElenaProp } from './base/d3-component.js';
import { VIEWBOX_WIDTH, VIEWBOX_HEIGHT } from './base/d3-component.js';
import type {
  ScatterPlotData,
  ScatterPlotDataPoint,
  ChartDimensions
} from './base/chart-types.js';
import { isScatterPlotData } from './base/chart-types.js';
import {
  renderScatterPlot,
  addScatterPlotInteractions,
  cleanupScatterPlot,
  createScatterPlotScales,
  defaultScatterPlotConfig
} from './renderers/scatter-plot-renderer.js';
import type {
  ScatterPlotConfig,
  ScatterPlotScales,
  ScatterPlotRenderResult
} from './renderers/scatter-plot-renderer.js';

export class ScatterPlot extends ChartComponent {
  static tagName = 'pp-scatter-plot';

  static props: ElenaProp[] = [
    ...ChartComponent.props,
    'show-axes',
    'show-grid',
    'show-size',
    'point-radius',
  ];

  // A little more room than the base default so numeric axis ticks have space.
  margin = { top: 16, right: 24, bottom: 32, left: 48 };

  data: ScatterPlotData = { data: [] };
  'show-axes' = true;
  'show-grid' = false;
  'show-size' = false;
  'point-radius' = 5;

  // Internal bookkeeping — plain fields; never trigger a render cycle.
  private renderResult?: ScatterPlotRenderResult;
  private focusedIndex = 0;

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.initScatterPlot();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.initScatterPlot());
  }

  private initScatterPlot() {
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'img');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', this.title || 'Scatter plot');
    }
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeydown);
    if (this.renderResult) {
      cleanupScatterPlot(this.renderResult);
    }
  }

  protected validateData(): boolean {
    return isScatterPlotData(this.data) && this.data.data.length > 0;
  }

  /** Scales are created in the renderer; nothing to precompute here. */
  protected setupScales(): void {}

  private buildConfig(): Partial<ScatterPlotConfig> {
    return {
      ...defaultScatterPlotConfig,
      showSize: this['show-size'],
      pointRadius: this['point-radius']
    };
  }

  protected renderChart(): void {
    if (!this.contentGroup || !this.validateData()) {
      return;
    }

    const dimensions: ChartDimensions = {
      width: this.width,
      height: this.height,
      margin: this.margin
    };
    const config = this.buildConfig();

    if (this.renderResult) {
      cleanupScatterPlot(this.renderResult);
    }

    const container = select(this.contentGroup);

    // Create scales first so axes and grid can render behind the points, in the
    // same viewBox coordinate space (600×300 minus margins).
    const scales = createScatterPlotScales(this.data, dimensions, {
      ...defaultScatterPlotConfig,
      ...config
    });

    const viewBoxDimensions = {
      width: VIEWBOX_WIDTH - this.margin.left - this.margin.right,
      height: VIEWBOX_HEIGHT - this.margin.top - this.margin.bottom
    };

    if (this['show-grid']) {
      this.renderGrid(scales, viewBoxDimensions);
    }
    if (this['show-axes']) {
      this.renderAxes(scales, viewBoxDimensions);
    }

    this.renderResult = renderScatterPlot(container, this.data, dimensions, config);
    this.addInteractions();

    this.setChartLabel(this.title || `Scatter plot with ${this.data.data.length} data points`);
    this.syncDataTable(this.data.data.map(item => [item.label ?? '', item.x, item.y, item.category ?? '']));
  }

  private addInteractions(): void {
    if (!this.renderResult) return;
    addScatterPlotInteractions(
      this.renderResult,
      this.handlePointHover.bind(this),
      this.handlePointLeave.bind(this),
      this.handlePointClick.bind(this)
    );
  }

  private describePoint(data: ScatterPlotDataPoint): string {
    const coords = `(${data.x}, ${data.y})`;
    const prefix = data.label ? `${data.label}: ` : '';
    const suffix = data.category ? ` — ${data.category}` : '';
    return `${prefix}${coords}${suffix}`;
  }

  private handlePointHover(data: ScatterPlotDataPoint, event: MouseEvent): void {
    this.dispatchEvent(new CustomEvent('pp-point-hover', {
      detail: { data, originalEvent: event },
      bubbles: true,
      composed: true
    }));
  }

  private handlePointLeave(): void {
    this.dispatchEvent(new CustomEvent('pp-point-hover-end', {
      bubbles: true,
      composed: true
    }));
  }

  private handlePointClick(data: ScatterPlotDataPoint, event: MouseEvent): void {
    this.dispatchEvent(new CustomEvent('pp-point-click', {
      detail: { data, originalEvent: event },
      bubbles: true,
      composed: true
    }));
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (!this.validateData()) return;

    const points = this.data.data;
    const last = points.length - 1;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.focusPoint(Math.min(this.focusedIndex + 1, last));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.focusPoint(Math.max(this.focusedIndex - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        this.focusPoint(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusPoint(last);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.handlePointClick(points[this.focusedIndex], new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
        break;
    }
  };

  private focusPoint(index: number): void {
    const points = this.data.data;
    if (index < 0 || index > points.length - 1) return;

    this.focusedIndex = index;

    this.setAttribute('aria-live', 'polite');
    this.setAttribute('aria-label', `Scatter plot. Current: ${this.describePoint(points[index])}. Use arrow keys to navigate.`);
  }

  private renderAxes(scales: ScatterPlotScales, dimensions: { width: number; height: number }): void {
    const container = select(this.contentGroup);
    container.selectAll('.axis-group').remove();

    const xAxisGroup = container
      .append('g')
      .attr('class', 'axis-group x-axis')
      .attr('transform', `translate(0, ${dimensions.height})`);
    xAxisGroup.call(axisBottom(scales.x).ticks(6).tickSize(6));
    this.styleAxis(xAxisGroup, 'x');

    const yAxisGroup = container
      .append('g')
      .attr('class', 'axis-group y-axis');
    yAxisGroup.call(axisLeft(scales.y).ticks(6).tickSize(6));
    this.styleAxis(yAxisGroup, 'y');
  }

  private styleAxis(container: Selection<SVGGElement, unknown, null, undefined>, axisType: 'x' | 'y'): void {
    container.select('.domain')
      .attr('stroke', 'var(--c-border)')
      .attr('stroke-width', 1)
      .attr('fill', 'none');

    container.selectAll('.tick line')
      .attr('stroke', 'var(--c-border)')
      .attr('stroke-width', 1);

    container.selectAll('.tick text')
      .attr('fill', 'var(--c-bodyDimmed)')
      .attr('font-size', 'var(--text-s)')
      .attr('font-family', 'var(--font)');

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

  private renderGrid(scales: ScatterPlotScales, dimensions: { width: number; height: number }): void {
    const container = select(this.contentGroup);
    container.selectAll('.grid').remove();

    const gridGroup = container.append('g').attr('class', 'grid');

    // Horizontal grid lines (y ticks)
    gridGroup.selectAll('.grid-line-y')
      .data(scales.y.ticks(6))
      .join('line')
      .attr('class', 'grid-line grid-line-y')
      .attr('x1', 0)
      .attr('x2', dimensions.width)
      .attr('y1', (d: number) => scales.y(d))
      .attr('y2', (d: number) => scales.y(d))
      .attr('stroke', 'var(--c-border)')
      .attr('stroke-opacity', 0.2)
      .attr('stroke-dasharray', '2,2');

    // Vertical grid lines (x ticks)
    gridGroup.selectAll('.grid-line-x')
      .data(scales.x.ticks(6))
      .join('line')
      .attr('class', 'grid-line grid-line-x')
      .attr('x1', (d: number) => scales.x(d))
      .attr('x2', (d: number) => scales.x(d))
      .attr('y1', 0)
      .attr('y2', dimensions.height)
      .attr('stroke', 'var(--c-border)')
      .attr('stroke-opacity', 0.2)
      .attr('stroke-dasharray', '2,2');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-scatter-plot': ScatterPlot;
  }
}
