import { useSyncExternalStore } from 'react';

// Active-path tracking for the persisted nav island.
//
// The nav is `transition:persist`ed, so it hydrates once and never re-renders
// on navigation — a `currentPath` prop would freeze at the first page. Instead
// the nav reads the active path from this tiny external store, updated on
// `astro:page-load` (ClientRouter fires it on the initial load and after every
// swap). `getServerSnapshot` returns '' so the server HTML — which highlights
// nothing — matches during hydration; the client snapshot then switches to the
// real pathname and React highlights the current item without a mismatch.

let path = typeof location !== 'undefined' ? location.pathname : '';
const listeners = new Set<() => void>();

function setActivePath(next: string): void {
  if (next === path) return;
  path = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('astro:page-load', () => setActivePath(location.pathname));
}

export function useActivePath(): string {
  return useSyncExternalStore(subscribe, () => path, () => '');
}

// Normalise trailing slashes so links (`/patterns/foo`) match the runtime
// pathname regardless of Astro's directory-format trailing slash. Returns
// false while the active path is still the server snapshot ('').
export function isActivePath(href: string, current: string): boolean {
  if (!current) return false;
  const strip = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p);
  return strip(href) === strip(current);
}
