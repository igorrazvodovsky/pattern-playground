import { Elena } from '@elenajs/core';

/** The shape Elena accepts in `static props`. */
export type ElenaProp = string | { name: string; reflect?: boolean };

/** The fixed viewBox every chart in the family draws into. */
export const VIEWBOX_WIDTH = 600;
export const VIEWBOX_HEIGHT = 300;

/**
 * Base D3 host that provides the shared SVG container and responsive sizing
 * for all chart components.
 *
 * Elena supplies props and lifecycle only — there is no template. The SVG
 * scaffold is built imperatively once on connect, and from then on D3 owns
 * everything inside it outright. Reactive prop changes land in `updated()`,
 * which redraws by calling `renderD3Content()` (clear + redraw, idempotent).
 */
export abstract class D3Component extends Elena(HTMLElement) {
  static props: ElenaProp[] = [
    'width',
    'height',
    { name: 'margin', reflect: false },
  ];

  width = 0;
  height = 0;
  margin = { top: 20, right: 20, bottom: 20, left: 40 };

  protected svg!: SVGSVGElement;
  protected contentGroup!: SVGGElement;
  protected resizeObserver?: ResizeObserver;

  connectedCallback() {
    super.connectedCallback();
    this.ensureScaffold();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {
    if (typeof ResizeObserver !== 'undefined' && !this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.updateDimensions());
    }
    this.resizeObserver?.observe(this);
    this.updateDimensions();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  /** Build the SVG container once; survives reconnects. */
  private ensureScaffold() {
    if (this.svg) return;
    const NS = 'http://www.w3.org/2000/svg';

    const container = document.createElement('div');
    container.className = 'pp-d3-component d3-container';

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'd3-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-labelledby', 'chart-title');
    svg.setAttribute('viewBox', `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);

    const title = document.createElementNS(NS, 'title');
    title.id = 'chart-title';
    title.textContent = 'Data visualization chart';

    const content = document.createElementNS(NS, 'g');
    content.setAttribute('class', 'd3-content');

    svg.append(title, content);
    container.append(svg);
    this.append(container);

    this.svg = svg;
    this.contentGroup = content;
  }

  protected updateDimensions() {
    const rect = this.getBoundingClientRect();

    if (rect.width > 0 && rect.height > 0) {
      this.width = rect.width;
      this.height = rect.height;
    } else {
      const computedStyle = getComputedStyle(this);
      const cssWidth = parseInt(computedStyle.width, 10);
      const cssHeight = parseInt(computedStyle.height, 10);

      this.width = cssWidth > 0 ? cssWidth : 800;
      this.height = cssHeight > 0 ? cssHeight : 400;
    }
  }

  /** Inner dimensions accounting for margins. */
  protected getInnerDimensions() {
    return {
      width: Math.max(0, this.width - this.margin.left - this.margin.right),
      height: Math.max(0, this.height - this.margin.top - this.margin.bottom),
    };
  }

  /** Update the accessible name: the SVG `<title>` and the host's aria-label. */
  protected setChartLabel(label: string) {
    const title = this.svg?.querySelector('title');
    if (title) title.textContent = label;
    this.setAttribute('aria-label', label);
  }

  /** Subclasses draw their D3 content into `contentGroup` here. */
  protected abstract renderD3Content(): void;

  updated() {
    if (!this.contentGroup) return;
    if (this.width === 0 || this.height === 0) {
      this.updateDimensions();
    }
    this.contentGroup.setAttribute(
      'transform',
      `translate(${this.margin.left}, ${this.margin.top})`,
    );
    this.renderD3Content();
  }
}
