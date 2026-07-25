---
title: "Situation backfill: fill the two situations across the pattern corpus"
status: "completed"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-25"
completed: "2026-07-25"
area: "language"
promoted_to: ""
superseded_by: ""
---
# Situation backfill: fill the two situations across the pattern corpus

Follow-up from the split-project move review's composition pass (move 5 of
`plans/archive/split-project/composition.md`).

## Context

The situation constructs are live: `situation.initiating` /
`situation.resulting` in the schema, emitted as node metadata, with
`sets-up:` clauses deriving conditional `precedes` edges
(`docs/language/relationship-vocabulary.md` §Situations). Coverage as of
2026-07-25: 24 of 94 `role: pattern` entries carry a `situation:` block.

The delta since the outline (17/92 on 2026-07-11) is instructive for the
vocabulary doc's open question 1 (do situations get written unprompted?):
all seven new blocks came from the view-system reshape — one authoring
sitting over new and reworked pages. New pages authored in a sitting get
situations; existing pages do not acquire them organically. This pass is
the deliberate backfill the construct was always going to need.

The reshape also produced the evidence work item 2 was waiting for: six
view-system pages (attribute-visibility, coordinated-views, data-view,
overview-detail, problem-curated-view, purpose-keyed-view) carry both a
prose `## Consequences` section and `situation.resulting` clauses, and the
two visibly mirror each other (overview-detail's resulting clauses are
compressed restatements of its Consequences bullets). The
`consequences`-vs-`situation.resulting` comparison no longer needs a filled
corpus to start — it has a live specimen set.

Tooling already in place: the extractor warns when a `precedes` pair is
both declared in `relationships:` and emitted by a `sets-up` clause
("author the pair only in the clause"), so edge migration during the fill
is guarded.

## Work

### 1. Adjudicate `consequences` against `situation.resulting` — provisionally, first

`docs/language/vision.md` §Mature move record lists `consequences` among
the unrealised fields and points the comparison at this pass.
`situation.resulting` is defined as "what holds after the move is applied,
including the new problems it opens" — on its face the same territory.

Sit with the six double-carrying view-system pages and decide the
*provisional* relation before the fill starts, so 70 pages aren't authored
under an unsettled construct:

- Does `consequences` survive as a distinct field, or is it absorbed into
  `situation.resulting`?
- If absorbed: what is the prose `## Consequences` section then? A
  reader-facing rendering of the resulting clauses (one judgement, two
  renders — consistent with the construct's rule 1), or duplication to
  trim?
- If distinct: name the residue — which statements on the six pages are
  consequences but not resulting-context, and why.

The call is provisional until close-out (step 3): the fill itself is the
test, and any clause that refuses the construct is evidence to revisit.
Record the final outcome through the vocabulary changelog and the vision
doc's field list.

#### Provisional call (2026-07-25): absorbed, with the prose section keeping two jobs

`consequences` does not survive as a distinct field. `situation.resulting`
already covers its territory, and the six double-carrying pages show the two
saying the same thing at different lengths — data-view's two clauses are its
two Consequences bullets almost verbatim; overview-detail's and
purpose-keyed-view's are compressed restatements.

What decided it is a mechanism fact, not a judgement about the prose:
`situation.initiating` and `situation.resulting` never render on a pattern
page. They are emitted as node metadata, and the only place a clause reaches
a reader is as an edge's derived label in `RelatedPatterns.astro`. So the
prose `## Consequences` section already *is* the reader-facing render of the
resulting clauses, and the frontmatter block is the machine-legible one — one
judgement, two renders, exactly rule 1's shape. Minting a third carrier for
the same judgement is the scatter the construct exists to prevent.

The residue is real but small, and it is not resulting-context. Prose
Consequences carries two things a resulting clause does not:

- *Advice.* Coordinated views' third bullet — "merge views with
  near-identical semantics; couple only where coupling demonstrably helps" —
  tells the designer what to do, not what holds after the move.
- *Field observation.* Attribute visibility's "few products grant the control
  at all — the ceiling is the norm, not the exception" reports on the world,
  not on the design the move produced.

Neither wants a field. Advice belongs in the prose because that is where a
reader can act on it, and field observation belongs beside the reference it
came from. So the shape is: resulting clauses are the judgement, the prose
section renders them for a reader and is free to carry advice and observation
alongside. The fill tests whether that holds.

Scope note for the fill: this pass authors frontmatter. It does not add
`## Consequences` sections to pages that lack them — that would pre-empt the
call while it is still provisional.

### 2. Fill the two situations, family by family

Hand pass over the 70 `role: pattern` entries without a `situation:`
block — no scripted transforms; scripts only for verification. Batches
follow frontmatter `group`, because an initiating situation is told as the
history of sibling moves and `sets-up` targets are mostly within-family;
having the family in mind is most of the work. Anchors already written
(conversation, flat-navigation, searching, the view-system six) ground
each sitting.

Per page, three duties:

- *Write or skip.* Initiating situation as the history of moves already
  applied or ruled out (state-disabled is the negative-space specimen);
  resulting clauses for what holds after, with `sets-up:` only where a
  clause genuinely tees up a next move. The §Situations skip taxonomy
  governs: minimal primitives, unbounded stances, and collection pages
  skip honestly. An empty construct is not authored.
- *Decompose situational edges.* Where an existing `precedes`/`follows`
  edge note is really a conditional or situational judgement, move it into
  the source page's resulting clause with `sets-up:` and drop the
  `relationships:` entry (the extractor warns on the duplicate). Rule 2:
  the condition is authored on the source side, so a `follows` note on B
  may land as a clause on A — cross-page edits stay within the batch where
  possible. Hub-and-spoke is the worked example waiting to happen: the
  vocabulary doc already decomposes "takes over when items exceed screen
  capacity" into flat-navigation's resulting clause.
- *Record the verdict.* Check the page off below with its outcome:
  `authored`, or `skip` plus which taxonomy arm. The roster is the
  worksheet; verdicts live here so the pass is resumable and auditable.

Batch order, sequential-density first:

*Batch 1 — conversation (13).* The most sequential family; densest
`sets-up` territory (openings → activities → repairs → closings).

- [x] abort — authored
- [x] agent-opening — authored
- [x] agent-repair — authored
- [x] capability-and-scope — authored
- [x] closing — authored
- [x] disengage-without-closing — authored
- [x] extended-telling — authored
- [x] inquiry-agent — authored
- [x] inquiry-user — authored
- [x] open-request — authored
- [x] sequence-completion — authored
- [x] user-opening — authored
- [x] user-repair — authored

Batch 1 notes. All thirteen authored; nothing in the family skipped. The
primitives-skip arm doesn't apply here even though every page is
`atomic: primitive` — in a sequential family the initiating situation *is* the
stage of the encounter, which is move-history, not a restatement of the
definition.

Fourteen conditional `precedes`/`follows` entries decomposed into source-side
clauses and dropped from `relationships:`. Two of the openings' forks collapsed
into single clauses with several `sets-up` targets, because the fork is one
judgement: which activity the encounter enters depends on the shape of what the
actor brought. `disengage-without-closing` resumes the same way — one clause,
both re-entry points.

Two things surfaced that weren't decomposition:

- *Retarget.* `agent-repair precedes inquiry-user` (mirrored by
  `inquiry-user follows agent-repair`) was aimed at the wrong primitive. The
  note said "transitions into information capture when a specific required value
  is missing", and information capture is the *agent* asking — inquiry-agent.
  Since the judgement was being rewritten as a clause anyway, it now sets up
  inquiry-agent, and both mis-aimed entries are gone.
- *One new edge.* `open-request` sets up `inline-confirmation` — the page's own
  guidance already gates irreversible steps behind explicit confirmation, and the
  clause was the first place that claim had a home.

Held: `abort related undo`'s note is conditional ("when state has been
modified"), so its judgement sits partly outside abort's resulting clause. Not
touched here — converting it would re-type a `related` edge to `precedes`, which
is a changelog decision rather than a decomposition. Abort's second clause states
the loose-end problem in its own words instead.

Extractor after the batch: no situation warnings, no duplicate-pair warnings,
`precedes` 68 → 69 (the retarget swaps one, inline-confirmation adds one).

*Batch 2 — seeking + navigation (13).* Holds the doc's own worked
conditional (flat-navigation → hub-and-spoke) and the escalation ladders.

- [x] command-menu — authored
- [x] dynamic-hyperlinks — authored
- [x] filtering — authored
- [x] link-preview — authored
- [x] progressive-disclosure — authored
- [x] sorting — authored
- [x] fully-connected — authored (resulting only)
- [x] hub-and-spoke — authored (resulting only)
- [x] hybrid-patterns — skip (collection page)
- [x] multilevel-tree — authored (resulting only)
- [x] pan-and-zoom — authored (resulting only)
- [x] pyramid — authored (resulting only)
- [x] step-by-step — authored (resulting only)

Batch 2 notes. The batch turned up two things the outline hadn't anticipated,
both worth carrying into the remaining batches.

*A fourth skip arm: the decision tree already owns it.* Rule 1 gives a
situational judgement two possible homes — a node's situation block, or the
decision tree that owns it. For all six navigation models the which-model
judgement is `navigation-overview`'s tree, in detail and by name ("deep
hierarchy? 3+ levels, 50+ pages → multilevel tree"). An initiating situation on
those pages would be that tree restated node-side, which is the smearing the
construct exists to end. So the six carry `resulting` only, each with a comment
saying why the other half is absent. Their resulting contexts are *not*
tree-owned — the tree says which model to reach for, never what applying one
leaves behind — and that is where the content turned out to be. This arm is not
in the §Situations skip taxonomy; it belongs there, and step 3 should put it
there.

*`alternative` on a pair blocks `sets-up`.* The obvious model-to-model
escalations (fully connected outgrowing its chrome → tree; hub's lateral cost →
hybrid) all have their pairs already typed `alternative`, and `alternative` plus
`precedes` between the same two nodes genuinely contradict: different
transformations of the same starting structure, versus one producing what the
other acts on. Hard block, for the rest of the pass. Two new handoffs cleared
it: hub-and-spoke sets up purpose-keyed-view (grounded in navigation-overview's
own "monitor multiple areas" line) and pan-and-zoom sets up coordinated-views
(grounded in overview-detail's minimap note).

`complements` and `related` do *not* block. The pairing isn't a contradiction
there, and rule 1 resolves the two-carrier worry in the clause's favour: the
clause is the authorable home, the edge note a rendering of it. The vocabulary's
own escalation ladder is this shape — good defaults' `precedes` to autocomplete
and autofill came out of judgements that had been sitting beside `complements`.
So: `sets-up` is allowed on a `complements`/`related` pair when the clause
genuinely states a handoff, and when it is used the note comes off the
`relationships:` entry so the judgement keeps one home.

Batch 2 was authored under the blanket version of this rule before it was
narrowed, so three conversion opportunities are held rather than taken:
multilevel-tree/searching ("escape hatch when hierarchy fails"),
filtering/agent (delegating a filter the attributes can't express), and
progressive-disclosure/good-defaults ("what is visible by default is the first
disclosure decision"). Deliberate holds, not rulings — they are re-typing calls,
and worth a look at close-out alongside the health dial.

*`hybrid-patterns` skipped as a collection page.* The page enumerates six
combinations rather than making one move, and each combination's condition
already lives in navigation-overview's hybrid-combinations list. Its `role` is
`pattern`, but the collection-page arm is what the content is.

One decomposition: `command-menu precedes unavailable-actions` ("context menus
show only relevant commands, hiding those inaccessible in the current context")
into a clause. Single-page edit — no mirror existed.

Extractor after the batch: no warnings, `precedes` 69 → 71.

*Batch 3 — application (12).*

- [x] action-consequences — skip (unbounded stance)
- [x] assisted-task-completion — authored
- [x] cognitive-forcing-functions — authored
- [x] data-entry — authored
- [x] human-goes-first — authored
- [x] next-best-action — authored
- [x] overreliance-checklist — authored
- [x] saving — authored
- [x] settings — authored
- [x] suggestion — authored
- [x] template — authored
- [x] wizard — authored

Batch 3 notes. Eleven authored, one skipped.

*`action-consequences` skips as an unbounded stance.* The page is a framework for
evaluating severity — three dimensions and a five-rung ladder of guards — not a
move somebody applies. Its resulting context would be "you now know which guard
this action wants", which is a choice judgement, and deletion's decision tree
already owns that judgement for the one action it covers (the page's own
`related: deletion` note says so: "its decision tree is this framework projected
onto one action"). It stays a `sets-up` *target* — next-best-action and saving
both land on it — which is fine; a target owes no block of its own.

Four conditional `precedes` decomposed, all single-source, no cross-page edits
needed: cognitive-forcing-functions → activity-log (only the rationale-logging
variant produces a trail), next-best-action → cognitive-forcing-functions ("when
stakes are high") and → action-consequences ("when accepting leads to
consequential decisions"), suggestion → cognitive-forcing-functions (the
anchoring its own fixation-risk section documents is what the forcing functions
answer).

Four `sets-up` under the narrowed rule, each with its note removed from the
old entry so the judgement keeps one home: data-entry → status-feedback (was
`related`) and → validation (no prior edge — `form hosts` all three, but the
entry-to-checking handoff had no home), assisted-task-completion →
transparent-reasoning (was `related`; the page's own "more initiative means more
need for transparency"), wizard → undo (was `complements`).

*Settings' four `precedes` left alone.* All noted, none conditional —
"locale-aware format preferences", "confirms settings changes" are plain
generative claims. Two carry a soft "particularly when…" that reads like a
condition and isn't one; manufacturing a decomposition out of them would have
been inventing the judgement rather than moving it.

Extractor after the batch: no warnings, `precedes` 71 → 75, `related` −2,
`complements` −1, related share 22.4% → 22.0%.

*Batch 4 — sense-making + evaluation + coordination (10).*

- [x] annotation — authored
- [x] block-based-editor — authored
- [x] explanation — authored
- [x] grouping — authored
- [x] tag — authored
- [x] focus-and-context — authored
- [x] semantic-zoom — authored
- [x] text-lense — authored
- [x] commenting — authored
- [x] inline-interface — authored

Batch 4 notes. All ten authored; nothing skipped.

*Annotation was one judgement across three edges.* Its `precedes` to collaboration,
conversation and commenting were three renderings of a single situational claim —
that the marks are visible to other people. All three notes hedged around the same
condition ("shared annotations…", "annotations often initiate…", "extends static
annotation into…"). They collapse into one clause with three `sets-up` targets, which
is the pre-correction shape rule 1 names, caught in the wild.

*One cross-batch rule-2 correction.* The over-reliance judgement about explanation —
"full explanations can *increase* over-reliance by giving users a plausible
justification they don't need to think through" — was authored on
cognitive-forcing-functions as a `complements` note. Rule 2 puts the condition on the
source side: it is explanation's resulting context that becomes the forcing function's
initiating situation. The clause now lives on explanation with
`sets-up: [cognitive-forcing-functions]`, and the note came off
cognitive-forcing-functions (whose own initiating, authored in batch 3, already
reconciles it from its own end as plain prose — exactly the B-side rule 2 describes).

Two other conversions: tag → filtering (no prior edge; the tag-to-facet handoff had no
home anywhere, and it is where tagging's value gets collected) and commenting →
status-feedback, promoted out of `tangential`. That last one is worth noting for the
tangential retirement watch — a `tangential` edge that turned out to be a plain
generative claim once the resulting context was written down.

Held: semantic-zoom/item-view stays `complements`. The ladder relation is
compositional — item view owns the rungs, semantic zoom drives them from one control —
not sequential, so there was nothing to convert.

Extractor after the batch: no warnings, `precedes` 75 → 78, `complements` −1,
`tangential` 18 → 17.

*Batch 5 — ungrouped (23).* Heterogeneous; contains a legible AI cluster
(agent, prompt, generated-content, transparent-reasoning,
embedded-intelligence, ai-tuning) worth sitting together, a state/status
cluster (state-empty, status-feedback, unavailable-actions,
inline-confirmation, validation), and a remainder taken page by page.

- [x] agent — authored
- [x] ai-tuning — authored
- [x] embedded-intelligence — authored
- [x] generated-content — authored
- [x] prompt — authored
- [x] transparent-reasoning — authored
- [x] inline-confirmation — authored (resulting only)
- [x] state-empty — authored
- [x] status-feedback — skip (unbounded stance)
- [x] unavailable-actions — authored
- [x] validation — authored
- [x] activity-feed — authored
- [x] activity-log — authored
- [x] autofill — authored
- [x] collaboration — authored
- [x] deep-linking — authored
- [x] help — authored
- [x] keyboard-shortcuts — authored
- [x] living-document — authored
- [x] mastery — authored
- [x] workflow — authored
- [x] workspace — authored

Batch 5 notes. Twenty-one authored, one skipped.

*`status-feedback` skips as an unbounded stance, on the same grounds as
action-consequences.* The page says so about itself — "not one move but a framework
for choosing among them" — three dimensions routing to three delivery shapes, each of
which is a pattern in its own right. Nobody applies status feedback; they apply
indication, or validation, or transient feedback. Its resulting context would be the
routing, which is a choice judgement.

The two skips together name a shape worth adding to the taxonomy: the *framework page*
— a page whose content is dimensions and a ladder that route to other moves. Both stay
`sets-up` targets (data-entry and commenting land on status-feedback; next-best-action
and saving on action-consequences), which is the right asymmetry: a target reconciles
from its own end or not at all, and neither of these has an own end to reconcile from.

*`inline-confirmation` takes the tree-owned arm.* Deletion's decision tree names it as
a leaf, and its own `related: action-consequences` note already places it on the ladder
("moderate recovery effort, clear intent, context worth keeping; one rung above
undo-only, one below modal"). Resulting only.

*One decomposition, one conversion.* `workspace precedes notification` ("alerts actors
to changes in non-visible workspaces") is the resulting context of partitioning, not a
property of notification — it moved into a clause. `transparent-reasoning` →
cognitive-forcing-functions converted out of `complements`, the same rule-2 correction
as explanation in batch 4 and from the identical note shape ("counterbalancing
interventions when transparent reasoning slides into over-reliance"). That the same
mis-homing appeared twice, on the two pages that make visible reasoning available, is
the sweep-yield tell working: over-reliance judgements were being authored on the
intervention's page rather than on the page whose move creates the exposure.

*The `agent`, `prompt` and `embedded-intelligence` fans left alone.* Eleven outbound
`precedes` between them, and none of the notes is conditional — "the input that leads
to generated content", "natural language queries translated into structured filters"
are plain generative claims, and two carry no note at all. The densest part of the
corpus turned out to have the least to decompose.

Extractor after the batch: no warnings, `precedes` 78 → 79, `complements` −1.

### 3. Close out — done 2026-07-25

*The step-1 adjudication is confirmed, not revised.* Nothing in 91 authored
blocks refused the construct. What the fill added is confirmation from the other
direction: pressure toward the residue categories showed up twice (a link-preview
clause that was advice, a dynamic-hyperlinks clause that was closer to a design
note than a state) and both rewrote cleanly as states. The boundary holds because
it is the boundary between "what holds after" and "what you should therefore do",
and that line is legible in the writing. Recorded in the vocabulary changelog
(2026-07-25) and in `docs/language/vision.md` §Mature move record, whose
unrealised list is now `problem`, `forces`, `evidence`, `status` — `consequences`
left it by absorption rather than implementation, which the vision doc says
explicitly so a later reader doesn't mistake it for a shipped field.

*Open question 1 answered, and reframed in answering.* Situations are written
unprompted; they land as edge notes rather than in the block. The pass recovered
22 situational judgements from `precedes`/`follows`/`complements` notes — one of
them (annotation) smeared across three edges as three hedged renderings of a
single claim. So the block only catches a judgement when it is already there. The
answer and the two practices it recommends — a thin block on every new page, a
periodic sweep of noted directed edges — are in the changelog; the question is
struck through in §Open questions with a narrower successor left open: whether
pages that now have blocks accrete into them, or whether the note reflex outlives
the block.

*Skip taxonomy grew two arms*, both written into §Situations: the decision-tree
arm (removes `initiating` only) and the framework page under unbounded stances.
The two `alternative`/`complements` authoring notes went in beside them, along
with the finding that minimal primitives are not skips inside a sequential family.

*Coverage.* 91 of 94 `role: pattern` entries carry a situation block; the other
three carry skip verdicts on this page — hybrid-patterns (collection page),
action-consequences and status-feedback (framework pages, unbounded stance). Every
entry is accounted for. Twelve pages carry `resulting` only under the
decision-tree arm; state-disabled remains the sole `initiating`-only page, as the
negative-space specimen it was written to be.

*Graph delta.* `precedes` 68 → 79, `related` −2, `complements` −4, `tangential`
−1, related share 22.4% → 22.0%. One edge retargeted (agent-repair → inquiry-agent,
away from a mis-aimed inquiry-user), one promoted out of `tangential` (commenting →
status-feedback). Site build green: 235 pages, schema and cross-reference validators
passing.

*A tooling gap the pass found the hard way.* The extractor's duplicate-pair warning
only fires when a `precedes` pair is declared in `relationships:` *and* emitted by a
`sets-up` clause. It says nothing when a `complements`, `related` or `tangential` edge
sits on a pair a clause now also emits — so every conversion out of those types is
unguarded, and the guard stayed silent through all five batches while two such pairs
accumulated. Both were caught by a final cross-type sweep over the graph rather than by
the extractor:

- `transparent-reasoning` ↔ `cognitive-forcing-functions` — the reciprocal `complements`
  note ("visible reasoning is valuable but can also anchor") survived on
  cognitive-forcing-functions' page and restated the judgement the new clause had taken
  over. Removed. The reason it survived is instructive: the conversion is authored on
  the source page, and the duplicate lives on the *target* page, which is exactly where
  nobody is looking.
- `data-entry` ↔ `validation` — validation's note bundled two claims, one sequential
  ("the entry the message responds to", now the clause's job) and one about prevention
  (a forgiving format removes errors validation would report). Trimmed to the prevention
  half, which is distinct and worth keeping; the `complements` edge stays.

Two pairs remain double-carried and are legitimate: `deletion → undo`, where the second
carrier is a `recommends` edge from deletion's own decision tree — two judgement homes,
which rule 1 permits by name — and `searching → navigation-overview`, where `surveys` is
collection membership and orthogonal to the sequential fallback claim.

The obvious follow-up is an extractor advisory for the cross-type case: a `sets-up`
clause emitting a pair that already carries any other typed edge. It is not a warning
(`recommends` and `surveys` co-presence are both fine), so it wants the advisory
register the axis sanity check uses, and it should be precision-biased the way the
note-verb advisory is. Not wired here — the pass is closing, and an advisory nobody has
tuned against a filled corpus is the kind that fires noisily and gets ignored.

*Carried forward.* Three `complements`/`related` conversion opportunities held
rather than taken, all from batch 2 before the `alternative`-only rule was
narrowed: multilevel-tree/searching, filtering/agent,
progressive-disclosure/good-defaults. Plus abort/undo, whose conditional
`related` note ("when state has been modified") sits partly outside abort's
resulting clause. All four are re-typing calls — changelog decisions, and the
health dial's nearest live leads for the next gardening sweep.

## Not owned here

`status` — adjudicated in the same composition sitting as the next
mature-move-record field the corpus is asking for (stubs with finished-page
authority, the schema-less fun meter, first-stab entries with no legible
maturity). Different construct, separate realisation.
