---
title: "Style boundary between the patterns site and the component library"
status: "completed"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-12"
area: "patterns-site, components"
promoted_to: ""
superseded_by: ""
---
# Style boundary between the patterns site and the component library

## Context

The patterns site and the component library currently share one global
light-DOM cascade with no declared boundary. `Base.astro` imports the
library's entire stylesheet (`@styles/main.css`, ~45 files) into every page,
then layers the site's own `app.css` / `stack.css` on top. Demos are React
components rendered inside prose panes wrapped only in `.demo-block`
(`apps/patterns/src/components/Demo.tsx`) — a class, not a boundary.
Storybook imports the same `main.css` and must keep a full-library entry.

Three consumer types are tangled in that one cascade:

- *Site prose and chrome* depend on library base files: `reset.css`,
  `variables*`, `typography.css` (`* { font-family: var(--font) }`),
  `layout.css` (`.flow` is used directly by `[...slug].astro`), plus chrome
  components from the package (`@components/sidebar`, `pp-toc`, buttons, kbd).
- *Demos* need the component skins (`button.css`, `cmdk.css`,
  `reference.css`, …) in light DOM.
- *Lit components* are split: most have `static styles` (shadow DOM, already
  isolated); the chart primitives render to light DOM; React package
  components are styled entirely by the global sheets.

### The leaks, both directions

*Site → demos* is the acute direction, acknowledged in the code — `app.css`
carries a literal `/* Leaks into demos */` comment where a pane font-size had
to be disabled. Pane prose rules (`.pane .pane-body > article`
line-height/max-width), dash list markers (`.pane ul { list-style: "- " }`),
and `a:not([class])` underlines all reach demo markup. Current defenses are
ad hoc: a `--font` reset on `.demo-block`, `:not(pp-toc ul)` chains,
commented-out rules.

*Library → site* is chronic. Library CSS styles bare elements (`button`,
`h1–h5`, `table`, `input`, `* { font-family }`), which the site mostly
*wants* as its substrate — but where chrome needs something different the
site fights back with `!important` (`--sidebar-width`, `max-width: 8rem`,
`font-size: 16px` in `app.css`). Root enabler: *20 of the 47 library CSS
files are unlayered* (typography, input, textarea, navigation, cmdk,
reference, toast, …). Unlayered author styles beat every `@layer`, so the
declared `reset → … → states` order is only half real and specificity wars
arbitrate instead.

### Constraints

- *No wholesale shadow-DOM demo wrapper*: `toast.ts`, `dropdown.ts`, and
  `Reference.tsx` portal/append overlays to `document.body`; they would land
  outside a shadow root and lose their styles.
- *No iframes*: demos render in situ, inline within prose — that context is
  part of what the demo shows.
- *Storybook keeps a whole-library entry point* (`main.css`).
- `@scope` limits selector *matching*, not *inheritance*: properties set on
  ancestors (line-height, font) still inherit into the demo subtree. The demo
  wrapper keeps an explicit inheritance guard.
- Scope proximity ranks below layers and specificity in the cascade; the
  design must not rely on proximity to beat anything, only on the scoping
  limit to stop selector reach.

## Design

Stay in light DOM; make the cascade itself the boundary. Tokens (custom
properties) are the one thing *meant* to cross every boundary — everything
else gets an explicit place.

## Steps

### 1. Split the library stylesheet into intent-revealing entries

In `packages/components/src/styles/`:

- `tokens.css` — `variables-palette`, `variables`, `purpose`, `animation`.
  Custom properties only; safe to load anywhere.
- `base.css` — `reset`, `typography`, `layout`. The substrate a consumer
  explicitly opts into for its own markup.
- `components.css` — everything else (the skins demos and chrome need).
- `main.css` — re-exports all three; Storybook unchanged.

The site then declares its dependency instead of inheriting by accident:
`Base.astro` imports the three entries (today all three; the value is that
the dependency is named, and a future consumer can take tokens without
skins).

### 2. Layer every library file

Fix the 20 unlayered files so all library rules live in the declared layers
(`reset, theme, global, layout, components, utilities, states`). Assign at
the import site in the entry files — `@import url(typography.css)
layer(global);` — rather than editing each file, except where a file already
declares internal layers (leave those as-is; nested assignment composes).

Then, on the site side, pull the library below everything the site writes:
a small `lib.css` in `apps/patterns/src/styles/` containing

```css
@layer lib;
@import '@styles/tokens.css' layer(lib);
@import '@styles/base.css' layer(lib);
@import '@styles/components.css' layer(lib);
```

imported first in `Base.astro`. Library-internal layers become `lib.*`
sublayers; every site rule — layered or not — now beats the library without
`!important`. Verify Vite resolves the `@styles` alias inside CSS `@import`
and that the bundler (lightningcss under Astro 7 / Vite 8) preserves
`layer()` on imports; if it mangles them, fall back to assigning layers only
at the package entry files (step 2 first half) and rely on import order for
same-named layers — weaker but sufficient.

### 3. Scope site prose with a donut

Rewrite prose styling in `app.css` / `stack.css` inside donut scopes:

```css
@scope (.content-inset, .pane article) to (.demo-block, pp-toc) {
  /* list markers, link underlines, blockquote voice, measure, … */
}
```

Prose rules structurally cannot enter a demo, and nesting resolves correctly
(a list inside a demo inside a pane is excluded — the current `:not(pp-toc
ul)` chains can't express that). Delete the `:not()` chains and the
commented-out font-size workaround. Future prose styles are leak-proof by
construction because they are authored inside the scope block.

Keep (and consolidate) the inheritance guard on `.demo-block`: font family
(already `--font: system-ui`), plus line-height and font-size reset, since
inheritance crosses the scope limit.

In-situ demos that deliberately sit inside prose voice (a mention rendered
mid-sentence) are *not* scope holes — only the `.demo-block` wrapper is. The
context trade-off stays visible, which is part of the demo's job.

### 4. Remove the fights

With the library in `lib`, delete the `!important`s in `app.css` that exist
only to out-shout library rules (`--sidebar-width`, logo `max-width`,
blockquote `font-size`, flow margin) and re-express them as plain rules.
Each removal is a visual check on the affected chrome (sidebar, logo, pane
prose).

### 5. Enforce the boundary

Add a check beside the existing `validate-cross-references` integration (or
a small script in the repo's verification style):

- every file reachable from the library entry points is layered (no
  unlayered rule escapes);
- prose-targeting selectors in `app.css` / `stack.css` (`.pane article …`,
  `.content-inset …` descendants) live inside the `@scope` block.

### Follow-up, not blocking

- Migrate the light-DOM chart primitives (`charts/primitives/*`,
  `d3-component.ts`) to `static styles` like the rest of the Lit components.
- `docs.css` is imported by no entry and carries 27 `!important`s — decide
  whether it is dead or Storybook-only, and place or delete it.

## Verification

- A pattern page with block demos: demo lists show no dash markers, demo
  links no prose underline, demo type no prose measure/line-height.
- Site chrome (sidebar width, logo size, TOC) unchanged with zero
  `!important` in `app.css`.
- Storybook renders unchanged from `main.css`.
- Build green; no FOUC or layer-order warnings in dev console.

## Outcome (2026-07-12)

All five steps landed. The library splits into `tokens.css` / `base.css` /
`components.css` (re-exported by `main.css` for Storybook); the site imports
them through `apps/patterns/src/styles/lib.css`, which wraps the whole library
in a `lib` layer declared ahead of every site layer — so site rules win by layer
order, and `app.css` / `stack.css` are now `!important`-free. Prose voice lives
in two `@scope (…) to (.demo-block, pp-toc)` donuts in `app.css`; the
`.demo-block` guard resets inherited type across the scope limit.

Verified in the emitted CSS (`@layer lib{}` wraps the library sublayers and
precedes the site layers; `layer()` survives lightningcss inlining), by build +
eslint, and visually (demos, prose, home page grid/rail, Storybook Button + chrome).

Two findings beyond the plan: the `blockquote + p` fight was against the
*library's* `.flow > * + *` `!important`, so that important was removed at the
source (`layout.css`); and `--sidebar-width` / logo `max-width` `!important`s
were vestigial (nothing in the library set them). The boundary is enforced by
`scripts/check-style-boundary.mjs` (wired into the `docs-integrity` workflow).

Resolved follow-up: `docs.css` is Storybook-only (imported by
`.storybook/preview.ts`), not dead. Still open: migrating the light-DOM chart
primitives (`charts/primitives/*`, `d3-component.ts`) to `static styles`. The
pre-existing partial layer-escapes in `card.css` / `form.css` /
`variables-palette.css` / `layout.css` are intentional library overrides,
contained by the `lib` wrapper on the site, and left as-is.
