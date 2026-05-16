import { create } from 'zustand';

export type Pane = {
  slug: string;
  title: string;
  html: string;
  status: 'loading' | 'ready' | 'error';
};

type StackState = {
  panes: Pane[];
  activeIndex: number;
  cache: Map<string, Pane>;
  push: (slug: string, fromIndex: number) => Promise<void>;
  syncFromURL: (slug0: string, title0: string) => Promise<void>;
};

async function fetchPane(slug: string): Promise<Pane> {
  const res = await fetch(`/patterns/${slug}/`);
  if (!res.ok) throw new Error(`fetch failed: ${slug}`);
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');

  // Astro's client:only slot content is inside <template data-astro-template>
  // Template contents live in a DocumentFragment, not the normal DOM, so we
  // must access .content rather than using a plain querySelector.
  const tmpl = doc.querySelector('template[data-astro-template]') as HTMLTemplateElement | null;
  const root: ParentNode = tmpl ? tmpl.content : doc;
  const article = root.querySelector('article');

  const title = article?.querySelector('h1')?.textContent?.trim() ?? slug;
  return { slug, title, html: article?.innerHTML ?? '', status: 'ready' };
}

export function buildURL(panes: Pane[]): string {
  if (panes.length === 0) return '/';
  const [first, ...rest] = panes;
  const base = `/patterns/${first.slug}`;
  if (rest.length === 0) return base;
  const params = new URLSearchParams();
  for (const pane of rest) params.append('stackedNotes', pane.slug);
  return `${base}?${params.toString()}`;
}

// Replace the first loading-status pane with the given slug by a new value.
function replaceLoadingPane(panes: Pane[], slug: string, next: Pane): Pane[] {
  const idx = panes.findIndex(p => p.slug === slug && p.status === 'loading');
  if (idx === -1) return panes;
  const updated = [...panes];
  updated[idx] = next;
  return updated;
}

export const useStackStore = create<StackState>()((set, get) => ({
  panes: [],
  activeIndex: 0,
  cache: new Map(),

  push: async (slug, fromIndex) => {
    const { panes, cache } = get();
    const truncated = panes.slice(0, fromIndex + 1);
    const placeholder: Pane = { slug, title: slug, html: '', status: 'loading' };
    const newPanes = [...truncated, placeholder];
    set({ panes: newPanes, activeIndex: fromIndex + 1 });
    history.pushState({}, '', buildURL(newPanes));

    const cached = cache.get(slug);
    if (cached) {
      set(state => ({ panes: replaceLoadingPane(state.panes, slug, cached) }));
      return;
    }

    try {
      const pane = await fetchPane(slug);
      cache.set(slug, pane); // mutate in place — cache is never subscribed to by renderers
      set(state => ({ panes: replaceLoadingPane(state.panes, slug, pane) }));
    } catch {
      set(state => {
        const idx = state.panes.findIndex(p => p.slug === slug && p.status === 'loading');
        if (idx === -1) return state;
        const updated = [...state.panes];
        updated[idx] = { ...updated[idx], status: 'error' };
        return { panes: updated };
      });
    }
  },

  syncFromURL: async (slug0, title0) => {
    const stacked = new URLSearchParams(window.location.search).getAll('stackedNotes');
    const pane0: Pane = { slug: slug0, title: title0, html: '', status: 'ready' };

    if (stacked.length === 0) {
      set({ panes: [pane0], activeIndex: 0 });
      return;
    }

    const { cache } = get();
    const placeholders: Pane[] = stacked.map(s => ({ slug: s, title: s, html: '', status: 'loading' }));
    set({ panes: [pane0, ...placeholders], activeIndex: stacked.length });

    const results = await Promise.allSettled(
      stacked.map(s => {
        const hit = cache.get(s);
        return hit ? Promise.resolve(hit) : fetchPane(s);
      })
    );

    const fetched = results.map((r, i): Pane =>
      r.status === 'fulfilled'
        ? r.value
        : { slug: stacked[i], title: stacked[i], html: '', status: 'error' }
    );

    for (const p of fetched) if (p.status === 'ready') cache.set(p.slug, p);
    set({ panes: [pane0, ...fetched] });
  },
}));

// Module-level: intercept in-pane pattern link clicks in the capture phase, before
// ClientRouter's bubble-phase listener runs. ClientRouter checks ev.defaultPrevented
// before calling navigate(), so a capture-phase preventDefault() stops soft navigation.
if (typeof document !== 'undefined') {
  document.addEventListener(
    'click',
    (event) => {
      // Only plain left-clicks
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

      const target = event.composedPath()[0] as Element;
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const paneEl = anchor.closest('[data-pane-index]') as HTMLElement | null;
      if (!paneEl) return;

      const href = anchor.href;
      if (!href) return;
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      if (!url.pathname.startsWith('/patterns/')) return;

      event.preventDefault(); // Stops ClientRouter from navigating (it checks defaultPrevented)

      const fromIndex = parseInt(paneEl.dataset.paneIndex ?? '0', 10);
      const targetSlug = url.pathname.replace(/^\/patterns\//, '').replace(/\/$/, '');
      useStackStore.getState().push(targetSlug, fromIndex);
    },
    { capture: true }, // capture phase fires before ClientRouter's bubble-phase listener
  );
}
