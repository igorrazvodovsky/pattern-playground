---
title: "Elena migration: the library follows the philosophy"
status: "completed"
kind: "exec-spec"
created: "2026-08-07"
last_reviewed: "2026-08-07"
area: "components"
promoted_to: "docs/specs/component-authoring.md, .claude/rules/web-components.md, .claude/rules/typescript.md"
superseded_by: ""
---
# Elena migration: the library follows the philosophy

## Why

The component-library decision
(`completed/2026-08-component-library-decision.md`) landed on adopting
Elena (`@elenajs/core` v1.0.1) as the authoring library, decided
2026-08-07 on grain, not capability: for this playground the material
should push toward HTML-first composite components, and the probe
showed Elena doing exactly that. This plan is the dependency change
that verdict implies. Lit leaves when the last phase completes.

## Recipes (established by the probe, branch `elena-probe`)

- *Rung 2 (composite enhancement):* `static props` plus class fields
  replace decorators; the Lit import drops; nothing else moves. Elena
  has no attribute-name mapping, so kebab-case attributes become
  quoted class fields (`'no-scroll-controls' = false`) read via
  bracket access. Every host gains an automatic `text` capture and a
  `hydrated` marker attribute; both are harmless but real.
- *Rung 3 (owned subtree):* the template keeps structure and simple
  text/attribute parts only. Boolean and absent-when-empty attributes,
  `aria-*` wiring, and live value sync move to an imperative
  `updated()`. Interpolated fragments must be memoized or every
  re-render falls off the patch path onto a full morph. Elena's
  renderer owns the whole child list: author-provided children are
  captured before first render and re-adopted as fragments — position
  survives, element identity does not. Document that per component.
- *Additions from the rung-2 sweep:*
  - Elena's `updated()` carries no changed-props map, so `@watch`
    handlers and `updated(changed)` guards become manual previous-value
    fields compared in `updated()`; seed them in `firstUpdated()` when
    the old code used `waitUntilFirstUpdate`.
  - Props that hold live elements (`anchor`, positioning boundaries)
    must be `{ name, reflect: false }` — reflection serialises object
    props as JSON and a DOM element cannot survive that. They stay
    camelCase; only attribute-reachable props need kebab-case names.
  - Anything that reacts to a prop-change *event chain* at teardown
    time must not rely on it: prop changes dispatch on a microtask, so
    listeners removed synchronously (e.g. a dropdown closing) miss
    them. Tear down directly instead (dropdown now closes submenus
    inline in its hide path).
- *Addition from the rung-3 sittings:* Elena coerces an incoming
  attribute by the type the prop *currently holds*. A prop documented
  as string-or-object (`pp-timestamp`'s `value: DateInput`) must route
  its attribute through an `attributeChangedCallback` override that
  hands the raw string to the property — once the prop has held a
  `Date`, an ISO attribute string would go through `JSON.parse` and be
  lost.
- *Addition from the charts sitting:* a prop whose name collides with a
  native reflecting property (`title`) must not be a class field. The
  field initializer assigns through the native setter inside the
  constructor — Elena installs its accessors only on first connect —
  which writes a `title=""` attribute, and `createElement` rejects a
  constructor that produces attributes. Instead `declare` the type and
  define an own data property in the constructor
  (`Object.defineProperty(this, 'title', { value: '', … })`); Elena
  captures it as the prop default on first connect. Lit never hit this
  because its decorator shadowed the native accessor at class-definition
  time.
- Reference implementations: `pp-tab-group` (rung 2) and `pp-range`
  (rung 3) on the probe branch, commit 903ce80c.

## Phases

1. *Land the probe.* Done 2026-08-07: `elena-probe` merged to main
   (range, tab-group, `@elenajs/core` dependency, `optimizeDeps`
   priming, the `hide-value` CSS rule).
2. *Rung-2 sweep.* Done 2026-08-07: breadcrumbs, dropdown, input,
   list, list-item, popup, priority-plus, select, tab, and tab-panel
   migrated. `pp-timestamp` reclassified to phase 3 — it renders an
   owned `<time>` subtree with conditional attribute parts, exactly
   what the clone parser rejects. Notes from the sweep:
   - `pp-list-item`'s unused `aria-setsize`/`aria-posinset` props were
     dropped; the platform's own `ariaSetSize`/`ariaPosInSet`
     reflection covers that surface.
   - Kebab-case renames (`has-submenu`, `submenu-open`, `auto-size`,
     …) ripple only into `list.ts` and `dropdown.ts`; attribute names
     are unchanged, so no story or site markup moved.
   - Verified against baseline: ESLint clean, typecheck no worse
     (popup went from six pre-existing errors to one), story test
     suite identical failure set (42 pre-existing, mostly a11y
     contrast). Dropdown open/select/submenu/Escape exercised by hand;
     the one behavioural fix is the inline submenu teardown recorded
     in the recipes above.
3. *Rung-3 sittings.* Done 2026-08-07: both recomposed as composites
   rather than porting their templates, so neither passed through
   rung 3 at all.
   - `pp-tooltip` — `render()` dropped: the owned `pp-popup` + body
     are built imperatively once on first connect, and the `content`
     string is written into the body as text. The three `@watch`
     handlers became previous-value fields compared in `updated()`,
     which also pushes positioning config onto the owned popup — the
     dropdown's shape, applied to an owned child instead of an
     author-composed one.
   - `pp-timestamp` — inverted to composite: enhances a `<time>` child
     (author- or server-written, created once when absent), mutating
     `datetime`/`title`/text in place. Without a `value` the child is
     left untouched, so server-rendered absolute dates survive as
     pre-upgrade content. The `value` attribute rides the
     `attributeChangedCallback` override recorded in the recipes.
   - Verified: ESLint clean; typecheck errors 243 → 234 with none in
     the two files; rendered `<time>` markup identical to the Lit
     version, so `Timestamp.mdx` needed no change. Exercised by hand
     in Storybook — tooltip: hover/focus show, Escape via
     CloseWatcher, disabled-while-open hides, content change rewrites
     and repositions, `pp-show`/`pp-after-show`/`pp-hide`/
     `pp-after-hide` order; timestamp: ISO attribute, `Date` and epoch
     properties, threshold crossing both ways, author-written `<time>`
     adoption, refresh after a DOM move.
   - `utility/watch.ts` now has no users — phase 5 deletes it rather
     than porting it.
4. *Charts restructure* — Done 2026-08-07, not a faithful port.
   `D3Component`/`ChartComponent` moved to Elena for props and
   lifecycle only; the lit template gave way to an SVG scaffold built
   imperatively once on connect, and D3 owns everything inside it.
   `updated()` redraws unconditionally — clear-and-redraw is
   idempotent — which retired the whole `shouldRerender`/changed-map
   machinery rather than porting it. The primitives and `pp-map`
   follow the same rule. Judgment calls made:
   - The `<pp-tooltip .position=… .visible=…>` fragments in bar-chart
     and scatter-plot were phantom API — the tooltip has no such
     props and never rendered anything — and were dropped, not
     ported. Hover/click/keyboard events and aria-live announcements
     stay; bar-chart's keyboard nav gained scatter's persistent
     focused index (the old handler reset to 0 on every keypress).
   - The screen-reader data table is now built imperatively per
     redraw (`syncDataTable` on the chart base). The attribute-side
     data converters were dropped: every consumer sets `data` as a
     property, and Elena's JSON coercion covers the attribute path.
   - Attribute-reachable props went kebab-case per the recipe
     (`show-axes`, `animate-chart`, `color-steps`, `tile-url`,
     `selected-id`, …), rippling into the four data-visualisation
     stories, `Table.stories.tsx`'s mini chart, and the
     collection-view renderers. Object- and function-valued props
     (`data`, `margin`, `locations`, scales, coordinators) stay
     camelCase with `reflect: false`.
   - `pp-map` creates its canvas before `super.connectedCallback()`
     so Elena's first-connect `firstUpdated` finds it; prop changes
     ride prev-value fields, and `select()` catches the
     selected-id prev field up inline so the microtask update cycle
     doesn't re-apply the selection as an API change (which pans).
   - The `title` prop's native-property collision surfaced here; the
     recipe above records the fix (applies to the chart base and
     chart-legend).
   - Verified: ESLint clean; typecheck 234 → 230 with none in the
     touched files (the four cleared were bar-chart axis typings);
     story suite identical 42-failure set (a11y, none chart-related).
     Exercised by hand in Storybook and on the site — bar chart
     (axes, grid, both orientations, value/category labels), scatter,
     choropleth (regions, legend), map (tiles, pins, selection from
     both marker click and `selected-id`, popup, attribute
     reflection), Table's mini charts, collection-view map and plot
     renderers, and the linked-trio demo on the pattern site.
5. *Retire Lit.* Done 2026-08-07. `lit` left both workspaces,
   `@astrojs/lit` left the site's Astro config (all islands are
   React), and `eslint-plugin-lit` left the root ESLint setup.
   `utility/slot.ts` and `utility/watch.ts` deleted — no consumers
   remained. `@storybook/web-components-vite` turned out to be an
   unused leftover (the Storybook framework is react-vite) and went
   with them. Docs swept: `docs/specs/component-authoring.md` records
   the migration as complete and drops the `static styles` residue;
   `.claude/rules/web-components.md`'s rung-3 wording now describes
   Elena's child capture/re-adoption; `.claude/rules/typescript.md`
   replaces the `ValueConverter` note with Elena's type-directed
   coercion rule and drops the stage-3 decorators mention. Verified:
   `npm ls lit` empty; ESLint 0 errors; typecheck at the 230
   baseline; site build (241 pages) and Storybook build both clean.

## Ladder review (2026-08-07)

A pass over the catalogue against the decision ladder, looking for
components that can move down a rung — the direction the Elena
adoption is meant to push. Items marked *open* are design decisions
awaiting a verdict, not scheduled work.

Already at the right rung: sections, toc, priority-plus, modal, toast,
table, list-label, and h are vanilla; the rung-2 sweep covered the
reactive hosts; list, list-item, dropdown, tab-group, input are
genuinely interactive composites.

*Dissolve to HTML + CSS:*
- `pp-avatar` — dissolved 2026-08-07 to class-and-cascade, Kelp-style:
  an image avatar is `<img class="avatar">` directly, initials/icon/
  chip avatars are `<span class="avatar">`, sizes ride `data-size`
  with medium as the classless default. The class had only added
  redundant CSS classes and `role="img"` + `aria-label` around an
  `<img>` whose own `alt` carries the semantics. The tag left the
  markup entirely — an undefined custom tag misleads (it promises
  behaviour), so dissolution means class, not tag-as-hook.
- `pp-breadcrumbs` (open) — `role="navigation"` belongs on a real `<nav>`;
  the click interception that emits `breadcrumb-navigation` (and
  prevents default on every link) is demo glue, not component
  behaviour. Candidate for a documented `<nav><ol>` pattern; the event
  wiring moves to the stories that need it.
- `pp-h` — dissolved 2026-08-07. The class was empty; its one real job
  was participating in the sections mechanism's heading selector, and
  a JS hook belongs on a `data-*` attribute, not a tag. The selector
  now keys on `[data-heading]` (`<p data-heading>Overview</p>`); the
  tag, class, registration, and JSX type entry are all gone.

*Decoration moves to the cascade (open):*
- `pp-select`'s caret and `pp-list-item`'s check/chevron are appended
  by JS but are pure decoration — pseudo-element territory. Functional
  appended controls (input's clear button, tab-group's scroll buttons)
  rightly stay JS.

*Lean harder on the platform (open):*
- `pp-modal` hand-rolls focus trapping and Escape handling that native
  `<dialog>`/`showModal()` already provide, and does backdrop-click
  geometry that `closedby` now covers; the non-`<dialog>` fallback
  path could retire.
- `pp-range` renders its own `<input type="range">` where input and
  select enhance a native control the author composes — the one grain
  inconsistency among the form components. Inverting it would make
  label association and form participation native.
- `pp-popup` on CSS anchor positioning would retire Floating UI, but
  anchor positioning is not cross-browser yet — stays a watch
  condition, not a move.

## Watch conditions

- `@elenajs/ssr` stabilising — server-rendered `pp-*` elements become
  reachable once it does; no Astro adapter exists yet, but the
  string-in/string-out design admits one.
- Single-maintainer risk: if Elena is abandoned, vendor the ~572-line
  core rather than reverting the migration.
