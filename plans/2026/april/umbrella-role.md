# Umbrella role

A plan to give *umbrella* MDX pages (authored surveys of a territory of related moves) a first-class role distinct from single-move source pages. Promotes `relationship-vocabulary.md` open question 6 from "after Phase 4" to active work, after the 2026-04-30 reordering surfaced that the umbrella distinction is the project's strongest divergence from the report on contemporary pattern-language formats.

## Context

The Phase 0.B adversarial probe (2026-04-25 changelog) flagged Bot, Assisted task completion, and Status feedback as MDX files where the generative-profile frame strains for *structural* reasons: the page describes a territory of related moves, not a single move. The library currently treats every MDX file as a single-move source. This collapses a real distinction.

An earlier framing borrowed Dorian Taylor's [specificity gradient](https://doriantaylor.com/the-specificity-gradient) and called these pages *projections*. The 2026-04-30 changelog retired that term: Dorian's projection runs *data → generated document* (lossy in the document because the data is canonical), while the project's situation runs the other way (graph is the project's projection of MDX, not the reverse). Umbrella pages are *authored surveys at a higher altitude*, not generated views over canonical data. The structural question is therefore narrower and clearer than the projection framing suggested: does the data model need to distinguish single-move pages from umbrella pages at the node level so extraction and graph reasoning can handle them differently?

This plan answers yes and proposes the smallest concrete shape that will bear weight.

## Two framings

These mirror the framings that shape `typed-edges.md` and apply equally here:

1. *Suggestion, not matching.* The umbrella role is a hint about how to read a page, not a predicate that drives validation. A page being marked as an umbrella means "don't expect this to behave like a single move"; it does not commit the system to any particular generated view, schema, or completeness guarantee.

2. *Authored, not generated.* Unlike a Dorian-style projection, an umbrella is *authored*. The page's voice, framing, and editorial cuts are the point. The structural change is recognising that authored content can sit at different altitudes, not generating umbrella content from underlying data.

## Scope

This plan covers a minimal first pass: identify the umbrella pages currently in the corpus, add an `umbrella` role marker, emit a typed edge from each umbrella to its constituent moves, and update extraction and graph data accordingly. It does *not* cover umbrella-aware rendering, umbrella-vs-single-move queries, or generation of umbrella views from underlying data. Those become possible once the role exists; they are not the gate.

## Identified umbrella candidates

From the Phase 0.B probe and the 2026-04-25 reconciliation:

- [`src/stories/activities/Bot.mdx`](../../../src/stories/activities/Bot.mdx) — surveys the territory of bot/assistant patterns
- [`src/stories/actions/application/AssistedTaskCompletion.mdx`](../../../src/stories/actions/application/AssistedTaskCompletion.mdx) — surveys the territory of moves around assisted task work
- [`src/stories/operations/StatusFeedback.mdx`](../../../src/stories/operations/StatusFeedback.mdx) — surveys the territory of status-feedback moves

A research pass through the corpus may surface additional candidates (Activity overviews, foundations that have grown territory-shaped, project-level pages like `actions/Overview.mdx` and `activities/Overview.mdx`). Don't assume the list is closed; treat the three above as starting points.

## Phase A — Survey and validate the role

Before changing any code or schema, validate that the umbrella role is the right structural cut on a wider set of MDX files than the original three. The Phase 0.B probe was an adversarial check on candidates that *resisted* profiles; this is the inverse — a survey on a representative cross-section asking whether the umbrella role would change how the page is read.

### Survey approach

For each candidate, write a one-paragraph note answering:

1. Does this page authoritatively define a single move, or does it survey a territory of related moves?
2. If it surveys, what are the constituent moves it gathers? Are they all in the corpus?
3. Does the page have a generative profile? If yes, does the profile feel forced or natural?
4. What kind of relationship does the page have with the constituent moves: introduction, summary, design-space map, exemplar collection, or something else?

Candidate set (~10–12 pages, covering different altitudes and editorial styles):

- The three known umbrellas: Bot, Assisted task completion, Status feedback
- Activity-scale candidates that may or may not be umbrellas: Conversation, Onboarding, Collaboration, Help, Generated content, Transparent reasoning
- Overview pages: `actions/Overview.mdx`, `activities/Overview.mdx`
- Foundation candidates that may have grown territory-shaped over time: pick 2–3 from `src/stories/foundations/`

### Gate criteria

- Does the umbrella distinction track a real structural difference, or is it a continuum where most pages have *some* umbrella character?
- Are there candidates that resist binary classification (e.g., a page that defines a single move *and* surveys related territory)?
- What relationship name from umbrella to its constituent moves reads most naturally — `surveys`, `gathers`, `frames`, or something else?
- Are there umbrella pages that gather moves not yet in the corpus? (If so, the umbrella surfaces a real gap, which is one of the things umbrellas are good for.)

If most pages have umbrella character to some degree, the binary role is wrong and a *gradient* may be needed instead. That's a different plan; stop and revise before continuing.

### Files modified

New file: `plans/2026/april/notes/umbrella-survey.md` — survey notes and verdict. No code changes in Phase A.

## Phase B — Add the role to the data model

Only after Phase A closes with a binary umbrella/single-move distinction holding.

### Authoring marker

The umbrella role is declared in MDX via Storybook `Meta` tags. The existing `Meta` includes `tags={[...]}` already; adding `'role:umbrella'` is the simplest path that doesn't require new infrastructure.

```mdx
<Meta of={BotStories} tags={['atomic:pattern', 'role:umbrella', ...]} />
```

This is consistent with how `atomic:*` tags currently encode compositional projections. The `role:*` namespace is reserved for the future role vocabulary in `vision.md` (`move`, `mechanism`, `umbrella`, `quality`, etc.); only `role:umbrella` is committed in this plan. Other roles are inferred from category folder for now, as today.

### Extraction

`scripts/extract-graph-data.ts` gains:

1. *Role detection*: read the `Meta` tags. If `role:umbrella` is present, set the node's `role` field to `'umbrella'`. Otherwise, leave unset.
2. *Edge type emission*: for an umbrella page, every link inside `## Related patterns` gets edge type `surveys` (or whichever name Phase A confirmed) instead of the default `related`. Headers under `## Related patterns` on an umbrella page are read as editorial groupings of the surveyed territory; the per-link `surveys` edge survives.
3. *Profile suppression*: if a page has `role:umbrella`, extraction does not require a profile sidecar and does not warn about its absence. The `Generative profiles` skip list in `relationship-vocabulary.md` already exempts umbrella pages narratively; this codifies it.

### Schema additions

```typescript
interface Node {
  id: string;
  title: string;
  category: string;
  path: string;
  tags?: string[];
  role?: 'umbrella';  // NEW — only 'umbrella' is committed; other roles inferred from category for now
}

type EdgeType =
  | 'precedes' | 'follows' | 'enables' | 'instantiates'
  | 'complements' | 'tangential' | 'alternative'
  | 'recommends' | 'related' | 'enacts'
  | 'surveys';  // NEW — umbrella → constituent move
```

`surveys` is directed (umbrella → move), no inverse stored. Reverse traversal ("which umbrellas survey this move?") is a graph query.

### Edge labels

Per-link `— ` annotations on umbrella pages carry through the same way they do on single-move pages. The labels say *what role this constituent plays in the territory the umbrella gathers*. This becomes the primary place the umbrella's editorial voice lands in machine-readable form.

### Verification

- The three known umbrellas (Bot, Assisted task completion, Status feedback) have `role: 'umbrella'` in their nodes.
- Their outgoing edges are `surveys`, not `related`.
- No profile sidecar is required for these three.
- Other pages are unaffected (extraction is idempotent, edges unchanged).
- *Invariant*: every `surveys` edge has a source with `role: 'umbrella'`. No other edge type has this constraint.

### Files modified

- `scripts/extract-graph-data.ts`
- `src/pattern-graph.json` (regenerated)
- `src/stories/activities/Bot.mdx` — add `role:umbrella` tag
- `src/stories/actions/application/AssistedTaskCompletion.mdx` — add `role:umbrella` tag
- `src/stories/operations/StatusFeedback.mdx` — add `role:umbrella` tag
- `docs/language/relationship-vocabulary.md` — update changelog with the addition; move `surveys` from open question to defined type

## Phase C — Make the distinction visible (deferred)

Sketched but not committed in this plan:

- *Umbrella-aware queries*: `findUmbrellasFor(moveId)`, `findMovesUnder(umbrellaId)`. Belongs in the Phase 4 query API of `typed-edges.md`.
- *Umbrella-aware rendering*: visual distinction in `PatternGraph.tsx` (different node shape or colour). Low-cost but cosmetic; defer until the role has earned its keep in queries.
- *Umbrella-vs-territory gap analysis*: which constituent moves an umbrella references that don't exist in the corpus. This is one of the most useful things umbrellas can surface — they make absences legible. Worth a separate small note when the role is in place.
- *Other roles*: `vision.md` lists `move`, `mechanism`, `contract`, `quality`, `foundation`, `concept`, `example` as candidates. Promoting any of these is a separate decision; this plan only commits to `umbrella`.

## Open questions

1. *Is `umbrella` the right name?* Alternatives: `survey`, `territory`, `index`. `umbrella` won because it's already the term in use in the existing prose and is intuitive. Phase A may surface a better name.

2. *What if a page is partly umbrella and partly single-move?* Phase A's survey will tell. If common, the role becomes a continuum (a `umbrella-ness` score?) or a per-section marker rather than a binary node-level field. Default assumption: binary holds.

3. *Should umbrellas have profiles after all, just at a different altitude?* An umbrella might have an `operates-on: a territory of related moves` / `produces: a sensemaking surface that makes gaps visible` profile that's non-vacuous. Defer until the role exists; revisit when the schema is stable.

4. *How does the `surveys` edge interact with `related`?* If an umbrella's MDX puts a link in a thematic header (e.g., "Core patterns" vs. "Edge cases"), should the edge be `surveys` typed by the editorial cut, or pure `surveys` with the header text as a label/tag? Default: pure `surveys` with header text as label, mirroring how thematic headers on single-move pages become labels.

5. *Push/pull dynamics.* The 2026-04-30 changelog noted that the push/pull future Dorian's framing suggested still applies, just at finer grain. An umbrella page is a candidate site for this: its constituent moves and editorial cuts could in principle be derived from the underlying graph, with only the prose voice authored. Defer until at least three umbrellas exist with stable structure; revisit when there's a concrete consumer.

## Research

This plan is itself the answer to "do we need to research some aspects in more detail?" for the umbrella question — the framing has already been refined (the 2026-04-30 retirement of *projection* terminology is the research output). The remaining open research, light to moderate:

- *Concept maps and topic maps* — both have the notion of an "occurrence" or "scope" that's adjacent to the umbrella role. Worth a focused read to see if their relation types (`broaderScope`, `partOf`, `seeAlso`) carry over, even if their schemas don't.
- *Ontology pattern annotations (OPLa)* — the report mentions OPLa supports pattern-based annotations that "guide exploration through meaningful thematic paths". An umbrella page is structurally similar; check if OPLa's metadata shape suggests anything for the `surveys` edge or for umbrella node metadata.
- *Dorian Taylor's specificity gradient*, fully read — the 2026-04-30 retirement was based on a partial reading. A complete read may surface useful framings beyond the projection misfit (e.g., the gradient itself as a coordinate for where authoring should happen).
- *Bowker & Star's boundary objects* — umbrella pages may be doing the work of boundary objects (sitting between communities of practice, holding multiple readings). Worth reading specifically for how a boundary object is *not* a misfit pattern when its role is named.

The research happens between Phase A and Phase B, not before Phase A. Phase A's survey establishes what the role actually is in this corpus; the research stress-tests the strawman before committing to the schema in Phase B. This sequence follows the practice in [`docs/project/plan-drafting.md`](../../../docs/project/plan-drafting.md).

## Phase ordering

```
Phase A (survey across ~10–12 candidate pages — gate)
    │
    ▼
research pass (concept/topic maps, OPLa, full Dorian, boundary objects)
    │
    ▼
Phase B (role marker, schema, extraction, three known umbrellas)
    │
    ▼
Phase C (queries, rendering, gap analysis — deferred)
```

Phase A is a research artifact, not code. Phase B is the smallest concrete data-model change. Phase C is intentionally deferred so the role earns its keep before more is built on it.
