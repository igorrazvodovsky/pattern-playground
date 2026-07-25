// Cross-island channel for "this pattern is under the pointer".
//
// The sidebar and the graph are separate React roots in separate island
// chunks, so they can't share a store module instance — they talk over a
// document-level CustomEvent instead. The payload is a *path* rather than a
// node id: the sidebar knows hrefs, the graph owns the path → node mapping,
// and neither has to know whether a given href has a node at all.
//
// The graph only exists on the home page; everywhere else these events simply
// have no listener.
export const PATTERN_GRAPH_HOVER_EVENT = 'pattern-graph:hover';

export interface PatternGraphHoverDetail {
  /** Pathname of the hovered pattern, or null when nothing is hovered. */
  path: string | null;
}

export function setPatternGraphHover(path: string | null): void {
  document.dispatchEvent(
    new CustomEvent<PatternGraphHoverDetail>(PATTERN_GRAPH_HOVER_EVENT, {
      detail: { path },
    })
  );
}

/** Trailing slashes vary by link source; the graph's own paths carry none. */
export function normalisePatternPath(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

// One document listener for the page's lifetime, one live subscriber slot.
// The graph island can't clean up after itself: a client-side navigation
// discards its DOM without unmounting the React root, so effect cleanup never
// runs and a plain addEventListener would accumulate a dead closure over the
// whole graph on every return to the home page. A fresh island simply takes the
// slot; unsubscribing is identity-checked so a late cleanup from the discarded
// island can't silence the live one.
let subscriber: ((detail: PatternGraphHoverDetail) => void) | null = null;
let bound = false;

export function subscribePatternGraphHover(
  fn: (detail: PatternGraphHoverDetail) => void
): () => void {
  subscriber = fn;
  if (!bound) {
    document.addEventListener(PATTERN_GRAPH_HOVER_EVENT, (event) => {
      subscriber?.((event as CustomEvent<PatternGraphHoverDetail>).detail);
    });
    bound = true;
  }
  return () => {
    if (subscriber === fn) subscriber = null;
  };
}
