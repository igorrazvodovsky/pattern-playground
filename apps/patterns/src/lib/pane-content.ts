// Client-side supply line for pane content. Fetches the prerendered pane
// partial (pages/patterns/[slug]/pane.astro or pages/sequences/[id]/pane.astro)
// and extracts its contract: the fragment's root <article> and the <h1> inside
// it. Shared by the stacked panes (stack-store) and the link-preview popover,
// with one in-flight-deduping cache between them, keyed by pane path.

export type PaneContent = { path: string; title: string; html: string };

const cache = new Map<string, Promise<PaneContent>>();

async function fetchPaneContent(path: string): Promise<PaneContent> {
  const res = await fetch(`${path}/pane/`);
  if (!res.ok) throw new Error(`pane fetch failed: ${path} (${res.status})`);
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const article = doc.querySelector('article');
  if (!article) throw new Error(`pane fragment has no <article>: ${path}`);
  const title = article.querySelector('h1')?.textContent?.trim() ?? path;
  return { path, title, html: article.innerHTML };
}

export function getPaneContent(path: string): Promise<PaneContent> {
  let pending = cache.get(path);
  if (!pending) {
    pending = fetchPaneContent(path);
    // A failed fetch must not poison the cache — evict so a retry refetches.
    pending.catch(() => cache.delete(path));
    cache.set(path, pending);
  }
  return pending;
}
