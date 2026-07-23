---
title: "View-system demos: one model, many framings"
status: "active"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-18"
area: "demos, components"
promoted_to: ""
superseded_by: ""
---
# View-system demos: one model, many framings

## Context

The view-system reshape (`2026-07-view-system.md`) leaves the family as
interconnected patterns with no hub: data-view, item-view, overview-detail,
coordinated-views, purpose-keyed-view, problem-curated-view,
attribute-visibility, semantic-zoom, focus-and-context, with malleability as
the quality the family enacts. This plan owns the demo collection for those
pages.

Two goals govern every decision:

1. _The interconnection is the content._ With the hub retired, no page can
   host a "system of views" survey; the whole has to emerge from the demos
   themselves — the reader recognises the same data reframed as they move
   between pages.
2. _Fidelity to the primaries._ Malleable ODI (Min, Chen, Cao & Xia, CHI '25)
   supplies the design space and the evidence the demos dramatise; Meridian
   (Min & Xia, UIST '25) supplies the spec shape the demos stay compatible
   with.

Substrate facts (2026-07-18): demos live in
`packages/components/src/demos/<slug>{.tsx,/}`, embedded via
`@pkg/demos/*` + `client:only="react"` inside the injected `<Demo>` wrapper;
Storybook borrows the same exports. The data-view demo (card/list/table,
`controls` prop, slices for filtering/sorting/grouping) runs on
`shared/data/products.json`; item-view demos run on tasks; semantic-zoom is a
tldraw canvas with hardcoded cards; focus-and-context carries its own
`JuiceProduction.json`. Overview-detail, coordinated-views,
purpose-keyed-view, problem-curated-view, and malleability have no demos.
There is no shared demo scaffolding module.

That fragmentation undermines the family's own claim — four pages, four
unrelated datasets, where the pattern language says "one model, many
coexisting projections".

## The two commitments

1. _One model._ Every family demo draws from the circular-economy products
   collection (`shared/data/products.json`, enriched — Phase 0). Its deep
   attribute tree (specifications, lifecycle, sustainability) is precisely
   the surface fluid attributes needs: more attributes than any overview
   would dare show.
2. _One spec shape._ A `ViewSpec` object — query, representation,
   arrangement, detail invocation, malleability — that every demo consumes.
   Each demo is then a `(model, spec)` pair, and the patterns differ only in
   what varies:
   - data-view: the actor edits the spec (the framing controls are a spec
     editor)
   - attribute-visibility: the actor edits `shownAttributes`, per view
   - saved views: named specs
   - overview-detail: two specs at different rungs, coupled by focus
   - coordinated-views: n specs, coupled by propagated designation
   - semantic zoom: a ladder of `shownAttributes` under one scale control
   - focus-and-context: the rung as a function of distance from attention
   - purpose-keyed view: specs keyed by recurring purpose and attention
     budget
   - problem-curated view: detection rules emitting (spec patch, reason)
     pairs
   - malleability: which spec fields the actor may touch

   The algebra the reshape committed to in prose becomes executable, which
   is goal 1 discharged by construction rather than by a survey page.

## Meridian: adopt now or stay compatible?

Decision: _adopt the shape now, not the machinery._

What we take — field names and semantics where the corpus doesn't already
have a word: `shownAttributes`; detail invocation as `openIn` / `openFrom` /
`openBy` (side-by-side, popover, new-page × item-or-attribute × click/hover);
a `malleability` block that is on by default and selectively `disabled`. The
corpus vocabulary stays the outer structure (query / representation /
arrangement); Meridian's terms name the insides.

What we leave — the data-binding language (roles, attribute groups,
conditionals, transforms, `bindingId`), recursion machinery, the developer
package, the console widget, AI spec generation. That is the paper's research
apparatus; the demos need the state object, not the framework.

Why now is cheaper than later: the demos need exactly this state object
anyway — the existing DataView demo already holds all of it as ad-hoc
useState. Naming it once costs nothing, and pays three times over: the saved
framing becomes a portable, displayable object (the data-view page's Meridian
citation demonstrated, not just cited); semantic zoom's reduction to
per-level attribute selection becomes literal; and if the saved-view node
ever mints, it has a concrete referent. Adopting the full Meridian package
later would be a rewrite either way — the shape is the part with lasting
value.

```ts
interface ViewSpec {
  id: string;                                  // saved views name specs
  label?: string;
  query: FilterClause[];                       // which items
  representation: {
    type: 'list' | 'card' | 'table' | 'map' | 'plot';
    rung: 'glyph' | 'summary' | 'detail';      // item-view ladder, population side
    shownAttributes: AttributePath[];
  };
  arrangement: {
    sortBy?: SortClause;                       // manual rank is a SortClause too
    groupBy?: AttributePath;
    groupLayout?: 'sections' | 'lanes';        // block axis or inline axis
  };
  detail?: {
    openIn: 'side-by-side' | 'popover' | 'new-page';
    openFrom: 'item' | AttributePath;
    openBy: 'click' | 'hover';
    shownAttributes: AttributePath[] | 'all';
  };
  malleability?: Partial<Record<
    'query' | 'representation' | 'arrangement' | 'content',
    { disabled: true }
  >>;                                          // absent = fully malleable
}
```

(Sketch, not contract — settle exact clause types against the existing
filter/sort utilities during Phase 0.)

There is deliberately no `'board'` representation type: a board is grouping
on the inline axis — card representation + `groupBy` + `groupLayout:
'lanes'` — and everything else board-ish falls out of that or of
writability (empty lanes stay visible because lanes are write
destinations; swimlanes are two groupings, one per axis; per-lane rank is
a manual sort scoped to groups). The view switcher still offers "Board" as
a named spec preset, which is itself a demo beat: the Board button
revealed as a composite the actor can take apart.

## Phase 0 — substrate

- `packages/components/src/demos/view-family/`: `spec.ts` (ViewSpec, patch
  helpers), `data.ts` (the canonical collection, finders), `renderers.tsx`
  (registry mapping `representation.type` → renderer). Ownership note:
  shared scaffolding borrowed by every family demo, per the move-keyed
  convention; data-view continues to own its composition components.
- Enrich `products.json` where thin: `price`, `condition`, a `location`
  (named site + coordinates for the map/glyph renderers), `listedAt`.
  Keep the deep attribute tree untouched — it is the point. Verify the
  existing DataView filters/search against the enriched shape.
- Refactor `demos/data-view/` internals onto the spec: one spec object plus
  a patch reducer replaces the scattered viewMode/attributes/filters/
  grouping state. The `controls` prop re-expresses as the malleability
  block (`controls.filter: false` ⇒ `malleability.query.disabled`); keep
  the exported slice API stable so the filtering/sorting/grouping embeds
  don't move.
- Renderers are reusable building blocks first, demo code second: each
  lives in the component catalogue with its own Storybook entry, and
  `renderers.tsx` composes the block rather than implementing it.
  Everything this plan needs beyond card/list/table exists (2026-07-18):
  _map_ and _plot_ landed on main as `pp-map` (Leaflet, keyboard-operable
  pins — supersedes the schematic-SVG idea; feed it the `location`
  coordinates) and `pp-scatter-plot`, merged into this branch. The board
  is not a representation renderer but the `groupLayout: 'lanes'`
  arrangement: a CSS-only block (`.board` / `.board__column` in
  `styles/board.css`, composing the existing `.card` block). Dragging between lanes — writing through the
  grouping — is demo behaviour layered on top in Phase 1, not part of the
  block. Calendar/timeline stay aspirational prose.
- Drag-and-drop strategy (decided 2026-07-18): Atlassian's Pragmatic drag
  and drop (`@atlaskit/pragmatic-drag-and-drop`), added when Phase 1
  starts. It carries every dragging gesture in this plan — card between
  lanes (writable board, Phase 1), attribute chip between detail and
  overview (fluid attributes, Phase 3), manual rank within a lane if a
  demo wants it. Chosen over dnd-kit (the current React default with a
  built-in keyboard sensor and sortable preset) because the core is
  framework-agnostic and headless: it attaches to any element — React
  demo today, a rung-2 `pp-board` enhancement if drag ever promotes into
  the catalogue — builds on the native HTML5 drag API, and its ~5 kB core
  keeps pattern pages light. The cost — no out-of-the-box keyboard drag —
  is taken deliberately: every dragging demo also ships an explicit
  non-pointer path (a move-to-lane menu on the card, a visibility toggle
  on the attribute chip), which is the accessible route and doubles as
  narration that the write goes through the projection, not the gesture.

## Phase 1 — data-view

1. _DataViewDemo_ (kept, now spec-driven). Narration on the page already
   lands the anatomy: filter = query, switcher = representation,
   sort/group = arrangement, attribute selector = the malleable overview.
2. _Saved-views demo_ (new): three named specs — developer default, a role
   view, a personal view — switched whole from a dropdown, the whole
   framing travelling as one named object. Include one visibly stale saved view
   (its query names a category that no longer matches much) to carry the
   lifecycle consequence: saved framings accumulate and want pruning.
3. _Attribute-temperaments slice_ (new, small): hoarder and minimalist
   presets on the attribute selector — the two temperaments from the user
   study as one-click states, arguing for configurability over guessing a
   middle. Owned by attribute-visibility (`demos/attribute-visibility.tsx`);
   data-view embeds it as a borrow.
4. _Writable-views demo_ (new): the Board preset (cards + `groupBy:
   status` + `groupLayout: 'lanes'`); dragging a card between lanes writes
   the grouping attribute through the projection; one illegal write
   (dragging into a computed group) is refused and the refusal surfaced.
   The claim is about grouping, not boards — writability travels with the
   `groupBy`, whichever axis the groups run along. This lands the main
   plan's deferred "drag-between-groups interaction in the data-view
   demo".

## Phase 2 — item-view

- Migrate the ladder demos from tasks to one canonical product, the same
  entity at every rung (the context trade-off is each demo's secondary
  job): _glyph_ — a dot/pin among the population (rendered by the map or
  plot renderer: a glyph is only legible inside a population, so it is the
  population renderer's job, not ItemView's — which also sidesteps the
  deferred micro/mini/mid/maxi vocabulary seam); _reference_ — an @mention
  in running prose; _summary_ — a row among peers, a card standalone;
  _detail_ — popover/panel; _full_ — the entity page.
- Requires a `ProductAdapter` for ItemView alongside the existing task/
  quote/project adapters.
- _Transitions demo_ (new): one demo walking the ladder with the designed
  mechanism at each crossing — hover reference → popover, click row →
  panel, panel → full page — and the place preserved on the way back down
  to the collection.
- The task-based demos retire only after a borrow sweep in both directions
  (stories included).

## Phase 3 — overview-detail, and the malleability borrow

The centrepiece; no demo exists today.

1. _Core ODI demo_: overview spec (compressed, few attributes) beside
   detail spec (full), the current item propagating both ways, place kept
   on return. A layout switcher runs the same spec pair through
   `openIn: side-by-side | popover | new-page` — the new-page case
   simulated in-frame as the list-page → item-page roundtrip with place
   kept. That demonstrates the reframe's central claim: layout is one
   value of the pattern, and the sequential roundtrip is this pattern's
   own form.
2. _Fluid-attributes demo_: attributes mode over the same pair. Starting
   state honours the evidence — the overview shows little beyond price
   (the Airbnb ceiling as the demo's opening friction). The actor surfaces
   an attribute from the detail view into every overview item, hides
   another, then sorts and filters by what they surfaced —
   surface-then-sort and surface-then-filter as the paper's observed
   workflows. Owned by attribute-visibility (the pattern that names the
   move, minted 2026-07-18); overview-detail and malleability embed it as
   borrows.
3. _Composition demo_ (stretch): two overviews — list and map — sharing
   one detail. Build once; it is also coordinated-views material and gets
   borrowed there (or owned there and borrowed here — decide at build
   time by which page narrates it more centrally).

malleability.mdx borrows demo 2 with the malleability block exposed:
toggling `content: {disabled: true}` shows malleable-by-default,
selectively disabled — enforced framing as degenerate framing, still a
framing. Neither borrower owns the demo — attribute-visibility does; the
quality page gets its first demo without owning one.

## Phase 4 — coordinated-views

- _Linked trio_: list + map + detail over the collection; brushing and
  linking. Hover moves focus (transient highlight everywhere the item
  appears); click stakes a selection (marked in every view until
  released) — the selection-vs-focus distinction from the mint, live.
  Propagation is instant; a decouple toggle greys the stale view to show
  the self-evidence guideline (couple visibly or visibly decouple).
- _Cross-filtering variant_: brush a region of the plot (price × carbon
  footprint) and the list prunes — the BI case, grounded product-first.
- The instantiates edge to overview-detail is shown by the shared
  composition demo (Phase 3.3): one artefact, embedded on both pages.

## Phase 5 — purpose-keyed view and problem-curated view

1. _The three purposes_: one collection keyed three ways — monitor
   (aggregate tiles + a trend strip, glanceable), explore (the general
   data-view, borrowed from Phase 1), investigate (a drilldown path
   bottoming out in the item's full view). Same data throughout; the
   keying, not the content, is what changes. Landed as three separate
   demos, one per variant subsection, rather than one behind-a-toggle
   switcher: the three states render three unrelated UIs (aggregates vs.
   the full data view vs. a drilldown), so a live toggle never showed the
   same items restaging — the sameness is conceptual, and the prose
   carries it. Demo-beside-its-prose also gives each `###` subsection its
   own illustration and drops the toggle's overlap with the watch-to-chase
   demo's glance tiles. Exports: `MonitorDemo`, `InvestigateDemo`; explore
   embeds `DataViewDemo` directly (the borrow-map row).
2. _Watch-to-chase tiers_ (the capstone): ambient badge → at-a-glance tile
   wall → focused slice → item full view. Movement inward is deliberate
   (nothing auto-expands); the framing is preserved on the way back out;
   the outer tier's omissions are narrated as the consequential curation
   decision. This demo doubles as the family tour — monitoring
   (purpose-keyed) hands to a flag (problem-curated) into a pruned
   overview-detail down to the full item view — the whole in one flow,
   hosted on the family's largest move. No hub page required.
3. _Problem-curated checklist_: detection rules over the collection
   (missing dimensions, price an outlier for its category, listed too
   long) render as a checklist; each flag is a (spec patch, reason) pair.
   Selecting a flag prunes the general view to the relevant slice,
   annotated with why it fired; the unpruned exploratory view stays one
   action away (the escape hatch as structure, not courtesy); every flag
   carries a not-useful control that acknowledges feedback — the noise
   budget made tangible.

## Phase 6 — semantic-zoom and focus-and-context touches

- _Population-rung demo_ (new): a zoom slider moves every item one rung at
  a time — glyph ↔ summary ↔ detail card — implemented as
  `shownAttributes` per level, the Meridian reduction the page already
  cites. A semantic-resize mode drives the same ladder from container
  width instead of the slider (the Masonview variant line from the main
  plan's Phase 5).
- The tldraw canvas demo stays as the spatial-canvas instance.
- focus-and-context (optional): a fisheye strip over the collection —
  focused item at full rung, neighbours at summary, the rest glyphs — the
  rung as a function of distance from attention. The existing
  ContextualNavigationDemo stays; sweep borrows before touching anything.
  (Superseded 2026-07-22: the demo's rebuild — certainty as the distance
  metric — was spun out to `2026-07-contextual-navigation-rebuild.md` and
  landed 2026-07-23; the borrow sweep came back empty, nothing else imports
  it. The demo is now three certainty bands over `JuiceProduction.json`, not
  the entity page this line described.)

## Borrow map

| Demo | Owner page | Borrowed by |
| --- | --- | --- |
| DataViewDemo | data-view | purpose-keyed-view (explore) |
| Filtering/sorting/grouping slices | data-view | filtering, sorting, grouping (unchanged) |
| Writable board | data-view | grouping (orientation) |
| Fluid attributes | attribute-visibility | overview-detail, malleability |
| Attribute-temperaments slice | attribute-visibility | data-view |
| List+map composition | overview-detail or coordinated-views | the other of the two |
| Ladder demos | item-view | — (glyph rides the map/plot renderers) |
| Population-rung zoom | semantic-zoom | — |
| Checklist | problem-curated-view | — |
| Tiers capstone | purpose-keyed-view | — |

Storybook placement (2026-07-18, superseding the earlier per-demo-story
norm): pattern demos get no Storybook entries. Storybook is the
form-language catalogue (docs/language/pattern-and-form.md); a catalogue
entry is normative, and a pattern demo is a move realisation — listing it
promotes one realisation to a contract. What Storybook gains instead is a
`Templates/` bucket for compositions reused whole, seeded with
`Templates/Collection view`: the ViewSpec-driven skeleton (representation
switching, grouping, presets-as-specs), stripped of the demos' narrative
staging. To keep the dependency arrow pointing the right way (pattern
borrows form), the substrate graduated out of `demos/`:
`demos/view-family/` → `templates/collection-view/`, taking
`AttributeUtils`/`SortingUtils`/`FilterOperations`/`FilterTypes` from
`demos/data-view/` with it; the pragmatic-dnd loader landed in
`utility/dnd.ts`. The pre-existing `Components/Semantic zoom` entry (on
`main` before this work) still borrows a demo and awaits the same call.

## Sequencing and coordination

- Phase 0 gates everything; Phase 1 before 2–5 (the ODI needs both sides;
  the purpose switcher borrows the explore view).
- Demo embeds land after the corresponding page lands in the main plan's
  phases; the embed-narration bullets already reserved there (the
  `controls` prop as designer-side disabling; "demo optional" at the
  coordinated-views mint) are satisfied by Phases 1 and 4 here.
- Wiring per page: import from `@pkg/demos/*`, `client:only="react"`,
  inside `<Demo>`; the optimizeDeps glob already covers `demos/**`.

## Execution state (2026-07-18)

Phases 0–6 are implemented on `view-system-reshape`; every borrow-map row is
wired (page embeds + Storybook stories) and the site builds green. Where the
build deviated from the letter of a phase:

- _Collection size._ `products.json` grew 5 → 13 items alongside the
  attribute enrichment: board lanes, map pins, plot brushing, and the
  category-median outlier rule all need a population (the rule requires ≥3
  items per category). Statuses and conditions vary across the new items;
  the flag bait is deliberate — a missing material passport (task chair), a
  low and a high price outlier (power bank, wool jacket), one stale listing
  (remanufactured laptop, 2025-09-30).
- _Cross-filter brush._ `pp-scatter-plot` has no drag-brush API, so the
  cross-filtering demo brushes with a price-range control that drives both
  views (out-of-range points grey via per-point colour, the list prunes). A
  true rectangle brush waits on the chart component growing one.
- _Ladder migration in place._ The task-based item-view demo exports were
  reimplemented on the canonical product under their existing names, so the
  story and page borrows never broke; no separate retirement step remained.
- _Trio ownership._ The list+map+detail composition landed as
  coordinated-views' `LinkedTrioDemo`; overview-detail embeds it as the
  composition borrow (the build-time decision the plan left open).
- _Transitions demo_ keeps its panel and full view in-frame rather than
  going through the modal service — the collection staying visible is what
  narrates place-kept.
- _Monitor tier_ ships aggregate tiles with a cycle-over-cycle trend on
  each (label, figure, delta, one-line reading — the stat-card anatomy).
  The delta is real: the current figure derives from `products`, the
  baseline is a committed prior-cycle snapshot
  (`shared/data/catalogue-snapshot.json`), and `upIsGood` is per-metric so
  the same arrow reads good on listings and bad on carbon. This reverses
  the earlier "without the trend strip" deferral for the tile-level delta;
  a per-tile _sparkline_ (a time series, not a single prior reading) still
  joins the calendar/timeline line in the deferred list, since the snapshot
  carries one prior point, not a series.
- _data-view.mdx_ gained a minimal `## Writable views` section as the
  board demo's host — the main plan owed the section and the demo needed a
  home; the prose is deliberately two sentences.
- _SSR note._ Demos load `@atlaskit/pragmatic-drag-and-drop` lazily inside
  effects via `view-family/dnd.ts` — its directory subpaths don't resolve as
  Node ESM, so a static import breaks Astro's prerender even under
  `client:only` (the prerender chunk keeps a bare side-effect import).

## Browser verification (2026-07-18)

A driven pass over all ten pages against the built site (Chrome, `astro
preview`): representation/group switching, saved-view swap + stale empty
state, board drag and menu writes + computed-lane refusal,
chip drag + surface-then-sort/-filter, ODI layout switching, popover and
new-page detail, linked-trio propagation + decouple, cross-filter range,
ladder walk (mention hover → row panel → full page → back, place kept),
investigate drilldown, watch-to-chase walk, checklist prune + dismissal,
rung zoom, fisheye focus, malleability lock. Four defects found and fixed:

- Badge buttons on cards sat under the `.card__hit` cover, making
  surface-then-filter unreachable by pointer — raised
  `.card__attributes :is(button, pp-dropdown)` above the cover.
- `.card`'s `container-type: inline-size` makes every card a stacking
  context, so later sibling cards painted over the ODI click popover —
  the open `.odi-anchor` now takes `z-index: var(--layer-dropdown)`.
- The checklist rows put both buttons in the chip grid's action cell
  (`.attribute-chip .button` matched the label button too) — the rule now
  excludes `.attribute-chip__label`.
- The sort button's "Sorted by" label lost its internal spaces to
  flex-item whitespace collapsing — the phrase is wrapped in one span.

Not exercisable headlessly: the semantic-resize mode's ResizeObserver (the
automation tab reports `visibilityState: hidden`, which suspends rAF/RO
callbacks browser-wide) — the observer path is standard and the zoom-slider
path drives the same rungs; worth one glance in a visible tab.

## Toolbar block (2026-07-21)

The family's control rows carried `.flex`, a layout utility, where the
catalogue already names the thing: `Components/Toolbar`. `.toolbar` was styled
only as `.sbdocs .toolbar` in `docs.css`, so it was Storybook-docs chrome
rather than a block — the site never saw it. It now exists as
`styles/toolbar.css` in `layer(components)`, imported from `components.css`,
carrying the row layout plus the narrow-`demo`-container wrap rule that was
written for toolbars but lived on `.flex`. The control rows of DataView,
FluidAttributes, WritableBoard, semantic zoom, the cross-filter brush, and the
`Templates/Collection view` skeleton take `.toolbar`; the Toolbar story drops
its `.flex`. Groups nested inside a toolbar (FilterControls, the label+slider
pairs) stay `.flex` — they are rows within a toolbar, not toolbars.

## Filtering alignment (2026-07-21)

Click-to-filter in the fluid-attributes demo is [filtering](/patterns/filtering)
territory, so the demo stopped owning filtering logic and the shared primitives
grew the case it needed. `spec.query` types filter clauses as `ProductFilter`
already; the demo's ad-hoc `{attribute, value}` state was the one place in the
family holding a query off-spec.

What the filtering substrate gained:

- `ProductFilter['type']` widened from the `ProductFilterType` enum to
  `ProductFilterField` (enum member _or_ attribute path), with an
  `isProductFilterType` guard. `productMatchesFilter` gained a path branch that
  matches on the value as displayed — `formatAttributeValue(getAttributeValue(…))`
  — which is the string the actor clicked. Enum clauses keep raw matching and
  their operator vocabulary untouched.
- `ProductFilterOperator.EQUALS`, the operator a clicked value states.
- `getUniqueAttributeValues(products, path)` beside `getUniqueFilterValues`, and
  `generateAttributeFilterCategories(products, paths)`, which makes each
  surfaceable path a filter category over the values the collection shows. Paths
  being categories is what keeps the chip components path-generic.
- `ProductFilters`, `ProductFilterOperatorDropdown` and
  `ProductFilterValueDropdown` accept either kind of field, so a path clause is
  editable exactly like a category one: widen it to alternatives from the chip,
  negate it, remove it. The operator re-derives on value count
  (`equals` ↔ `is any of`) so the chip always reads as what it matches.

Why editability matters rather than being polish: click-to-filter is
self-limiting. Once a clause narrows to `A = V`, every visible item shows `A = V`,
so no second value of `A` is clickable and accumulate-on-click is
indistinguishable from replace. The chip's value picker is the only reachable
route to a multi-value clause. By the same argument the overview can never go
empty — every clause is built from a visible item — so no empty state is owed
here.

## Grouping alignment (2026-07-21)

The writable-board demo was unusable in a narrow pane — lanes at
`min(18rem, 88cqi)` behind a horizontal scroll — and its controls stated the
claim narrowly: a two-button group offering status or price band, cards only,
lanes only. The claim is grouping's ("writability travels with the `groupBy`,
whichever axis the groups run along"), so the demo now varies what the claim
says is variable and the narrow-pane fix falls out of the same move.

- _Group-by_ is the shared `GroupingControls` dropdown over a curated list —
  availability status and condition (both written), price band (computed, and
  so refusing), plus _no grouping_, which renders flat cards and no write
  destination. The grouping attribute joins the card's shown attributes, so a
  write is visible on the item, not only in its position.
- _Orientation_ is a two-valued control, `.board--sections` or
  `.board--lanes`, opening on sections. It is stated rather than inferred: an
  earlier revision rotated the board from a container query and read the
  laid-out `grid-auto-flow` back through a `ResizeObserver` so the control
  could report what the space had decided. That was a rule firing where nobody
  asked for it, and a label that could go stale in a backgrounded tab; naming
  the axis costs a click and reads plainly. Sections to open with because a
  demo host is capped at the prose measure (~35rem on a wide screen), where
  four 18rem lanes never fitted — the thing that made the demo hard to use.
  Stacked sections span the host and lay their cards out
  `auto-fill minmax(14rem, 1fr)`, so a populous group doesn't run several
  screens long. The markup never changes across the rotation, so a lane stays
  a lane — and a drop target — through it; this is grouping.mdx's own claim
  made mechanical rather than a second layout.
- _A group is a `<details>`_, on both axes — the disclosure the block-axis
  grouping in `ViewSpecRenderer` already used, now the lane too, so the two
  grouping demos on the page are made of the same thing. This is the one place
  where collapsing has real teeth: the contents of a closed disclosure are
  skipped — not painted, not hit-tested, not in the accessibility tree — so a
  drop target registered on the card list inside would quietly stop existing
  the moment a reader collapsed the group. It is registered on the `<details>`
  instead, whose summary row stays on screen and catches the drop. Dwelling a
  drag over a closed group springs it open after 500ms (Atlassian's figure for
  the same gesture, and what the Finder trained everyone on), and a drop that
  lands before the spring opens the group anyway, so a card is never written
  into somewhere the reader can't see. The `<summary>` carries text and a
  count only: it is button-like, so any interactive descendant would be
  flattened out of the accessibility tree — a per-group control would have to
  sit beside it. Collapsing costs the pointer path nothing and the keyboard
  path nothing either, since the card's _Move to…_ menu names every
  destination whether or not it is open.
- _A collapsed group folds along the axis it runs on._ On the block axis it
  closes to a row, as a disclosure in prose does. On the inline axis it turns
  on its side: the lane narrows to a ~35px spine and its header sets vertical,
  the same move `.pane-spine` makes for a collapsed pane in the site's stack,
  with the marker and the count keeping their own writing mode so neither
  reads as a turned glyph. The spine stretches to the board's height, which
  makes the closed lane a taller drop target than the open one it replaced —
  collapsing a lane concedes width, not reachability. This is what moved
  `.board` from grid to flex: grid's implicit tracks are all one width, and a
  spine beside a lane needs two.
- _Feedback_ goes through `showToast` rather than an in-demo status line —
  both the write and its refusal, since they are one gesture answered two
  ways and the refusal has to be as visible as the success. The toast is the
  corpus's transient-feedback channel and carries its own assertive live
  region, so the demo owes no second one. The write's toast undoes on click,
  following the transient-feedback demos — a write through a projection can
  only be offered this casually because it is cheap to take back.
- _Substrate._ The demo stopped hand-rolling lane markup and consumes
  `BoardLanes` via `renderItem` + `renderLane`; `renderLane` now renders the
  `.board__column` section itself (it had no other consumer), which is what
  lets a demo-side component own the drop-target ref and hook state.
- Representation stays out of it: `DataViewGroupingSlice`, embedded above on
  grouping.mdx, already groups card/list/table.

## Fisheye alignment (2026-07-21)

The fisheye demo ran along the inline axis — a flex strip whose focused item
took `16rem` and whose far items were squeezed to `4rem` — which a demo host
capped at the prose measure has no room for. Rotating it to the block axis
fixed the pane and exposed the deeper problem: the collection was wrong for the
pattern. A fisheye needs its items ordered by something the actor holds, so
that distance from the focus is distance in their terms; a catalogue's
neighbours are whatever the sort happened to put there, so the compressed rows
were only a shorter list, not a preserved whole. The demo runs on a run of dated
records, so neighbours are neighbours in time.

The run was the ledger first (`transactions.json`) and is now a lifecycle
assessment: `shared/data/lifecycle-events.json`, 30 flows tracking one e-bike
from a 2010 aluminium billet to a 2026 landfill residue, each with its
kilograms of CO₂e — negative where recovery gave something back. Two reasons
for the change. The ledger spoke in business-report language, which the run's
own vocabulary did not earn; and a year of transactions makes the calendar
look almost adequate, where fifteen years of an object's life does not — half
these years hold a single entry, so a year is not a comparable unit of
anything and the binning has to come from somewhere else. The fixture is
general (`lifecycleEvents` from `@shared/data`), and carries a `site` field no
demo reads yet. `transactions.json` stays as it was for `Table.stories.tsx`.

- _One primitive at four grains._ A span is a contiguous stretch of the ledger
  with a date range, a sentence, and constituent spans; a transaction is a span
  of one whose sentence is its own description. The year, its chapters, their
  episodes and the entries are then the same kind of thing told more or less
  coarsely, which is what lets one recursive template render the tree. Four
  revisions were spent getting here, and each failed the same way — by treating
  the levels as different kinds of row (a chapter with a title and a total, an
  entry with a date and an amount) and then reaching for colour to explain the
  difference. The primitive is the fix; the colour was a symptom.
- _A stretch is on screen exactly once._ An open span is replaced by its
  constituents — it keeps its name as a caption, but its sentence goes, because
  a sentence and the things it summarises are the same stretch told twice. The
  previous arrangement kept a heading standing over its own children, so six
  weeks of the year appeared as a chapter sentence, three episode sentences and
  a run of entries all at the same moment, and the accent ground existed to say
  which of those rows was a duplicate container. Remove the repetition and the
  colour has nothing left to do.
- _Proportion alone cannot magnify, which took three attempts to see._ The
  first arrangement gave every span exactly its share of a fixed block — grow
  factors are record counts, summing to the length of the run — on the
  reasoning that if the shares always sum to the same thing, nothing can move.
  It does hold, and it is useless: one record's share of the frame is about
  9px, a record's row cannot be drawn shorter than its line at 28px, so a
  stretch opened into its records overflowed by three to one. What the reader
  got for opening an episode was a scrollbar. The lens now boosts the open
  path — `MAGNIFICATION = 3`, applied at every level, because each level
  divides only what the level above handed it — and the frame stays fixed
  while the proportions inside it change. That is a fisheye; equal shares are
  a bar chart.
- _So the terrain does move, and the earlier claim that it did not was wrong._
  Measured: opening a chapter pushes the chapters below it down by ~190px and
  moves its own top edge by 21px. It is safe to drive with the pointer anyway,
  because a band grows around the pointer rather than away from it, and the
  pointer stays inside a band that is now 236px tall. The invariant that
  survives is weaker and still worth having: the frame never grows, the whole
  run is on screen in every state, and the rail keeps one tick per record at
  one scale throughout. The page prose and the demo's own comment claimed
  stillness; both now say what actually happens.
- _Overflow is absorbed where it is caused._ Each `.fisheye__rail` scrolls
  itself and takes `min-block-size: 0`, and each band takes a floor of one line
  rather than of its content. Without those, a band that would not fit took the
  room off its neighbours and the whole frame moved; with them, a stretch too
  long for the room it can be given scrolls inside its own band and everything
  outside it stays put. The open path is capped at 66% of its parent, so
  context can never be squeezed out altogether — a 13-flow episode shows eight
  rows and scrolls the rest.
- _The rail is the constant map._ Every span carries one tick per record it
  stands for whether or not those records are showing, so the whole run is on
  the edge of the view at all times and at one scale. This is the arrangement
  in Wattenberger's fisheye for text, where a collapsed field still shows a
  segment per paragraph underneath it, and it is where the bearings come from
  once the ancestor headings are gone: position in the rail says where you are,
  so a heading does not have to.
- _Distance costs words as well as room._ A sentence is clamped to three lines
  at the centre, two one ring out, one beyond that — and in a pane under 26rem
  the outermost ring gives up its sentence entirely and keeps its name and its
  dates. This is the pattern working rather than a concession to the width, and
  it is also what holds the sum of the min-content floors under the height of
  the block, which a year of long sentences otherwise overflows.
- _The grouping is asked of a model_ (`POST /api/timeline/group`, added beside
  the existing `text/zoom` and `explain` endpoints). Where an episode ends is a
  judgement about what happened — a fire and its aftermath, a scale-up — and
  the calendar gets it wrong by construction; the model also writes each row's
  sentence, which is the whole difference between a coarse row that explains
  the year ("Rebuilt the sorting line after the fire") and one that counts it
  ("Fire settlement and 3 more"). This is Wattenberger's move exactly: his text
  fisheye has an LLM summarise runs of paragraphs so the far end of a document
  can still say something.
- _The endpoint is timeline-shaped, not ledger-shaped_: it takes
  `{id, date, label, amount?, category?}` records and returns
  `phases → episodes → startId`, so any dated
  run in the corpus can use it. Boundaries rather than member lists: asking the
  model to name every record it placed ran a 48-entry ledger into the token
  ceiling and lost sixteen of them, where a start per episode is short enough
  to be safe and makes coverage total by construction. `resolveGrouping` turns
  the boundaries into a span tree, discarding any start the model invented or
  put out of order and pulling the first back to the first record.
- _The run says nothing about itself at all._ The model was asked for a title
  and a sentence covering the whole run; both were waste, since the root is
  always open and its sentence is therefore never rendered, and a sentence
  spanning everything says nothing the reader cannot already see. The contract
  drops both (`TimelineGrouping` is now just `phases`). The root's caption went
  with them: naming the frame from inside the frame is a line that says
  nothing, and the demo host's own label already carries what the run is. The
  caption was also the keyboard's way back to the top, so Escape took that
  job — the pointer comes out by leaving, and the keyboard has no gesture for
  leaving.
- _A record at the centre is the one span the boost cannot reach_, because it
  has no constituents to hand space down to, and at the centre it wraps to two
  lines. Left on its proportional share it was clipped through the middle of
  its own sentence; it now takes the height its content asks for.
- _A squeezed band keeps its name and fades out the rest._ Text is anchored to
  the start of the band rather than centred, so the first thing lost is the end
  of the sentence and never the title, and the cut is a mask rather than a hard
  edge. A line sliced through the middle reads as a broken box; a fade reads as
  distance, which is what it is.
- _The fallback is the argument._ Until the grouping lands, and if the local
  API isn't running at all, the same view renders the calendar's own answer,
  with a line saying so. Over a multi-year run the calendar cannot use its own
  units — a year holding one flow is a 9px band — so it bins on the only thing
  it can see, gathering consecutive years until a run holds eight records:
  2010–2011, 2012–2014, 2015–2019, 2020–2026. Rows that can only count. The
  structure survives and the meaning doesn't, which is the comparison worth
  having on screen. (`ContextualNavigationDemo` showed an empty frame when this
  was written; it was rebuilt on 2026-07-23 and makes the same fallback
  argument with its own two computed bands.)
- _One ordering, one channel, and the ground inverted._ Distance from the lens
  used to run two ways at once: the rail from accent through `--c-accent-300`
  to `--c-neutral-300`, and the ground from the page through `--c-neutral-50`
  to `--c-neutral-100`. The rail was right and the ground was backwards — the
  further out a band was, the more tint it carried, so the resting view was a
  wall of grey and the one thing being read was a hole in it. Ground now says
  one thing only, about one span: the record under the lens takes
  `--c-accent-50`, and if the lens is resting on a stretch rather than a record
  that stretch takes `--c-neutral-50`. Everything else is the page. Distance is
  the rail's job alone, plus how much a band is allowed to say.
- _The root is the frame, and the frame is not a span._ Both `[data-tip]`
  rules — the 66% cap on how much room the lens may take, and the ground that
  says where it is — matched the run itself whenever the lens was resting at
  the top, which is the view's own opening state. The cap left the whole run
  crammed into two thirds of the block with a third of it empty, and the ground
  tinted everything. `data-root` exempts it from both.
- _Latency is a design surface here_, since the reader waits on the grouping
  before the view means anything. Three things bring it from ~35s to nothing:
  the endpoint runs on `config.openai.fastModel` (`gpt-4o`, overridable via
  `OPENAI_FAST_MODEL`) rather than the configured `gpt-4-turbo` — for
  segmenting a list the reader can already see, the larger model is slower
  _and_ worse, emitting out-of-order boundaries the resolver then drops; the
  handler memoises on the request body plus the model name; and the client
  keeps the answer in session storage, so moving around the site never pays
  again. Cold ≈ 8s, warm ≈ 4ms, cached ≈ 0.
- _The lens is a path, not a position._ It was an entry index, and every
  gesture had to be translated into one: hovering a chapter set the focus to
  `indices[length / 2]`, so asking for the spring fire opened an aluminium sale
  and asking for the fire's own episode opened a £410 packaging purchase. The
  focus is now the id of the span under the pointer, and the path to it is
  derived, so there is nothing left to guess. It rests at the root, so the view
  opens on the year rather than three levels down somewhere nobody chose — the
  old default was `transactions.length / 2`, which meant the overview was a
  state the demo could not reach.
- _Read from the reference by using it rather than looking at it_
  (wattenberger.com/thoughts/fish-eye, "The Elves and the Shoemaker"). Three
  things, none of which were visible in the screenshots. Every grain is
  permanently in the DOM: the summaries and the full paragraphs are siblings,
  and a grain that is not currently shown sits at `height: 0` rather than
  being unmounted. Each is absolutely positioned with a computed `top` and
  `height` in pixels, and everything carries `transition: all 0.15s
  cubic-bezier(0.4, 0, 0.2, 1)` — so a move of the pointer interpolates two
  numbers per item instead of producing a new layout. And it is far emptier
  than it looks in a still: ten paragraphs in 725px, one sentence per band,
  and a coarse summary given 350px to say a single line in.
- _Density came down to match._ 63 flows to 30, the frame from 38rem to 44rem
  (the reference's is 741px), sentences from three lines at the centre to two,
  and one everywhere else regardless of the room the band has. A record's share
  of the frame is now 23px against a row's 28px, so `MAGNIFICATION` drops from
  3 to 1.5 and a five-record episode opens into five rows with 9px left over.
  Filling a tall band with text because the room is there was most of what made
  the view feel crammed; the empty half of a band is the falloff being visible.
- _Animating the flex did not work, and the reason is worth keeping._ A
  `transition` on `flex-grow` is applied and does nothing: the band that opens
  is a different element from the band that closed, so it mounts at its final
  size, and the bands that survive keep the grow factors they had — what
  changed is the denominator, which is not a property and cannot be
  interpolated. Smoothness here is architectural, not a CSS line: it needs the
  reference's arrangement, where every grain stays mounted and the renderer
  computes `top` and `height` per item. That is a rewrite of the renderer and
  is not done.
- _One template for a record, and one mark on the rail._ Three switches went
  out together, each of them a second layout the reader had to cross on the way
  in. A record at the centre used to wrap to two lines, take the day and month
  spelled out, and gain its stage as an aside; it is now the same single line
  it is anywhere else, and the raised surface is what says the lens is on it.
  Days went with them — over fifteen years the day of the month is noise, and
  a flow is being placed in a life rather than in a week, so every date is a
  month and a year. And a record's tick was a dot where every other mark on the
  rail was a segment of a 3px bar; it is now that same segment. One shape at one
  scale down the whole rail is what makes it readable as a map — a mark that
  changes shape at the finest grain is claiming a difference in kind that the
  primitive explicitly does not have.
- _A stretch made of one thing is that thing._ The model gave an episode
  covering a single record ("Distribution to Market", one road-freight flow),
  and aiming at that flow put the lens on the episode instead. Opening a
  singleton costs a caption and returns nothing: the caption's room comes off
  the neighbours, so the band being aimed at moves out from under the pointer
  between the aim and the arrival, and the row ends up clipped by the band
  below it. `collapseSingletons` folds any level with one constituent into that
  constituent, applied to both the model's tree and the calendar's, and the
  prompt now asks for episodes of two to five records. Fixed in the data rather
  than the renderer so the path never contains the elided level and the rings
  stay honest. Verified by aiming: every record in the recall episode is still
  under the pointer after the lens moves to it, and aiming at an episode lands
  inside that episode.
- _An episode has a maximum size, and it is a layout fact._ The prompt holds an
  episode to between 2 and 5 records (6-10 episodes over 3-4 phases), because an episode is opened into rows and a longer one
  cannot be given room for them. The first run of the new data ignored the old
  wording ("no more than a sixth") and returned a 13-record episode, which is
  how the ceiling was found. `PROMPT_VERSION` and the client's `CACHE_PREFIX`
  move together on every prompt change; they are at 6.
- _Open: this is an exception to the one-model commitment_ — the page runs on
  `lifecycle-events.json` rather than the products collection — and the
  commitment is the plan's own, so it wants ratifying rather than assuming.
  The argument for the exception: focus-and-context projects no collection — its other two
  examples are a process hierarchy and a timeline — so the interconnection the
  commitment protects was never carried on this page. The fallback if it is
  refused: keep the products stack and give it a stated ordering (price,
  recency, carbon footprint), which buys meaningful adjacency but can only ever
  demonstrate the distance term.
- _It lands the page's Timeline example_, which had stood at `TODO: Demo` with
  prose that describes this demo exactly ("significant events highlighted with
  detailed information, routine activities summarised concisely"). The demo
  moved out of the lead slot into that section, so the page now opens on prose
  and the reader meets the `🚧 Contextual navigation` stub before the working
  demo — worth reordering the two example sections, or restoring a lead demo,
  whichever the page wants. (Reordered 2026-07-22: Timeline leads.)
- _Composition, and why it is not the stepper._ Earlier revisions built on the
  `.stepper` block and spent themselves overriding it — marker size, connector
  geometry re-hung off the marker, `--button-padding` to beat
  `.button:not(…):not(…)`. The rail here is a different object: it carries one
  tick per record rather than one marker per row, and its dashes scale with a
  band's height (`background-size: 100% calc(100% / var(--ticks))`), which the
  block has no way to express. `.fisheye` owns its own rail; the stepper keeps
  the timelines that are lists of moments.
- _Focus takes `mousemove`, not `mouseenter`._ Kept from the earlier revision,
  though it now guards much less: with the total conserved, a row no longer
  slides under a stationary pointer for the browser to re-resolve hover
  against. Requiring real pointer movement still states the rule the demo is
  about — the lens follows attention, not its own reflow — and it is what keeps
  the deepening deliberate as the pointer drifts down a chapter into an episode
  into its entries.
- _Superseded._ Phase 6's fisheye bullet ("a fisheye strip over the collection
  — focused item at full rung, neighbours at summary, the rest glyphs") is
  spent: no strip, no collection, and glyph stays the population-side rung
  where the map and plot renderers earn it. The export is
  `FisheyeTimelineDemo`.
- _Two fixes the intermediate products stack exposed_, both older than this
  change and both visible anywhere `ProductCard` renders: the icon was butted
  against the name (`ProductDetail` already separated them, the card didn't),
  and `Circular Fashion T-Shirt` carried `ph:tshirt`, which Phosphor doesn't
  have — the row was the only one with no icon.

## Deferred, with triggers

- _AI-assisted fluid attributes_ (natural-language surface/sort/filter; a
  generated computed attribute with hoverable provenance): the trigger is
  met — the fisheye's `timeline/group` endpoint settles that an API-keyed demo
  path is acceptable, and adds a second precedent beside `aiFilterAdapter`:
  ship a deterministic fallback that stands on its own, and say on screen which
  one the reader is looking at.
- _Calendar/timeline representations_: when the temporality line in
  data-view wants demonstrating rather than stating.
- _Full Meridian spec language or package_: only if a demo starts needing
  data-binding roles or recursion.
- _Editable-spec console_ (edit the JSON, watch the view): if the
  authorship-axis prose in malleability ever wants a demo of its own.
- _Canvas demo on the canonical collection_: when the tldraw demo is next
  touched for other reasons.

## Not owned here

- The pattern-page prose and edges (main view-system plan).
- The ItemView scope-vocabulary rework (micro/mini/mid/maxi vs the
  ladder's names) — glyph is handled population-side precisely so this
  plan doesn't force that seam.
- Workspace-boundary demos (2026-07-workspace-boundary.md).
