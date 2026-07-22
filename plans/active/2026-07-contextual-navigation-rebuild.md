---
title: "Contextual navigation: the certainty fisheye"
status: "active"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-22"
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
   - _Inferred_ — connections derived from the knowledge base by rule:
     compact references — name, relationship, and the _basis line_ stating
     what the inference stands on ("appears with the Heating Assembly in
     every configuration"). One rung leaner than explicit.
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

## Mechanics

- _Data._ `JuiceProduction.json` stays. The one-model commitment's
  exception for this page is already argued in the demos plan (the pattern
  projects no collection; the interconnection goal was never carried here),
  and this is the only fixture with authored relationship structure, rules,
  and a containment tree.
- _Inferred band derivation_ is deterministic: rules over the model such as
  co-membership in a functional group, shared attribute values, sibling
  position under a common assembly. Each rule names itself in the basis
  line — the rule is the provenance. This doubles as the API-off fallback
  band.
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

## Build order

1. _Deterministic core_ — bands from data only: gradient rendering
   (focus / explicit / inferred at three fidelities), hover-and-focus
   sharpening, click-to-refocus, Escape, keyboard path. The demo already
   argues the pattern at the end of this step.
2. _Deduced rim_ — endpoint, memoisation, proposals streaming in as
   provisional names; sharpen-on-attend fetches nothing extra (the
   rationale ships with the proposal).
3. _Past-the-boundary focus_ — the provisional centre state and the
   proposed-under crumb.
4. _Page embed restored_ — uncomment the `<Demo>` block on
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
- Both themes; narrow pane (the demo host caps at the prose measure —
  bands stack on the block axis, nothing scrolls sideways).

## Not owned here

- The pattern page's prose and edges — already updated (2026-07-22) to
  describe this demo; only the embed uncomment in step 4 touches the page.
- The item-view ladder's component-side vocabulary seam.
- Any catalogue promotion of the provisional-name treatment — triggered
  only if a second demo wants it.
