/**
 * Bar Chart Web Component
 *
 * A Lit component that orchestrates bar chart rendering using the pure bar chart renderer.
 * Provides reactive properties, template-based composition, and integration with chart primitives.
 *
 * @example
 * ```html
 * <pp-bar-chart
 *   .data="${barData}"
 *   orientation="vertical"
 *   show-legend
 *   show-grid>
 * </pp-bar-chart>
 * ```
 */

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { select } from 'd3-selection';
import { ChartComponent } from './base/chart-component.js';
import './primitives/chart-axis.js';
import {
  BarChartData,
  BarChartDataPoint,
  ChartDimensions,
  isBarChartData
} from './base/chart-types.js';
import type { BarChartScales } from './renderers/bar-chart-renderer.js';
import {
  convertToBarChartData,
  transformBarChartData
} from './base/data-converters.js';
import {
  renderBarChart,
  addBarChartInteractions,
  cleanupBarChart,
  BarChartConfig,
  BarChartRenderResult,
  defaultBarChartConfig,
  createBarChartScales
} from './renderers/bar-chart-renderer.js';
import {
  ScaleCoordinator,
  createScaleCoordinator
} from './services/scale-coordinator.js';

/**
 * Custom value converter for BarChartData
 */
export const barChartDataConverter = {
  fromAttribute: (value: string | null): BarChartData | null => {
    if (!value) return null;
    return convertToBarChartData(value);
  },
  toAttribute: (value: BarChartData | null): string | null => {
    return value ? JSON.stringify(value) : null;
  }
};

@customElement('pp-bar-chart')
export class BarChart extends ChartComponent {
  static styles = ChartComponent.styles;

  // Bar chart specific properties
  @property({
    type: Object,
    converter: barChartDataConverter
  })
  data: BarChartData = { data: [] };

  @property({ type: String, reflect: true })
  orientation: 'vertical' | 'horizontal' = 'vertical';

  @property({ type: Boolean, reflect: true, attribute: 'show-legend' })
  showLegend = false;

  @property({ type: Boolean, reflect: true, attribute: 'show-grid' })
  showGrid = false;

  @property({ type: Boolean, reflect: true, attribute: 'show-axes' })
  showAxes = true;

  @property({ type: Boolean, reflect: true, attribute: 'animate-chart' })
  animateChart = true;

  @property({ type: Number, attribute: 'animation-duration' })
  animationDuration = 300;

  @property({ type: Number, attribute: 'bar-padding' })
  barPadding = 0.1;

  @property({ type: String })
  sort: 'asc' | 'desc' | 'none' = 'none';


  // Internal state
  @state() private renderResult?: BarChartRenderResult;
  @state() private tooltipVisible = false;
  @state() private tooltipContent = '';
  @state() private tooltipX = 0;
  @state() private tooltipY = 0;

  // Scale coordination
  private scaleCoordinator: ScaleCoordinator = createScaleCoordinator();

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'img');
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


  protected shouldRerender(changedProperties: Map<string | number | symbol, unknown>): boolean {
    return super.shouldRerender(changedProperties) ||
      changedProperties.has('orientation') ||
      changedProperties.has('animateChart') ||
      changedProperties.has('barPadding') ||
      changedProperties.has('sort');
  }

  /**
   * Setup scales based on data - required by ChartComponent
   */
  protected setupScales(): void {
    // Scales are created in the renderer, not stored as instance variables
  }

  /**
   * Create scales for rendering primitives before bars
   */
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
      orientation: this.orientation,
      animate: this.animateChart,
      animationDuration: this.animationDuration,
      barPadding: this.barPadding,
      ...defaultBarChartConfig
    };

    // Clean up previous render result
    if (this.renderResult) {
      cleanupBarChart(this.renderResult);
    }

    const container = select(this.contentGroup);

    // Create scales first so we can render axes before bars
    const scales = this.createScalesForPrimitives(transformedData, dimensions, config);

    // Update scale coordinator with the new scales
    this.scaleCoordinator.updateScale('x', scales.x);
    this.scaleCoordinator.updateScale('y', scales.y);

    // Render chart primitives first (axes, grid) so they appear behind bars
    // Use the same coordinate system as the scales (viewBox-based)
    const viewBoxDimensions = {
      width: 600 - this.margin.left - this.margin.right,
      height: 300 - this.margin.top - this.margin.bottom
    };

    if (this.showAxes) {
      this.renderAxesWithPrimitive(scales, viewBoxDimensions);
    }
    if (this.showGrid) {
      this.renderGrid(scales, viewBoxDimensions);
    }

    // Now render the bar chart on top
    this.renderResult = renderBarChart(container, transformedData, dimensions, config);

    // Add interactions
    this.addInteractions();

    // Update title for accessibility
    const titleElement = this.querySelector('#chart-title');
    if (titleElement) {
      titleElement.textContent = this.title || `Bar chart with ${transformedData.data.length} data points`;
    }
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
    // Show tooltip
    this.tooltipContent = `${data.category}: ${data.value}`;
    this.tooltipX = event.clientX;
    this.tooltipY = event.clientY;
    this.tooltipVisible = true;

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('pp-bar-hover', {
      detail: { data, originalEvent: event },
      bubbles: true,
      composed: true
    }));
  }

  private handleBarLeave(): void {
    this.tooltipVisible = false;

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
    let currentIndex = 0;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        currentIndex = Math.min(currentIndex + 1, data.data.length - 1);
        this.focusBar(currentIndex);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        this.focusBar(currentIndex);
        break;
      case 'Home':
        event.preventDefault();
        this.focusBar(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusBar(data.data.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.renderResult) {
          const currentData = data.data[currentIndex];
          this.handleBarClick(currentData, event as KeyboardEvent);
        }
        break;
    }
  };

  private focusBar(index: number): void {
    if (!this.renderResult) return;

    const data = this.transformData();
    if (index >= 0 && index < data.data.length) {
      const currentData = data.data[index];

      // Simulate hover effect for keyboard navigation
      this.tooltipContent = `${currentData.category}: ${currentData.value}`;
      const rect = this.getBoundingClientRect();
      this.tooltipX = rect.left + rect.width / 2;
      this.tooltipY = rect.top + rect.height / 2;
      this.tooltipVisible = true;

      // Announce to screen readers
      this.setAttribute('aria-live', 'polite');
      this.setAttribute('aria-label', `Bar chart. Current: ${this.tooltipContent}. Use arrow keys to navigate.`);
    }
  }

  private renderAxesWithPrimitive(scales: BarChartScales, dimensions: { width: number; height: number }): void {
    const container = select(this.contentGroup);

    // Remove existing axes
    container.selectAll('.axis-group').remove();

    // Create X-axis group
    const xAxisGroup = container
      .append('g')
      .attr('class', 'axis-group x-axis')
      .attr('transform', `translate(0, ${dimensions.height})`);

    // Create Y-axis group
    const yAxisGroup = container
      .append('g')
      .attr('class', 'axis-group y-axis');

    // Render X-axis directly using D3 axis methods that the chart-axis component uses
    this.renderAxisDirect(xAxisGroup, scales, dimensions, 'x');
    this.renderAxisDirect(yAxisGroup, scales, dimensions, 'y');
  }

  private renderAxisDirect(container: any, scales: BarChartScales, dimensions: { width: number; height: number }, axisType: 'x' | 'y'): void {
    // Import and use d3-axis directly, similar to chart-axis component
    import('d3-axis').then(({ axisBottom, axisLeft }) => {
      let axis: any;

      if (axisType === 'x') {
        // X-axis configuration based on orientation
        if (this.orientation === 'vertical') {
          // Categories on X-axis for vertical bars
          axis = axisBottom(scales.x).tickSize(6);
        } else {
          // Values on X-axis for horizontal bars
          axis = axisBottom(scales.y).ticks(5).tickSize(6);
        }
      } else {
        // Y-axis configuration based on orientation
        if (this.orientation === 'vertical') {
          // Values on Y-axis for vertical bars
          axis = axisLeft(scales.y).ticks(5).tickSize(6);
        } else {
          // Categories on Y-axis for horizontal bars
          axis = axisLeft(scales.x).tickSize(6);
        }
      }

      // Render the axis
      container.call(axis);

      // Apply the same styling as chart-axis component
      this.applyAxisStyling(container, axisType);
    });
  }

  private applyAxisStyling(container: any, axisType: 'x' | 'y'): void {
    // Style domain line
    container.select('.domain')
      .attr('stroke', 'var(--c-border)')
      .attr('stroke-width', 0)
      .attr('fill', 'none');

    // Style tick lines
    container.selectAll('.tick line')
      .attr('stroke', 'var(--c-border)')
      .attr('stroke-width', 1);

    // Style tick text
    container.selectAll('.tick text')
      .attr('fill', 'var(--c-bodyDimmed)')
      .attr('font-size', 'var(--text-sm)')
      .attr('font-family', 'var(--font-family-base)');

    // Position text based on orientation (using same values as chart-axis component)
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

    // Remove existing grid
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

  render() {
    return html`
      ${super.render()}
      ${this.tooltipVisible ? html`
        <pp-tooltip
          .content="${this.tooltipContent}"
          .position="{ x: ${this.tooltipX}, y: ${this.tooltipY} }"
          .visible="${this.tooltipVisible}"
        ></pp-tooltip>
      ` : ''}

      <!-- Screen reader accessible data summary -->
      <div class="inclusively-hidden" role="table" aria-label="Chart data">
        <div role="rowgroup">
          ${this.data.data.map(item => html`
            <div role="row">
              <span role="cell">${item.category}</span>
              <span role="cell">${item.value}</span>
            </div>
          `)}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-bar-chart': BarChart;
  }
}