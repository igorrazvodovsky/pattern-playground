import { create } from 'zustand';
import { getPaneContent } from './pane-content';
import { buildURL, decodePaneParam, panePath, parsePanePath } from './pane-path';

export type Pane = {
  // `/patterns/<slug>` or `/sequences/<id>`: the pane's identity (pane-path.ts).
  path: string;
  title: string;
  html: string;
  status: 'loading' | 'ready' | 'error';
  hash?: string;
};

// A request for StackManager to bring an open pane into view. `n` changes on
// every request, so going to the same pane twice still scrolls.
export type Reveal = { index: number; hash?: string; n: number };

type StackState = {
  panes: Pane[];
  activeIndex: number;
  reveal: Reveal | null;
  push: (path: string, fromIndex: number, hash?: string) => Promise<void>;
  goTo: (index: number, hash?: string) => void;
  follow: (path: string, fromIndex: number, hash?: string) => void;
  syncFromURL: (path0: string, title0: string) => Promise<void>;
};

// The open pane a link from `fromIndex` should go to: the nearest pane with
// that path to the left of the link (its own pane included), then the nearest
// to the right. -1 when the page is not open.
export function findOpenPane(panes: Pane[], path: string, fromIndex: number): number {
  for (let i = Math.min(fromIndex, panes.length - 1); i >= 0; i--) {
    if (panes[i].path === path) return i;
  }
  for (let i = fromIndex + 1; i < panes.length; i++) {
    if (panes[i].path === path) return i;
  }
  return -1;
}

// Until its content arrives, a pane is titled by its slug or id.
function placeholderTitle(path: string): string {
  return parsePanePath(path)?.id ?? path;
}

// Replace the first loading-status pane with the given path by a new value.
function replaceLoadingPane(panes: Pane[], path: string, next: (pane: Pane) => Pane): Pane[] {
  const idx = panes.findIndex(p => p.path === path && p.status === 'loading');
  if (idx === -1) return panes;
  const updated = [...panes];
  updated[idx] = next(updated[idx]);
  return updated;
}

export const useStackStore = create<StackState>()((set, get) => ({
  panes: [],
  activeIndex: 0,
  reveal: null,

  push: async (path, fromIndex, hash) => {
    const { panes } = get();
    const truncated = panes.slice(0, fromIndex + 1);
    const placeholder: Pane = { path, title: placeholderTitle(path), html: '', status: 'loading', hash };
    const newPanes = [...truncated, placeholder];
    set({ panes: newPanes, activeIndex: fromIndex + 1 });
    history.pushState({}, '', buildURL(newPanes));

    try {
      const content = await getPaneContent(path);
      // The pane's current hash, not the one it was pushed with: a link to
      // this pane may have named an anchor while it was loading (goTo).
      set(state => ({ panes: replaceLoadingPane(state.panes, path, pane => ({ ...content, status: 'ready', hash: pane.hash })) }));
    } catch {
      set(state => ({ panes: replaceLoadingPane(state.panes, path, pane => ({ ...pane, status: 'error' })) }));
    }
  },

  // Going to an open pane closes nothing: the panes to its right stay where
  // they are, and the actor can scroll back to them. The anchor becomes part
  // of the pane's address, replacing rather than adding a history entry.
  goTo: (index, hash) => {
    const { panes, reveal } = get();
    if (!panes[index]) return;
    let next = panes;
    if (hash && panes[index].hash !== hash) {
      next = [...panes];
      next[index] = { ...panes[index], hash };
      history.replaceState(history.state, '', buildURL(next));
    }
    set({ panes: next, activeIndex: index, reveal: { index, hash, n: (reveal?.n ?? 0) + 1 } });
  },

  // What following a link from pane `fromIndex` does: go to the page if it is
  // already open, open it to the right otherwise.
  follow: (path, fromIndex, hash) => {
    const { panes, goTo, push } = get();
    const openIndex = findOpenPane(panes, path, fromIndex);
    if (openIndex === -1) push(path, fromIndex, hash);
    else goTo(openIndex, hash);
  },

  syncFromURL: async (path0, title0) => {
    const stacked = new URLSearchParams(window.location.search).getAll('stackedNotes');
    // Pane 0's anchor is the page's own fragment.
    const pane0: Pane = { path: path0, title: title0, html: '', status: 'ready', hash: location.hash || undefined };

    if (stacked.length === 0) {
      set({ panes: [pane0], activeIndex: 0 });
      return;
    }

    const entries = stacked.map(decodePaneParam);
    const placeholders: Pane[] = entries.map(e => ({ path: e.path, title: placeholderTitle(e.path), html: '', status: 'loading', hash: e.hash }));
    set({ panes: [pane0, ...placeholders], activeIndex: entries.length });

    const results = await Promise.allSettled(entries.map(e => getPaneContent(e.path)));

    const fetched = results.map((r, i): Pane =>
      r.status === 'fulfilled'
        ? { ...r.value, status: 'ready', hash: entries[i].hash }
        : { path: entries[i].path, title: placeholderTitle(entries[i].path), html: '', status: 'error' }
    );

    // Keep any anchor a goTo recorded while the panes were loading.
    set(state => ({
      panes: [pane0, ...fetched.map((pane, i) => {
        const current = state.panes[i + 1];
        return current?.path === pane.path ? { ...pane, hash: current.hash } : pane;
      })],
    }));
  },
}));

// The single-pane layout (stack.css, same breakpoint). There the site behaves
// like ordinary pages, as notes.andymatuschak.org does on a phone: a link is a
// plain navigation with its own history entry, Back walks the pages read, and
// nothing is marked as open.
export const singlePaneQuery =
  typeof window === 'undefined' ? null : matchMedia('(width <= 768px)');

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

// The same for sequence ids. The sequences loader also accepts `.md`.
const sequenceFiles = import.meta.glob('/src/content/sequences/**/*.{md,mdx}');
export const validSequenceIds = new Set(
  Object.keys(sequenceFiles).map(p =>
    p.split('/').pop()!.replace(/\.mdx?$/, '')
  )
);

// The pane path a URL points at, if it names a page that exists and can be
// stacked; null otherwise.
export function stackablePath(url: URL): string | null {
  if (url.origin !== location.origin) return null;
  const parsed = parsePanePath(url.pathname);
  if (!parsed) return null;
  const valid = parsed.kind === 'sequence' ? validSequenceIds : validSlugs;
  return valid.has(parsed.id) ? panePath(parsed.kind, parsed.id) : null;
}

// Module-level: intercept in-pane pattern and sequence link clicks in the
// capture phase, before ClientRouter's bubble-phase listener runs. ClientRouter
// checks ev.defaultPrevented before calling navigate(), so a capture-phase
// preventDefault() stops soft navigation.
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

      // In-pane section links (the table of contents, footnotes) go to that
      // section of the pane they sit in. The document fragment belongs to
      // pane 0, so these must not reach the browser or pp-toc, which would
      // write their anchor there. A demo's `href="#"` stays its own business.
      const rawHref = anchor.getAttribute('href') ?? '';
      if (rawHref.startsWith('#')) {
        if (rawHref.length < 2 || anchor.closest('.demo-block')) return;
        event.preventDefault();
        event.stopPropagation();
        useStackStore.getState().goTo(parseInt(paneEl.dataset.paneIndex ?? '0', 10), rawHref);
        return;
      }

      const href = anchor.href;
      if (!href) return;
      const url = new URL(href, location.href);
      const targetPath = stackablePath(url);
      if (!targetPath) return; // fall through to normal navigation / Astro 404
      if (singlePaneQuery?.matches) return; // a plain navigation, see singlePaneQuery

      event.preventDefault(); // Stops ClientRouter from navigating (it checks defaultPrevented)

      const fromIndex = parseInt(paneEl.dataset.paneIndex ?? '0', 10);
      const hash = url.hash || undefined;
      useStackStore.getState().follow(targetPath, fromIndex, hash);
    },
    { capture: true }, // capture phase fires before ClientRouter's bubble-phase listener
  );
}
