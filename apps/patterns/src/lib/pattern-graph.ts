// Feeds the home page's <pp-network-graph> with this site's own graph.
//
// The reading layer — deterministic layout, degree-sized nodes, hover
// neighbourhood, trail — belongs to the chart component and is domain-blind.
// What lives here is everything that knows this is a pattern library: which
// JSON the nodes come from, which meta becomes a styling hook, which edge type
// is commentary rather than structure, where each family sits on the canvas,
// and what a click means.
import graphData from '../data/pattern-graph.json' with { type: 'json' };
import activityLevels from '../data/activity-levels.json' with { type: 'json' };
import { normalisePatternPath, subscribePatternGraphHover } from './pattern-graph-hover';
import type { NetworkGraph } from '@components/charts/network-graph';
import type { NetworkGraphData, NetworkGraphNode } from '@components/charts/base/chart-types';

interface NodeMeta {
  'activity-level': string;
  'lifecycle-stage': string | null;
  'atomic-category': string;
  mediation: string | null;
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
const CATEGORY_ANCHORS: Record<string, [number, number]> = {
  Operations: [450, 120],
  Actions: [680, 320],
  Activities: [550, 520],
  Foundations: [200, 200],
  Qualities: [180, 460],
};

function buildData(): NetworkGraphData {
  const nodes: NetworkGraphNode[] = (graphData.nodes as GraphNodeData[]).map((n) => {
    const meta = nodeMeta[n.id];
    // Absent, not empty: pattern-graph.css keys off `:not([data-mediation])`
    // and `[data-seed]`, so a null must leave no attribute behind.
    const attrs: Record<string, string> = {
      'at-level': meta?.['activity-level'] ?? 'cross-cutting',
      'atomic-category': meta?.['atomic-category'] ?? n.category.toLowerCase(),
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

// The graph currently on the page. A client-side navigation discards the old
// element and mounts a new one, so the hover subscription is taken out *once*
// and reads this slot — subscribing per mount would mint a closure holding a
// whole discarded graph on every return to the home page, which is the leak
// pattern-graph-hover's own single-slot design exists to avoid.
let live: { el: NetworkGraph; idByPath: Map<string, string> } | null = null;
let subscribed = false;

/**
 * Wire up the graph on the page, if it is there. Idempotent per element, and
 * safe to call again after a client-side navigation swaps in a fresh one.
 */
export async function mountPatternGraph(root: ParentNode = document): Promise<void> {
  const el = root.querySelector<NetworkGraph>('pp-network-graph[data-pattern-graph]');
  if (!el || el.dataset.patternGraphReady !== undefined) return;
  el.dataset.patternGraphReady = '';

  // The layout script registers the element, but module order between the two
  // is not guaranteed — wait for the upgrade rather than assume it.
  await customElements.whenDefined('pp-network-graph');
  if (!el.isConnected) return;

  const data = buildData();
  el.anchors = CATEGORY_ANCHORS;
  el.data = data;

  // The sidebar knows hrefs; the graph knows ids. Neither has to learn the
  // other's vocabulary — the path is the shared name.
  live = {
    el,
    idByPath: new Map(data.nodes.map((n) => [normalisePatternPath(n.href ?? ''), n.id])),
  };

  if (!subscribed) {
    subscribed = true;
    subscribePatternGraphHover(({ path }) => {
      if (!live?.el.isConnected) return;
      live.el.setExternalHighlight(
        path ? (live.idByPath.get(normalisePatternPath(path)) ?? null) : null
      );
    });
  }

  el.addEventListener('pp-node-click', (event) => {
    const { node } = (event as CustomEvent<{ node: NetworkGraphNode }>).detail;
    if (node.href) window.location.href = node.href;
  });
}
