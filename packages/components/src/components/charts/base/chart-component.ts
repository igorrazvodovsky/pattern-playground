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

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('mouseover', this.handleMouseOver);
    this.removeEventListener('mouseout', this.handleMouseOut);
    this.removeEventListener('click', this.handleClick);
  }

  protected handleMouseOver = (event: MouseEvent) => {
    if (this.disabled) return;

    this.dispatchEvent(new CustomEvent('pp-chart-hover', {
      detail: { originalEvent: event },
      bubbles: true,
      composed: true
    }));
  };

  protected handleMouseOut = (event: MouseEvent) => {
    if (this.disabled) return;

    this.dispatchEvent(new CustomEvent('pp-chart-hover-end', {
      detail: { originalEvent: event },
      bubbles: true,
      composed: true
    }));
  };

  protected handleClick = (event: MouseEvent) => {
    if (this.disabled) return;

    this.dispatchEvent(new CustomEvent('pp-chart-click', {
      detail: { originalEvent: event },
      bubbles: true,
      composed: true
    }));
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
