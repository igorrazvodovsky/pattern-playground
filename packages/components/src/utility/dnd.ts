/**
 * Lazy loader for Pragmatic drag and drop's element adapter. The package's
 * directory subpaths don't resolve as Node ESM, so a static import breaks
 * Astro's prerender even under client:only — demos load it inside effects
 * instead, where only the browser ever runs it.
 */

export type ElementAdapter = typeof import('@atlaskit/pragmatic-drag-and-drop/element/adapter');

let adapterPromise: Promise<ElementAdapter> | undefined;

export function loadElementAdapter(): Promise<ElementAdapter> {
  adapterPromise ??= import('@atlaskit/pragmatic-drag-and-drop/element/adapter');
  return adapterPromise;
}
