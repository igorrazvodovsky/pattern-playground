---
paths:
  - "packages/components/src/components/**/*.ts"
---

# Web components

Settled model: `docs/specs/component-authoring.md` — light-DOM, platform-first,
take the lowest rung of the decision ladder that suffices. The authoring
library is Elena (`@elenajs/core`): https://elenajs.com/ for lifecycle, props,
rendering, and events; conversion recipes and gotchas in
`plans/completed/2026-08-elena-migration.md`. Reference implementations:
`tab-group` (composite enhancement), `tooltip` and `timestamp` (owned-subtree
recompositions).

Elena grain this project learned the hard way:
- `updated()` carries no changed-props map — compare previous-value fields,
  seeded in `firstUpdated()`.
- On rung 3 Elena's renderer owns the whole child list: author children are
  re-adopted as fragments (position survives, element identity does not) —
  document that per component.
- Props holding live DOM elements need `{ name, reflect: false }` and stay
  camelCase; only attribute-reachable props get kebab-case names.

Project conventions:
- Register via `src/components/register-all.ts` in dependency order — never
  `customElements.define()` inline (ESLint enforces).
- `connectedCallback` guards on `document.readyState` before initialising
  (see `tab/tab.ts`).
- Events are `pp-`-prefixed `CustomEvent`s with `bubbles: true, composed: true`.
- JS hooks are descriptive `data-*` attributes — never CSS classes, never
  `role`/`aria-*` (ESLint enforces). Styling hooks are classes; an undefined
  custom tag is never a styling hook.
