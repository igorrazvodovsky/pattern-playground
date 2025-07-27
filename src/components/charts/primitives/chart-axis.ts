import { LitElement, html } from 'lit';
import { property, query, customElement } from 'lit/decorators.js';
import type { TemplateResult } from 'lit';
import { select } from 'd3-selection';
import { axisBottom, axisTop, axisLeft, axisRight } from 'd3-axis';
import type { ScaleBand, ScaleLinear } from 'd3-scale';
// Styles available globally with Light DOM

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
export class PpChartAxis extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @query('.axis-group') axisGroup!: SVGGElement;
  @query('.axis-svg') svg!: SVGElement;

  @property() orientation: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  @property() label = '';
  @property({ type: Number }) tickCount = 5;
  @property() tickFormat = '';
  @property({ type: Boolean }) grid = false;
  @property({ type: Number }) width = 0;
  @property({ type: Number }) height = 0;
  @property({ type: Object }) scale: ScaleBand<string> | ScaleLinear<number, number> | null = null;

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

    // Clear previous axis content
    select(this.axisGroup).selectAll('*').remove();

    // Create the appropriate axis based on orientation
    let axis: any;
    switch (this.orientation) {
      case 'bottom':
        axis = axisBottom(this.scale as any);
        break;
      case 'top':
        axis = axisTop(this.scale as any);
        break;
      case 'left':
        axis = axisLeft(this.scale as any);
        break;
      case 'right':
        axis = axisRight(this.scale as any);
        break;
      default:
        axis = axisBottom(this.scale as any);
    }

    // Configure axis
    if ('ticks' in this.scale && this.tickCount) {
      axis.ticks(this.tickCount);
    }

    if (this.tickFormat) {
      axis.tickFormat(this.tickFormat as any);
    }

    // Render the axis
    select(this.axisGroup).call(axis);

    // Style the axis elements
    this.styleAxis();

    // Emit render event
    this.dispatchEvent(new CustomEvent('pp-axis-render', {
      detail: { orientation: this.orientation },
      bubbles: true,
      composed: true
    }));
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
      .attr('font-size', 'var(--text-sm)')
      .attr('font-family', 'var(--font-family-base)');

    // Position text based on orientation
    if (this.orientation === 'left') {
      axisSelection.selectAll('.tick text')
        .attr('text-anchor', 'end')
        .attr('x', -9)
        .attr('dy', '0.32em');
    } else if (this.orientation === 'right') {
      axisSelection.selectAll('.tick text')
        .attr('text-anchor', 'start')
        .attr('x', 9)
        .attr('dy', '0.32em');
    } else if (this.orientation === 'top') {
      axisSelection.selectAll('.tick text')
        .attr('text-anchor', 'middle')
        .attr('y', -9)
        .attr('dy', '0');
    } else {
      axisSelection.selectAll('.tick text')
        .attr('text-anchor', 'middle')
        .attr('y', 9)
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