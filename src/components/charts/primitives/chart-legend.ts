import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import type { TemplateResult } from 'lit';

/**
 * Legend data item interface
 */
export interface LegendItem {
  id: string;
  label: string;
  color: string;
  visible?: boolean;
  symbol?: 'circle' | 'square' | 'line' | 'dash';
}

/**
 * @summary A configurable chart legend that displays data series information
 * @status draft
 * @since 0.1
 *
 * @slot - Default slot for custom legend content
 *
 * @event pp-legend-item-click - Emitted when a legend item is clicked
 * @event pp-legend-item-toggle - Emitted when a legend item visibility is toggled
 *
 * @csspart base - The component's base wrapper
 * @csspart legend-list - The container for legend items
 * @csspart legend-item - Individual legend item
 * @csspart legend-symbol - The color/symbol indicator
 * @csspart legend-label - The text label
 *
 * @cssproperty --legend-font-size - Font size for legend labels
 * @cssproperty --legend-font-family - Font family for legend labels
 * @cssproperty --legend-item-spacing - Spacing between legend items
 * @cssproperty --legend-symbol-size - Size of the legend symbols
 * @cssproperty --legend-symbol-spacing - Spacing between symbol and label
 * @cssproperty --legend-padding - Padding around the legend
 * @cssproperty --legend-background - Background color of the legend
 * @cssproperty --legend-border - Border around the legend
 * @cssproperty --legend-border-radius - Border radius of the legend
 */
export class PpChartLegend extends LitElement {

  protected createRenderRoot() {
    return this;
  }

  @property({ type: Array }) items: LegendItem[] = [];
  @property() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @property({ type: Boolean, reflect: true }) interactive = false;
  @property() title = '';

  constructor() {
    super();
  }

  /**
   * Handle legend item click
   */
  private handleItemClick(item: LegendItem, event: Event) {
    event.preventDefault();

    // Emit click event
    this.dispatchEvent(new CustomEvent('pp-legend-item-click', {
      detail: { item, originalEvent: event },
      bubbles: true,
      composed: true
    }));

    // If interactive, toggle visibility
    if (this.interactive) {
      this.toggleItem(item.id);
    }
  }

  /**
   * Handle keyboard navigation
   */
  private handleItemKeyDown(item: LegendItem, event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleItemClick(item, event);
    }
  }

  /**
   * Toggle the visibility of a legend item
   */
  toggleItem(id: string) {
    const itemIndex = this.items.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    const updatedItems = [...this.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      visible: !(updatedItems[itemIndex].visible ?? true)
    };

    this.items = updatedItems;

    // Emit toggle event
    this.dispatchEvent(new CustomEvent('pp-legend-item-toggle', {
      detail: {
        item: updatedItems[itemIndex],
        visible: updatedItems[itemIndex].visible ?? true
      },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Set the visibility of a specific item
   */
  setItemVisibility(id: string, visible: boolean) {
    const itemIndex = this.items.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    const updatedItems = [...this.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      visible
    };

    this.items = updatedItems;
  }

  /**
   * Get the visibility state of all items
   */
  getVisibilityState(): Record<string, boolean> {
    return this.items.reduce((state, item) => {
      state[item.id] = item.visible ?? true;
      return state;
    }, {} as Record<string, boolean>);
  }

  /**
   * Update legend items
   */
  updateItems(items: LegendItem[]) {
    this.items = items;
  }

  private renderLegendItem(item: LegendItem) {
    const isHidden = !(item.visible ?? true);
    const symbol = item.symbol || 'square';

    return html`
      <li
        class="legend-item"
        ?data-hidden=${isHidden}
        tabindex=${this.interactive ? '0' : '-1'}
        role=${this.interactive ? 'button' : 'listitem'}
        aria-label="Legend item: ${item.label}${isHidden ? ' (hidden)' : ''}"
        @click=${(e: Event) => this.handleItemClick(item, e)}
        @keydown=${(e: KeyboardEvent) => this.handleItemKeyDown(item, e)}
      >
        <div
          part="legend-symbol"
          class="legend-symbol"
          data-symbol=${symbol}
          style="--symbol-color: ${item.color};"
        ></div>
        <span part="legend-label" class="legend-label">${item.label}</span>
      </li>
    `;
  }

  render(): TemplateResult {
    return html`
      <div part="base" class="legend-container">
        ${this.title ? html`<div class="legend-title">${this.title}</div>` : ''}
        <ul
          part="legend-list"
          class="legend-list"
          role="list"
          aria-label=${this.title || 'Chart legend'}
        >
          ${repeat(
            this.items,
            item => item.id,
            item => this.renderLegendItem(item)
          )}
        </ul>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-chart-legend': PpChartLegend;
  }
}