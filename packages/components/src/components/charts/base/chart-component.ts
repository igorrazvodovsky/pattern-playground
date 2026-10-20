import { D3Component, type ElenaProp } from './d3-component.js';
import type { ScaleLinear, ScaleBand, ScaleTime } from 'd3-scale';

/**
 * Base class for chart components: shared props (data, title, loading,
 * disabled), host-level hover/click events, the screen-reader data summary,
 * and the render pipeline (validate → set up scales → render).
 */
export abstract class ChartComponent extends D3Component {
  static props: ElenaProp[] = [
    ...D3Component.props,
    { name: 'data', reflect: false },
    'title',
    'loading',
    'disabled',
  ];

  data: unknown = [];
  declare title: string;
  loading = false;
  disabled = false;

  protected xScale?: ScaleLinear<number, number> | ScaleBand<string> | ScaleTime<number, number>;
  protected yScale?: ScaleLinear<number, number> | ScaleBand<string>;

  /**
   * Spoken name for charts read item by item ("Bar chart"). When set, the host
   * becomes a focusable image whose arrow keys, Home and End move through
   * `itemCount()` items and Enter or Space activates one. Charts that focus
   * their own marks (the network graph) leave it unset.
   */
  protected itemNavigationName?: string;
  protected focusedIndex = 0;

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
    this.addEventListener('mouseover', this.handleMouseOver);
    this.addEventListener('mouseout', this.handleMouseOut);
    this.addEventListener('click', this.handleClick);
  }

  connectedCallback() {
    super.connectedCallback();
    const name = this.itemNavigationName;
    if (!name) return;
    if (document.readyState !== 'loading') {
      this.initItemNavigation(name);
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.initItemNavigation(name));
  }

  private initItemNavigation(name: string) {
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'img');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', this.title || name);
    }
    this.addEventListener('keydown', this.handleItemKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('mouseover', this.handleMouseOver);
    this.removeEventListener('mouseout', this.handleMouseOut);
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleItemKeydown);
  }

  /** Number of items the keyboard moves through. */
  protected itemCount(): number {
    return 0;
  }

  /** Short spoken description of one item, announced when it takes focus. */
  protected describeItem(_index: number): string {
    return '';
  }

  /** Enter or Space on the focused item. */
  protected activateItem(_index: number, _event: KeyboardEvent): void {}

  /** Runs after an item takes keyboard focus. */
  protected onItemFocus(_index: number): void {}

  private focusItem(index: number): void {
    if (index < 0 || index >= this.itemCount()) return;
    this.focusedIndex = index;
    this.setAttribute('aria-live', 'polite');
    this.setAttribute(
      'aria-label',
      `${this.itemNavigationName}. Current: ${this.describeItem(index)}. Use arrow keys to navigate.`,
    );
    this.onItemFocus(index);
  }

  private handleItemKeydown = (event: KeyboardEvent): void => {
    if (!this.validateData()) return;
    const last = this.itemCount() - 1;
    if (last < 0) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.focusItem(Math.min(this.focusedIndex + 1, last));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.focusItem(Math.max(this.focusedIndex - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        this.focusItem(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusItem(last);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.focusedIndex <= last) this.activateItem(this.focusedIndex, event);
        break;
    }
  };

  protected handleMouseOver = (event: MouseEvent) => {
    if (this.disabled) return;

    this.dispatchEvent(
      new CustomEvent('pp-chart-hover', {
        detail: { originalEvent: event },
        bubbles: true,
        composed: true,
      }),
    );
  };

  protected handleMouseOut = (event: MouseEvent) => {
    if (this.disabled) return;

    this.dispatchEvent(
      new CustomEvent('pp-chart-hover-end', {
        detail: { originalEvent: event },
        bubbles: true,
        composed: true,
      }),
    );
  };

  protected handleClick = (event: MouseEvent) => {
    if (this.disabled) return;

    this.dispatchEvent(
      new CustomEvent('pp-chart-click', {
        detail: { originalEvent: event },
        bubbles: true,
        composed: true,
      }),
    );
  };

  protected validateData(): boolean {
    return Array.isArray(this.data);
  }

  protected transformData(): unknown {
    return this.data;
  }

  protected abstract setupScales(): void;

  protected clearChart() {
    if (this.contentGroup) {
      while (this.contentGroup.firstChild) {
        this.contentGroup.removeChild(this.contentGroup.firstChild);
      }
    }
  }

  /**
   * Rebuild the screen-reader data summary (a plain DOM sibling of the SVG).
   */
  protected syncDataTable(rows: Array<Array<string | number>>, label = 'Chart data') {
    let table = this.querySelector<HTMLElement>(':scope > .visually-hidden');
    if (!table) {
      table = document.createElement('div');
      table.className = 'visually-hidden';
      table.setAttribute('role', 'table');
      this.append(table);
    }
    table.setAttribute('aria-label', label);

    const group = document.createElement('div');
    group.setAttribute('role', 'rowgroup');
    for (const row of rows) {
      const rowEl = document.createElement('div');
      rowEl.setAttribute('role', 'row');
      for (const cell of row) {
        const cellEl = document.createElement('span');
        cellEl.setAttribute('role', 'cell');
        cellEl.textContent = String(cell);
        rowEl.append(cellEl);
      }
      group.append(rowEl);
    }
    table.replaceChildren(group);
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

  protected abstract renderChart(): void;
}
