import { LitElement, html, unsafeCSS, css } from 'lit';
import { property, query } from 'lit/decorators.js';
import type { CSSResultGroup, TemplateResult } from 'lit';
import chartStyles from '../../../styles/charts.css?inline';

/**
 * Base D3 component that provides common D3 SVG container management
 * and responsive sizing for all chart components.
 * 
 * Extends LitElement with pp- prefix convention and provides:
 * - SVG container management
 * - Responsive sizing and viewport management
 * - Base data binding with @property decorators
 * - Reactive controllers for lifecycle management
 */
export abstract class D3Component extends LitElement {
  static styles: CSSResultGroup = [
    unsafeCSS(chartStyles),
    css`
      :host {
        display: block;
        width: 100%;
        height: auto;
        box-sizing: border-box;
      }
      
      .d3-container {
        width: 100%;
        height: auto;
        position: relative;
      }
      
      .d3-svg {
        display: block;
        width: 100%;
        height: auto;
      }
    `
  ];

  @query('.d3-svg') protected svg!: SVGElement;
  @query('.d3-content') protected contentGroup!: SVGGElement;

  @property({ type: Number, reflect: true }) width = 0;
  @property({ type: Number, reflect: true }) height = 0;
  @property({ type: Object }) margin = { top: 20, right: 20, bottom: 20, left: 20 };

  protected resizeObserver?: ResizeObserver;

  constructor() {
    super();
    this.setupResizeObserver();
  }

  connectedCallback() {
    super.connectedCallback();
    this.resizeObserver?.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected firstUpdated() {
    // Update dimensions immediately
    this.updateDimensions();
    
    // Also update after a small delay to ensure layout is complete
    setTimeout(() => {
      this.updateDimensions();
    }, 0);
  }

  private setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateDimensions();
      });
    }
  }

  protected updateDimensions() {
    const rect = this.getBoundingClientRect();
    
    // Use container dimensions if available
    if (rect.width > 0 && rect.height > 0) {
      this.width = rect.width;
      this.height = rect.height;
    } else {
      // Fallback to computed styles or defaults
      const computedStyle = getComputedStyle(this);
      const cssWidth = parseInt(computedStyle.width, 10);
      const cssHeight = parseInt(computedStyle.height, 10);
      
      this.width = cssWidth > 0 ? cssWidth : 800;
      this.height = cssHeight > 0 ? cssHeight : 400;
    }
  }

  /**
   * Get the inner dimensions accounting for margins
   */
  protected getInnerDimensions() {
    return {
      width: Math.max(0, this.width - this.margin.left - this.margin.right),
      height: Math.max(0, this.height - this.margin.top - this.margin.bottom)
    };
  }

  /**
   * Abstract method that subclasses must implement to render their D3 content
   */
  protected abstract renderD3Content(): void;

  protected updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    
    // Ensure dimensions are set (fallback if firstUpdated didn't work)
    if (this.width === 0 || this.height === 0) {
      this.updateDimensions();
    }
    
    // Re-render D3 content when dimensions or data change
    if (changedProperties.has('width') || 
        changedProperties.has('height') || 
        this.shouldRerender(changedProperties)) {
      this.renderD3Content();
    }
  }

  /**
   * Override this method to specify additional properties that should trigger re-rendering
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected shouldRerender(_changedProperties: Map<string | number | symbol, unknown>): boolean {
    return false;
  }

  render(): TemplateResult {
    const viewBoxWidth = 600;
    const viewBoxHeight = 300;
    
    return html`
      <div class="d3-container">
        <svg 
          class="d3-svg" 
          role="img"
          aria-labelledby="chart-title"
          viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}"
        >
          <title id="chart-title">Data visualization chart</title>
          <g 
            class="d3-content"
            transform="translate(${this.margin.left}, ${this.margin.top})"
          ></g>
        </svg>
      </div>
    `;
  }
}