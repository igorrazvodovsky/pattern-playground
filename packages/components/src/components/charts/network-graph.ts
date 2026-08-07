/**
 * Network Graph Web Component
 *
 * A component drawing a force-directed node-link view — the relational branch
 * of the chart territory. Nodes are sized by connectedness; hovering a node lifts
 * its neighbourhood out of the whole, and a trail of recently visited nodes
 * stays legible while it connects back to the one under the pointer.
 *
 * The layout runs to completion up front (no animation): d3-force is seeded
 * deterministically, so the same data always settles into the same picture.
 * Unlike the cartesian charts, the drawing does not fit the family's fixed
 * 600×300 viewBox — a force layout's aspect is data-driven, so the simulation
 * runs in its own layout space and the viewBox is fitted to the settled extent.
 *
 * @example
 * ```html
 * <pp-network-graph trail-length="8"></pp-network-graph>
 * ```
 */

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
} from 'd3-force';
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import { scaleSqrt } from 'd3-scale';
import { ChartComponent } from './base/chart-component.js';
import type { ElenaProp } from './base/d3-component.js';
import type { NetworkGraphData, NetworkGraphNode, NetworkGraphEdge } from './base/chart-types.js';
import { isNetworkGraphData } from './base/chart-types.js';

/** The space the simulation settles in; the viewBox then fits the result. */
const LAYOUT_WIDTH = 900;
const LAYOUT_HEIGHT = 600;
const EDGE_CURVATURE = 0.15;
const VIEWBOX_PAD = 20;
/** Wraps onto the eight-hue categorical palette (see charts.css). */
const CATEGORY_COLOURS = 8;

interface SimNode extends SimulationNodeDatum {
  readonly node: NetworkGraphNode;
  radius: number;
}

interface LaidOutNode {
  node: NetworkGraphNode;
  x: number;
  y: number;
  radius: number;
  degree: number;
  categoryIndex?: number;
}

interface LaidOutEdge {
  edge: NetworkGraphEdge;
  path: string;
}

interface Layout {
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
  viewBox: string;
  adjacency: Map<string, Set<string>>;
}

function curvedEdgePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const cx = mx - (y2 - y1) * EDGE_CURVATURE;
  const cy = my + (x2 - x1) * EDGE_CURVATURE;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

export class NetworkGraph extends ChartComponent {
  static tagName = 'pp-network-graph';

  static props: ElenaProp[] = [
    ...ChartComponent.props,
    'trail-length',
    { name: 'anchors', reflect: false },
  ];

  data: NetworkGraphData = { nodes: [], edges: [] };
  /** How many recently visited nodes the trail keeps; 0 disables it. */
  'trail-length' = 8;
  /**
   * Optional category → [x, y] targets in layout space (900×600) that gently
   * pull each category's nodes toward a home region, so the families of a
   * mixed graph settle into recognisable neighbourhoods.
   */
  anchors: Record<string, [number, number]> = {};

  // The viewBox absorbs container resizes, so margins have no meaning here.
  margin = { top: 0, right: 0, bottom: 0, left: 0 };

  // Layout is cached by data/anchors identity: prop changes that don't touch
  // either (width/height from the ResizeObserver, trail-length) must not
  // re-run the simulation or rebuild the DOM.
  private layout?: Layout;
  private layoutData?: NetworkGraphData;
  private layoutAnchors?: Record<string, [number, number]>;
  private builtLayout?: Layout;

  // Hover state lives outside Elena's reactive cycle — highlighting toggles
  // classes on the existing DOM, never re-renders it.
  private hoveredId: string | null = null;
  // An outside pointer (e.g. a linked list of the same items) gets its own
  // slot so the two sources can't clear each other; own hover wins meanwhile.
  private externalId: string | null = null;
  private trail: string[] = [];
  private nodeEls = new Map<string, SVGGElement>();
  private edgeEls: Array<{ el: SVGPathElement; source: string; target: string }> = [];

  connectedCallback() {
    super.connectedCallback();
    this.svg.classList.add('network-graph__svg');
    this.svg.parentElement?.classList.add('network-graph');
    // The scaffold's role="img" would flatten descendants to presentation,
    // but the nodes are real keyboard-reachable controls — this is a group.
    this.svg.setAttribute('role', 'group');
  }

  protected validateData(): boolean {
    return isNetworkGraphData(this.data) && this.data.nodes.length > 0;
  }

  protected setupScales(): void {
    // no-op — a network graph has no cartesian scales
  }

  protected renderD3Content(): void {
    if (!this.validateData() || this.loading) {
      this.clearChart();
      this.builtLayout = undefined;
      return;
    }
    if (this.layoutData !== this.data || this.layoutAnchors !== this.anchors) {
      this.layout = this.computeLayout(this.data, this.anchors);
      this.layoutData = this.data;
      this.layoutAnchors = this.anchors;
    }
    // A resize only rescales the (already fitted) viewBox — skip the rebuild
    // so hover state survives.
    if (this.builtLayout === this.layout) return;
    this.clearChart();
    this.renderChart();
    this.builtLayout = this.layout;
  }

  private computeLayout(
    data: NetworkGraphData,
    anchors: Record<string, [number, number]>
  ): Layout {
    const layoutEdges = data.edges.filter((e) => e.layout !== false);
    const degrees = new Map<string, number>();
    for (const { source, target } of layoutEdges) {
      degrees.set(source, (degrees.get(source) ?? 0) + 1);
      degrees.set(target, (degrees.get(target) ?? 0) + 1);
    }

    const maxDegree = Math.max(...degrees.values(), 1);
    const radiusScale = scaleSqrt().domain([0, maxDegree]).range([4, 12]);

    const simNodes: SimNode[] = data.nodes.map((node) => ({
      node,
      radius: radiusScale(degrees.get(node.id) ?? 0),
    }));
    const simNodeById = new Map(simNodes.map((n) => [n.node.id, n]));

    const links: SimulationLinkDatum<SimNode>[] = layoutEdges
      .filter((e) => simNodeById.has(e.source) && simNodeById.has(e.target))
      .map((e) => ({ source: e.source, target: e.target }));

    forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        forceLink<SimNode, SimulationLinkDatum<SimNode>>(links)
          .id((d) => d.node.id)
          .distance(80)
      )
      .force('charge', forceManyBody<SimNode>().strength(-120))
      .force('center', forceCenter<SimNode>(LAYOUT_WIDTH / 2, LAYOUT_HEIGHT / 2))
      .force('collide', forceCollide<SimNode>().radius((d) => d.radius + 4))
      .force(
        'cx',
        forceX<SimNode>((d) => anchors[d.node.category ?? '']?.[0] ?? LAYOUT_WIDTH / 2).strength(0.05)
      )
      .force(
        'cy',
        forceY<SimNode>((d) => anchors[d.node.category ?? '']?.[1] ?? LAYOUT_HEIGHT / 2).strength(0.05)
      )
      .stop()
      .tick(300);

    const categoryIndexByName = new Map<string, number>();
    for (const { node } of simNodes) {
      if (node.category && !categoryIndexByName.has(node.category)) {
        categoryIndexByName.set(node.category, (categoryIndexByName.size % CATEGORY_COLOURS) + 1);
      }
    }

    const nodes: LaidOutNode[] = simNodes.map((n) => ({
      node: n.node,
      x: n.x ?? LAYOUT_WIDTH / 2,
      y: n.y ?? LAYOUT_HEIGHT / 2,
      radius: n.radius,
      degree: degrees.get(n.node.id) ?? 0,
      categoryIndex: n.node.category ? categoryIndexByName.get(n.node.category) : undefined,
    }));
    const laidOutById = new Map(nodes.map((n) => [n.node.id, n]));

    // Adjacency counts every drawn edge, including layout-excluded ones —
    // "neighbour" is about relationships, not about what pulled the layout.
    const adjacency = new Map<string, Set<string>>();
    const edges: LaidOutEdge[] = [];
    for (const edge of data.edges) {
      const src = laidOutById.get(edge.source);
      const tgt = laidOutById.get(edge.target);
      if (!src || !tgt) continue;
      if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set());
      if (!adjacency.has(edge.target)) adjacency.set(edge.target, new Set());
      adjacency.get(edge.source)!.add(edge.target);
      adjacency.get(edge.target)!.add(edge.source);
      edges.push({ edge, path: curvedEdgePath(src.x, src.y, tgt.x, tgt.y) });
    }

    const minX = Math.min(...nodes.map((n) => n.x - n.radius)) - VIEWBOX_PAD;
    const minY = Math.min(...nodes.map((n) => n.y - n.radius)) - VIEWBOX_PAD;
    const maxX = Math.max(...nodes.map((n) => n.x + n.radius)) + VIEWBOX_PAD;
    const maxY = Math.max(...nodes.map((n) => n.y + n.radius)) + VIEWBOX_PAD;

    return {
      nodes,
      edges,
      viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
      adjacency,
    };
  }

  protected renderChart(): void {
    const layout = this.layout;
    if (!layout) return;
    const NS = 'http://www.w3.org/2000/svg';

    this.svg.setAttribute('viewBox', layout.viewBox);
    this.nodeEls = new Map();
    this.edgeEls = [];
    this.hoveredId = null;
    this.trail = [];

    for (const { edge, path } of layout.edges) {
      const el = document.createElementNS(NS, 'path');
      el.setAttribute('class', 'network-graph__edge');
      el.setAttribute('d', path);
      if (edge.type) el.dataset.edgeType = edge.type;
      this.contentGroup.append(el);
      this.edgeEls.push({ el, source: edge.source, target: edge.target });
    }

    for (const laid of layout.nodes) {
      const { node } = laid;
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'network-graph__node');
      g.setAttribute('transform', `translate(${laid.x},${laid.y})`);
      g.setAttribute('role', node.href ? 'link' : 'button');
      g.setAttribute('aria-label', node.category ? `${node.label} (${node.category})` : node.label);
      g.setAttribute('tabindex', '0');
      g.dataset.id = node.id;
      if (node.category) g.dataset.category = node.category;
      if (laid.categoryIndex) g.dataset.categoryIndex = String(laid.categoryIndex);
      for (const [key, value] of Object.entries(node.attrs ?? {})) {
        g.setAttribute(`data-${key}`, value);
      }

      g.addEventListener('mouseenter', () => this.handleNodeEnter(node));
      g.addEventListener('mouseleave', () => this.handleNodeLeave(node));
      g.addEventListener('click', (event) => this.handleNodeActivate(node, event));
      g.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.handleNodeActivate(node, event);
        }
      });

      const circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('class', 'network-graph__circle');
      circle.setAttribute('r', String(laid.radius));

      const label = document.createElementNS(NS, 'text');
      label.setAttribute('class', 'network-graph__label');
      label.setAttribute('x', String(laid.radius + 3));
      label.setAttribute('dominant-baseline', 'middle');
      label.textContent = node.label;

      g.append(circle, label);
      this.contentGroup.append(g);
      this.nodeEls.set(node.id, g);
    }

    this.applyHighlight();
    this.setChartLabel(
      this.title || `Network graph of ${layout.nodes.length} items and ${layout.edges.length} relationships`
    );
    this.syncDataTable(
      layout.nodes.map((n) => [n.node.label, n.node.category ?? '', n.degree]),
      this.title || 'Network graph data'
    );
  }

  /**
   * Highlight a node as if the pointer were on it, from outside the graph —
   * e.g. hovering the same item in an adjacent list. Own hover wins while it
   * lasts; pass null to clear. Doesn't touch the trail, so sweeping down a
   * dense outside list can't flush it.
   */
  setExternalHighlight(id: string | null): void {
    this.externalId = id;
    this.applyHighlight();
  }

  private handleNodeEnter(node: NetworkGraphNode): void {
    this.hoveredId = node.id;
    const max = this['trail-length'];
    if (max > 0 && this.trail[this.trail.length - 1] !== node.id) {
      this.trail = this.trail.filter((id) => id !== node.id);
      this.trail.push(node.id);
      if (this.trail.length > max) this.trail = this.trail.slice(this.trail.length - max);
    }
    this.applyHighlight();
    this.dispatchEvent(new CustomEvent('pp-node-hover', {
      detail: { node },
      bubbles: true,
      composed: true,
    }));
  }

  private handleNodeLeave(node: NetworkGraphNode): void {
    this.hoveredId = null;
    this.applyHighlight();
    this.dispatchEvent(new CustomEvent('pp-node-hover-end', {
      detail: { node },
      bubbles: true,
      composed: true,
    }));
  }

  private handleNodeActivate(node: NetworkGraphNode, originalEvent: Event): void {
    this.dispatchEvent(new CustomEvent('pp-node-click', {
      detail: { node, originalEvent },
      bubbles: true,
      composed: true,
    }));
  }

  /** Trail nodes reachable from the active node by hopping only through other visited nodes. */
  private reachableTrail(activeId: string, adjacency: Map<string, Set<string>>): Set<string> {
    const trailSet = new Set(this.trail);
    const reachable = new Set<string>();
    const queue = [activeId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const neighborId of adjacency.get(current) ?? []) {
        if (trailSet.has(neighborId) && neighborId !== activeId && !reachable.has(neighborId)) {
          reachable.add(neighborId);
          queue.push(neighborId);
        }
      }
    }
    return reachable;
  }

  private applyHighlight(): void {
    const layout = this.layout;
    if (!layout || this.nodeEls.size === 0) return;

    const activeId = this.hoveredId ?? this.externalId;
    const neighbors = activeId ? (layout.adjacency.get(activeId) ?? new Set<string>()) : null;
    const reachable = activeId ? this.reachableTrail(activeId, layout.adjacency) : new Set<string>();

    this.svg.classList.toggle('network-graph__svg--hovering', activeId !== null);

    for (const [id, el] of this.nodeEls) {
      const classes = ['network-graph__node'];
      if (id === activeId) {
        classes.push('network-graph__node--active');
      } else if (neighbors?.has(id)) {
        classes.push('network-graph__node--neighbor');
      } else if (reachable.has(id)) {
        classes.push('network-graph__node--trail');
      } else if (activeId) {
        classes.push('network-graph__node--dimmed');
      }
      el.setAttribute('class', classes.join(' '));
    }

    for (const { el, source, target } of this.edgeEls) {
      const classes = ['network-graph__edge'];
      if (source === activeId || target === activeId) {
        classes.push('network-graph__edge--active');
      } else if (reachable.has(source) && reachable.has(target)) {
        classes.push('network-graph__edge--trail');
      } else if (activeId) {
        classes.push('network-graph__edge--dimmed');
      }
      el.setAttribute('class', classes.join(' '));
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-network-graph': NetworkGraph;
  }
}
