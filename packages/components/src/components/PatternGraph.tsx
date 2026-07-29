import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import graphData from '../pattern-graph.json' with { type: 'json' };
import activityLevels from '../activity-levels.json' with { type: 'json' };
import { normalisePatternPath, subscribePatternGraphHover } from './pattern-graph-hover';

interface NodeMeta {
  'activity-level': string;
  'lifecycle-stage': string | null;
  'atomic-category': string;
  'mediation': string | null;
}

const nodeMeta = activityLevels.nodes as Record<string, NodeMeta>;
interface GraphNodeData {
  id: string;
  title: string;
  category: string;
  path: string;
  seed?: boolean;
}

const graphNodes = graphData.nodes as GraphNodeData[];

interface GraphNode extends SimulationNodeDatum {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly path: string;
  readonly seed?: boolean;
  radius: number;
}

interface RenderedNode {
  id: string;
  title: string;
  category: string;
  path: string;
  x: number;
  y: number;
  radius: number;
  atLevel: string;
  lifecycleStage: string | null;
  atomicCategory: string;
  mediation: string | null;
  seed?: boolean;
}

type ColorMode = 'at-level' | 'mediation';

interface RenderedEdge {
  id: string;
  source: string;
  target: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: string;
  label?: string;
}

interface GraphEdgeData {
  source: string;
  target: string;
  type?: string;
  label?: string;
  incomingNote?: string;
}

const SVG_WIDTH = 900;
const SVG_HEIGHT = 600;
const EDGE_CURVATURE = 0.15;

function curvedEdgePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const cx = mx - (y2 - y1) * EDGE_CURVATURE;
  const cy = my + (x2 - x1) * EDGE_CURVATURE;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

const DEFAULT_TRAIL_LENGTH = 8;

const CATEGORY_TARGETS: Record<string, [number, number]> = {
  Operations:   [450, 120],
  Actions:      [680, 320],
  Activities:   [550, 520],
  Foundations:  [200, 200],
  Qualities:    [180, 460],
};


function buildGraph() {
  const allEdges = graphData.edges as GraphEdgeData[];
  const structuralEdges = allEdges.filter((edge) => edge.type !== 'recommends');
  const degrees = new Map<string, number>();
  for (const { source, target } of structuralEdges) {
    degrees.set(source, (degrees.get(source) ?? 0) + 1);
    degrees.set(target, (degrees.get(target) ?? 0) + 1);
  }

  const maxDegree = Math.max(...degrees.values(), 1);
  const radiusScale = scaleSqrt().domain([0, maxDegree]).range([4, 12]);

  const simNodes: GraphNode[] = graphNodes.map((n) => ({
    ...n,
    radius: radiusScale(degrees.get(n.id) ?? 0),
  }));

  const nodeById = new Map(simNodes.map((n) => [n.id, n]));

  type LayoutLink = {
    source: GraphNode | string;
    target: GraphNode | string;
  };
  const renderedGraphEdges = allEdges
    .filter((e) => nodeById.has(e.source) && nodeById.has(e.target))
    .map((e) => ({
      source: e.source,
      target: e.target,
      type: e.type ?? 'related',
      label: e.label ?? e.incomingNote,
    }));
  const layoutLinks: LayoutLink[] = renderedGraphEdges
    .filter((e) => e.type !== 'recommends')
    .map((e) => ({
      source: e.source,
      target: e.target,
    }));

  const linkForce = forceLink<GraphNode, SimulationLinkDatum<GraphNode>>(
    layoutLinks as SimulationLinkDatum<GraphNode>[]
  )
    .id((d) => d.id)
    .distance(80);

  forceSimulation<GraphNode>(simNodes)
    .force('link', linkForce)
    .force('charge', forceManyBody<GraphNode>().strength(-120))
    .force('center', forceCenter<GraphNode>(SVG_WIDTH / 2, SVG_HEIGHT / 2))
    .force('collide', forceCollide<GraphNode>().radius((d) => d.radius + 4))
    .force(
      'cx',
      forceX<GraphNode>(
        (d) => CATEGORY_TARGETS[d.category]?.[0] ?? SVG_WIDTH / 2
      ).strength(0.05)
    )
    .force(
      'cy',
      forceY<GraphNode>(
        (d) => CATEGORY_TARGETS[d.category]?.[1] ?? SVG_HEIGHT / 2
      ).strength(0.05)
    )
    .stop()
    .tick(300);

  const nodes: RenderedNode[] = simNodes.map((n) => {
    const meta = nodeMeta[n.id];
    return {
      id: n.id,
      title: n.title,
      category: n.category,
      path: n.path,
      x: n.x ?? SVG_WIDTH / 2,
      y: n.y ?? SVG_HEIGHT / 2,
      radius: n.radius,
      atLevel: meta?.['activity-level'] ?? 'cross-cutting',
      lifecycleStage: meta?.['lifecycle-stage'] ?? null,
      atomicCategory: meta?.['atomic-category'] ?? n.category.toLowerCase(),
      mediation: meta?.['mediation'] ?? null,
      seed: n.seed,
    };
  });

  const adjacency = new Map<string, Set<string>>();
  const edges: RenderedEdge[] = renderedGraphEdges.map((edge, i) => {
    const src = nodeById.get(edge.source)!;
    const tgt = nodeById.get(edge.target)!;
    if (!adjacency.has(src.id)) adjacency.set(src.id, new Set());
    if (!adjacency.has(tgt.id)) adjacency.set(tgt.id, new Set());
    adjacency.get(src.id)!.add(tgt.id);
    adjacency.get(tgt.id)!.add(src.id);
    return {
      id: String(i),
      source: src.id,
      target: tgt.id,
      x1: src.x ?? 0,
      y1: src.y ?? 0,
      x2: tgt.x ?? 0,
      y2: tgt.y ?? 0,
      type: edge.type,
      label: edge.label,
    };
  });

  const PAD = 20;
  const minX = Math.min(...nodes.map((n) => n.x - n.radius)) - PAD;
  const minY = Math.min(...nodes.map((n) => n.y - n.radius)) - PAD;
  const maxX = Math.max(...nodes.map((n) => n.x + n.radius)) + PAD;
  const maxY = Math.max(...nodes.map((n) => n.y + n.radius)) + PAD;
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  // Lets an outside hover (the sidebar) name a node by the link it already has.
  const idByPath = new Map(nodes.map((n) => [normalisePatternPath(n.path), n.id]));

  return { nodes, edges, viewBox, adjacency, idByPath };
}

interface PatternGraphProps {
  trailLength?: number;
}

export function PatternGraph({ trailLength = DEFAULT_TRAIL_LENGTH }: PatternGraphProps = {}) {
  const [graph] = useState(buildGraph);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [externalId, setExternalId] = useState<string | null>(null);
  const [trail, setTrail] = useState<string[]>([]);
  const [colorMode] = useState<ColorMode>('at-level');

  // Hovering a sidebar link highlights its node as if the pointer were on it.
  // Kept in its own slot so the two sources can't clear each other, and so a
  // sweep down the (dense) sidebar list doesn't flush the trail the way
  // handleNodeEnter would.
  useEffect(
    () =>
      subscribePatternGraphHover(({ path }) => {
        setExternalId(path ? (graph.idByPath.get(normalisePatternPath(path)) ?? null) : null);
      }),
    [graph.idByPath]
  );

  // The pointer can only be in one place, but a stale leave from either source
  // shouldn't cancel the other — so own hover simply wins while it lasts.
  const activeId = hoveredId ?? externalId;

  const neighbors = activeId ? (graph.adjacency.get(activeId) ?? new Set<string>()) : null;
  const trailSet = useMemo(() => new Set(trail), [trail]);

  // Trail nodes reachable from the hovered node by hopping only through other visited nodes.
  const reachableTrailSet = useMemo(() => {
    const reachable = new Set<string>();
    if (!activeId) return reachable;
    const queue = [activeId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const neighborId of graph.adjacency.get(current) ?? []) {
        if (trailSet.has(neighborId) && neighborId !== activeId && !reachable.has(neighborId)) {
          reachable.add(neighborId);
          queue.push(neighborId);
        }
      }
    }
    return reachable;
  }, [activeId, trailSet, graph.adjacency]);

  const handleNodeEnter = useCallback((id: string) => {
    setHoveredId(id);
    setTrail((prev) => {
      if (prev[prev.length - 1] === id) return prev;
      const next = prev.filter((existingId) => existingId !== id);
      next.push(id);
      return next.length > trailLength ? next.slice(next.length - trailLength) : next;
    });
  }, [trailLength]);

  const nodeClass = (id: string) => {
    const classes = ['pattern-graph__node'];
    if (id === activeId) {
      classes.push('pattern-graph__node--active');
    } else if (neighbors?.has(id)) {
      classes.push('pattern-graph__node--neighbor');
    } else if (reachableTrailSet.has(id)) {
      classes.push('pattern-graph__node--trail');
    } else if (activeId) {
      classes.push('pattern-graph__node--dimmed');
    }
    return classes.join(' ');
  };

  const edgeClass = (edge: RenderedEdge) => {
    const classes = ['pattern-graph__edge'];
    if (edge.source === activeId || edge.target === activeId) {
      classes.push('pattern-graph__edge--active');
    } else if (reachableTrailSet.has(edge.source) && reachableTrailSet.has(edge.target)) {
      classes.push('pattern-graph__edge--trail');
    } else if (activeId) {
      classes.push('pattern-graph__edge--dimmed');
    }
    return classes.join(' ');
  };

  const svgClass = [
    'pattern-graph__svg',
    activeId ? 'pattern-graph__svg--hovering' : '',
  ].filter(Boolean).join(' ');

  const handleNodeActivate = useCallback((path: string) => {
    window.parent.location.href = path;
  }, []);

  return (
    <div className="pattern-graph">
      <svg
        className={svgClass}
        viewBox={graph.viewBox}
        role="img"
        aria-label="Force-directed graph of design system patterns and their relationships"
        data-color-mode={colorMode}
      >
        <g>
          {graph.edges.map((edge) => (
            <path
              key={edge.id}
              className={edgeClass(edge)}
              data-edge-type={edge.type}
              d={curvedEdgePath(edge.x1, edge.y1, edge.x2, edge.y2)}
            />
          ))}
          {graph.nodes.map((node) => (
            <g
              key={node.id}
              className={nodeClass(node.id)}
              transform={`translate(${node.x},${node.y})`}
              role="link"
              aria-label={`${node.title} (${node.category})${node.seed ? ', seed' : ''}`}
              tabIndex={0}
              data-seed={node.seed ? '' : undefined}
              data-category={node.category}
              data-at-level={node.atLevel}
              data-lifecycle-stage={node.lifecycleStage ?? undefined}
              data-atomic-category={node.atomicCategory}
              data-mediation={node.mediation ?? undefined}
              onMouseEnter={() => handleNodeEnter(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleNodeActivate(node.path)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNodeActivate(node.path);
                }
              }}
            >
              <circle className="pattern-graph__circle" r={node.radius} />
              <text className="pattern-graph__label" x={node.radius + 3} dominantBaseline="middle">
                {node.title}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
