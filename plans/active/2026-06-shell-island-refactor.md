---
title: Shrink the client:load shell surface — persistent sidebar island, static content
status: active
kind: exec-spec
created: 2026-06-24
last_reviewed: 2026-06-24
area: apps/patterns layout, hydration
promoted_to:
superseded_by:
---

# Shrink the `client:load` shell surface

Status: proposed, not started (2026-06-24). Follow-up to the `optimizeDeps`
hydration fix in `apps/patterns/astro.config.mjs`.

New motivation (2026-07-08, Astro 7 / Vite 8 upgrade): this refactor is no longer
just an optimization — it's the fix for a concrete regression the upgrade
introduced. Under `@astrojs/react` 6 + ClientRouter, re-hydrating the whole-page
shell on every swap now throws a structural hydration mismatch
(`<main data-slot="sidebar-inset">` vs `<div data-slot="sidebar">`) that React
patches mid-transition, aborting the View Transition
(`InvalidStateError: Transition was aborted`) on every client-side nav. Cosmetic
(nav completes; the cross-page animation snaps), absent on Astro 6.4.8. Confirmed
empirically that `transition:persist` on the *whole* `AppShell` does not fix it
and staled the content — exactly the failure this plan's target architecture
(persist only the sidebar, content as a sibling) is designed to avoid; see
"Why `transition:persist` is safe here" below. The upgrade already landed the
`open={hydrated && isOpen(...)}` collapsible-gate fix (the discarded
`useNavHydration()` return), which removed the *collapsible-specific* mismatch;
this plan removes the remaining *structural* one.

## Problem

`apps/patterns/src/layouts/Base.astro` mounts the entire app shell as one
`client:load` React island:

```astro
<AppShell client:load navItems={…} title={…} currentPath={…} slug={…} …>
  <slot />
</AppShell>
```

`AppShell` (`src/components/AppShell.tsx`) renders `SidebarProvider → Sidebar`
(nav, search, footer) *and* `SidebarInset` wrapping the page content. Because the
whole shell is `client:load` and lives under `ClientRouter` (View Transitions),
the island and its full dependency tree (`react`, `react-dom`, `@base-ui/react`
sidebar primitives, `zustand`) re-hydrate on *every* navigation. Each navigation
re-runs the island's dynamic `import()`, which is the operation that fails when a
dev re-optimization (or any transient fetch hiccup) invalidates a module URL —
the `Failed to fetch dynamically imported module … #astro-retry` error.

The `optimizeDeps.include` fix removed the dev-only *trigger* (lazy
re-optimization mid-session). This plan removes the *structural amplifier*: the
shell shouldn't re-hydrate per navigation at all. It also improves production —
less JS re-run per route, faster swaps, and a shell that survives navigation
instead of rebuilding.

This is optional. The `optimizeDeps` fix stands on its own; ship this only if the
re-hydration cost or residual fragility justifies the work.

## Current architecture

```
Base.astro
  └─ <AppShell client:load>                ← one island, re-hydrates per nav
       └─ SidebarProvider                   renders .sidebar-wrapper (flex host)
            ├─ Sidebar                       nav tree, search, footer (interactive)
            └─ SidebarInset (main)           wraps {children} = <slot/>  (static content
                 └─ StackManager | div            inside the island)
```

What is actually interactive vs. inert:

- *Interactive, belongs in an island*: sidebar collapse (⌘B, cookie, mobile
  `Dialog`), collapsible nav groups (Base UI `Collapsible` + persisted
  `nav-store`), tooltips when collapsed, the search button.
- *Inert, only needs CSS*: the page content. `SidebarInset` is a plain `<main
  class="sidebar-inset">`; it reflows purely via CSS (`.sidebar-wrapper` is
  `display:flex`, `.sidebar-inset` is `flex:1`, the sidebar's gap div carries the
  width that the `data-state` attribute toggles). Nothing in the content area
  consumes `SidebarContext`.
- *Per-page interactive*: `StackManager` (the stacked-notes pane manager) depends
  on `slug` and legitimately re-initialises per route.

So the content is already server-rendered static HTML — it's just *parented
inside* the island today, which is what forces it through hydration.

## Target architecture

Move the flex layout host into static Astro markup. Hydrate only the sidebar, and
`transition:persist` it so it survives swaps (hydrates once, never re-runs its
import on navigation). Leave the content as a plain Astro `<slot/>`, with
`StackManager` as a small per-page island.

```
Base.astro
  └─ <div class="sidebar-wrapper">          ← STATIC flex host (Astro)
       ├─ <Nav client:load transition:persist navItems={…} />   ← the only persistent island
       └─ <main class="sidebar-inset">       ← STATIC
            └─ <StackManager client:load slug title>  | <div class="content-inset">
                 <slot />
```

`<astro-island>` defaults to `display:contents`, so the persisted `Nav` island's
root `.sidebar` element still acts as the flex child next to the static inset —
the existing flex relationship is preserved without moving CSS.

### Why `transition:persist` is safe here (unlike persisting the whole shell)

The earlier caution against `transition:persist` was about persisting a node that
*wraps the per-page slot* — the persisted node would keep stale content. Here the
sidebar no longer wraps content (content is a sibling), so persisting it is
exactly right: it has no per-page state to go stale, keeps nav open/closed state
naturally, and stops re-hydrating.

## Key risks / wrinkles (the parts that aren't mechanical)

1. *Active-link highlighting goes stale under persist.* A persisted island does
   not re-render on navigation, so the `currentPath`/`isActive` prop freezes at
   the first page. Fix: drive active state from the URL at runtime. Add an
   `astro:page-load` listener (the codebase already uses this event in
   `src/lib/link-preview.ts`) that reads `location.pathname` and updates a
   `currentPath` signal/store the nav renders from — not a prop. Acceptance:
   navigate A→B→A, the highlighted item tracks the URL each time.

2. *Layout-host ownership.* `SidebarProvider` currently renders the
   `.sidebar-wrapper` flex host *and* provides context. To make the inset a
   static sibling, the host must be static Astro and the provider must stop
   rendering it. Add an opt-out (e.g. `SidebarProvider` prop `renderWrapper={false}`,
   defaulting to the current behaviour) so the provider becomes context-only when
   the host lives in Astro. The `--sidebar-width`, token, and `--font` rules key
   off the `.sidebar-wrapper` *class* (see `sidebar.css` / `app.css`), so they keep
   working once that element is authored in Astro. Confirm the wrapper-scoped
   token block (`[data-slot="sidebar-wrapper"]`) is reproduced on the static host
   (add `data-slot="sidebar-wrapper"` to the Astro div).

3. *Blast radius of the `SidebarProvider` change.* Used in exactly two places:
   `AppShell.tsx` and `packages/components/src/stories/Sidebar.stories.tsx`. The
   `renderWrapper` opt-out keeps the Storybook story (and its default) untouched.

4. *Mobile.* The mobile sidebar is a Base UI `Dialog` portal triggered from
   context; unaffected by persist. Verify the ⌘B toggle and mobile open/close
   still work after the split.

5. *StackManager.* Stays `client:load` (not persisted) inside the static inset,
   wrapping `<slot/>` exactly as today. Its content-fetching of other pattern
   pages (`stack-store.ts`, parsing `<template data-astro-template>` / `<article>`)
   is independent of the shell split — but re-verify stacked-notes navigation,
   since the slot's DOM position changes.

6. *Nav data at SSR.* `navItems` is computed in `Base.astro` from the content
   collection and is identical across pages, so baking it into the persisted
   island once is correct. No per-page nav recompute needed.

7. *Search button.* `openSearch()` queries the document-level `<pagefind-modal>`
   (outside the island, in `Base.astro`); moving the button into the persisted
   `Nav` island keeps it working.

## Implementation phases

Phase 1 — Extract a context-only provider mode
- Add `renderWrapper?: boolean` (default `true`) to `SidebarProvider`. When
  `false`, render `<>{children}</>` (still inside `Tooltip.Provider`) without the
  `.sidebar-wrapper` div. No behaviour change for existing callers.

Phase 2 — Split `AppShell` into `Nav` + static host
- Create `Nav.tsx` containing `SidebarProvider renderWrapper={false}` → `Sidebar`
  → the existing nav/search/footer markup (lift the body of today's `AppShell`
  sidebar branch). Props: `navItems`, `storybookUrl`. Drop `currentPath` as a
  prop; read it from the active-path store (Phase 4).
- `StackManager` stays as-is.

Phase 3 — Rewrite `Base.astro` body
```astro
<div class="sidebar-wrapper" data-slot="sidebar-wrapper">
  <Nav client:load transition:persist="app-nav" navItems={navItems} storybookUrl={storybookUrl} />
  <main class="sidebar-inset">
    {slug
      ? <StackManager client:load slug={slug} title={title}><slot /></StackManager>
      : <div class="content-inset"><slot /></div>}
  </main>
</div>
```

Phase 4 — Active-path tracking
- Add a tiny `active-path` store (or local state) updated on `astro:page-load`
  from `location.pathname`. `Nav` renders `isActive` against it. Delete the
  `currentPath` prop threading.

Phase 5 — Delete dead code
- Remove `AppShell.tsx` once `Nav` + `Base.astro` cover its responsibilities.
- Reassess `optimizeDeps.include`: the React-island deps are still needed (the
  persisted island and `StackManager` use them), so leave the list; this refactor
  reduces *how often* those modules execute, not *whether* they're bundled.

## Verification

Reuse the method that validated the `optimizeDeps` fix:

- *Dev-log A/B*: cold-clear `node_modules/.vite`, start dev, crawl several island
  pages. Still zero `optimized dependencies changed → reloading` lines.
- *Re-hydration count*: confirm the `Nav` island hydrates *once* and does not
  re-run across navigations (e.g. a `console.count` in a `useEffect`, or observe a
  single `astro-island` mount). This is the core success metric.
- *Browser console* (extension connected this time): navigate A→B→A repeatedly,
  including a stacked-notes flow; no `astro-island` hydration errors.
- *Regression checklist*: sidebar collapse + ⌘B + cookie persistence; mobile
  dialog open/close; collapsible nav groups keep state across navigation; active
  link tracks the URL; search (⌘K and button); stacked-notes push/pop and URL
  sync.
- `npm run test` (eslint) and a production `npm run build` + `preview` smoke.

## Non-goals / rollback

- Not touching `StackManager` internals or `stack-store`/`nav-store` logic.
- Not changing the sidebar's visual design or the CSS token system.
- Rollback is a single revert: restore `AppShell.tsx` and the old `Base.astro`
  body. The `SidebarProvider` `renderWrapper` prop is additive and can stay.

## Open questions

- Does `transition:persist` on the nav interact badly with the mobile `Dialog`
  portal across swaps (portal re-parenting)? Test early.
- Should active-path be a `zustand` store (consistent with `nav-store`) or plain
  module state + event? Lean `zustand` for consistency, but it's a small call.
- Prior art: `plans/completed/2026-05-sidebar-react.md` (the React sidebar
  conversion) — confirm nothing there assumed per-navigation re-hydration.
