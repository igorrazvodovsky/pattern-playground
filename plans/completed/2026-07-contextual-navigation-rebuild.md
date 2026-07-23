---
title: "Contextual navigation: the certainty fisheye"
status: "completed"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-23"
area: "demos, components, server"
promoted_to: ""
superseded_by: ""
---
# Contextual navigation: the certainty fisheye

## Context

focus-and-context.mdx carries two examples, and they cover the two working
parts of Furnas's degree-of-interest machinery between them. The timeline
fisheye (`FisheyeTimelineDemo`, built under `2026-07-view-system-demos.md`
§Fisheye alignment) reads distance _positionally_ — how far along the run
from the pointer — and puts a model to work on the _representation_ side:
the coarse rungs are generated tellings. Contextual navigation is the same
machinery with the distance metric pivoted: distance is _connection
certainty_. Explicit, modelled edges are nearest; knowledge-base inferences
a band further out; language-model deductions — connections to components
the model doesn't even contain — at the speculative rim. AI works the
_distance_ side here: it computes nearness where no edge is authored and
extends the context past the model's boundary. Both examples descend from
Furnas through Wattenberger's text fisheye.

The existing `ContextualNavigationDemo`
(`packages/components/src/demos/focus-and-context/`) has the idea but not
the rendering. Every context item lands at the same rung — uniform cards —
and AI provenance is a binary badge (`.card.dashed`). Coarser-with-distance,
the fisheye signature, is absent, so the demo reads as an entity page —
item-view at full scope — and the pattern's claim is not visible on screen.
It is also broken: the page embed is commented out and the mounted demo
shows an empty frame.

The page prose was rewritten ahead of this build (2026-07-22) and describes
the rebuilt demo; the prose is the spec's user-facing statement, and this
plan's job is to land what the page already says.

Borrow sweep (2026-07-22): nothing else imports `ContextualNavigationDemo` —
no story, no other page. The rebuild may change its shape freely. This plan
supersedes the demos plan's Phase 6 line "the existing
ContextualNavigationDemo stays".

## The claim the demo must make on screen

_Fidelity falls as certainty falls, and the gradient is visible at rest._
The boundary with item-view is exactly this: a focus in full plus one
uniform ring of related cards is an entity page, whatever the prose claims.
Three certainty bands at three distinct fidelities is the minimum truth
condition, and the first thing to verify.

## Design commitments

1. _Two context axes, one gradient._ The containment axis — breadcrumb
   ancestors above, structure table below — is modelled by definition and
   renders as the constant frame, the graph counterpart of the timeline
   demo's rail: always present, always explicit, the place bearings come
   from. The certainty gradient runs over the _connection_ axis only.
2. _Three bands, three rungs._ The bands reuse the item-view ladder's
   vocabulary, one rung down per band:
   - _Focus_ — the selected component in full working detail: attributes,
     structure, rules (the current `MainItemCard` survives as this rung).
   - _Explicit_ — connections authored in the data (`relatedObjects`):
     summary cards — name, relationship, description. Solid ground.
   - _Inferred_ — connections derived from the model by rule (there is no
     second store; see Mechanics): compact references — name,
     relationship, and the _basis line_ stating what the inference stands
     on ("appears with the Pre-heater in every configuration"). One rung
     leaner than explicit.
   - _Deduced_ — connections proposed by a language model, typically to
     components not in the model at all: provisional names — a name and one
     hedged clause, visually tentative (the dashed treatment moves here,
     where it now means something: this item may not exist). The rim.
3. _The lens moves along the pivoted axis._
   - _Attending sharpens in place._ Hover (or keyboard focus) on a context
     item raises it one rung while everything else holds: a deduced name
     gains its rationale sentence, an inferred reference expands toward a
     card. Attention spends fidelity where it points — the same rule as the
     timeline's `mousemove` lens.
   - _Clicking refocuses._ The item becomes the centre and the gradient
     re-runs from it.
   - _Focusing a deduced item walks the lens past the model's boundary._
     The centre renders provisionally — dashed full card, generated
     description, no authored structure — anchored by a "proposed under
     &lt;parent&gt;" crumb on the otherwise-real breadcrumb. Its explicit
     band is empty by construction; its whole context is inference and
     conjecture, which is the state narrating itself.
   - _Escape returns_ the lens to the last modelled component, mirroring
     the timeline demo's Escape-to-root.
4. _The fallback is the argument_ (precedent: `timeline/group`). The
   explicit and inferred bands are computed from the data and work with no
   API; the deduced rim appears only when the API answers, and its absence
   is stated on screen in one line. The deployed demo must argue the
   gradient with two bands rather than render an empty frame.
5. _A non-pointer path for every gesture_, per the demos convention:
   sharpening rides keyboard focus, refocusing is activation, Escape
   returns. No gesture exists only as hover.
6. _The reader controls how far the lens reaches._ The three connection
   bands are switchable layers, all on by default. Two constraints hold
   them to the pattern:
   - _The control moves the horizon, not the gradient._ Turning a layer
     off removes that band; it never renders a surviving band at a
     different fidelity. Reach narrows from the rim inward — deduced
     first, then inferred — so the fidelity ladder is invariant under
     every setting and the gradient is intact in the default state that
     Verification screenshots.
   - _Containment is never a layer._ The breadcrumb-and-structure frame
     stays constant, per commitment 1; only the connection axis is
     switchable. In [information architecture](/patterns/information-architecture)
     terms, the frame is the enumerative backbone and the layers are the
     faceted overlay over it. Collapsing the structure table would be a
     density affordance, and is not this control.

   The control is also where the inferred band's omissions become
   visible: it names the rules that layer runs and how many fired, so a
   reader who suspects the system is holding something back can see the
   whole rule set without the band spending a rung on each miss. This is
   what extends the demo past its home modes (exploring, browsing) into
   the [foggy-finding](/patterns/interaction#foggy-finding) ones, where
   the risk interaction.mdx names is the actor believing the system is
   hiding something.

## Mechanics

- _Data._ `JuiceProduction.json` stays. The one-model commitment's
  exception for this page is already argued in the demos plan (the pattern
  projects no collection; the interconnection goal was never carried here),
  and this is the only fixture with authored relationship structure, rules,
  and a containment tree.
- _There is no second store._ The "knowledge base" the page prose invokes
  is `JuiceProduction.json` read a second way: the inferred band is rules
  computed over the same model the explicit band is authored in. The
  standing constraint on any fixture change below is that added data must
  be _raw material a rule reads, never the inference itself_ — an
  authored `inferredConnections` array would collapse the middle band into
  the explicit one, leaving three fidelities but only two certainties.
- _Inferred band derivation_ is deterministic, and the rule set is fixed.
  In falling order of what each rule stands on, which is also the order
  they render in:
  1. _Rule-text mention_ — another component's `rulesAndConstraints`
     names this one in prose (`fruitReception-001`'s rule mentions
     `rawTruckDelivery-001`). A human wrote the connection down; only its
     form is unstructured.
  2. _Reverse edge_ — another component authors a `relatedObjects` entry
     pointing here. `relatedObjects` is one-directional today, so
     `pasteurizationUnit-001` is pointed at by five nodes and lists none
     of them.
  3. _Shared service_ — co-membership in a `services` fan-in, the one
     grouping that cuts across the containment tree today.
  4. _Configuration co-membership_ — appears alongside the focus in
     every configuration that contains either (the plan's original
     example basis line, made computable by the fixture change below).
  5. _Two-hop process flow_ — reachable through one intermediate along
     the 23 authored `Process Flow` edges. Upstream and downstream
     neighbours a person would not spot by eye.
  6. _Shared attribute value_ — same value for the same attribute, across
     the tree rather than within a parent/variant pair.

  Each rule names itself in the basis line — the rule is the provenance.
  The band doubles as the API-off fallback.
- _Fire-only, in fixed order._ Only rules that return something render;
  the fixed order above is what makes the vocabulary learnable from
  repeated exposure, and it gives the band its own internal falling
  certainty, so the pattern's argument is made twice. Empty rungs are not
  rendered — in a fisheye the vertical space between bands is what makes
  the fidelity difference legible. What fire-only omits is recovered in
  the layer control (commitment 6), not in the band.
- _Cap the band at five items, and state the overflow._ Hubs like
  `pasteurizationUnit-001` carry five reverse edges before the other
  rules run. A silently truncated band would misrepresent certainty in
  the exact direction this pattern is about, so the cap shows as an
  honest "12 more inferred" line.
- _Sparse is a state, not a failure._ Over the current 33 nodes the four
  no-new-data rules fire nothing on six: the leaf variants
  (`standardHoldingTube`, `extendedHoldingTube`, `waterCooled`,
  `glycolCooled`), `filterElement-001`, and the root. Those are exactly
  the nodes where the deduced rim should carry the weight — an empty
  inferred band beside three conjectured names is the gradient telling
  the truth about a leaf, the same move commitment 3 makes for the
  past-the-boundary focus. Do not pad the fixture to make every node
  dense; under-tuned rules keep the gradient readable.
- _Fixture changes_ (the mock data is ours to extend):
  - _Add a top-level `configurations` array_ — named line variants
    ("Concentrate", "Not-from-concentrate", "Pilot"), each listing member
    ids. Membership is the fact; _co_-membership across configurations is
    what the rule computes, which is why this passes the raw-material
    test where a `functionalGroup` tag would not (a tag rule only reads
    its own label back). Configurations also cut across the containment
    tree, so the rule surfaces connections the constant frame cannot.
  - _Promote the dangling refs._ `maintenanceService-001` points at
    `heatExchanger` and `recirculationPump`, neither of which exists in
    `flattenedModel`; `getRelatedObjects` silently drops them today. Make
    them real nodes under `pasteurizationUnit-001` — the service fan-in
    then has four genuine members, and recirculation puts a loop in the
    two-hop flow rule.
  - _Place two or three cross-tree attribute matches._ Today's co-value
    evidence is almost all trivial parent/variant pairs; the only
    non-obvious one is `material: Stainless Steel` across `screen-001`,
    `coolingAssembly`, `coolingExchanger`. A second such cluster and a
    shared `maxOperatingPressure` spanning the extraction and
    pasteurization sides turn a dead rule into a live one. Stop there.
- _Endpoint._ `POST /api/model/deduce` beside `timeline/group`, following
  its shape discipline: a model-agnostic input (the focus item plus its
  modelled neighbourhood), a minimal contract out (`{name, rationale,
  anchorId}` per proposal), the fast model, memoised on request body,
  `PROMPT_VERSION` moving with the client cache prefix. The current
  free-form `callOpenAI` streaming in `api-service.ts` retires; streaming
  survives as proposals arriving one at a time at the rim.
- _Rendering._ Rungs compose existing blocks (card, badge, the reference
  chip) rather than minting demo-only components; if the provisional-name
  treatment recurs elsewhere it graduates to the catalogue with a story,
  per the reusable-blocks convention. The three bands read as three visibly
  different weights in both themes.
- _The layer control is the band headers._ Rather than a settings panel
  beside the gradient, each band header carries its own toggle and its
  own count, and the inferred header expands to the rule list with fired
  counts against each. Merging the control into the structure keeps the
  chrome near zero and puts each switch where its effect is. Toggles are
  buttons with pressed state, reachable in the same tab order as the
  context items.

## Build order

1. _Fixture_ — `configurations`, the two promoted nodes, the placed
   attribute matches. Small, and every later step reads it.
2. _Deterministic core_ — bands from data only: the six rules, gradient
   rendering (focus / explicit / inferred at three fidelities),
   hover-and-focus sharpening, click-to-refocus, Escape, keyboard path.
   The demo already argues the pattern at the end of this step.
3. _Layer control_ — band-header toggles, counts, the inferred rule list.
   Lands before the rim so the reach-narrowing rule is exercised while
   there are still two bands to narrow between.
4. _Deduced rim_ — endpoint, memoisation, proposals streaming in as
   provisional names; sharpen-on-attend fetches nothing extra (the
   rationale ships with the proposal).
5. _Past-the-boundary focus_ — the provisional centre state and the
   proposed-under crumb.
6. _Page embed restored_ — uncomment the `<Demo>` block on
   focus-and-context.mdx (the label is already written); driven browser
   pass.

## Verification

- The gradient is visible at rest: a screenshot shows three bands at three
  fidelities without any pointer on the frame.
- API off: the rim is absent, the one-line statement shows, the demo still
  argues the pattern with two bands.
- Aim tests, as the timeline demo did: attending to a specific inferred
  reference sharpens that reference and nothing else; focusing a deduced
  item lands on a provisional centre whose breadcrumb carries the
  proposed-under crumb; Escape returns to the last modelled component.
- The layer control narrows reach without touching fidelity: with the rim
  off, the surviving bands render exactly as they did with it on. The
  screenshot above is taken in the default all-on state.
- The inferred band's omissions are recoverable: on a node where only two
  rules fire, the control still lists all six with their counts, and the
  four zeroes are legible as checked-and-empty rather than absent.
- Both themes; narrow pane (the demo host caps at the prose measure —
  bands stack on the block axis, nothing scrolls sideways).

## Not owned here

- The pattern page's prose and edges — already updated (2026-07-22) to
  describe this demo; only the embed uncomment in step 6 touches the
  page. The layer control gives focus-and-context a live claim on
  information-architecture's structure types, and the two pages may want
  a typed edge for it; that is a page-language call, deliberately left
  out of this build.
- Anything on information-architecture.mdx. Its Structure and
  relationships section has no layer vocabulary today, and this demo is
  not the argument for adding one.
- The item-view ladder's component-side vocabulary seam.
- Any catalogue promotion of the provisional-name treatment — triggered
  only if a second demo wants it.

## Outcome (2026-07-23)

Built as specified. Where the build departs from the spec, and why:

- _Deduction is one request, revealed one proposal at a time in the client._
  The spec asked for `timeline/group`'s shape discipline and for proposals
  arriving one at a time. `timeline/group` is not a streaming endpoint, so the
  endpoint follows it exactly — one JSON reply, memoised on the request body,
  `PROMPT_VERSION` beside the model in the key — and the arrival is a client
  reveal on a timer. The rim still fills gradually rather than settling all at
  once; nothing about it needed server streaming to say so.
- _Configuration co-membership is skipped where the focus runs in every
  configuration._ Set-equality alone reported ten to twelve components on the
  core line and pushed the two-hop and shared-attribute rules under the cap on
  nearly every node — a rule that fires everywhere discriminates nowhere. It now
  runs only where membership discriminates, which is what made rules 5 and 6
  live. The spec's example basis line ("in every configuration") is gone with
  it; the enumerated form ("in the Concentrate and Pilot lines, and nowhere
  else") is what renders.
- _The connection rules skip the focus's own branch._ Parents, children and
  sibling variants are the constant frame; a rule that reports one has told the
  reader what the breadcrumb and the structure table already say. Authored edges
  are exempt, so the explicit band still carries a modelled edge to a child.
- _The fixture gained a third promoted node._ `heatingAssembly` was dangling in
  `pasteurizationUnit-001`'s `childrenIds` alongside the two the spec named, so
  the two land under it rather than beside it, and the structure table stops
  dropping a child silently. 36 nodes.
- _The layer switch is one dropdown, not three toggles._ Commitment 6 asks for
  three switchable layers and for reach to narrow from the rim inward; taken
  together those are one setting, not three, because a reader cannot sensibly
  keep the model's guesses while dropping what the model states. The control is
  a single choice — "Explicit" / "Explicit + inferred" / "Explicit + inferred +
  deduced", each carrying the count it would put on screen — so the nesting is
  legible from the options themselves and needs no sentence explaining it. (An
  earlier build gave each band its own toggle; three switches that telescope
  read as three switches that are broken.)
- _Refocusing moves DOM focus to the frame._ The activated control is gone by
  the time the new gradient renders, so without this the keyboard would be left
  on the document and Escape would never reach the demo.

Departures asked for after the build (2026-07-23), and what they cost:

- _One list, not three bands._ The connections are a single run of cards, and
  certainty is carried by how each card is drawn: an authored edge keeps its
  border, its ground and the target's readings; an inference drops the border
  and the readings; a proposal drops the ground too, dims, and marks its name
  provisional. The band headers that named each tier are gone, so the whole
  claim now rests on the card treatments — which is a stricter test of the
  pattern, and the one the plan's truth condition was always about.
- _The rule rides its own card._ The separate rule list is gone; each inferred
  card names the rule that found it where its relationship would otherwise sit.
  The cost is the plan's "omissions are recoverable" property: a rule that fires
  nothing is now invisible, where the list showed all six with their zeroes.
- _Nothing is revealed on attend._ Hover- and focus-sharpening are gone: every
  card says everything it has to say at rest. Commitment 3's "attending sharpens
  in place" is dropped with them — a card that grows under the pointer moves
  every card below it, which is the one thing a fisheye must not do. The
  interaction model is now activate and Escape.
- _Catalogue blocks throughout._ The bespoke `certainty__*` rungs are gone; the
  rows are `.card` with `.attribute`, `.label`, `.description` and attribute
  `.badge`s, and the control is `pp-dropdown` + `pp-list` + radio
  `pp-list-item`. What is left in `view-family.css` is the gradient itself —
  which slots each tier drops, and how its weight falls.
- _The levels control sits in the frame's header._ The control moved out of the
  connections header and up beside the breadcrumb, behind a gear. Both halves of
  the frame are now on one line: where you are on the containment axis, and which
  levels of the other one are shown.
- _Each level is its own switch, not a cumulative reach._ The control started as
  one setting naming a nested reach (`Explicit` → `Explicit + inferred` →
  `Explicit + inferred + deduced`), on the argument that the tiers nest and you
  cannot sensibly keep the model's guesses while dropping what it states. That
  argument still holds, but a toggle per level is a plainer mental model than a
  scale, so the control is now three checkboxes — `Explicit` / `Inferred` /
  `Deduced` — and any combination is allowed, including the ones that mean
  nothing. The dropdown stays open on select so a reader can flip several
  without reopening it.
- _The focus card was realigned to the catalogue card._ The detail card was a
  bare `.card` — outside `.cards`, so it never picked up the inline gutter the
  whole card interior is measured against; its title sat in a `.card__header`
  though it carries no actions, on a different inset from the body; and its
  collapsible `<details>` sections leaned on the shared `.card details` rule,
  which is written for a padding gutter this card builds from child margins,
  so it bled the sections a step past the left border and railed the disclosure
  dots outside the frame. Now the card is wrapped in `.cards`, the title is a
  plain heading (the no-actions branch `ProductCard` uses), and a small scoped
  block pins the section bands flush inside the card and swaps the external dot
  rail for a caret in the summary's own inset. Title, description, every section
  heading, its contents, table cells and badges resolve to one left edge; the
  sections stay collapsible.
- _Demo links are excluded from the link preview._ A demo's `href="#"` links
  resolved to the page the demo sits on, so hovering one previewed the page the
  reader was already reading. `resolveSlug` now skips anything inside
  `.demo-block`.

Not verified, and why:

- _Both themes._ The site is `color-scheme: light only`; `.dark` is a surface
  utility for a dark panel, not a page theme, and the sibling fisheye is in the
  same position. There is no second theme to check the gradient in.

Residue for whoever is next:

- `pp-breadcrumbs` elides its middle crumbs at a narrow _viewport_, so a narrow
  demo pane in a wide window overflows. Worked around locally (`.certainty
  pp-breadcrumbs { flex-wrap: wrap }`); the component-level fix is a container
  query, and belongs with the component.
- `--space-3xs` is not in the token scale. Two pre-existing uses in
  `view-family.css` (`.stat`, `.person-card__id`) are silently dropped.
- `apps/server` CORS now allows `http://localhost:4322`, the port Astro falls to
  when a second checkout or worktree holds 4321.
- `utils/api.ts`'s `callOpenAI` lost its only caller when `api-service.ts`
  retired. `/api/generate` still exists; the client helper is now unused.
