---
title: "Pane stack: refit to Astro's grain"
status: "completed"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-08-07"
area: "pattern-site"
promoted_to: ""
superseded_by: ""
---
# Pane stack: refit to Astro's grain

Rebuild the pane stack's supply lines — how pane content is fetched, how
demos mount, how pane 0 is rendered — so nothing depends on Astro
internals. The reading experience (sliding panes, spines,
`?stackedNotes=` URLs, live demos in every pane) does not change.

## Status

Closed at phase 3 (2026-08-07). Phase 4's gate failed on criterion (a):
stable Firefox still lacks cross-document view transitions, and
degrading sidebar navigation there to an instant full load is not
acceptable. Criterion (b) also weighed in — sidebar scroll position
survives swaps only because the Nav island instance persists, and plain
MPA navigation would reset it on every click. ClientRouter stays.
Revisit trigger: stable Firefox ships cross-document view transitions.

Phases 1–3 were implemented and verified 2026-07-25 (build green; demos mount at
pane 0, stacked, and in dev; Mermaid renders both places; link previews
carry prose without demo holes; pagefind indexes 117 pattern pages and
skips the pane partials; focus lands on a pushed pane's `h1` — now for
uncached pushes too, which the old length-keyed effect missed).
`reviveAstroScripts` and both DOMParser scraping paths are deleted; no
`client:only` remains in pattern content. `scripts/verify-demo-registry.mjs`
checks the content↔registry contract (its `--against` baseline defaults
to HEAD; pass the pre-migration ref once this lands).

## Context

The stack renders pane 0 from the server slot and builds panes 1+ by
fetching the target page and injecting `article.innerHTML`
(`stack-store.ts` `fetchPane`, `StackManager.tsx`). Three parts of that
supply chain lean on Astro internals rather than public contract:

- _Scraping._ `fetchPane` and `link-preview.ts` `fetchContent` both
  fetch the full page and dig the article out, with a fallback into
  `<template data-astro-template>` — a serialisation detail of the
  island wrapper that has already changed shape once (the code comments
  still describe a `client:only` shell that no longer exists).
- _Script revival._ Demos are `client:only="react"` islands, and
  `<script>` tags inserted via `innerHTML` never execute, so injected
  panes would show empty island frames. `reviveAstroScripts`
  (`StackManager.tsx`) re-executes Astro's bootstrap scripts by matching
  their text (`self.Astro`) — the fix
  `plans/archive/2026-07-pane-island-hydration.md` landed. It works, but
  it breaks silently whenever Astro changes its bootstrap format.
- _Content as island children._ Pane 0's article is passed through the
  `client:load` StackManager island, so every page's prose hydrates
  through React and the article's markup shape is whatever island
  serialisation produces.

The archived hydration plan rejected manually mounting Astro's island
format because that duplicates Astro's private props contract. This plan
takes the other exit: remove the island contract from pattern content
entirely, so there is nothing to revive and nothing private to
duplicate. What remains is a shape Astro supports outright: static
fragments (partials) composed client-side, plus self-mounting demo
widgets owned by us.

## Approach

Phases 1 and 2 are the load-bearing pair (together they delete both
internals-dependent hacks); phase 3 is a structural tidy-up that can
ride along; phase 4 is a separate, gated decision.

### 1. Demo registry replaces `client:only` islands

Demos contribute nothing server-side — `client:only` uses Astro purely
as a mounting mechanism, and that mechanism is what breaks under
injection. Replace it with a mounting contract we own:

- `Demo.astro` supersedes the current `Demo.tsx` frame in MDX usage:
  `<Demo name="item-view-glyph" label="…" />` renders the existing
  `.demo-block` frame with a `<div data-demo="item-view-glyph">` mount
  point instead of island children.
- A client module (loaded once from the layout) holds the registry:
  demo name → `() => import('@pkg/demos/…')`, mounted with `createRoot`.
  Dynamic imports keep per-demo code-splitting. `mountDemos(root)` runs
  on initial load and on each pane that turns ready — the same code path
  everywhere, replacing the `reviveAstroScripts` effect.
- Prop-carrying islands (the six `MermaidDiagram chart={…}` usages) pass
  props as JSON in a data attribute; the registry parses and forwards.
- Sweep the ~39 MDX files converting demo tags. Hand-migrate
  file-by-file; write a verification script (no `client:only` left in
  content; demo count per page unchanged; every `data-demo` name
  resolves in the registry) rather than a transform.

Side effects worth having: demo modules leave the prerender graph, so
browser-only dependency workarounds (the Pragmatic drag-and-drop lazy
loader in `demos/view-family/dnd.ts`) become unnecessary, and the
`optimizeDeps.entries` surface in `astro.config.mjs` shrinks.

### 2. Pane partial endpoint replaces page scraping

- `src/pages/patterns/[slug]/pane.astro` with `export const partial =
  true` and `getStaticPaths` over the patterns collection, rendering
  just the article — via a shared component also used by the full page,
  so the two cannot drift. Prerenders to a static fragment.
- One fetch-and-cache module consumes it, serving both `fetchPane` and
  the link-preview popover (which currently duplicates the scraping,
  cache included). The fragment root `<article>` plus its `h1` is the
  whole contract. This is the shared seam
  `plans/active/2026-05-link-preview-component-extraction.md` notes; do
  it here, let that plan consume it.
- Depends on phase 1 only in that fragments must not contain island
  markup; land 1 first (or together).

### 3. Pane 0 becomes static

StackManager does nothing to pane 0's content — it wraps it in a
section, adds a spine, and manages scroll. Render `<section class="pane"
data-pane-index="0">` (spine included, hidden while the stack has one
pane) statically in the layout, and demote StackManager to a sibling
island inside `.stack` that renders panes 1+ only (`<astro-island>` is
`display: contents`, so flex geometry is unaffected). It toggles pane
0's active state and spine visibility by DOM attribute, as
`updateStackClasses` already does for collapse state. Prose stops
hydrating through React; the article's markup is plain server HTML.

### 4. Gated: retire ClientRouter for cross-document view transitions

After 1–3, ClientRouter serves only sidebar navigation: in-content
pattern links never reach it (the capture-phase interception in
`stack-store.ts` exists to beat it to the click). Nav state already
persists via `nav-store.ts` (zustand `persist`). Replacing it with plain
MPA navigation plus CSS `@view-transition { navigation: auto }` deletes
a bug class in one move: the capture-phase race, the stale pagefind
trigger workaround, the open view-transition-abort regression, the
dev-mode dep-hash 504s during swaps, and the four `transitions-*`
virtual modules pinned in `optimizeDeps`.

Gate before committing: (a) cross-document view transitions animate in
Chromium and Safari 18.2+ but not yet in stable Firefox — sidebar
navigation there becomes an instant full load; (b) check what visibly
resets on a real reload that persistence doesn't cover (sidebar scroll
position, transient open/closed state) and decide whether to persist it
or accept it. If either lands wrong, keep ClientRouter — phases 1–3 do
not depend on this one.

## What does not change

The geometry and interaction layer is framework-neutral and stays:
`updateStackClasses` collapse/overlap detection, spine scroll
behaviour, focus management, hash handling, the `?stackedNotes=` URL
scheme, the store shape. Demos still export plain React components from
`@pkg/demos/*`, so Storybook borrows are untouched.

## Verification

- Per phase: site build green; `/patterns/a11y?stackedNotes=autocomplete`
  shows a live autocomplete in pane 1 (the archived plan's check);
  a Mermaid-carrying page renders its diagrams at pane 0 and stacked.
- Phase 1 sweep: verification script as above, plus a click-through of
  every demo-carrying page (script enumerates them).
- Phase 2: link previews still render prose without demo holes.
- Phase 3: pagefind still indexes article prose; keyboard focus lands on
  the pushed pane's `h1` as before.
- Dev-server health after 1–2: `optimizeDeps` entries reduced without
  "new dependencies optimized" reloads reappearing.

## Research notes (gate run 2026-07-18)

- Partials are a supported static-build feature; `export const partial`
  must be statically analysable; works with `getStaticPaths` dynamic
  routes; the installed Astro 7 carries `partial` in its route types.
- Cross-document view transitions: Chrome 126+, Safari 18.2+, Firefox
  behind a flag — progressive enhancement only (phase 4's gate).
- Confirmed in the built output: pane 0's article is server-rendered
  inside the island slot (prose is already indexable); the
  `data-astro-template` fallback in the fetch code corresponds to a
  previous shell shape.

## Relations

- Supersedes the mechanism from
  `plans/archive/2026-07-pane-island-hydration.md` (its scoping
  decisions stand: link previews stay inert, demo blocks dropped from
  previews).
- Provides the shared fetch seam that
  `plans/active/2026-05-link-preview-component-extraction.md` waits on.
- The MDX demo-tag sweep touches the same pages as
  `plans/active/2026-07-view-system-demos.md`; sequence the sweep after
  that plan's demo set settles, or fold its new demos into the registry
  as they land.

## Definition of done

`reviveAstroScripts` and both DOMParser scraping paths are deleted; no
`client:only` remains in pattern content; pane 0 is static HTML;
stacked panes and link previews work as today; build and verification
checks green. Phase 4 resolved either way: ClientRouter retired, or its
gate recorded as failed and the plan closed at phase 3.
