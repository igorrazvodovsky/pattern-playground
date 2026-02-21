import React, { useRef, useState, useCallback } from 'react';
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

interface Transform {
  x: number;
  y: number;
  scale: number;
}

const SVG_WIDTH = 900;
const SVG_HEIGHT = 600;
const INITIAL_TRANSFORM: Transform = { x: 0, y: 0, scale: 1 };

const CATEGORY_TARGETS: Record<string, [number, number]> = {
  Foundations:        [190, 300],
  Primitives:         [340, 140],
  Components:         [580, 155],
  Compositions:       [730, 310],
  Patterns:           [600, 490],
  Qualities:          [290, 490],
  'Data Visualisation': [135, 430],
  'Visual Elements':  [145, 175],
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

  const nodes: RenderedNode[] = simNodes.map((n) => ({
    id: n.id,
    title: n.title,
    category: n.category,
    path: n.path,
    x: n.x ?? SVG_WIDTH / 2,
    y: n.y ?? SVG_HEIGHT / 2,
    radius: n.radius,
  }));

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
  const [transform, setTransform] = useState<Transform>(INITIAL_TRANSFORM);
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);
  const hasDragged = useRef(false);

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

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const t = transformRef.current;
    dragRef.current = { startX: e.clientX, startY: e.clientY, tx: t.x, ty: t.y };
    hasDragged.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (!hasDragged.current && Math.hypot(dx, dy) > 3) {
      hasDragged.current = true;
    }
    if (hasDragged.current) {
      setTransform((t) => ({ ...t, x: dragRef.current!.tx + dx, y: dragRef.current!.ty + dy }));
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleDoubleClick = useCallback(() => {
    setTransform(INITIAL_TRANSFORM);
  }, []);

  const handleNodeActivate = useCallback((path: string) => {
    if (!hasDragged.current) {
      window.parent.location.href = path;
    }
  }, []);

  return (
    <div className="pattern-graph">
      <svg
        className={`pattern-graph__svg${hoveredId ? ' pattern-graph__svg--hovering' : ''}`}
        viewBox={graph.viewBox}
        role="img"
        aria-label="Force-directed graph of design system patterns and their relationships"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
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
