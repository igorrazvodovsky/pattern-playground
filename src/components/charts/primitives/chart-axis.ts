import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import type { TemplateResult } from 'lit';
import { select } from 'd3-selection';
import { axisBottom, axisTop, axisLeft, axisRight } from 'd3-axis';
import type { Axis, AxisDomain, AxisScale } from 'd3-axis';
import type { ScaleBand, ScaleLinear } from 'd3-scale';
import type { ScaleConsumer, TickInfo, ChartScale, ScaleCoordinator } from '../services/scale-coordinator.js';

/**
 * @summary A configurable chart axis component that works with D3 scales
 * @status draft
 * @since 0.1
 *
 * @slot - Default slot for custom axis content
 *
 * @event pp-axis-render - Emitted when the axis has been rendered
 *
 * @csspart base - The component's base wrapper
 * @csspart axis - The SVG group containing the axis
 *
 * @cssproperty --axis-color - Color of the axis line and ticks
 * @cssproperty --axis-font-size - Font size for axis labels
 * @cssproperty --axis-font-family - Font family for axis labels
 * @cssproperty --tick-color - Color of the tick marks
 * @cssproperty --tick-size - Size of the tick marks
 * @cssproperty --grid-color - Color of the grid lines (if enabled)
 * @cssproperty --grid-opacity - Opacity of the grid lines
 */
@customElement('pp-chart-axis')
export class PpChartAxis extends LitElement implements ScaleConsumer {
  protected createRenderRoot() {
    return this;
  }

  @query('.axis-group') axisGroup!: SVGGElement;
  @query('.axis-svg') svg!: SVGElement;

  @property() orientation: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  @property() label = '';
  @property({ type: Number }) tickCount = 5;
  @property() tickFormat: ((d: AxisDomain) => string) | string = '';
  @property({ type: Boolean }) grid = false;
  @property({ type: Number }) width = 0;
  @property({ type: Number }) height = 0;
  @property({ type: Object }) scale: ScaleBand<string> | ScaleLinear<number, number> | null = null;
  @property({ type: Object }) coordinator: ScaleCoordinator | null = null;

  // Internal properties for axis configuration

  constructor() {
    super();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('scale') ||
        changedProperties.has('orientation') ||
        changedProperties.has('tickCount') ||
        changedProperties.has('tickFormat') ||
        changedProperties.has('width') ||
        changedProperties.has('height')) {
      this.renderAxis();
    }
  }

  /**
   * Render the axis using the provided scale with d3-axis
   */
  private renderAxis() {
    if (!this.scale || !this.axisGroup) {
      return;
    }

    try {

    // Clear previous axis content
    select(this.axisGroup).selectAll('*').remove();

    // Create the appropriate axis based on orientation
    // D3 axis types are generic, so we handle the scale as AxisScale
    const axisScale = this.scale as AxisScale<AxisDomain>;
    let axis: Axis<AxisDomain>;
    switch (this.orientation) {
      case 'bottom':
        axis = axisBottom(axisScale);
        break;
      case 'top':
        axis = axisTop(axisScale);
        break;
      case 'left':
        axis = axisLeft(axisScale);
        break;
      case 'right':
        axis = axisRight(axisScale);
        break;
      default:
        axis = axisBottom(axisScale);
    }

    // Configure axis
    if ('ticks' in this.scale && this.tickCount) {
      axis.ticks(this.tickCount);
    }

    if (this.tickFormat) {
      // Type-safe tick formatter handling
      if (typeof this.tickFormat === 'function') {
        axis.tickFormat(this.tickFormat);
      } else if (typeof this.tickFormat === 'string' && this.tickFormat.trim()) {
        // Handle common string format patterns
        try {
          // Import d3-format for number formatting
          import('d3-format').then(({ format }) => {
            const formatter = format(this.tickFormat as string);
            // Create a wrapper that handles both string and number domains
            const domainFormatter = (domainValue: AxisDomain) => {
              if (typeof domainValue === 'number') {
                return formatter(domainValue);
              }
              return String(domainValue);
            };
            axis.tickFormat(domainFormatter);
            // Re-render with the new formatter
            select(this.axisGroup).call(axis);
            this.styleAxis();
          }).catch(() => {
            console.warn('d3-format not available for string tick formatting');
          });
        } catch {
          console.warn('Unable to parse tick format string:', this.tickFormat);
        }
      }
    }

    // Render the axis
    select(this.axisGroup).call(axis);

    // Style the axis elements
    this.styleAxis();

    // Generate tick information for coordinator
    this.generateTickInfo();

    // Emit render event
    this.dispatchEvent(new CustomEvent('pp-axis-render', {
      detail: { orientation: this.orientation },
      bubbles: true,
      composed: true
    }));

    } catch (error) {
      console.error('Chart axis: Error rendering axis:', error);
      // Clear the axis group on error to prevent partial renders
      if (this.axisGroup) {
        select(this.axisGroup).selectAll('*').remove();
      }
    }
  }

  /**
   * Apply styling to the rendered axis
   */
  private styleAxis() {
    const axisSelection = select(this.axisGroup);

    // Style domain line
    axisSelection.select('.domain')
      .attr('stroke', 'var(--c-border)')
      .attr('stroke-width', 1)
      .attr('fill', 'none');

    // Style tick lines
    axisSelection.selectAll('.tick line')
      .attr('stroke', 'var(--c-border)')
      .attr('stroke-width', 1);

    // Style tick text
    axisSelection.selectAll('.tick text')
      .attr('fill', 'var(--c-bodyDimmed)')
      .attr('font-size', 'var(--text-s)')
      .attr('font-family', 'var(--font)');

    // Position text based on orientation
    if (this.orientation === 'left') {
      axisSelection.selectAll('.tick text')
        .attr('text-anchor', 'end')
        .attr('x', -12)
        .attr('dy', '0.32em');
    } else if (this.orientation === 'right') {
      axisSelection.selectAll('.tick text')
        .attr('text-anchor', 'start')
        .attr('x', 12)
        .attr('dy', '0.32em');
    } else if (this.orientation === 'top') {
      axisSelection.selectAll('.tick text')
        .attr('text-anchor', 'middle')
        .attr('y', -12)
        .attr('dy', '0');
    } else {
      axisSelection.selectAll('.tick text')
        .attr('text-anchor', 'middle')
        .attr('y', 12)
        .attr('dy', '0.71em');
    }
  }

  /**
   * Update the scale for this axis
   */
  setScale(scale: ScaleBand<string> | ScaleLinear<number, number>) {
    this.scale = scale;
    this.renderAxis();
  }

  /**
   * Get the current axis dimensions
   */
  getDimensions() {
    return {
      width: this.width,
      height: this.height
    };
  }

  /**
   * ScaleConsumer implementation - update scale from coordinator
   */
  updateScale(axis: 'x' | 'y', scale: ChartScale): void {
    // Only update if this axis matches the coordinator axis
    const axisType = this.orientation === 'bottom' || this.orientation === 'top' ? 'x' : 'y';
    if (axis === axisType) {
      this.scale = scale;
      this.renderAxis();
    }
  }

  /**
   * Generate tick information for the scale coordinator
   */
  private generateTickInfo(): void {
    if (!this.scale || !this.coordinator) return;

    const axisType = this.orientation === 'bottom' || this.orientation === 'top' ? 'x' : 'y';
    const ticks: TickInfo[] = [];

    if ('bandwidth' in this.scale) {
      // Band scale
      const bandScale = this.scale as ScaleBand<string>;
      const domain = bandScale.domain();
      domain.forEach(value => {
        const position = bandScale(value);
        if (position !== undefined) {
          ticks.push({ value, position: position + bandScale.bandwidth() / 2 });
        }
      });
    } else {
      // Linear scale
      const linearScale = this.scale as ScaleLinear<number, number>;
      const tickValues = linearScale.ticks(this.tickCount);
      tickValues.forEach(value => {
        const position = linearScale(value);
        if (position !== undefined) {
          ticks.push({ value, position });
        }
      });
    }

    this.coordinator.updateTicks(axisType, ticks);
  }

  /**
   * Set the scale coordinator for this axis
   */
  setCoordinator(coordinator: ScaleCoordinator): void {
    this.coordinator = coordinator;
    coordinator.registerConsumer(this);
  }

  /**
   * Remove the scale coordinator
   */
  removeCoordinator(): void {
    if (this.coordinator) {
      this.coordinator.unregisterConsumer(this);
      this.coordinator = null;
    }
  }

  render(): TemplateResult {
    return html`
      <div class="axis-container">
        <svg
          class="axis-svg"
          width="${this.width}"
          height="${this.height}"
          role="img"
          aria-label="Chart axis: ${this.label || this.orientation}"
        >
          <g class="axis-group"></g>
        </svg>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-chart-axis': PpChartAxis;
  }
}