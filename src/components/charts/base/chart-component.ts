import { property } from 'lit/decorators.js';
import { D3Component } from './d3-component.js';
import type { ScaleLinear, ScaleBand, ScaleTime } from 'd3-scale';

/**
 * Chart-specific base component that extends D3Component
 * 
 * Provides:
 * - Scale management utilities
 * - Common chart interactions (hover, click)
 * - Data validation and transformation
 * - Core chart functionality without feature composition
 */
export abstract class ChartComponent extends D3Component {
  @property({ type: Object }) data: unknown = [];
  @property({ type: String }) title = '';
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Common scale types used across charts
   */
  protected xScale?: ScaleLinear<number, number> | ScaleBand<string> | ScaleTime<number, number>;
  protected yScale?: ScaleLinear<number, number> | ScaleBand<string>;

  constructor() {
    super();
    this.addEventListener('mouseover', this.handleMouseOver);
    this.addEventListener('mouseout', this.handleMouseOut);
    this.addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('mouseover', this.handleMouseOver);
    this.removeEventListener('mouseout', this.handleMouseOut);
    this.removeEventListener('click', this.handleClick);
  }

  protected shouldRerender(changedProperties: Map<string | number | symbol, unknown>): boolean {
    return changedProperties.has('data') || 
           changedProperties.has('loading') || 
           changedProperties.has('disabled');
  }

  /**
   * Handle mouse over events for chart interactions
   */
  protected handleMouseOver = (event: MouseEvent) => {
    if (this.disabled) return;
    
    this.dispatchEvent(new CustomEvent('pp-chart-hover', {
      detail: { originalEvent: event },
      bubbles: true,
      composed: true
    }));
  };

  /**
   * Handle mouse out events for chart interactions
   */
  protected handleMouseOut = (event: MouseEvent) => {
    if (this.disabled) return;
    
    this.dispatchEvent(new CustomEvent('pp-chart-hover-end', {
      detail: { originalEvent: event },
      bubbles: true,
      composed: true
    }));
  };

  /**
   * Handle click events for chart interactions
   */
  protected handleClick = (event: MouseEvent) => {
    if (this.disabled) return;
    
    this.dispatchEvent(new CustomEvent('pp-chart-click', {
      detail: { originalEvent: event },
      bubbles: true,
      composed: true
    }));
  };

  /**
   * Validate data structure - override in subclasses
   */
  protected validateData(): boolean {
    return Array.isArray(this.data);
  }

  /**
   * Transform raw data into chart-ready format - override in subclasses
   */
  protected transformData(): unknown {
    return this.data;
  }

  /**
   * Setup scales based on data - override in subclasses
   */
  protected abstract setupScales(): void;

  /**
   * Clear previous chart content
   */
  protected clearChart() {
    if (this.contentGroup) {
      // Clear all child elements
      while (this.contentGroup.firstChild) {
        this.contentGroup.removeChild(this.contentGroup.firstChild);
      }
    }
  }

  protected renderD3Content(): void {
    if (!this.validateData() || this.loading) {
      this.clearChart();
      return;
    }

    this.clearChart();
    this.setupScales();
    this.renderChart();
  }

  /**
   * Abstract method for rendering the actual chart - implement in subclasses
   */
  protected abstract renderChart(): void;
}