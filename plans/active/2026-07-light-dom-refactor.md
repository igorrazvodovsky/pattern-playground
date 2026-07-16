---
title: "Light-DOM refactor: platform-first components"
status: "active"
kind: "exec-spec"
created: "2026-07-16"
last_reviewed: "2026-07-16"
area: "components"
promoted_to: ""
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

### Phase 3 — overlays (popup, tooltip, dropdown)

Execute within `transient-layers-tech.md`'s settled strategy. Light-DOM
conversion composes with it: `popover` needs no shadow root, and the
style-boundary plan already noted these components portal to `document.body`
— their styles must be global regardless, which shadow DOM was actively
fighting. Keep Floating UI; keep the `@supports (anchor-name: --a)`
enhancement layer. `pp-popup` stays the shared positioning utility.

### Phase 4 — retire the customised built-in button

- Delete `PpButton` and its registration; establish `button.css` class-based
  styling as the single mechanism (it already exists).
- Sweep `is="pp-button"` (92 usages repo-wide) to classes. Mechanical;
  do it in one sitting so the two conventions never coexist ambiguously.
- Update the `primitives-button--docs` entry prose if it mentions the `is`
  attribute.

### Phase 5 — residue and the library decision

After phases 0–4, count what still genuinely uses Lit's machinery (reactive
re-render into an owned subtree — likely charts, possibly select). Only then
decide: minimal Lit, vanilla + small helpers, or Elena. This decision is
deliberately last because the refactor makes it small. Record it as a
decision-record plan.

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

## Open questions

- Does `pp-select`'s interaction model survive rung 2, or is it the one
  component that justifies staying a rendered island until Phase 5?
- Pre-upgrade content policy: is `:not(:defined)` styling wanted as a shared
  convention, or is acceptable-unstyled HTML per component enough?
- Should the decision ladder be promoted to `docs/specs/` once two phases
  have exercised it? (Leaning yes — it is current-truth material, and the
  rules file should stay operational rather than doctrinal.)
