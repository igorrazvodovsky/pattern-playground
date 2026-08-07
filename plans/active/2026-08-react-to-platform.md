---
title: "React residue onto the platform-first ladder"
status: "active"
kind: "exec-spec"
created: "2026-08-06"
last_reviewed: "2026-08-06"
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
effort-to-payoff.

### 1. Delete hover-card

75-line prop-forwarding wrapper over base-ui with zero consumers (not in
`main.ts`, no story, no demo, no site import) and full functional overlap
with `pp-popup` + `pp-tooltip`. Delete the component, its orphaned
`styles/hover-card.css` (144 lines, including `__reference-preview` /
`__user-preview` variants nothing renders), and any style-index import.
First run the both-directions borrow sweep that is standard before any
deletion; the survey found nothing, but the sweep is the gate.

### 2. Convert MermaidDiagram (rung 3)

35 lines, stateless: a memoised string→SVG call into
`dangerouslySetInnerHTML`. Becomes a small light-DOM element (or a plain
render function behind the existing `data-demo="mermaid"` mount — take the
simpler). `MermaidDiagram.astro` already emits the container. Consumers:
the `mermaid` demo-registry entry plus `Overflow.mdx` / `Button.mdx`
stories.

### 3. Replace animate-change-in-height with CSS

37 lines of `motion` + ResizeObserver animating a filter dropdown's height.
Modern CSS (`interpolate-size: allow-keywords`, `calc-size()`) animates to
auto natively; unsupported browsers get an instant snap, which is an
acceptable degradation. Delete the component; drop the `motion/react`
import from the filter family if this was its last use.

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

### 5. Sidebar (gated — decide before starting)

654 lines of which 17 of 24 exports are one-line `div` wrappers adding
`data-slot` + `clsx`; the real work is in the 810-line `sidebar.css`. The
stateful core is small (open/collapse + cookie, one keyboard shortcut,
mobile sheet) and both base-ui dependencies duplicate light-DOM machinery
(`Tooltip` ↔ `pp-tooltip`, `Dialog` ↔ the modal's `createDrawerDOM`). A
rung-2 conversion would shrink the site's Nav island substantially — but it
rewrites `Nav.tsx` and two stories, and the component is a deliberate
shadcn port. Gate: confirm the Nav-island payoff is wanted before
committing to the unit; if deferred, record that here rather than leaving
it implied.

## Later, not here

- `pp-popup` accepting virtual anchors, which would dissolve
  `Reference.tsx`'s hand-rolled duplicate of the same floating-ui
  middleware stack. Belongs with popup work, not this sweep.
- `item-view/working-rung-store.ts` (zustand + localStorage holding one
  string) — a simplification candidate for whenever item-view's shape is
  next revisited.

## Verification (plan-level)

- Storybook vitest suite at its 42-failure baseline after each unit;
  stories and site demos of touched families spot-checked.
- Site build green; index page and stacked-notes panes render the graph
  (unit 4).
- Grep gates: no `motion/react` import left in filter after unit 3; no
  `hover-card` references after unit 1.
