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

import { html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { select } from 'd3-selection';
import { ChartComponent } from './base/chart-component.js';
import {
  BarChartData,
  BarChartDataPoint,
  ChartConfig,
  ChartDimensions,
  isBarChartData
} from './base/chart-types.js';
import {
  convertToBarChartData,
  transformBarChartData
} from './base/data-converters.js';
import {
  renderBarChart,
  updateBarChart,
  addBarChartInteractions,
  cleanupBarChart,
  BarChartConfig,
  BarChartRenderResult,
  defaultBarChartConfig,
  createBarChartScales
} from './renderers/bar-chart-renderer.js';
import tooltipStyles from '../tooltip/tooltip.css?inline';

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
  static styles = [
    ChartComponent.styles,
    unsafeCSS(tooltipStyles)
  ];

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

  @property({ type: Boolean, reflect: true })
  animate = true;

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
      changedProperties.has('animate') ||
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
      animate: this.animate,
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
    
    // Render chart primitives first (axes, grid) so they appear behind bars
    // Use the same coordinate system as the scales (viewBox-based)
    const viewBoxDimensions = {
      width: 600 - this.margin.left - this.margin.right,
      height: 300 - this.margin.top - this.margin.bottom
    };
    
    if (this.showAxes) {
      this.renderAxes(scales, viewBoxDimensions);
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
          this.handleBarClick(currentData, event as any);
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

  private renderAxes(scales: any, dimensions: { width: number; height: number }): void {
    const container = select(this.contentGroup);

    // Remove existing axes
    container.selectAll('.axis').remove();

    // X-axis
    const xAxisGroup = container
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${dimensions.height})`);

    // Y-axis
    const yAxisGroup = container
      .append('g')
      .attr('class', 'axis y-axis');

    // Create and render axes using the scales
    if (this.orientation === 'vertical') {
      // For vertical bars: x = categories, y = values
      xAxisGroup.call((g: any) => {
        const axis = g.selectAll('.tick')
          .data(scales.x.domain())
          .join('g')
          .attr('class', 'tick')
          .attr('transform', (d: string) => `translate(${scales.x(d)! + scales.x.bandwidth() / 2}, 0)`);

        axis.append('line')
          .attr('y2', 6)
          .attr('stroke', 'var(--c-border)');

        axis.append('text')
          .attr('y', 9)
          .attr('dy', '0.71em')
          .attr('text-anchor', 'middle')
          .attr('fill', 'var(--c-bodyDimmed)')
          .text((d: string) => d);
      });

      yAxisGroup.call((g: any) => {
        const ticks = scales.y.ticks(5);
        const axis = g.selectAll('.tick')
          .data(ticks)
          .join('g')
          .attr('class', 'tick')
          .attr('transform', (d: number) => `translate(0, ${scales.y(d)})`);

        axis.append('line')
          .attr('x2', -6)
          .attr('stroke', 'var(--c-border)');

        axis.append('text')
          .attr('x', -9)
          .attr('dy', '0.32em')
          .attr('text-anchor', 'end')
          .attr('fill', 'var(--c-bodyDimmed)')
          .text((d: number) => d);
      });
    } else {
      // For horizontal bars: x = values, y = categories
      xAxisGroup.call((g: any) => {
        const ticks = scales.y.ticks(5);
        const axis = g.selectAll('.tick')
          .data(ticks)
          .join('g')
          .attr('class', 'tick')
          .attr('transform', (d: number) => `translate(${scales.y(d)}, 0)`);

        axis.append('line')
          .attr('y2', 6)
          .attr('stroke', 'var(--c-border)');

        axis.append('text')
          .attr('y', 9)
          .attr('dy', '0.71em')
          .attr('text-anchor', 'middle')
          .attr('fill', 'var(--c-bodyDimmed)')
          .text((d: number) => d);
      });

      yAxisGroup.call((g: any) => {
        const axis = g.selectAll('.tick')
          .data(scales.x.domain())
          .join('g')
          .attr('class', 'tick')
          .attr('transform', (d: string) => `translate(0, ${scales.x(d)! + scales.x.bandwidth() / 2})`);

        axis.append('line')
          .attr('x2', -6)
          .attr('stroke', 'var(--c-border)');

        axis.append('text')
          .attr('x', -9)
          .attr('dy', '0.32em')
          .attr('text-anchor', 'end')
          .attr('fill', 'var(--c-bodyDimmed)')
          .text((d: string) => d);
      });
    }
  }

  private renderGrid(scales: any, dimensions: { width: number; height: number }): void {
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