# Hash anchor navigation in stacked-notes panes

## Context

Links like `/patterns/foundations/interaction#sense-making--integration` open correctly when the stacked-notes click interceptor fires, but the pane always opens at the top — the `#hash` fragment is extracted from the URL but never used. `rehype-slug` already generates `id` attributes on headings, so the target elements exist in the fetched HTML; the store and renderer just don't carry or act on the fragment.

---

## Changes

### 1. `apps/patterns/src/lib/stack-store.ts`

**Add `hash` to `Pane` type** (line 3–8):

```ts
export type Pane = {
  slug: string;
  title: string;
  html: string;
  status: 'loading' | 'ready' | 'error';
  hash?: string;           // e.g. '#sense-making--integration'
};
```

**Update `push` signature** (line 14):

```ts
push: (slug: string, fromIndex: number, hash?: string) => Promise<void>;
```

**Update `push` body** (line 59–86) — thread `hash` through all three paths:

```ts
push: async (slug, fromIndex, hash) => {
  // ...
  const placeholder: Pane = { slug, title: slug, html: '', status: 'loading', hash };
  // ...
  if (cached) {
    set(state => ({ panes: replaceLoadingPane(state.panes, slug, { ...cached, hash }) }));
    return;
  }
  // ...
  const pane = await fetchPane(slug);
  cache.set(slug, pane);   // cache stores content only, no hash
  set(state => ({ panes: replaceLoadingPane(state.panes, slug, { ...pane, hash }) }));
  // error path uses spread of existing pane, so hash is preserved automatically
```

**Extract and pass `hash` in the click interceptor** (line 159):

```ts
const hash = url.hash || undefined;
useStackStore.getState().push(targetSlug, fromIndex, hash);
```

`url.hash` is `''` (no fragment) or `'#section-id'`; `|| undefined` keeps the `Pane` type clean.

Note: `buildURL` and `syncFromURL` are intentionally left unchanged — hash is ephemeral scroll-on-open state, not persisted in the URL stack params.

---

### 2. `apps/patterns/src/components/StackManager.tsx`

**Add a `useEffect`** that fires whenever `panes` changes, detects a pane that just became `ready` with a `hash`, and scrolls to the target heading within that pane's `.pane-body` scroll container.

Add `prevPanesRef` alongside the existing refs (after line 43):

```tsx
const prevPanesRef = useRef<typeof panes>([]);
```

Add the effect after the existing `panes.length` focus effect (after line 63):

```tsx
useEffect(() => {
  panes.slice(1).forEach((pane, i) => {
    if (!pane.hash || pane.status !== 'ready') return;
    if (prevPanesRef.current[i + 1]?.status === 'ready') return; // already scrolled
    const paneEl = stackRef.current?.querySelector<HTMLElement>(`[data-pane-index="${i + 1}"]`);
    paneEl?.querySelector(pane.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  prevPanesRef.current = panes;
}, [panes]);
```

`pane.hash` (e.g. `'#sense-making--integration'`) is a valid CSS selector. `scrollIntoView` on the heading scrolls the nearest scrollable ancestor, which is `.pane-body` (`overflow-y: auto`), not the window.

---

## Files to modify

- `apps/patterns/src/lib/stack-store.ts` — `Pane` type, `push` signature + body, click interceptor
- `apps/patterns/src/components/StackManager.tsx` — `prevPanesRef`, scroll `useEffect`

---

## Verification

1. Open any pattern page, click a link with a `#section` anchor (e.g. from `agency.mdx`: `/patterns/foundations/interaction#sense-making--integration`).
2. The pane should open and scroll to the "Sense-making & integration" heading, not the top.
3. Click the same link again (cache hit path) — scroll should fire again.
4. Open a link without a hash — pane should open at the top as before.
5. Check TypeScript (`pnpm tsc --noEmit` in `apps/patterns`) reports no errors.
