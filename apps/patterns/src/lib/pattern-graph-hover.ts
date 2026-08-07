// Cross-island channel for "this pattern is under the pointer".
//
// The sidebar is a React island and the graph is a custom element wired from
// the page's own script; they load as separate chunks and can't share a store
// module instance, so they talk over a document-level CustomEvent instead. The
// payload is a *path* rather than a node id: the sidebar knows hrefs, the
// graph's page owns the path → node mapping, and neither has to know whether a
// given href has a node at all.
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
// A client-side navigation discards the graph's DOM and nothing tears the
// subscription down with it, so a plain addEventListener would accumulate a
// dead closure over a whole discarded graph on every return to the home page.
// A fresh graph simply takes the slot; unsubscribing is identity-checked so a
// late cleanup from a discarded one can't silence the live one.
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
