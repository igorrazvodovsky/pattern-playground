import { LitElement, html, unsafeCSS } from 'lit';
import { property, query } from 'lit/decorators.js';
import type { CSSResultGroup, TemplateResult } from 'lit';
import chartStyles from '../../../styles/charts.css?inline';

/**
 * Standalone reusable axis component using d3-axis
 * 
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
export class PpChartAxis extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(chartStyles)];

  @query('.axis-group') axisGroup!: SVGGElement;
  @query('.axis-svg') svg!: SVGElement;

  @property() orientation: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  @property() label = '';
  @property({ type: Number }) tickCount = 5;
  @property() tickFormat = '';
  @property({ type: Boolean }) grid = false;
  @property({ type: Number }) width = 0;
  @property({ type: Number }) height = 0;
  @property({ type: Object }) scale: unknown = null;

  // Internal properties for axis configuration
  private _axisFunction: unknown = null;
  private _tickValues: unknown[] = [];

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
   * Render the axis using the provided scale
   * Note: This is a placeholder implementation. In a real implementation,
   * this would use d3-axis to create the actual axis.
   */
  private renderAxis() {
    if (!this.scale || !this.axisGroup) {
      return;
    }

    // Clear previous axis content
    while (this.axisGroup.firstChild) {
      this.axisGroup.removeChild(this.axisGroup.firstChild);
    }

    // This is a simplified implementation
    // In a real implementation, you would use:
    // import { axisBottom, axisTop, axisLeft, axisRight } from 'd3-axis';
    // const axis = axisBottom(this.scale).ticks(this.tickCount);
    // select(this.axisGroup).call(axis);

    this.renderPlaceholderAxis();
    
    // Emit render event
    this.dispatchEvent(new CustomEvent('pp-axis-render', {
      detail: { orientation: this.orientation },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Placeholder axis rendering (to be replaced with actual D3 implementation)
   */
  private renderPlaceholderAxis() {
    // Create domain line
    const domain = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    domain.setAttribute('class', 'domain');
    
    if (this.orientation === 'bottom' || this.orientation === 'top') {
      domain.setAttribute('x1', '0');
      domain.setAttribute('x2', String(this.width));
      domain.setAttribute('y1', '0');
      domain.setAttribute('y2', '0');
    } else {
      domain.setAttribute('x1', '0');
      domain.setAttribute('x2', '0');
      domain.setAttribute('y1', '0');
      domain.setAttribute('y2', String(this.height));
    }
    
    this.axisGroup.appendChild(domain);

    // Create placeholder ticks
    for (let i = 0; i <= this.tickCount; i++) {
      const tickGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tickGroup.setAttribute('class', 'tick');
      
      const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const tickText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      
      if (this.orientation === 'bottom' || this.orientation === 'top') {
        const x = (this.width / this.tickCount) * i;
        tickGroup.setAttribute('transform', `translate(${x}, 0)`);
        
        tickLine.setAttribute('x1', '0');
        tickLine.setAttribute('x2', '0');
        tickLine.setAttribute('y1', '0');
        tickLine.setAttribute('y2', this.orientation === 'bottom' ? '6' : '-6');
        
        tickText.setAttribute('x', '0');
        tickText.setAttribute('y', this.orientation === 'bottom' ? '15' : '-9');
        tickText.textContent = String(i);
      } else {
        const y = (this.height / this.tickCount) * i;
        tickGroup.setAttribute('transform', `translate(0, ${y})`);
        
        tickLine.setAttribute('x1', '0');
        tickLine.setAttribute('x2', this.orientation === 'right' ? '6' : '-6');
        tickLine.setAttribute('y1', '0');
        tickLine.setAttribute('y2', '0');
        
        tickText.setAttribute('x', this.orientation === 'right' ? '9' : '-9');
        tickText.setAttribute('y', '0');
        tickText.textContent = String(i);
      }
      
      tickGroup.appendChild(tickLine);
      tickGroup.appendChild(tickText);
      this.axisGroup.appendChild(tickGroup);
    }
  }

  /**
   * Update the scale for this axis
   */
  setScale(scale: unknown) {
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

customElements.define('pp-chart-axis', PpChartAxis);

declare global {
  interface HTMLElementTagNameMap {
    'pp-chart-axis': PpChartAxis;
  }
}