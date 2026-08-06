---
title: "Component authoring library: the post-refactor decision"
status: "active"
kind: "decision-record"
created: "2026-08-06"
last_reviewed: "2026-08-06"
area: "components"
promoted_to: ""
superseded_by: ""
---
# Component authoring library: the post-refactor decision

## Context

The light-DOM refactor (`active/2026-07-light-dom-refactor.md`, phases 0–4
complete) deliberately deferred the authoring-library question until the
refactor had made it small. It is now small: zero shadow roots remain, the
component contract is settled in `docs/specs/component-authoring.md`, and
Lit's remaining footprint is measurable rather than structural.

What the residue actually uses (counted 2026-07-31):

- *Reactive re-render of an owned subtree* (rung 3): the chart family
  (bar-chart, scatter-plot, choropleth, map, chart-grid/legend/axis on the
  `D3Component` base), `pp-range` (track + marks + value readout), and
  `pp-tooltip`'s one small owned popup + body.
- *Reactive properties and lifecycle only* (rung 2): everything else —
  attribute parsing/reflection via `@property`, batched updates,
  `updateComplete`, `connectedCallback`/`disconnectedCallback` on hosts
  that never render children they didn't create.

## The question

What authors component reactivity and lifecycle now that encapsulation is
gone: stay on minimal Lit, move to vanilla + small helpers, or adopt the
HTML-web-components architecture the parent plan shorthands as
Elena/Piccalilli?

## Options

1. *Minimal Lit (status quo).* Lit stays as the reactive-property engine
   behind the light-DOM contract; `lit-html` renders the rung-3 subtrees.
   Nothing rewrites. Cost: one dependency (~7 kB core) whose main features
   (shadow templating, slots, `static styles`) the library no longer uses.
2. *Reactive-element subset.* Keep `@lit/reactive-element` (properties,
   lifecycle, decorators) for rung-2 hosts and drop `lit-html`; rung-3
   renderers move to hand-rolled DOM or stay on `lit-html` where charts
   earn it. A middle rung worth pricing before choosing 1 or 3.
3. *Vanilla + small helpers.* A ~50-line base class: `observedAttributes`
   sync, upgrade-safe property accessors, an update queue. Rewrites the
   property machinery of every Lit component for zero user-visible change;
   removes the dependency entirely.
4. *Elena / Piccalilli architecture.* Adopt the external HTML-web-components
   approach wholesale. Pinned down by the research gate: Elena is Ariel
   Salminen's "Progressive Web Components" base-class library
   (elenajs.com, ~2.6 kB), the glue in Scott Riley's Piccalilli series
   "Framework-agnostic design systems" — props with reflection, batched
   light-DOM re-renders, tagged templates, experimental SSR.

## Strawman verdict (proposed, not decided)

Option 1, revisited only on a forcing function — with option 2 noted as a
cheap adjunct if dependency weight ever matters. The refactor already moved
every component to the platform's grain; Lit is now an implementation
detail invisible from the authoring contract (real children, `data-slot`,
cascade styling). Rewriting reactive-property plumbing across ~15 hosts is
churn without a user-visible return, and the chart family genuinely uses
templated re-render. Forcing functions that would reopen this: shipping the
library as a dependency-free artifact, wanting server-rendered components
(see findings — this door is already closed on Lit), or Lit's
shadow-first feature direction diverging further from light-DOM use.

## Research gate findings (run 2026-08-06)

Framed as "what would I be wrong about?", per the project's
research-before-locking-in practice.

- *Elena identified.* Ariel Salminen's pre-1.0, single-author library
  (announced 2026-03; github.com/arielsalminen/elena). It validates the
  refactor rather than obsoleting it: a ~2.6 kB re-implementation of the
  slice of Lit this library already uses. Switching buys philosophy points
  and vendor risk, not capability.
- *Light-DOM Lit is tolerated, not blessed.* lit.dev documents
  `createRenderRoot() { return this }` but calls rendering into children
  "generally not recommended"; `static styles` and `<slot>` are inert
  (already handled by the refactor's recipe). New Lit capability lands
  shadow-first; `@lit-labs/signals` works in light DOM, but its
  template-level updates are lit-html/shadow-oriented.
- *The strongest counter-argument: SSR is foreclosed.* `@lit-labs/ssr`
  does not support light-DOM render roots (lit/lit#3416; fix PR stalled
  2022). If the Astro site ever wants server-rendered `pp-*` elements,
  Lit cannot get there — "revisit on a forcing function" risks meaning
  "revisit after it's too late". Today no `pp-*` element is
  server-rendered, so this is a watch condition, not a blocker.
- *Option 2 is real and drop-in.* `@lit/reactive-element` standalone is an
  officially documented path (same class, same decorators, no lit-html),
  ~2.95 kB vs full lit's ~6.1 kB min+gzip. Little community prior art, but
  it is exactly shaped for rung-2 enhancement hosts.
- *Practice check.* The HTML-web-components camp (Ferdinandi, Keith,
  Nielsen, Enhance) hand-rolls attribute/property boilerplate and does not
  consider it a pain worth a dependency — so option 3 is viable for rung-2
  hosts, but the rung-3 renderers (charts, range, tooltip) would be
  rebuilding what lit-html already does well.

## Once decided

- Record the verdict here, move this plan to `completed/`, and update
  `docs/specs/component-authoring.md`'s closing pointer.
- If the verdict changes the dependency, that work becomes its own
  exec-spec plan; this file stays a decision record.
