// The pattern site's graph as pp-network-graph data: which JSON the nodes
// come from, which meta becomes a styling hook, which edge type is
// commentary rather than structure, and where each family sits on the
// canvas. Free of the DOM, so the home page can also lay the graph out at
// build time and reserve its box.

import graphData from '../data/pattern-graph.json' with { type: 'json' };
import activityLevels from '../data/activity-levels.json' with { type: 'json' };
import type { NetworkGraphData, NetworkGraphNode } from '@components/charts/base/chart-types';

interface NodeMeta {
  'activity-level': string;
  'lifecycle-stage': string | null;
  'mediation': string | null;
}

interface GraphNodeData {
  id: string;
  title: string;
  category: string;
  path: string;
  seed?: boolean;
}

interface GraphEdgeData {
  source: string;
  target: string;
  type?: string;
  label?: string;
  incomingNote?: string;
}

const nodeMeta = activityLevels.nodes as Record<string, NodeMeta>;

/**
 * Home regions in the simulation's 900×600 layout space, so the five families
 * settle into recognisable neighbourhoods instead of one undifferentiated ball.
 */
export const CATEGORY_ANCHORS: Record<string, [number, number]> = {
  Operations: [450, 120],
  Actions: [680, 320],
  Activities: [550, 520],
  Foundations: [200, 200],
  Qualities: [180, 460],
};

export function buildData(): NetworkGraphData {
  const nodes: NetworkGraphNode[] = (graphData.nodes as GraphNodeData[]).map((n) => {
    const meta = nodeMeta[n.id];
    // Absent, not empty: pattern-graph.css keys off `:not([data-mediation])`
    // and `[data-seed]`, so a null must leave no attribute behind.
    const attrs: Record<string, string> = {
      'at-level': meta?.['activity-level'] ?? 'cross-cutting',
    };
    if (meta?.['lifecycle-stage']) attrs['lifecycle-stage'] = meta['lifecycle-stage'];
    if (meta?.mediation) attrs['mediation'] = meta.mediation;
    if (n.seed) attrs['seed'] = '';

    return { id: n.id, label: n.title, category: n.category, href: n.path, attrs };
  });

  const known = new Set(nodes.map((n) => n.id));
  const edges = (graphData.edges as GraphEdgeData[])
    .filter((e) => known.has(e.source) && known.has(e.target))
    .map((e) => ({
      source: e.source,
      target: e.target,
      type: e.type ?? 'related',
      label: e.label ?? e.incomingNote,
      // `recommends` is an editorial suggestion, not a structural tie — it is
      // drawn, but it must not distort where the structure settles.
      layout: e.type !== 'recommends',
    }));

  return { nodes, edges };
}
