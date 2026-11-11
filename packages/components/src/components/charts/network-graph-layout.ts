// The force layout behind pp-network-graph, kept free of the DOM so a page
// can run it at build time: d3-force is seeded deterministically, so the
// server and the browser settle the same data into the same picture. A
// page that knows the viewBox ahead of time can reserve the drawing's box
// before the element upgrades.

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
import type { NetworkGraphData, NetworkGraphNode, NetworkGraphEdge } from './base/chart-types.js';

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

export interface LaidOutNode {
  node: NetworkGraphNode;
  x: number;
  y: number;
  radius: number;
  degree: number;
  categoryIndex?: number;
}

export interface LaidOutEdge {
  edge: NetworkGraphEdge;
  path: string;
}

export interface Layout {
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

export function layoutNetworkGraph(
  data: NetworkGraphData,
  anchors: Record<string, [number, number]>,
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
        .distance(80),
    )
    .force('charge', forceManyBody<SimNode>().strength(-120))
    .force('center', forceCenter<SimNode>(LAYOUT_WIDTH / 2, LAYOUT_HEIGHT / 2))
    .force(
      'collide',
      forceCollide<SimNode>().radius((d) => d.radius + 4),
    )
    .force(
      'cx',
      forceX<SimNode>((d) => anchors[d.node.category ?? '']?.[0] ?? LAYOUT_WIDTH / 2).strength(
        0.05,
      ),
    )
    .force(
      'cy',
      forceY<SimNode>((d) => anchors[d.node.category ?? '']?.[1] ?? LAYOUT_HEIGHT / 2).strength(
        0.05,
      ),
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
