---
title: "Elena migration: the library follows the philosophy"
status: "active"
kind: "exec-spec"
created: "2026-08-07"
last_reviewed: "2026-08-07"
area: "components"
promoted_to: ""
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
- Reference implementations: `pp-tab-group` (rung 2) and `pp-range`
  (rung 3) on the probe branch, commit 903ce80c.

## Phases

1. *Land the probe.* Merge `elena-probe` (range, tab-group,
   `@elenajs/core` dependency, `optimizeDeps` priming, the
   `hide-value` CSS rule).
2. *Rung-2 sweep* — batched mechanical, one territory, against the
   rung-2 recipe: breadcrumbs, dropdown, input, list, list-item,
   popup, priority-plus, select, tab, tab-panel, timestamp. Classify
   each against the decision record's residue count first; any that
   turn out to render an owned subtree move to phase 3 rather than
   getting half-migrated.
3. *Rung-3 sittings* — one judgment sitting per component:
   `pp-tooltip` (owned popup + body), plus any reclassified from
   phase 2.
4. *Charts restructure* — not a faithful port. `D3Component` /
   `ChartComponent` move to Elena for props and lifecycle only; D3
   owns the DOM outright, ending the lit-html-and-D3
   two-renderers-in-one-component arrangement. The primitives
   (chart-grid, chart-legend, chart-axis) follow the same rule. Own
   sitting; expect judgment calls, not mechanics.
5. *Retire Lit.* Remove the dependency; port or delete
   `utility/slot.ts` and `utility/watch.ts`; sweep docs and rules for
   Lit-specific guidance (`docs/specs/component-authoring.md`,
   `.claude/rules/web-components.md` rung-3 wording,
   `.claude/rules/typescript.md` `ValueConverter` note); confirm
   `npm ls lit` is empty.

## Watch conditions

- `@elenajs/ssr` stabilising — server-rendered `pp-*` elements become
  reachable once it does; no Astro adapter exists yet, but the
  string-in/string-out design admits one.
- Single-maintainer risk: if Elena is abandoned, vendor the ~572-line
  core rather than reverting the migration.
