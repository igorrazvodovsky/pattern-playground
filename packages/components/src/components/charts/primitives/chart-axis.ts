import { Elena } from '@elenajs/core';
import { select } from 'd3-selection';
import { axisBottom, axisTop, axisLeft, axisRight } from 'd3-axis';
import type { Axis, AxisDomain, AxisScale } from 'd3-axis';
import { format } from 'd3-format';
import type { ScaleBand, ScaleLinear } from 'd3-scale';
import type { ElenaProp } from '../base/d3-component.js';
import type { ScaleConsumer, TickInfo, ChartScale, ScaleCoordinator } from '../services/scale-coordinator.js';

/**
 * @summary A configurable chart axis component that works with D3 scales
 * @status draft
 * @since 0.1
 *
 * Elena supplies props and lifecycle only; the SVG scaffold is built
 * imperatively once and d3-axis owns everything inside it.
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
export class PpChartAxis extends Elena(HTMLElement) implements ScaleConsumer {
  static tagName = 'pp-chart-axis';

  static props: ElenaProp[] = [
    'orientation',
    'label',
    'tick-count',
    { name: 'tickFormat', reflect: false },
    'grid',
    'width',
    'height',
    { name: 'scale', reflect: false },
    { name: 'coordinator', reflect: false },
  ];

  orientation: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  label = '';
  'tick-count' = 5;
  tickFormat: ((d: AxisDomain) => string) | string = '';
  grid = false;
  width = 0;
  height = 0;
  scale: ScaleBand<string> | ScaleLinear<number, number> | null = null;
  coordinator: ScaleCoordinator | null = null;

  /** The owned scaffold, built once on first connect. */
  private svg!: SVGSVGElement;
  private axisGroup!: SVGGElement;

  connectedCallback() {
    super.connectedCallback();
    this.ensureScaffold();
  }

  private ensureScaffold() {
    if (this.svg) return;
    const NS = 'http://www.w3.org/2000/svg';

    const container = document.createElement('div');
    container.className = 'axis-container';

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'axis-svg');
    svg.setAttribute('role', 'img');

    const group = document.createElementNS(NS, 'g');
    group.setAttribute('class', 'axis-group');

    svg.append(group);
    container.append(svg);
    this.append(container);

    this.svg = svg;
    this.axisGroup = group;
  }

  updated() {
    if (!this.svg) return;
    this.svg.setAttribute('width', String(this.width));
    this.svg.setAttribute('height', String(this.height));
    this.svg.setAttribute('aria-label', `Chart axis: ${this.label || this.orientation}`);
    this.renderAxis();
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
    if ('ticks' in this.scale && this['tick-count']) {
      axis.ticks(this['tick-count']);
    }

    if (this.tickFormat) {
      if (typeof this.tickFormat === 'function') {
        axis.tickFormat(this.tickFormat);
      } else if (typeof this.tickFormat === 'string' && this.tickFormat.trim()) {
        try {
          const formatter = format(this.tickFormat);
          // Wrapper that handles both string and number domains
          axis.tickFormat((domainValue: AxisDomain) => {
            if (typeof domainValue === 'number') {
              return formatter(domainValue);
            }
            return String(domainValue);
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
      const tickValues = linearScale.ticks(this['tick-count']);
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
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-chart-axis': PpChartAxis;
  }
}
