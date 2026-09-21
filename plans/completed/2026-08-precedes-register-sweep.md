---
title: Precedes register sweep and the make-time ordering projection
status: completed
kind: exec-spec
created: 2026-08-21
last_reviewed: 2026-08-27
completed: 2026-08-27
area: language / pattern-site navigation
promoted_to: docs/language/relationship-vocabulary.md (precedes authoring test, register note, 2026-08-27 changelog entry)
superseded_by:
---

# Precedes register sweep and the make-time ordering projection

## Intent

Add a navigation projection that orders entries by approximate make-time — the order a designer settles them in, the way *A Pattern Language* runs from towns to construction details and each step of an unfolding in *The Nature of Order* acts on what the previous steps produced.

The obvious input is the `precedes` edge set, but it cannot be used as it stands. The vocabulary defines `precedes` in the designer's register ("applying A produces a centre or condition on which B can subsequently act", [relationship-vocabulary.md](../../docs/language/relationship-vocabulary.md) §precedes) and then admits that the actor's runtime sequence is "the evidence for the design-time claim, and on most edges the two coincide". In practice a fifth of the edges hold only in the actor's register, and a further dozen run in the wrong direction for make-time. A topological sort over the raw set would interleave "settle the information architecture before designing search" with "the agent speaks before the actor repairs", and would place localization early and data views late — the reverse of where a designer settles them.

This plan does the sweep first and the projection second. The sweep is the blocking step; the projection is a small change once the edge set is trustworthy.

## The test

Every `precedes` edge was read against its note or its `sets-up` clause and asked three questions in order:

1. *Make-time (M).* Does B's design take A's result as its material — a structure, a surface, or a newly opened problem — so that removing A from the design leaves B with nothing to act on? Keep as `precedes`. Many of these also hold in the actor's register; that coincidence is fine and is noted where it matters.
2. *Use-time (U).* Are A and B designed independently, with the edge describing the order the actor meets them in a session or encounter? Not `precedes` — rewrite in the designer's register where the two coincide, otherwise drop or retype; see "No use-time edge" below.
3. *Mistyped (X).* Is the claim composition, location, co-deployment, or selection wearing the sequential type? Retype.

A fourth bin, *direction (D)*, holds edges where a make-time claim exists but the authored direction runs the other way.

Source counts: 94 `precedes` edges in `pattern-graph.json` — 43 authored in frontmatter (`precedes:` or the `follows:` alias) and 51 emitted by `situation.resulting` clauses carrying `sets-up:`.

| Bin | Authored | Situation-derived | Total |
|---|---|---|---|
| M — keep | 21 | 36 | 57 |
| U — use-time | 6 | 13 | 19 |
| X — retype | 6 | 0 | 6 |
| D — direction | 10 | 2 | 12 |

Two findings shape what follows. The situation-derived set is mostly sound: the `sets-up` construct produces make-time claims wherever a clause names a newly opened design problem ("accepting a value and accepting it as correct are separate steps", "the corridor removes peripheral vision, so a change of mind has to be able to walk backwards"). The use-time edges cluster in two places — the conversation family's sequence-management and conversation-management pages, whose resulting clauses are encounter stages by design, and the hand-authored agent family (prompt → agent → generated content → conversation), where notes narrate the session rather than the design.

## Edge classification

Verdict round completed 2026-08-27 (delegated). *accept* takes the proposed disposition; *fix* replaces it, with the replacement in the cell. Rows the delegation changed from the original proposal are the *fix* rows.

### M — make-time, keep as `precedes`

Authored edges. Notes flagged *rewrite* describe the relation in dataflow or "enables" wording and should be re-voiced in the designer's register when touched; the type stands.

| Edge | Note or clause (abridged) | Reading | Verdict |
|---|---|---|---|
| agent → activity-log | actions and reasoning are tracked and displayed | the agent's own resulting clause says it "owes an account of itself afterwards"; the log is that account. Coincides with runtime | accept |
| agent → ai-tuning | tuning keeps the actor in control while the agent does its thing | the agent's freedom "is a setting rather than a fixed property"; tuning is the move that acts on that setting. Rewrite note | accept |
| agent → generated-content | presentation and manipulation of AI's output | output is the material generated-content's moves act on | accept |
| agent → transparent-reasoning | generates the reasoning that transparent reasoning makes visible | same shape | accept |
| agent → live-presentation | generates the stream that this surface presents in flight | same shape | accept |
| generated-content → change-review | the proposed change is generated output aimed at existing material | | accept |
| generated-content → detached-artefact | the promotion acts on output the generation produced in-stream | | accept |
| generated-content → instructed-revision | acts on output the generation activity produced | | accept |
| generated-content → regeneration | acts on the output the generation activity produced | | accept |
| data → dynamic-hyperlinks | hard and soft data layering | foundation as substrate, per the tiebreaker note under `instantiates` | accept |
| embedded-intelligence → suggestion | the output is often a suggestion the actor can accept, reject, or modify | inference output is the material the suggestion surface presents. Contrast the two X entries below, where embedded intelligence is a constituent rather than a producer | accept |
| information-architecture → localization | controlled vocabularies and label strategies that localization must adapt | the clearest make-time edge in the corpus; sets the direction for the localization group under D | accept |
| information-architecture → searching | the underlying structure and labelling system that search indexes | | accept |
| information-architecture → workspace | (no note) | structure partitions are what workspace partitioning acts on. Needs a note | accept |
| open-request → plan-preview | a complex request is the situation a plan makes reviewable before work starts | coincides with runtime | accept |
| prompt → agent | the prompt articulates the request the agent acts on | weak: an agent can be designed without a prompt surface (triggers, schedules). Coincides with runtime. Kept because the free-text request is the material the agent's design acts on in every page that carries both | accept |
| prompt → ai-tuning | lets the actor refine how the model gets prompted | tuning acts on the prompting mechanism | accept |
| settings → undo | enables reversal of settings changes | recorded overrides are the state undo acts on — the deletion → undo shape. Rewrite note; "enables" is the wrong verb | accept |
| settings → status-feedback | confirms settings changes | the change is the material feedback reports | accept |
| settings → notification | alerts actors to settings-related changes in shared contexts | conditional; the condition wants to move into a resulting clause | accept |
| tag → searching | tags enable faceted search and filtering | same relation as the situation-derived tag → filtering: the applied label is the facet the seeking move narrows by. Rewrite note | accept |

Situation-derived edges. The clause is the authorable home; nothing to rewrite unless a verdict says otherwise.

| Edge | Clause (abridged) | Verdict |
|---|---|---|
| ai-completion → cognitive-forcing-functions | inline generation makes accepting cheaper than evaluating, so over-reliance accrues by default | accept |
| annotation → commenting | a mark becomes something that can be answered rather than only added to | accept |
| assisted-task-completion → transparent-reasoning | the more work the system takes on, the more trust the actor has to extend | accept |
| autocomplete → ai-completion | deterministic completion ends where the continuation has to be generated | accept |
| bounded-autonomy → handoff | crossing a bound is a designed event: the work pauses and control returns | accept |
| bounded-autonomy → approval-gate | same clause | accept |
| change-review → approval-gate | the delta is a reviewable object, so an approval has something concrete to act on | accept |
| cognitive-forcing-functions → activity-log | where the forcing was writing down why, the reasons accumulate into a trail | accept |
| command-menu → unavailable-actions | commands that don't apply are absent rather than visibly out of reach | accept |
| commenting → status-feedback | comments acquire a lifecycle, and something has to say when a thread is finished | accept |
| data-entry → status-feedback | where the system did the structuring, its reading has to be shown back | accept |
| data-entry → validation | accepting a value and accepting it as correct are separate steps | accept |
| deletion → undo | a completed deletion is exactly the state undo acts on | accept |
| editing-in-place → undo | no assembled set to review, so taking something back happens after the fact | accept |
| explanation → cognitive-forcing-functions | a plausible explanation can make deferring easier rather than harder | accept |
| expressed-uncertainty → cognitive-forcing-functions | confidence is part of the output's surface, so scrutiny can land where needed | accept |
| flat-navigation → hub-and-spoke | holds only while everything fits one surface; when the count outgrows the screen, hub and spoke takes over | accept |
| good-defaults → autocomplete | a static guess serves only until the actor starts typing | accept |
| good-defaults → autofill | where the system already holds the actual value, pre-filling takes over from guessing | accept |
| good-defaults → assisted-task-completion | pre-population ends where the task needs the system to participate | accept |
| hub-and-spoke → purpose-keyed-view | the hub is the natural place to report across the spokes; what to show there is its own design problem | accept |
| live-presentation → abort | the output is legible as it forms, which is what makes interruption meaningful. Coincides | accept |
| live-presentation → generated-content | once the stream completes, a produced artefact sits on the surface. Runtime-voiced, but the artefact is the material; coincides | accept |
| next-best-action → action-consequences | accepting commits the actor to consequences they didn't work out | accept |
| next-best-action → cognitive-forcing-functions | where stakes are high, the recommendation being easy to accept is the problem | accept |
| open-request → inline-confirmation | where a step can't be taken back, the go-ahead has to come before it | accept |
| pan-and-zoom → coordinated-views | at any zoom the view carries no evidence of where it sits in the whole | accept |
| plan-preview → approval-gate | the preview becomes the thing an approval can act on | accept |
| reference-material → citation | the attachment that went in is what a citation can later point out | accept |
| saving → draft-and-publish | saving no longer says whether work is ready for others | accept |
| suggestion → cognitive-forcing-functions | a concrete proposal is the help and also the anchor | accept |
| tag → filtering | an applied label is a handle: whatever has been tagged becomes a facet to narrow by | accept |
| transparent-reasoning → cognitive-forcing-functions | a trail that looks thorough invites the actor to stop reading it | accept |
| wizard → undo | the corridor removes peripheral vision, so a change of mind has to walk backwards | accept |
| disengage-without-closing → agent-opening | the exchange is parked: state is saved, the actor can see what persists. The parked state is material the openings are designed to act on — an opening is also a resumption. No make-time path runs from an opening back to disengage (it is reached only by `alternative: closing`), so the loop is in the encounter, not the graph. Clause to stop narrating the pick-up | accept |
| disengage-without-closing → user-opening | same | accept |
| workspace → notification | some of the actor's work is now somewhere they aren't looking | accept |

### U — use-time, not `precedes`

Authored edges.

| Edge | Note | Why not make-time | Proposed | Verdict |
|---|---|---|---|---|
| autofill → saving | what happens after pre-filled data is accepted | saving's design takes nothing from autofill; this is session order | drop | accept |
| generated-content → conversation | generated content can become part of ongoing dialogue | altitude crosses action → activity; conversation hosts generation, it does not act on its output. `hosted-by` already carries this for detached-artefact | `hosted-by` on generated-content, matching detached-artefact | accept: `hosted-by` |
| generated-content → suggestion | output can inform subsequent suggestions | the note doesn't say what "inform" means, and the edge closes the corpus's one `precedes` cycle (agent → generated-content → suggestion → prompt → agent) | reroute through the pattern that names the relation: a resulting clause on generated-content setting up next-best-action (the output is a transition point the system can read and propose against; next-best-action already `instantiates` suggestion). Optionally a second clause setting up selective-memory, if output accumulating into what is carried forward belongs on this page | fix: reroute via next-best-action; not added: the carry-forward consequence belongs on the agent and conversation pages, not on every page whose output feeds memory |
| onboarding → mastery | building proficiency after initial learning | the actor's arc, not the designer's. Mastery's initiating situation ("the scaffolding is now in the way") gives a thin make-time reading, but expert routes are designed without onboarding | keep, rewritten: onboarding leaves scaffolding, and mastery is the move that acts on it being in the way (the coincidence case) | accept |
| onboarding → agent | the first steps that help people get to know the agent | session order, and reversed: the agent is the material an agent-onboarding is designed for | reverse: agent precedes onboarding, note re-homed on the agent page (what onboarding has to introduce) | accept |
| prompt → generated-content | the input that leads to generated content | first read as a shortcut across prompt → agent → generated-content | fix: keep as `precedes` — the agent chain covers only agentic generation, and single-shot prompt-to-output is the common case where the stated request is directly the material generation acts on; revoice the note. Moves to M | accept |

Situation-derived edges. All but one in the conversation family. Family verdict: the edges stay `precedes` under the protocol-family coincidence (see "No use-time edge"); the clauses are revoiced to name what the design contains where they currently narrate the actor's next move. Per-row cells mark only the rows needing more than revoicing.

| Edge | Clause (abridged) | Verdict |
|---|---|---|
| agent-opening → open-request | the encounter is at its first fork | accept |
| agent-opening → abort | the actor has been addressed but has committed to nothing | accept |
| user-opening → inquiry-user | the shape of what they brought decides the activity | accept |
| user-opening → open-request | same clause | accept |
| user-opening → inquiry-agent | same clause | accept |
| user-opening → abort | nothing has been acted on yet, so a change of mind costs nothing | accept |
| agent-repair → inquiry-agent | the exchange narrows to asking for one missing value | accept |
| agent-repair → sequence-completion | the activity resumes at the step it broke on |accept: revoice — completion has to be designed to resume mid-sequence, not from the top |
| user-repair → extended-telling | where re-delivery isn't enough the agent has to take the floor | accept |
| user-repair → sequence-completion | comprehension is restored and the activity resumes |accept: revoice — completion has to be designed to resume mid-sequence, not from the top |
| sequence-completion → closing | the encounter is between activities; if this was the last thing, it is ready to be ended | accept |
| searching → navigation-overview | a search can fail; browsing the structure is the fallback seeking move | retype `complements`: two seeking moves commonly co-deployed, neither acting on the other's product; the fallback narration stays in searching's resulting clause without `sets-up` |

The searching → navigation-overview edge is the one use-time clause outside the conversation family. It is a runtime fallback, not a design consequence; the overview's design takes nothing from search.

### X — retype

| Edge | Note | Proposed type | Verdict |
|---|---|---|---|
| embedded-intelligence → filtering | natural language queries translated into structured filters | `enables` — a constituent woven into natural-language filtering | accept |
| embedded-intelligence → focus-and-context | infers what contextual information is most relevant | `enables` — same | accept |
| settings → localization | language, timezone, and format preferences | `hosts` — settings is where localization's controls live; it produces nothing localization acts on | accept |
| suggestion → prompt | can provide an initial prompt | `hosts` (prompt hosts suggestion), or drop | accept |
| transparent-reasoning → activity-log | provides the detailed reasoning steps that get recorded | `complements` — the live trail and the durable record of the same work; neither acts on the other | accept |
| workspace → activity-log | shows history within a workspace | `hosts` | accept |

### D — direction

Edges where a make-time claim exists but the authored arrow runs the other way. These matter most for the projection: unreversed, they place localization early and data views late.

*The data-view group.* Filtering's own initiating situation is "a collection framing is in place"; the view exists before the narrowing move. The authored direction (move → view) is a pipeline claim: the result set is displayed. Under the test, the view is the material the move acts on.

| Edge | Note | Proposed | Verdict |
|---|---|---|---|
| filtering → data-view | (none) | reverse: data-view precedes filtering | accept |
| grouping → data-view | (none) | reverse | accept |
| sorting → data-view | (none) | reverse | accept |
| searching → data-view | displays the result set a search produces | fix: keep direction, unlike its three siblings — filtering, grouping and sorting presuppose a shown collection, but searching produces a result set from a corpus with no view in place (a search box on an empty page), and presenting that set is the design problem the view acts on. Becomes a resulting clause on searching | accept |

*The localization group.* The one edge pointing into localization (information-architecture → localization: "vocabularies that localization must adapt") has localization acting on material another pattern produced. The five pointing out of it say the same thing with the arrow reversed — "dialogue structure adapted", "locale-aware input parsing", "localised message content". By the same reading each target is material localization adapts, which makes localization a late, cross-cutting move — construction-detail altitude in Alexander's terms. Whether that is the right picture is the author's call; the alternative is that localization is an early strategic decision (which locales, which vocabularies) and the arrows stand. The two readings cannot both hold alongside the information-architecture edge.

| Edge | Note | Proposed | Verdict |
|---|---|---|---|
| localization → conversation | dialogue structure adapted to cultural communication norms | reverse | accept |
| localization → generated-content | locale-aware generation | reverse | accept |
| localization → data-entry | locale-aware input parsing and format tolerance | reverse | accept |
| localization → notification | localised message content, timing conventions | reverse | accept |
| localization → help | localised documentation and support content | reverse | accept |
| good-defaults → localization | locale detection and sensible starting configuration | fix: retype `complements` — a locale guess is good defaults applied to localization's axes; neither pattern's product is the other's material | accept |

*Altitude-crossing situation edges.*

| Edge | Clause | Proposed | Verdict |
|---|---|---|---|
| annotation → collaboration | once the marks are visible to others the layer stops being a private reading aid | action → activity; a visible mark is one small move collaboration is built from, which is `enables`, not sequence | accept: `enables` |
| annotation → conversation | same clause | same; or drop, since "a mark can be answered" is commenting, already carried | accept: drop — annotation → commenting carries the claim |

## No use-time edge

Decision (2026-08-22): no new edge type. The use-time edges are rewritten in the designer's register where the two coincide, and dropped or retyped where they don't.

The ground for rewriting: in a protocol family the design object is itself a sequence, so the order the moves are designed in and the order the actor meets them are the same. Alexander's entrance sequence (Entrance Transition → Entrance Room → the rooms beyond) is ordered by walking order and treated as make-time without comment. The conversation family is the same case. The discipline is voicing: a clause names what the design now contains ("footing is set and a topic is on the table"), not what the actor does next ("the activity resumes"). Most of the family's clauses are already in the first form; the repair → sequence-completion pair needs rewording (completion has to be designed to resume mid-sequence).

What this gives up: the graph stops distinguishing session order from design order where both hold, and if a use-time edge is wanted later the coincident edges have to be re-derived (trivial for the conversation family, a handful elsewhere). Edges with no honest make-time voicing — searching → navigation-overview, autofill → saving — drop or retype per the U tables; prompt → generated-content, first read as a transitive shortcut, stays as the agentless generation path. The `precedes` definition gains a sentence saying why a protocol family coincides, and the register note stops offering runtime sequence as the basis of the claim.

## The projection

Once the edge set is settled, a third entry in `projections` (`apps/patterns/src/layouts/Base.astro`, beside `by-activity` and `a-z`):

- Primary key: altitude, in the order foundations → activities → actions → operations. This is the Activity Theory lens doing the job of Alexander's scale order — largest centres first. Qualities are not moves and sit outside the sequence (either omitted or as a trailing group).
- Secondary key, within and across bands: a topological sort over the make-time `precedes` set plus reversed `enables` (whole before part — the room before the window). Cycles, if any survive the sweep, are a finding for the changelog.
- Tie-break: the existing `GROUP_ORDER` and `group` facet, then title.

Use-time edges are excluded from the sort input. The 54 nodes no `precedes` edge touches take their position from altitude and group alone; that is the "approximate" in the title, and the label on the projection should say so. Alexander's order was authored, not computed, and this one is computed from sparse edges over an authored band structure.

Validation: the resulting order for the navigation family, the generation family (prompt, agent, generated content, its four follow-on moves), and the data-view family should read as a sequence a designer would recognise. If it doesn't, the edge set is still wrong, not the sort.

## Sequence

1. Author verdicts on the tables above. One sitting for the 43 authored edges; the situation-derived U edges are one family-level decision, not fifteen.
2. Changelog entry in relationship-vocabulary: the no-new-edge decision and the protocol-family coincidence rule, the register note under `precedes` revised so runtime evidence is no longer the stated basis, and the reversal rule for the data-view and localization groups.
3. Retype and reverse per verdicts, hand-edited page by page. Regenerate `pattern-graph.json` and confirm the `precedes` count matches the M bin plus any D reversals.
4. Build the projection. Extend the graph-extraction lint if a make-time cycle check is wanted.
5. Close: promote the test in "The test" into the `precedes` definition as the authoring check, and record the projection in `docs/specs/pattern-site.md` §Classification facets.

## Execution notes (2026-08-27)

All verdicts applied by hand, page by page; `pattern-graph.json` regenerated; typecheck, lint, and a full build pass. Notes a fresh reader needs:

- The corpus moved between the sweep and execution: `streaming-output` left the corpus in parallel work (its `streaming-output → abort` edge is succeeded by `live-presentation → abort`), and `generated-content → citation` and `citation → cognitive-forcing-functions` arrived the same way. The final `precedes` count is 84: the sweep's 82 plus those two arrivals.
- The combined ordering input (`precedes` plus reversed `enables`) is not acyclic even though `precedes` alone is: whole-before-part and an authored `precedes` can disagree (agent ≺ conversation ≺ prompt against prompt `precedes` agent). The sort therefore treats `precedes` blocks as hard and reversed-`enables` blocks as soft: Kahn's algorithm releases fully free nodes smallest-key first, and at a stall releases the smallest-key node that only the heuristic still holds. A naive stall-break emitted the whole generation family in title order.
- Validation passed on all sampled families: prompt → agent → generated content → its follow-on moves; data view before filtering, grouping, sorting; searching before data view; flat navigation → hub and spoke → purpose-keyed view; information architecture before localization, localization last of the foundations.
- The projection was built and validated as above, then reverted before commit: to be useful the ordering approach needs further development. Steps 4 and 5's projection work is therefore not in the tree — the nav keeps its two projections, and `docs/specs/pattern-site.md` records nothing. The sweep, the vocabulary changes, and the regenerated graph stand on their own; the ordering thread continues in [2026-08-sequence-map.md](../active/2026-08-sequence-map.md), with the hard/soft cycle-breaking design under "The projection" as recoverable prior art.

## Discoveries

- The `sets-up` construct is a better make-time authoring device than hand-written `precedes` notes. Thirty-four of fifty-one derived edges passed the test without qualification; of the forty-three authored ones, twenty-one did. The difference is that a clause has to name what the pattern leaves behind, and a note only has to gloss the link.
- Use-time edges concentrate in two families rather than being spread across the corpus, so the retyping is two decisions and a handful of stragglers.
- The sweep's first pass read one runtime loop (disengage → opening) as a make-time cycle; the edge set has no such path. The one real `precedes` cycle ran through a dataflow note (generated-content → suggestion) and a hosting claim (suggestion → prompt), both retyped.
- The direction problem is invisible in the graph view and only shows up when an ordering is attempted. Alexander's order is the check that found it.
