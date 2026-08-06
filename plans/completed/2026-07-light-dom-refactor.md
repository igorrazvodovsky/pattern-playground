---
title: "Light-DOM refactor: platform-first components"
status: "completed"
kind: "exec-spec"
created: "2026-07-16"
last_reviewed: "2026-08-06"
area: "components"
promoted_to: "docs/specs/component-authoring.md"
superseded_by: ""
---
# Light-DOM refactor: platform-first components

## Context

The library's stated rule ("Don't use Shadow DOM by default — prefer light DOM",
`.claude/rules/web-components.md`) and its practice have drifted apart: 16 of 19
Lit components carry `static styles` and render into shadow roots. This plan
closes that gap, component by component, in the spirit of HTML web components
(light-DOM custom elements that enhance the HTML composed inside them) and the
architecture Elena/Piccalilli describe — but *without* changing authoring
library. Lit reaches light DOM with one override (`createRenderRoot() { return
this }`, already used by the chart primitives), which makes the refactor
incremental and keeps the library decision cheap and last.

Why now, beyond hygiene:

- *Accessibility seams.* None of the form controls use `ElementInternals` /
  `formAssociated`, so shadow-boundary inputs don't participate in forms or
  label association. Light DOM with native elements dissolves the problem
  rather than solving it.
- *Styling coherence.* The 2026-07 style-boundary work made the light-DOM
  cascade the governed, layered, `@scope`-guarded path. Shadow components sit
  outside that system with duplicated conventions (`?inline` imports).
- *Platform catch-up.* `popover`, `<dialog>`, `@scope`, and (progressively)
  anchor positioning replace much of what shadow encapsulation and JS
  positioning were doing.

### Census (2026-07-16)

- 19 Lit components; 16 shadow-DOM (`static styles` via `?inline`), 3–4 light
  (chart primitives, `d3-component.ts` base).
- Plain-`HTMLElement` light-DOM components already: toast, modal, table,
  sections, toc, avatar, h.
- Already CSS-only or native-HTML catalogue entries: badge, tag, card, callout,
  counter, kbd; dialog, details, textarea, checkbox, radio. The library is
  more platform-first than its Lit corner suggests.
- One customised built-in: `PpButton extends HTMLButtonElement` (an empty
  stub), spread across surfaces as `is="pp-button"` (92 usages repo-wide,
  2026-07-16 count). WebKit does not implement customised
  built-ins, so this pattern silently does nothing in Safari.

### Relation to existing plans

- *Supersedes* the style-boundary plan's open follow-up ("migrate the
  light-DOM chart primitives to `static styles`"). Direction reversed: the
  chart primitives were right all along; the rest of the library moves toward
  them.
- *Defers to* `active/2026-04-transient-layers-tech.md` for overlay strategy
  (Popover API for layering, Floating UI for positioning, anchor positioning
  as `@supports` enhancement). Phase 3 executes within that decision.
- *Coordinates with* the Storybook re-bucketing and pattern-demos migration:
  conversions must not retitle catalogue entries (docs ids are load-bearing
  for `ComponentRef`/`realised_by`), and demo work in flight should target
  the post-conversion markup where phases overlap.

## Principles: the decision ladder

For any component, existing or new, take the first rung that suffices:

1. *Native HTML + CSS.* No custom element at all. A button is a `<button>`
   with a class; a switch is `<input type="checkbox" role="switch">` styled.
2. *Composite enhancement.* A light-DOM custom element that renders nothing
   and enhances the children it is given. For wrappers around author content.
3. *Light-DOM render.* The element owns and renders its subtree (charts,
   spinners). Document that author children will be clobbered — ownership is
   now a convention, not a boundary.
4. *Shadow DOM.* Only with a written justification in the component file:
   genuine need for style isolation or third-party embedding. Expected
   residue: approximately none.

Slots do not exist below rung 4. Composition happens through real children
and, where a component needs named regions, `data-*`-attributed children
(e.g. `data-slot="prefix"`) — consistent with the existing "data-attributes
as JS hooks" rule.

## Inventory and intended fates

| Component | Lines | Slots | Fate |
|---|---|---|---|
| spinner | 25 | 0 | Rung 3 or demote to rung 1 (SVG + CSS, no JS) |
| switch | 112 | 0 | Evaluate rung 1 (native checkbox + CSS); else rung 3 |
| range | 188 | 2 | Evaluate rung 1 (`input[type=range]` + CSS); else rung 3 |
| input | 198 | 3 | Rung 2: enhance a real `<label>` + `<input>` |
| select | 196 | 6 | Hardest slot surface; decide rung 2 vs keep-last |
| breadcrumbs | 120 | 1 | Rung 2 — pilot candidate |
| tab / tab-group / tab-panel | 74/372/60 | 3/2/1 | Rung 2, converted as a family |
| list / list-item | 422/239 | 1/4 | Rung 2, converted as a family |
| priority-plus | 35 | 1 | Rung 2 |
| popup / tooltip / dropdown | 285/273/587 | 2/2/2 | Phase 3, per transient-layers plan |
| bar-chart | 514 | 0 | Verify: `static styles` is inert if the base renders light DOM — likely dead code |
| pp-button (built-in) | 14 | — | Retire; class-based `<button>` (rung 1) |

## Phases

Each phase is independently landable; each component conversion is one
commit-sized unit with its own verification. Phases 2–4 can be split into
separate plans if they grow discoveries of their own.

### Phase 0 — recipe and pilot

Convert `pp-breadcrumbs` (small, one slot, no form or overlay entanglement)
to establish the recipe:

1. `createRenderRoot() { return this }`.
2. Replace `<slot>` with direct children (composite: stop rendering what the
   author already wrote; enhance it — roles, separators, `aria-current`).
3. Move `?inline` CSS into `src/styles/` as a layered file
   (`layer(components)`), selectors rewritten `:host` → `pp-breadcrumbs`,
   internal selectors wrapped in `@scope (pp-breadcrumbs)` where leakage is
   plausible. Note `breadcrumbs.css` already exists in `styles/` — reconcile
   rather than duplicate.
4. FOUC guard: author pre-upgrade HTML that is acceptable unstyled, plus a
   `pp-breadcrumbs:not(:defined)` rule only if needed.
5. Events, tag name, catalogue title unchanged.

Verification: Storybook story renders identically; vitest storybook project
green; stylelint + `check-style-boundary` green; pattern-site demo pages spot-
checked (library CSS is layered under `lib`, so new files inherit the
boundary for free).

Write the recipe's discoveries back into this plan before proceeding.

#### Recipe discoveries (Phase 0, executed 2026-07-31)

- *`::slotted(X)` means child, not descendant.* Rewrite as `> X` (or
  `:scope > X`), never a descendant selector. Several shadow rules turned out
  to be dead because they assumed direct children that never existed in real
  markup (`::slotted(.crumbicon)`, `::slotted(.home-label)`) — audit each
  `::slotted` rule against actual usage before porting it.
- *The light-DOM override file already governed.* For slotted (light-DOM)
  children, outer-tree document styles beat shadow `::slotted` styles, so
  `styles/breadcrumbs.css` overrides were the effective values all along.
  Reconciling means merging to the *effective* styling, not the shadow
  sheet's text; dead custom properties (`--_crumb-color`, `--_crumb-gap`,
  `--_separator-size`, `--_crumb-shadow-color`) were dropped.
- *Event delegation replaces observer machinery.* A rung-2 host can listen on
  itself (`click`, `change`) instead of MutationObserver + per-element
  listener add/remove. The conversion deleted the observer, the `@state`
  init flag, and both listener-management methods.
- *Nesting under the tag selector suffices.* One `pp-breadcrumbs { … }` block
  with nested rules prevents leakage without `@scope`; reserve `@scope` for
  cases needing a lower boundary (donut scoping).
- *No `:not(:defined)` rule needed* — links and crumbs are acceptable
  unstyled; styling keys off the tag selector, not upgrade state.
- *Enhancement*: the host now sets `role="navigation"` in `init()` when the
  author didn't provide one.
- *A11y bonus*: the disguised select's `opacity: 0.01` (light file) was
  failing axe color-contrast in the Advanced story pre-conversion; the merged
  file uses `opacity: 0` (the shadow sheet's original intent), which axe
  treats as hidden — Breadcrumbs stories now fully green.
- *Environment*: `npm run test-storybook` was broken at root before this work
  — npm nests all `@storybook/*` packages under `packages/components/`
  (the `@storybook/addon-mcp` peer chain prevents hoisting), while vitest
  bundles the root config into root `node_modules/.vite-temp`, where
  `@storybook/addon-vitest` doesn't resolve. Resolved 2026-08-06: the
  vitest config now lives only in the components workspace
  (`packages/components/vitest.config.ts`), the root script delegates with
  `-w`, the root config and the symlink bridge are gone. Recorded in
  `docs/quality/dev-environment.md`.

### Phase 1 — demotions (rung 1)

- *spinner*: keep the `<pp-spinner>` tag if useful for authoring, but it can
  be a CSS-only element (styled tag selector) with no definition. Decide
  whether `role="progressbar"` in markup templates suffices.
- *switch*: prefer `<input type="checkbox" role="switch">` + CSS. The current
  component's labelled-by/described-by machinery exists *because* of the
  boundary; native association replaces it. Catalogue entry stays (it already
  documents checkbox/radio natively). If API compatibility matters for
  existing stories, a thin rung-3 element is the fallback.
- *range*: same evaluation against `input[type=range]`.
- Sweep stories and demos for the affected markup. Docs ids unchanged.

Outcomes (2026-07-31): *spinner* → rung 1, CSS-only `styles/spinner.css`
(border-ring `::after`, three turns per `--speed` to match the SVG's sweep);
definition deleted; standalone usages carry `role="progressbar"` +
`aria-label` in markup, decorative-beside-text usages carry nothing.
*switch* → rung 1, `input[type=checkbox][role=switch].switch` in
`styles/switch.css` (`appearance: none` track, `::before` thumb,
`switch--small`/`switch--large`); `pp-switch` deleted, stories rewritten to
native inputs, Switch.mdx gains a Markup section. *range* → rung 3
light-DOM render (fill percent, marks, and value readout genuinely need JS);
structure flattened (the `.form-control` wrapper layers were unstyled),
author prefix/suffix children stay in place as `data-slot="…"` children
ordered by CSS `order`, so no projection layer and no React ownership
conflict. Note: `pp-switch`'s ToggleInteraction test failure is a
pre-existing storybook/user-event incompatibility (fails on baseline too);
the native-input rewrite did not change it.

### Phase 2 — structural wrappers (rung 2)

Order: input → tab family → list family → priority-plus → select.

- Apply the Phase 0 recipe. The slot count in the inventory table approximates
  per-component effort; `pp-select` (6 slots) goes last and gets its own
  decision: if it is re-rendering heavily, it may be better held for Phase 5
  alongside the library decision than forced into rung 2 now.
- Form controls (input, select): native elements in light DOM restore label
  clicks and form participation without `ElementInternals`. Note `pp-select`
  already wraps a real `<select>` and projects light-DOM `<option>` children
  into it via slot — rung 2 mostly means removing that projection layer, which
  improves its odds of not waiting for Phase 5.
- Subtree-ownership rule applies: a rung-2 component must not re-render
  children it didn't create; reactive updates mutate attributes/classes on
  existing children.

Outcomes (2026-07-31): all five conversions landed, including select — its
projection layer dissolved as predicted and it did not need to wait for
Phase 5. New authoring contracts: *input* composes a native `<input>` (+
`data-slot` adornments) inside the `pp-input` box, clear button
component-appended, `data-empty` reflected for CSS; *select* composes a
native `<select>` (+ `data-slot="hint"` / `data-slot="error"`), caret
component-appended, placeholder is an authored disabled option; *tab family*
composes a `data-slot="nav"` strip of tabs plus panel children — the group is
a grid that places component-appended scroll buttons without wrappers, and
the JS-measured sliding indicator became CSS on `pp-tab[active]` (slide
animation dropped); *list family* keeps label content as loose children —
discovery: an anonymous-text label can't grow in flex, so the push-right
moved to an auto margin on the first suffix-side element, and element labels
keep ellipsis via a `:not([data-slot])` rule; check/chevron are
component-appended; `getTextLabel()` now reads unmarked child nodes;
*priority-plus* had an empty shadow sheet all along — one-line conversion,
plus the overflow-clone engine now rewrites copied `slot` attrs to
`data-slot`. Component-appended owned nodes (buttons, carets, check marks)
coexist with React-owned children without conflicts. `slot=` →
`data-slot=` swept across 16 usage files (34 renames); `dropdown.ts`
submenu detection accepts both until Phase 3 rewrites it. Full storybook
suite: baseline 43 failures (all pre-existing: axe colour-contrast debt and
a storybook/user-event `patchFocus` incompatibility on play-function
stories) → 42 after conversion. Watch item: `Tabs > Scrolling Tabs` failed
once in a full parallel run but is stable in isolation across repeated
runs. Re-checked 2026-08-06: did not reproduce across four isolated runs of
the Tabs file nor a full suite run (still exactly 42 pre-existing
failures); the story has no play function, so the one-off was render/axe
timing under parallel contention — watch closed unless it recurs.

### Phase 3 — overlays (popup, tooltip, dropdown)

Execute within `transient-layers-tech.md`'s settled strategy. Light-DOM
conversion composes with it: `popover` needs no shadow root, and the
style-boundary plan already noted these components portal to `document.body`
— their styles must be global regardless, which shadow DOM was actively
fighting. Keep Floating UI; keep the `@supports (anchor-name: --a)`
enhancement layer. `pp-popup` stays the shared positioning utility.

Outcomes (2026-07-31): *popup* — the element itself is now the positioned
box: Floating UI drives the host's `left`/`top`, the `popover` attribute
(and `showPopover()`) live on the host, and author children are the content
in place, so no wrapper and no re-parenting; the `popup` accessor returns
`this` for old-API consumers. Anchor is external only (property, id, or a
`data-slot="anchor"` child) — the anchor slot had no usages. *tooltip* —
rung 2: the first author child is the target; the element appends the
popup + body it owns and renders the `content` attribute into it (the
content slot had no usages). *dropdown* — rung 2 with a contract change:
the author composes `data-slot="trigger"` plus an explicit `<pp-popup>`
panel child; the dropdown wires trigger interaction and aria, pushes its
positioning config onto the popup, and keeps the submenu machinery (which
already moved live nodes and now round-trips `data-slot="submenu"`). The
panel skin moved onto the popup box (`.dropdown__panel` class set by the
component), written to out-specify the top-layer popover resets. ~20 usage
files swept (trigger rename + panel wrapper). Note: the old dropdown
show/hide animation animated a `display: contents` host and was visually
inert; it now actually animates the panel.

### Phase 4 — retire the customised built-in button

- Delete `PpButton` and its registration; establish `button.css` class-based
  styling as the single mechanism (it already exists).
- Sweep `is="pp-button"` (92 usages repo-wide) to classes. Mechanical;
  do it in one sitting so the two conventions never coexist ambiguously.
- Update the `primitives-button--docs` entry prose if it mentions the `is`
  attribute.

Outcomes (2026-07-31): `PpButton` deleted (component, registration,
`main.ts` export, jsx-types entry); all 100 `is="pp-button"` occurrences
across 29 files removed in one sitting — safe everywhere because the class
was an empty stub, so the attribute changed nothing even in Chromium. The
Button docs never mentioned the `is` attribute, so no prose change. The
dropdown's legacy `pp-button` accessible-trigger branch went with it.

### Phase 5 — residue and the library decision

After phases 0–4, count what still genuinely uses Lit's machinery (reactive
re-render into an owned subtree — likely charts, possibly select). Only then
decide: minimal Lit, vanilla + small helpers, or Elena. This decision is
deliberately last because the refactor makes it small. Record it as a
decision-record plan.

Residue count (2026-07-31, phases 0–4 complete): zero shadow roots remain
(`static styles`, `?inline`, `<slot`, and `attachShadow` greps are all
clean; the two chart `static styles = ChartComponent.styles` lines were
dead — the base class defines none — and were removed along with two inert
`<slot>` elements in chart primitives). Components that still genuinely
re-render an owned light-DOM subtree: the chart family (bar-chart,
scatter-plot, choropleth, map, chart-grid/legend/axis on the D3Component
base) and `pp-range` (track + marks + value readout). `pp-tooltip` renders
one small owned popup+body. Everything else uses Lit only for reactive
properties and lifecycle on a rung-2 host — the machinery the library
decision actually weighs. The decision itself now lives in
`active/2026-08-component-library-decision.md` (strawman: minimal Lit,
research-gated).

## Risks and constraints

- *Ownership discipline replaces encapsulation.* Without shadow boundaries,
  a re-rendering component can eat author children, and page CSS can reach
  component internals. The first is handled by the rung-2/rung-3 distinction;
  the second by `@scope` blocks and the (already enforced) layer boundary.
- *`static styles` in light DOM is silently inert* (adopted stylesheets need
  a shadow root). `bar-chart.ts` may already be in this state — verify, and
  make the recipe's step 3 non-optional so no component lands half-converted.
- *Slot-styling idioms* (`::slotted`, `part=`) in existing CSS must be
  rewritten, not deleted — grep for both during each conversion.
- *Demos and stories are the regression surface.* There are no visual
  regression tests; each conversion's verification leans on Storybook
  stories, the vitest storybook project, and spot-checks of pattern-site
  demo blocks. Budget for that in every unit.

## Out of scope

- Catalogue platform (Storybook vs VitePress/CEM). The component-manifest
  research settled resolution authority on Storybook's `index.json`; nothing
  here disturbs that.
- Adopting Elena now (Phase 5 decides, later).
- React subsystems (item-view, combobox, command-menu, sidebar, editor) —
  different substrate, untouched by this plan.

## Verification (plan-level)

- `npm run test` (eslint), `npm run test styles` (stylelint), storybook
  build, vitest storybook project — green at every phase boundary.
- `scripts/check-style-boundary.mjs` green (new CSS files must be layered).
- Cross-reference validator green (no docs-id drift; titles untouched).
- Grep gates at the end: no `static styles` without a rung-4 justification
  comment; no `<slot` outside rung-4 components; no `is="pp-button"`.

Results (2026-07-31): grep gates all pass. Storybook build green.
Storybook vitest suite: 42 failures vs 43 at baseline — every failure is
pre-existing (axe colour-contrast debt on buttons/badges/tabs/muted text,
plus a storybook/user-event `patchFocus` "Illegal invocation" on every
play-function story) and one was fixed (Breadcrumbs Advanced). Story
buckets and graph-mirror checks green. Visual spot-checks on the built
Storybook: input addons, tabs with icons/subtitles, open dropdown, select
sizes, switches — all render correctly. Known-dirty at baseline, unchanged:
repo-wide stylelint (config disagrees with the corpus's BEM and `--_x` /
`--c-*` naming conventions; new files match the corpus), workspace `eslint .`
(lints `public/storybook` build output; the only two source-file errors
pre-date this work), `verify-demo-registry.mjs` (pane-stack-refit state),
and `tsc --noEmit` (244 errors, down from 277 at baseline; no gate runs it).
Environment note: `npm run test-storybook` was broken before this work —
npm nests `@storybook/*` under `packages/components` (addon-mcp peer
chain) while vitest bundles the root config into root
`node_modules/.vite-temp` where `@storybook/addon-vitest` doesn't resolve.
Fixed durably 2026-08-06: the vitest config moved into the components
workspace, the root script delegates with `-w`, and the symlink bridge was
removed; full suite re-verified green-at-baseline (42) under the new
arrangement.

## Open questions — all resolved

- Does `pp-select`'s interaction model survive rung 2? *Yes* — its
  projection layer dissolved and it landed in Phase 2 (see outcomes there);
  nothing waits for Phase 5.
- Pre-upgrade content policy: per-component acceptable-unstyled HTML proved
  enough across every conversion; no component needed a `:not(:defined)`
  rule, so no shared convention exists. Recorded in the spec.
- Decision-ladder promotion: done 2026-08-06 —
  `docs/specs/component-authoring.md` is the settled spec; the rules file
  stays operational and now points there.
