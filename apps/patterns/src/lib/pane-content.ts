// Client-side supply line for pane content. Fetches the prerendered pane
// partial (pages/patterns/[slug]/pane.astro) and extracts its contract: the
// fragment's root <article> and the <h1> inside it. Shared by the stacked
// panes (stack-store) and the link-preview popover, with one
// in-flight-deduping cache between them.

export type PaneContent = { slug: string; title: string; html: string };

const cache = new Map<string, Promise<PaneContent>>();

async function fetchPaneContent(slug: string): Promise<PaneContent> {
  const res = await fetch(`/patterns/${slug}/pane/`);
  if (!res.ok) throw new Error(`pane fetch failed: ${slug} (${res.status})`);
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const article = doc.querySelector('article');
  if (!article) throw new Error(`pane fragment has no <article>: ${slug}`);
  const title = article.querySelector('h1')?.textContent?.trim() ?? slug;
  return { slug, title, html: article.innerHTML };
}

export function getPaneContent(slug: string): Promise<PaneContent> {
  let pending = cache.get(slug);
  if (!pending) {
    pending = fetchPaneContent(slug);
    // A failed fetch must not poison the cache — evict so a retry refetches.
    pending.catch(() => cache.delete(slug));
    cache.set(slug, pending);
  }
  return pending;
}
