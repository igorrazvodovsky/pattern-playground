import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import type { TemplateResult } from 'lit';
import type { ScaleBand, ScaleLinear } from 'd3-scale';
import type { ScaleConsumer, TickInfo, ChartScale, ScaleCoordinator } from '../services/scale-coordinator.js';

/**
 * Grid line configuration
 */
export interface GridConfig {
  showX?: boolean;
  showY?: boolean;
  density?: 'low' | 'medium' | 'high' | number;
  style?: 'solid' | 'dashed' | 'dotted';
  opacity?: number;
}

/**
 * @summary A configurable grid component for chart backgrounds
 * @status draft
 * @since 0.1
 *
 * @event pp-grid-render - Emitted when the grid has been rendered
 *
 * @csspart base - The component's base wrapper
 * @csspart grid - The SVG group containing grid lines
 * @csspart x-grid - X-axis grid lines
 * @csspart y-grid - Y-axis grid lines
 *
 * @cssproperty --grid-color - Color of the grid lines
 * @cssproperty --grid-opacity - Opacity of the grid lines
 * @cssproperty --grid-stroke-width - Width of the grid lines
 * @cssproperty --grid-x-color - Color of the X-axis grid lines
 * @cssproperty --grid-y-color - Color of the Y-axis grid lines
 */
export class PpChartGrid extends LitElement implements ScaleConsumer {

  protected createRenderRoot() {
    return this;
  }

  @query('.grid-group') gridGroup!: SVGGElement;
  @query('.grid-svg') svg!: SVGElement;

  @property({ type: Object }) config: GridConfig = { showX: true, showY: true };
  @property({ type: Number }) width = 0;
  @property({ type: Number }) height = 0;
  @property({ type: Object }) xScale: ScaleBand<string> | ScaleLinear<number, number> | null = null;
  @property({ type: Object }) yScale: ScaleBand<string> | ScaleLinear<number, number> | null = null;
  @property({ type: Object }) coordinator: ScaleCoordinator | null = null;
  
  // Tick information for scale-aware grid positioning
  private xTicks: TickInfo[] = [];
  private yTicks: TickInfo[] = [];
  @property({ type: Number }) tickCount = 5;

  constructor() {
    super();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('config') ||
        changedProperties.has('width') ||
        changedProperties.has('height') ||
        changedProperties.has('xScale') ||
        changedProperties.has('yScale') ||
        changedProperties.has('tickCount')) {
      this.renderGrid();
    }
  }

  private renderGrid() {
    if (!this.gridGroup || this.width === 0 || this.height === 0) {
      return;
    }

    try {

    // Clear previous grid content
    while (this.gridGroup.firstChild) {
      this.gridGroup.removeChild(this.gridGroup.firstChild);
    }

    const { showX = true, showY = true, style = 'solid' } = this.config;

    if (showX) {
      this.renderXGrid(style);
    }

    if (showY) {
      this.renderYGrid(style);
    }

    // Emit render event
    this.dispatchEvent(new CustomEvent('pp-grid-render', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
    
    } catch (error) {
      console.error('Chart grid: Error rendering grid:', error);
      // Clear the grid group on error
      if (this.gridGroup) {
        while (this.gridGroup.firstChild) {
          this.gridGroup.removeChild(this.gridGroup.firstChild);
        }
      }
    }
  }

  private renderXGrid(style: string) {
    // Use scale ticks for intelligent positioning if available
    if (this.xTicks.length > 0) {
      this.xTicks.forEach(tick => {
        const line = this.createGridLine(tick.position, 0, tick.position, this.height, 'x-grid', style);
        this.gridGroup.appendChild(line);
      });
    } else {
      // Fallback to uniform spacing
      const density = this.getDensity();
      const xStep = this.width / density;

      for (let i = 1; i < density; i++) {
        const x = xStep * i;
        const line = this.createGridLine(x, 0, x, this.height, 'x-grid', style);
        this.gridGroup.appendChild(line);
      }
    }
  }

  private renderYGrid(style: string) {
    // Use scale ticks for intelligent positioning if available
    if (this.yTicks.length > 0) {
      this.yTicks.forEach(tick => {
        const line = this.createGridLine(0, tick.position, this.width, tick.position, 'y-grid', style);
        this.gridGroup.appendChild(line);
      });
    } else {
      // Fallback to uniform spacing
      const density = this.getDensity();
      const yStep = this.height / density;

      for (let i = 1; i < density; i++) {
        const y = yStep * i;
        const line = this.createGridLine(0, y, this.width, y, 'y-grid', style);
        this.gridGroup.appendChild(line);
      }
    }
  }

  private createGridLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    className: string,
    style: string
  ): SVGLineElement {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', `grid-line ${className}`);
    line.setAttribute('data-style', style);
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    return line;
  }

  private getDensity(): number {
    const { density = 'medium' } = this.config;

    if (typeof density === 'number') {
      return Math.max(2, density);
    }

    switch (density) {
      case 'low':
        return 4;
      case 'medium':
        return 8;
      case 'high':
        return 16;
      default:
        return 8;
    }
  }

  updateConfig(config: Partial<GridConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set the scales for more intelligent grid positioning
   * Note: This would be used with actual D3 scales in a real implementation
   */
  setScales(xScale: ScaleBand<string> | ScaleLinear<number, number> | null, yScale: ScaleBand<string> | ScaleLinear<number, number> | null) {
    this.xScale = xScale;
    this.yScale = yScale;
  }

  /**
   * ScaleConsumer implementation - update scale from coordinator
   */
  updateScale(axis: 'x' | 'y', scale: ChartScale): void {
    try {
      if (axis === 'x') {
        this.xScale = scale;
      } else {
        this.yScale = scale;
      }
      this.renderGrid();
    } catch (error) {
      console.error(`Chart grid: Error updating ${axis} scale:`, error);
    }
  }

  /**
   * ScaleConsumer implementation - update ticks for grid positioning
   */
  updateTicks(axis: 'x' | 'y', ticks: TickInfo[]): void {
    try {
      if (!Array.isArray(ticks)) {
        console.warn(`Chart grid: Invalid ticks data for ${axis} axis`);
        return;
      }
      
      if (axis === 'x') {
        this.xTicks = ticks;
      } else {
        this.yTicks = ticks;
      }
      this.renderGrid();
    } catch (error) {
      console.error(`Chart grid: Error updating ${axis} ticks:`, error);
    }
  }

  /**
   * Set the scale coordinator for this grid
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

  /**
   * Update grid dimensions
   */
  updateDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * Show or hide the grid
   */
  setVisible(visible: boolean) {
    this.hidden = !visible;
  }

  /**
   * Show only X grid lines
   */
  showXGrid() {
    this.updateConfig({ showX: true, showY: false });
  }

  /**
   * Show only Y grid lines
   */
  showYGrid() {
    this.updateConfig({ showX: false, showY: true });
  }

  /**
   * Show both X and Y grid lines
   */
  showAllGrid() {
    this.updateConfig({ showX: true, showY: true });
  }

  /**
   * Hide all grid lines
   */
  hideGrid() {
    this.updateConfig({ showX: false, showY: false });
  }

  render(): TemplateResult {
    return html`
      <div class="grid-container">
        <svg
          class="grid-svg"
          width="${this.width}"
          height="${this.height}"
          role="presentation"
          aria-hidden="true"
        >
          <g class="grid-group"></g>
        </svg>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-chart-grid': PpChartGrid;
  }
}