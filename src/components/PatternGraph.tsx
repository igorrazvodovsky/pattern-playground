import React, { useState, useCallback } from 'react';
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
import activityLevels from '../stories/data/activity-levels.json' with { type: 'json' };

interface NodeMeta {
  'activity-level': string;
  'lifecycle-stage': string | null;
  'atomic-category': string;
}

const nodeMeta = activityLevels.nodes as Record<string, NodeMeta>;

interface GraphNode extends SimulationNodeDatum {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly path: string;
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
}

interface RenderedEdge {
  id: string;
  source: string;
  target: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const SVG_WIDTH = 900;
const SVG_HEIGHT = 600;

const CATEGORY_TARGETS: Record<string, [number, number]> = {
  Operations:   [450, 120],
  Actions:      [680, 320],
  Activities:   [550, 520],
  Foundations:  [200, 200],
  Qualities:    [180, 460],
};


function buildGraph() {
  const degrees = new Map<string, number>();
  for (const { source, target } of graphData.edges) {
    degrees.set(source, (degrees.get(source) ?? 0) + 1);
    degrees.set(target, (degrees.get(target) ?? 0) + 1);
  }

  const maxDegree = Math.max(...degrees.values(), 1);
  const radiusScale = scaleSqrt().domain([0, maxDegree]).range([4, 12]);

  const simNodes: GraphNode[] = graphData.nodes.map((n) => ({
    ...n,
    radius: radiusScale(degrees.get(n.id) ?? 0),
  }));

  const nodeById = new Map(simNodes.map((n) => [n.id, n]));

  type RawLink = { source: GraphNode | string; target: GraphNode | string };
  const simLinks: RawLink[] = graphData.edges
    .filter((e) => nodeById.has(e.source) && nodeById.has(e.target))
    .map((e) => ({ source: e.source, target: e.target }));

  const linkForce = forceLink<GraphNode, SimulationLinkDatum<GraphNode>>(
    simLinks as SimulationLinkDatum<GraphNode>[]
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
    };
  });

  const adjacency = new Map<string, Set<string>>();
  const edges: RenderedEdge[] = simLinks.map((link, i) => {
    const src = link.source as GraphNode;
    const tgt = link.target as GraphNode;
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
    };
  });

  const PAD = 20;
  const minX = Math.min(...nodes.map((n) => n.x - n.radius)) - PAD;
  const minY = Math.min(...nodes.map((n) => n.y - n.radius)) - PAD;
  const maxX = Math.max(...nodes.map((n) => n.x + n.radius)) + PAD;
  const maxY = Math.max(...nodes.map((n) => n.y + n.radius)) + PAD;
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  return { nodes, edges, viewBox, adjacency };
}

export function PatternGraph() {
  const [graph] = useState(buildGraph);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const neighbors = hoveredId ? (graph.adjacency.get(hoveredId) ?? new Set<string>()) : null;

  const nodeClass = (id: string) => {
    if (!hoveredId) return 'pattern-graph__node';
    if (id === hoveredId) return 'pattern-graph__node pattern-graph__node--active';
    if (neighbors?.has(id)) return 'pattern-graph__node pattern-graph__node--neighbor';
    return 'pattern-graph__node pattern-graph__node--dimmed';
  };

  const edgeClass = (edge: RenderedEdge) => {
    if (!hoveredId) return 'pattern-graph__edge';
    if (edge.source === hoveredId || edge.target === hoveredId) return 'pattern-graph__edge pattern-graph__edge--active';
    return 'pattern-graph__edge pattern-graph__edge--dimmed';
  };

  const svgClass = [
    'pattern-graph__svg',
    hoveredId ? 'pattern-graph__svg--hovering' : '',
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
      >
        <g>
          {graph.edges.map((edge) => (
            <line
              key={edge.id}
              className={edgeClass(edge)}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
            />
          ))}
          {graph.nodes.map((node) => (
            <g
              key={node.id}
              className={nodeClass(node.id)}
              transform={`translate(${node.x},${node.y})`}
              role="link"
              aria-label={`${node.title} (${node.category})`}
              tabIndex={0}
              data-category={node.category}
              data-at-level={node.atLevel}
              data-lifecycle-stage={node.lifecycleStage ?? undefined}
              data-atomic-category={node.atomicCategory}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleNodeActivate(node.path)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  window.parent.location.href = node.path;
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
