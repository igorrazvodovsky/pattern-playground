---
title: "React residue onto the platform-first ladder"
status: "completed"
kind: "exec-spec"
created: "2026-08-06"
last_reviewed: "2026-08-07"
area: "components"
promoted_to: ""
superseded_by: ""
---
# React residue onto the platform-first ladder

## Context

The light-DOM refactor (`completed/2026-07-light-dom-refactor.md`) left the
React subsystems out of scope. A survey (2026-08-06) of every `.tsx` family
in `packages/components/src/components` found most of them genuinely
React-bound — but four are not, and one is dead. The decision ladder from
`docs/specs/component-authoring.md` applies unchanged; this plan works the
candidates in leverage order.

What stays React, and why (so the boundary is recorded, not re-litigated):

- *editor, editor-plugins, commenting UI, template-field, Reference* —
  tiptap-react coupled (`useEditor`, `ReactRenderer`,
  `ReactNodeViewRenderer` NodeViews).
- *combobox / command-menu* — cmdk owns the list, filtering, and keyboard
  interaction model; the command-menu hooks are pure state machines on top.
- *item-view* — the custom-component registry's values are React component
  types by design (`ItemView is a first stab`; its shape is provisional
  but not this plan's business).
- *ModalErrorBoundary* — React error boundaries have no platform
  equivalent; it exists solely so `modal-service` can wrap React content.

## Units

Each unit is one commit with its own verification; order is by
effort-to-payoff. Units 1, 2 and 4 landed on 2026-08-07; 3 and 5 were decided
against, with the reasoning kept below rather than deleted.

### 1. Delete hover-card

75-line prop-forwarding wrapper over base-ui with zero consumers (not in
`main.ts`, no story, no demo, no site import) and full functional overlap
with `pp-popup` + `pp-tooltip`. Delete the component, its orphaned
`styles/hover-card.css` (144 lines, including `__reference-preview` /
`__user-preview` variants nothing renders), and any style-index import.
First run the both-directions borrow sweep that is standard before any
deletion; the survey found nothing, but the sweep is the gate.

Done. The sweep confirmed it: no import, no story, no demo, and no rule
anywhere keying on a `hover-card__` class. The only surviving mentions are
prose (`item-view.mdx` naming "hovercard" as a kind of overlay) and the
historical plans, both left alone.

### 2. Convert MermaidDiagram (rung 3) — landed as `pp-diagram`

35 lines, stateless: a memoised string→SVG call into
`dangerouslySetInnerHTML`. Becomes a small light-DOM element (or a plain
render function behind the existing `data-demo="mermaid"` mount — take the
simpler). `MermaidDiagram.astro` already emits the container. Consumers:
the `mermaid` demo-registry entry plus `Overflow.mdx` / `Button.mdx`
stories.

Done, as `pp-diagram` (`components/diagram/`), taking its source through a
`source` prop. The site's `Diagram.astro` emits the element instead of a mount
point; Storybook MDX writes the tag directly and drops its import.
`Conversation.mdx` turned out to import the component without using it —
import removed.

The name is not the renderer's. `beautiful-mermaid` is a swappable dependency,
and it was the only vendor name among the catalogue's tags. More usefully,
`diagram` marks a real boundary against the chart family: `pp-bar-chart` and
its siblings take *data* and compute a picture, while this one takes a
description an author composed by hand and lays it out. Authored, not
computed — which is also why it doesn't live under `charts/`.

One thing the element has to do that the React component didn't: registration
is sitewide, so a static `import 'beautiful-mermaid'` would put ~330 KB on
every page. The renderer loads behind a dynamic import on first use, shared
per page. Check this survives any future edit — in the built site it shows up
as a `__vite__mapDeps` entry on the layout's script chunk, not a static import.

`scripts/verify-demo-registry.mjs` counted `<MermaidDiagram>` as a registry
mount; it no longer is, and the script was corrected.

The rename reaches further than the tag, because `extract-graph-data.ts` reads
decision trees out of the MDX *source text*: it matches the tag and the prop by
name, so a half-done rename would drop trees from the pattern graph silently.
Its regex, the six content pages, `PatternArticle`'s component mapping, the
`chart-index` comments in `.claude/rules/pattern-content.md` and
`relationship-vocabulary.md`, and a `pp-diagram` entry in `jsx-types.ts` all
moved together. Verified by diffing the extractor's output across the rename:
12 decision-tree edges, identical set.

Left alone deliberately: the `chart-index` frontmatter key. It is
decision-tree vocabulary rather than this element's surface, its only usage is
form.mdx's dead block, and `2026-07-decision-tree-integration.md` already has
that block queued for deletion — renaming the key belongs to that plan.

### 3. Replace animate-change-in-height with CSS — dropped, premise didn't hold

The unit assumed `interpolate-size: allow-keywords` / `calc-size()` could
replace the component. They can't, for this use. Those properties let a
transition interpolate *to and from* `auto` when the specified value changes —
`height: 0` → `height: auto`. What the component animates is different: the
wrapper's height stays `auto` throughout while a `Combobox` list filters down
underneath it. A transition fires on a computed-value change and there is none,
so the CSS-only version snaps in every browser, not only old ones.

That left three options — accept the snap everywhere, or rebuild the behaviour
as a small light-DOM element (ResizeObserver writing `style.height` in px with
a plain CSS transition, which would also drop `motion`), or leave it. Decided
2026-08-07: leave it. `AnimateChangeInHeight` and its four call sites
(`filter-components.tsx`, `demos/filtering.tsx`,
`demos/data-view/FilterControls.tsx`,
`demos/data-view/ProductFilterValueDropdown.tsx`) stay as they are, and
`motion/react` remains a filter-family dependency.

### 4. Swap PatternGraph for pp-network-graph (rung 3)

The generic mechanism is already extracted: `pp-network-graph` lives in the
chart family (`charts/network-graph.ts`, `styles/network-graph.css`, a
Data visualisation story on mock data). It extends `ChartComponent`, with
one recorded deviation from the family: the viewBox is fitted to the
settled layout extent rather than the fixed 600×300, because a force
layout's aspect is data-driven. It carries the whole reading layer —
deterministic settled layout, degree-sized nodes, hover neighbourhood,
trail, `setExternalHighlight`, `pp-node-click` — and stays domain-blind:
node `attrs` pass through as `data-*` attributes for consumer CSS, edges
can opt out of pulling the layout (`layout: false`), `anchors` maps
categories to home regions.

What remains is the site swap:

- `pages/index.astro`: replace the React island with `<pp-network-graph>`
  plus a small script that builds `data` from `pattern-graph.json` +
  `activity-levels.json` (meta → `attrs`: at-level, lifecycle-stage,
  atomic-category, mediation, seed; `layout: false` on recommends edges;
  `anchors` from the category targets), feeds the hover channel into
  `setExternalHighlight` (path → id via its own map and
  `normalisePatternPath`), and navigates on `pp-node-click`.
- `pattern-graph.css` shrinks to the site-semantic overrides on the
  network-graph classes (at-level/mediation colours, edge-type dashes,
  seed ring, background); the colour-toggle block is dead — nothing
  renders it — and goes.
- Delete `PatternGraph.tsx`; `pattern-graph-hover.ts` carries over
  untouched. Payoff: one React island fewer on every site page.
  Verification: site build, index page and stacked panes render the graph,
  sidebar hover cross-highlights.

Done. The site half lives in `apps/patterns/src/lib/pattern-graph.ts`, called
from the page's own script.

`pattern-graph-hover.ts` did not carry over untouched after all — it moved to
`apps/patterns/src/lib/` beside its subscriber. `PatternGraph.tsx` was the only
thing in the package that ever imported it; with that gone, both ends of the
channel are site code, and the module is site-specific through and through (the
event is `pattern-graph:hover`, the payload a `/patterns/…` path). The generic
half of the mechanism was already in the right place —
`setExternalHighlight` on the component, which takes a node id and knows
nothing about patterns. It stays a separate file from `pattern-graph.ts`
despite being that module's only subscriber: `pattern-graph.ts` statically
imports the graph JSON, and `Nav.tsx` publishing through it would drag the
whole dataset into the nav island chunk on every page.

The same pass corrected where the site reads its graph data, and that ended a
duplication. The module first imported `@pkg/pattern-graph.json` — the copy
`extract-graph-data.ts` itself called `outputPathLegacy`, which existed only so
package code need not import from an app. `PatternGraph.tsx` was the package
code in question. With it deleted the mirror had no reader at all, so the two
JSON copies under `packages/components/src/`, the extractor's second pair of
writes, and `scripts/check-graph-mirror.mjs` — a gate that only ever guarded
hand-edit drift between the two — are gone. `apps/patterns/src/data/` is now
the single copy, which the site reads directly the way
`RelatedPatterns.astro` already did. Verified by diffing the extractor's
output across the deletion: byte-identical.

Three things about the swap are worth keeping written down, because each fails
quietly rather than loudly:

- *Absent, not empty.* React wrote `data-mediation={value ?? undefined}`, so a
  null left no attribute and `:not([data-mediation])` worked. The element
  stamps every key of `attrs`, so a null would arrive as the string `"null"`
  and the selector would match nothing. Null keys are dropped when building
  the data instead. Same for `data-seed`.
- *The host box.* The React version rendered into `<div class="pattern-graph">`,
  a block with `width: 100%`. A custom element gets no default box — the UA
  stylesheet gives `display` to known HTML elements only, so a `pp-` tag is
  inline until CSS says otherwise, upgraded or not — and the chart
  scaffold's container is `height: 100%` — right for charts that fill a box the
  page has sized, wrong here, because this SVG derives its own height from the
  viewBox fitted to the settled layout. Left inline, the container resolved its
  100% against the nearest block ancestor and took the height of the whole
  article column: a 5650px-tall graph wrapper around a 496px drawing. Fixed in
  `network-graph.css`, not the site override — every consumer had it, the
  Storybook story included: the host is `display: block` and the container's
  height comes from the drawing.
- *Specificity.* The component colours nodes by category at `(0,3,0)`
  (`.network-graph__node[data-category-index="N"] .network-graph__circle`).
  A site override written the obvious way ties at `(0,3,0)` and loses on
  source order, leaving every node on the categorical palette — a graph that
  looks fine and means nothing. Every rule in `pattern-graph.css` is prefixed
  with `pp-network-graph` to sit above it. Check computed `fill`, not that the
  graph rendered.
- *Re-arrival.* ClientRouter discards and rebuilds the page, so a bare
  `<script>` wires the graph once and every later return gets an element whose
  `data` is never set — an empty graph, not an error. Setup runs on
  `astro:page-load` too and marks the element it took. The hover subscription
  is taken out once for the document and reads a module-level slot; taking one
  out per mount would hold a whole discarded graph alive on every return,
  which is the leak `pattern-graph-hover.ts` already guards one level down.

The graph is home-page-only. Panes are built from pattern slugs
(`pages/patterns/[slug]/pane.astro`, `stack-store`'s glob over the content
directory) and the home page has neither a slug nor a pane route, so nothing
injects it into the stack.

One deliberate accessibility change came with the component: React put
`role="img"` and a descriptive label on the SVG, which flattens descendants to
presentation. `pp-network-graph` uses `role="group"` instead, because its nodes
are real keyboard-reachable controls and shouldn't be hidden from a screen
reader inside an image.

The colour-toggle CSS went with the toggle. The mediation scheme stayed:
`data-color-mode` moved onto the host element, so switching schemes is one
attribute, and neither block is dead-but-ungated.

### 5. Sidebar — deferred

654 lines of which 17 of 24 exports are one-line `div` wrappers adding
`data-slot` + `clsx`; the real work is in the 810-line `sidebar.css`. The
stateful core is small (open/collapse + cookie, one keyboard shortcut,
mobile sheet) and both base-ui dependencies duplicate light-DOM machinery
(`Tooltip` ↔ `pp-tooltip`, `Dialog` ↔ the modal's `createDrawerDOM`). A
rung-2 conversion would shrink the site's Nav island substantially — but it
rewrites `Nav.tsx` and two stories (`Sidebar.stories`, `Shell.stories`), and
the component is a deliberate shadcn port.

Gate answered 2026-08-07: deferred. The conversion is larger than units 1–4
together, and the Nav-island payoff isn't wanted enough to buy that. The
sidebar stays React; if it is picked up later it is its own plan, not a unit
of this one.

## Later, not here

- `pp-popup` accepting virtual anchors, which would dissolve
  `Reference.tsx`'s hand-rolled duplicate of the same floating-ui
  middleware stack. Belongs with popup work, not this sweep.
- `item-view/working-rung-store.ts` (zustand + localStorage holding one
  string) — a simplification candidate for whenever item-view's shape is
  next revisited.

## Nothing promoted

`promoted_to` is empty deliberately. The quiet-failure notes above read like
spec material, but they are general web-platform facts — a custom element
inherits no `display`, a percentage height needs a resolved containing block,
a heavy dependency behind a sitewide registration wants a dynamic import.
They cost time here because the work was a *conversion*, matching what React
had been doing implicitly; authored from scratch, none of them is a decision
anyone would have to be told. They stay in this trace rather than becoming
rules the repository has to carry.

## Verification (plan-level)

Recorded 2026-08-07, after units 1, 2 and 4.

- Storybook vitest suite: 42 failed / 151 passed, against a 43-failure
  baseline taken before any edit. No failure names a touched family. A run
  taken while the Vite cache was cold and Storybook dev was re-optimising
  reported 89 — that is noise, not signal; re-run on a warm cache before
  believing a jump.
- ESLint: 38 warnings, 0 errors, unchanged from baseline. Root
  `npm run test styles` is not a usable gate — its glob reaches built assets
  and reports ~121k errors on a clean tree; lint touched files individually.
- Site build green, 273 pages. Home page renders 135 nodes / 751 edges with
  activity-level fills, 19 seed rings, and no `data-mediation="null"`;
  sidebar hover cross-highlights; a node click navigates; the graph rebuilds
  after a ClientRouter round-trip.
- `pp-diagram` renders on the site and in both Storybook docs pages, with
  `beautiful-mermaid` still a dynamic dependency in the built chunk graph.
- `node scripts/verify-demo-registry.mjs --no-baseline` passes. Its default
  mode compares against `client:only` counts at HEAD and reports 35 failures
  on a pristine tree — the migration it checks is long since in history, so
  `--no-baseline` is the real gate.

Known and left alone: the mermaid renderer emits a fixed-width SVG that
overflows the reading column on the site. That predates this plan — the React
component rendered the same SVG into an equally unstyled `div`.

Not a regression: a React hydration mismatch on `pp-tooltip` in the Nav
(the element upgrades before React hydrates) reproduces on a pristine tree.
