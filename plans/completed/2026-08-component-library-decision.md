---
title: "Component authoring library: the post-refactor decision"
status: "completed"
kind: "decision-record"
created: "2026-08-06"
last_reviewed: "2026-08-07"
area: "components"
promoted_to: "docs/specs/component-authoring.md"
superseded_by: ""
---
# Component authoring library: the post-refactor decision

## Context

The light-DOM refactor (`completed/2026-07-light-dom-refactor.md`, phases 0–4
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
   (elenajs.com, ~2.9 kB), the glue in Scott Riley's Piccalilli series
   "Framework-agnostic design systems" — props with reflection, batched
   light-DOM re-renders, patch/morph templates, experimental SSR.

## Verdict (decided 2026-08-07)

Option 4: adopt Elena, as a philosophical commitment rather than a
technical upgrade. The deciding criterion is the reframing below — for
a playground, the authoring material's grain is the return — and the
probe bore it out: the rung-2 majority migrates near-mechanically into
exactly the composite-component practice the light-DOM refactor
established, and where Elena pushes back (rung-3 mixed ownership,
conditionals leaving the template), the pressure lands on better
platform practice (reflected attributes, CSS, explicit ownership).
Vendor risk is playground-sized — the core is one 572-line MIT file,
vendorable if abandoned, and the components stay standard custom
elements either way. SSR flips from foreclosed (Lit) to experimentally
open.

The migration is its own exec-spec:
`completed/2026-08-elena-migration.md`. The chart family restructures
rather than ports — D3 owns the DOM, Elena supplies props and
lifecycle only — ending the current two-renderers-in-one-component
arrangement.

## Strawman verdict (2026-08-06, superseded by the reframing)

Option 1, revisited only on a forcing function — with option 2 noted as a
cheap adjunct if dependency weight ever matters. The refactor already moved
every component to the platform's grain; Lit is now an implementation
detail invisible from the authoring contract (real children, `data-slot`,
cascade styling). Rewriting reactive-property plumbing across ~15 hosts is
churn without a user-visible return, and the chart family genuinely uses
templated re-render. Forcing functions that would reopen this: shipping the
library as a dependency-free artifact, wanting server-rendered components
(closed on Lit, experimentally open via Elena — see findings), or Lit's
shadow-first feature direction diverging further from light-DOM use.

## Reframing: what the decision is actually about (2026-08-07)

The strawman above prices the options with a production yardstick —
capability, churn, dependency weight. This project is a playground
(core-beliefs: research-first; decisions are often aesthetic or
philosophical), which changes the currency:

- *"Churn without a user-visible return" carries little weight here.*
  There is no user. A bounded rewrite of ~15 hosts is itself research
  material if the new grain teaches something.
- *The live question is which authoring grain nudges practice where the
  project wants to go.* Lit's grain — `render()` owns a template,
  JS-first, light DOM tolerated rather than intended — pulls authorship
  toward JS-rendered components. Elena's grain — composite components
  enhancing HTML that is already on the page, no `render()` as the
  default case, progressive enhancement throughout — pulls toward
  HTML-first authorship. That is the framework-agnostic stance
  (piccalil.li, "Framework-agnostic design systems") that motivated
  interest in this option, and it matches the project's own voice: from
  the situation inward, markup before machinery. The rung-2/rung-3
  residue count shows most hosts are already shaped like Elena's
  composite components; the library would name and reinforce a practice
  the refactor already established.
- *The counterweights stay real.* Single-maintainer dependency; and
  adopting any library is adopting someone else's opinions — option 3
  nudges hardest toward the bare platform, at the price of hand-rolling
  what Elena packages as designed, documented practice.

Under this framing option 4 is the live candidate, not a dismissed one.
Decided 2026-08-07: settle it with a bounded probe rather than paper
adjudication.

### Probe (run 2026-08-07)

Branch `elena-probe` (worktree `../pattern-playground-elena-probe`,
commit 903ce80c): `pp-tab-group` (rung 2) and `pp-range` (rung 3)
migrated to `@elenajs/core`. All range and tabs stories behave as
before; typecheck, ESLint, and console clean. What the grain did:

- *Rung 2 is near-mechanical.* Decorators become `static props` plus
  class fields; the Lit import drops; nothing else moves. Wrinkles:
  Elena has no attribute-name mapping, so kebab-case attributes become
  quoted class fields (`'no-scroll-controls' = false`, read via
  bracket access), and every host pays for the automatic `text`
  capture (reads all descendant text on connect) plus a `hydrated`
  marker attribute it may not need.
- *Rung 3 is where the philosophies actually differ.* Elena's renderer
  owns the element's entire child list (`replaceChildren` on first
  render, whole-list morph after), where lit-html manages only its own
  region. The range contract "author children survive alongside the
  owned subtree" had to weaken to "author children are re-adopted into
  the render": captured before first render, re-emitted as stable
  fragments — position keeps, element identity does not.
- *Conditionals leave the template.* Boolean and absent-when-empty
  attributes have no template form that survives Elena's clone parser
  (`${cond ? "disabled" : nothing}` in bare-attribute position breaks
  it), so `disabled`, `aria-*`, and live value sync moved to an
  imperative `updated()` — hand-rolling what Lit's `ifDefined`/
  `live`/`?attr` did declaratively. Fragments interpolated into the
  template must be memoized or every re-render falls off the patch
  path onto a full morph.
- *The pressure points somewhere real.* Squeezed out of the template,
  `hide-value` became a reflected attribute plus a CSS rule — state in
  markup, presentation in the cascade. The constraint pushes toward
  exactly the HTML-first practice the reframing values. And Elena's
  entire core is one readable 572-line file; the whole mechanism fits
  in one sitting.

The probe's findings fed the verdict above; the branch lands as the
migration plan's first phase.

## Research gate findings (run 2026-08-06)

Framed as "what would I be wrong about?", per the project's
research-before-locking-in practice.

- *Elena is further along than first assessed.* Still single-author
  (Ariel Salminen), but now v1.0.1 with a stable core, 100% test
  coverage, full docs (elenajs.com), and CLI/bundler/manifest tooling
  (github.com/arielsalminen/elena). The props surface — types inferred
  from class-field defaults, attribute reflection by default with
  opt-out, microtask-batched updates, `requestUpdate()` for deep
  mutations — re-implements the slice of Lit this library already uses,
  and its composite/primitive component split mirrors the rung-2/rung-3
  count above. Rendering is patch/morph against the existing DOM, not
  lit-html-style tagged templates. Switching would still be a rewrite of
  working plumbing with one maintainer's bus factor attached — but the
  earlier "philosophy points, not capability" dismissal is wrong in one
  place: SSR (next bullet).
- *Light-DOM Lit is tolerated, not blessed.* lit.dev documents
  `createRenderRoot() { return this }` but calls rendering into children
  "generally not recommended"; `static styles` and `<slot>` are inert
  (already handled by the refactor's recipe). New Lit capability lands
  shadow-first; `@lit-labs/signals` works in light DOM, but its
  template-level updates are lit-html/shadow-oriented.
- *The strongest counter-argument: SSR is foreclosed on Lit, open on
  Elena.* `@lit-labs/ssr` does not support light-DOM render roots
  (lit/lit#3416; fix PR stalled 2022). Elena's `@elenajs/ssr` does
  exactly this: it parses page HTML, calls registered components'
  `render()` server-side, serializes the expanded light DOM, and marks
  it `hydrated` for progressive enhancement — components without
  `render()` need no SSR step at all. Caveats: the package is explicitly
  experimental ("not yet ready for production use; APIs may change"),
  and shipped integrations are Eleventy, plain HTML, and Next.js — no
  Astro adapter, though the string-in/string-out design suggests one is
  writable. Today no `pp-*` element is server-rendered, so this stays a
  watch condition — but the exit now has a name: if SSR becomes wanted,
  the move is Elena or Elena-shaped, not an open question.
- *Option 2 is real and drop-in.* `@lit/reactive-element` standalone is an
  officially documented path (same class, same decorators, no lit-html),
  ~2.95 kB vs full lit's ~6.1 kB min+gzip. Little community prior art, but
  it is exactly shaped for rung-2 enhancement hosts.
- *Practice check.* The HTML-web-components camp (Ferdinandi, Keith,
  Nielsen, Enhance) hand-rolls attribute/property boilerplate and does not
  consider it a pain worth a dependency — so option 3 is viable for rung-2
  hosts, but the rung-3 renderers (charts, range, tooltip) would be
  rebuilding what lit-html already does well.

## Closed out (2026-08-07)

- Verdict recorded above; plan moved to `completed/`;
  `docs/specs/component-authoring.md`'s closing pointer updated.
- The dependency change is its own exec-spec:
  `completed/2026-08-elena-migration.md`. This file stays a decision
  record.
