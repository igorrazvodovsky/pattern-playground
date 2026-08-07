import { Elena } from '@elenajs/core';
import type { ElenaProp } from '../base/d3-component.js';

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
 * Elena supplies props and lifecycle only; the legend list is rebuilt
 * imperatively from `items` after every update.
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
export class PpChartLegend extends Elena(HTMLElement) {
  static tagName = 'pp-chart-legend';

  static props: ElenaProp[] = [
    { name: 'items', reflect: false },
    'orientation',
    'interactive',
    'title',
  ];

  items: LegendItem[] = [];
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  interactive = false;
  declare title: string;

  /** The owned scaffold, built once on first connect. */
  private container!: HTMLDivElement;
  private titleEl!: HTMLDivElement;
  private list!: HTMLUListElement;

  constructor() {
    super();
    // `title` collides with the native reflecting HTMLElement.title: a class
    // field would assign through the native setter and write a title=""
    // attribute inside the constructor, which the custom-elements spec forbids.
    // An own data property shadows the native accessor without invoking it;
    // Elena captures it as the prop default on first connect.
    Object.defineProperty(this, 'title', {
      value: '',
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.ensureScaffold();
    this.syncLegend();
  }

  private ensureScaffold() {
    if (this.container) return;

    const container = document.createElement('div');
    container.className = 'legend-container';
    container.setAttribute('part', 'base');

    const titleEl = document.createElement('div');
    titleEl.className = 'legend-title';
    titleEl.hidden = true;

    const list = document.createElement('ul');
    list.className = 'legend-list';
    list.setAttribute('part', 'legend-list');
    list.setAttribute('role', 'list');

    container.append(titleEl, list);
    this.append(container);

    this.container = container;
    this.titleEl = titleEl;
    this.list = list;
  }

  updated() {
    this.syncLegend();
  }

  /** Rebuild the legend list from `items`. */
  private syncLegend() {
    if (!this.list) return;

    this.titleEl.textContent = this.title;
    this.titleEl.hidden = !this.title;
    this.list.setAttribute('aria-label', this.title || 'Chart legend');

    this.list.replaceChildren(...this.items.map(item => this.buildLegendItem(item)));
  }

  private buildLegendItem(item: LegendItem): HTMLLIElement {
    const isHidden = !(item.visible ?? true);
    const symbol = item.symbol || 'square';

    const li = document.createElement('li');
    li.className = 'legend-item';
    li.setAttribute('part', 'legend-item');
    if (isHidden) li.setAttribute('data-hidden', '');
    li.tabIndex = this.interactive ? 0 : -1;
    li.setAttribute('role', this.interactive ? 'button' : 'listitem');
    li.setAttribute('aria-label', `Legend item: ${item.label}${isHidden ? ' (hidden)' : ''}`);
    li.addEventListener('click', (e: Event) => this.handleItemClick(item, e));
    li.addEventListener('keydown', (e: KeyboardEvent) => this.handleItemKeyDown(item, e));

    const symbolEl = document.createElement('div');
    symbolEl.className = 'legend-symbol';
    symbolEl.setAttribute('part', 'legend-symbol');
    symbolEl.setAttribute('data-symbol', symbol);
    symbolEl.style.setProperty('--symbol-color', item.color);

    const labelEl = document.createElement('span');
    labelEl.className = 'legend-label';
    labelEl.setAttribute('part', 'legend-label');
    labelEl.textContent = item.label;

    li.append(symbolEl, labelEl);
    return li;
  }

  private handleItemClick(item: LegendItem, event: Event) {
    event.preventDefault();

    this.dispatchEvent(new CustomEvent('pp-legend-item-click', {
      detail: { item, originalEvent: event },
      bubbles: true,
      composed: true
    }));

    if (this.interactive) {
      this.toggleItem(item.id);
    }
  }

  private handleItemKeyDown(item: LegendItem, event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleItemClick(item, event);
    }
  }

  toggleItem(id: string) {
    const itemIndex = this.items.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    const updatedItems = [...this.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      visible: !(updatedItems[itemIndex].visible ?? true)
    };

    this.items = updatedItems;

    this.dispatchEvent(new CustomEvent('pp-legend-item-toggle', {
      detail: {
        item: updatedItems[itemIndex],
        visible: updatedItems[itemIndex].visible ?? true
      },
      bubbles: true,
      composed: true
    }));
  }

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

  getVisibilityState(): Record<string, boolean> {
    return this.items.reduce((state, item) => {
      state[item.id] = item.visible ?? true;
      return state;
    }, {} as Record<string, boolean>);
  }

  updateItems(items: LegendItem[]) {
    this.items = items;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-chart-legend': PpChartLegend;
  }
}
