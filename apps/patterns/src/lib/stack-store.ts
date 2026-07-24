import { create } from 'zustand';
import { getPaneContent } from './pane-content';

export type Pane = {
  slug: string;
  title: string;
  html: string;
  status: 'loading' | 'ready' | 'error';
  hash?: string;
};

type StackState = {
  panes: Pane[];
  activeIndex: number;
  push: (slug: string, fromIndex: number, hash?: string) => Promise<void>;
  syncFromURL: (slug0: string, title0: string) => Promise<void>;
};

export function buildURL(panes: Pane[]): string {
  if (panes.length === 0) return '/';
  const [first, ...rest] = panes;
  const base = `/patterns/${first.slug}`;
  if (rest.length === 0) return base;
  const params = new URLSearchParams();
  // A pane's section anchor is part of its address: encode it into the param
  // ('#' is percent-encoded by URLSearchParams) so a shared or reloaded stack
  // restores anchor positions, not just panes.
  for (const pane of rest) params.append('stackedNotes', pane.hash ? pane.slug + pane.hash : pane.slug);
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

  push: async (slug, fromIndex, hash) => {
    const { panes } = get();
    const truncated = panes.slice(0, fromIndex + 1);
    const placeholder: Pane = { slug, title: slug, html: '', status: 'loading', hash };
    const newPanes = [...truncated, placeholder];
    set({ panes: newPanes, activeIndex: fromIndex + 1 });
    history.pushState({}, '', buildURL(newPanes));

    try {
      const content = await getPaneContent(slug);
      set(state => ({ panes: replaceLoadingPane(state.panes, slug, { ...content, status: 'ready', hash }) }));
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

    // Param values may carry a section anchor ('slug#fragment', see buildURL).
    const entries = stacked.map(s => {
      const i = s.indexOf('#');
      return i === -1
        ? { slug: s, hash: undefined as string | undefined }
        : { slug: s.slice(0, i), hash: s.slice(i) };
    });

    const placeholders: Pane[] = entries.map(e => ({ slug: e.slug, title: e.slug, html: '', status: 'loading', hash: e.hash }));
    set({ panes: [pane0, ...placeholders], activeIndex: entries.length });

    const results = await Promise.allSettled(entries.map(e => getPaneContent(e.slug)));

    const fetched = results.map((r, i): Pane =>
      r.status === 'fulfilled'
        ? { ...r.value, status: 'ready', hash: entries[i].hash }
        : { slug: entries[i].slug, title: entries[i].slug, html: '', status: 'error' }
    );

    set({ panes: [pane0, ...fetched] });
  },
}));

// Build-time-resolved set of valid pattern slugs from the content directory.
// The filename stem is the slug (matches entry.id via generateId in
// content.config.ts, independent of any folder nesting): e.g. 'tag'.
// Mistyped slugs fall through to normal navigation instead of landing in a
// broken stacked-notes pane.
const patternFiles = import.meta.glob('/src/content/patterns/**/*.mdx');
export const validSlugs = new Set(
  Object.keys(patternFiles).map(p =>
    p.split('/').pop()!.replace(/\.mdx$/, '')
  )
);

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

      // In-page anchors (e.g. table-of-contents links) are same-document
      // navigation, not a jump to another pattern — let them scroll.
      if (anchor.getAttribute('href')?.startsWith('#')) return;

      const paneEl = anchor.closest('[data-pane-index]') as HTMLElement | null;
      if (!paneEl) return;

      const href = anchor.href;
      if (!href) return;
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      if (!url.pathname.startsWith('/patterns/')) return;

      const targetSlug = url.pathname.replace(/^\/patterns\//, '').replace(/\/$/, '');
      if (!validSlugs.has(targetSlug)) return; // fall through to normal navigation / Astro 404

      event.preventDefault(); // Stops ClientRouter from navigating (it checks defaultPrevented)

      const fromIndex = parseInt(paneEl.dataset.paneIndex ?? '0', 10);
      const hash = url.hash || undefined;
      useStackStore.getState().push(targetSlug, fromIndex, hash);
    },
    { capture: true }, // capture phase fires before ClientRouter's bubble-phase listener
  );
}
