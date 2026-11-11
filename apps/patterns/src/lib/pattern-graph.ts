// Feeds the home page's <pp-network-graph> with this site's own graph.
//
// The reading layer — deterministic layout, degree-sized nodes, hover
// neighbourhood, trail — belongs to the chart component and is domain-blind.
// What lives here is everything that knows this is a pattern library: the
// data and family anchors (pattern-graph-data.ts), the sidebar hover link, and
// what a click means.
import { buildData, CATEGORY_ANCHORS } from './pattern-graph-data';
import { subscribePatternGraphHover } from './pattern-graph-hover';
import { normalisePath } from './pane-path';
import type { NetworkGraph } from '@components/charts/network-graph';
import type { NetworkGraphNode } from '@components/charts/base/chart-types';

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
    idByPath: new Map(data.nodes.map((n) => [normalisePath(n.href ?? ''), n.id])),
  };

  if (!subscribed) {
    subscribed = true;
    subscribePatternGraphHover(({ path }) => {
      if (!live?.el.isConnected) return;
      live.el.setExternalHighlight(path ? (live.idByPath.get(normalisePath(path)) ?? null) : null);
    });
  }

  el.addEventListener('pp-node-click', (event) => {
    const { node } = (event as CustomEvent<{ node: NetworkGraphNode }>).detail;
    if (node.href) window.location.href = node.href;
  });
}
