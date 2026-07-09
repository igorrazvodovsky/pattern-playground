---
title: "Relationship vocabulary: situations, part–whole hygiene, and the hosting gap"
status: "active"
kind: "exec-spec"
created: "2026-07-08"
last_reviewed: "2026-07-08"
area: "language, graph, pattern-site"
promoted_to: ""
superseded_by: ""
depends_on: "plans/completed/2026-06-typed-relationships.md, plans/active/2026-07-workspace-split-closure.md (workstream 2 gates the realised_by item)"
---
# Relationship vocabulary: situations, part–whole hygiene, and the hosting gap

The workspace-split territory closures generated vocabulary findings faster than any plan owned them: each closure's log recorded an input "for the relationship-vocabulary work" and moved on. This plan is that work's home. It owns the accumulated items, sorts them by what they actually are (one hygiene audit, one construct decision, two gated verdicts), and carries the research gate the construct decision needs before anything is committed to [relationship-vocabulary.md](../../docs/language/relationship-vocabulary.md).

The vocabulary doc stays the record; this plan is the vehicle. Changes land there through its changelog, per its own convention.

## Inventory

Each item marked with provenance. All originate from the closure plan's progress log or open questions unless noted.

1. *Part–whole misuse in the conversational cluster.* The 13 conversational primitives point at `conversation` through two different relations — 9 `enables`, 4 `instantiates` (abort, extended-telling, inquiry-user, user-repair) — with no discernible principle behind the split. The vocabulary doc settled this distinction (component–integral vs genus–species, after Winston et al.); by its own definitions the four `instantiates` are wrong: an abort is a constituent move *within* a conversation, not a *kind of* conversation. The definitions are settled but nothing at authoring time surfaces them. (T3 post-review repair, 2026-07-08.)
2. *Situations on edges.* Three sightings of one construct:
   - A conditional edge type: flat-navigation → hub-and-spoke reads as `precedes` when item count grows and as `alternative` when it is fixed; the note field carries the condition today. (T1 input, 2026-07-02.)
   - The graph already holds two same-typed edges between one pair distinguished only by `situationalHints` (notification's tree emits two `recommends` to transient-feedback). (T5 reflection, 2026-07-02.)
   - Two prose decision trees waiting to emit edges: action-consequences (whose three dimensions — time to recover, scope of impact, cascade effects — are the natural type system for consequence properties) and status-feedback (initiation, action required, urgency). (T5 addendum and feedback-cluster entry.)

   The stated convergence: decision-tree branches, edge conditions, and consequence/resulting-context properties are one construct seen from three ends; a conditional `precedes` decomposes into the join between A's resulting context and B's initiating situation. Accumulated situation awareness during traversal is what the construct ultimately serves.
3. *The hosting gap* (closure plan open question 7). No relation expresses *where a move's trigger is surfaced*: toolbar hosts the group-by control that launches grouping, which is neither `precedes` (generative sequence) nor `enables` (dependency). The cheapest repair — glossing notes on the existing `precedes` edges — is applied and holding.
4. *`enables` vs `realised_by`* (closure plan workstream 2, last bullet). Once component references resolve against Storybook's `index.json`, the pattern→component edge can leave the graph and become a cross-dataset reference, letting `enables` mean only move-composition within the language. Gated on the validator landing; the vocabulary decision is this plan's, the validator is not.
5. *The note field is doing three jobs* — gloss, condition carrier, and disambiguation (the conversational primitives needed notes specifically so that *Closing* in a mixed list isn't read as window chrome). Symptom, not item: when situations get their own construct (item 2), conditions leave the notes; the audit in workstream A should not "clean up" condition-bearing notes before then.

## Shape

Items 2, 3, and 5 are one family: the vocabulary lacks a first-class way to say *in what situation this edge applies*, so conditions hide in notes, situational hints exist only on unauthorable `recommends` edges, and the hosting relation can't say "the trigger lives there". Item 1 is hygiene against an already-settled spec. Item 4 is a boundary redraw, already decided in direction and merely gated. The plan therefore has one reflective decision (workstream B) and three mechanical-once-decided moves around it — the same reflective/mechanical split the closure plan's process note prescribes.

## Workstream A — part–whole hygiene (executable now)

- Re-type the four conversational `instantiates` → `enables` (their reverse notes on conversation.mdx move from `instances:` to `composed-of:` accordingly).
- Audit the remaining `instantiates` edges (8 after the fix: assisted-task-completion→suggestion, bounded-choice→selection, collaboration→collaboration-foundation, learnability→agency, wizard→step-by-step, transient-feedback→status-feedback, user-opening→inquiry-user, validation→status-feedback) and the 31 `enables` edges against the doc's definitions. Most look right on a first pass; user-opening→inquiry-user and learnability→agency (quality→quality) are the two worth actual thought.
- Extend the extractor's existing axis sanity advisory with a mixed-cluster check: flag any node that is the target of both `enables` and `instantiates` from entries sharing a `group`, which is exactly the conversational-cluster signature. Advisory, not error — the epistemic stance says hints, not predicates.
- *Notes-voicing audit (added 2026-07-08, T4 follow-up).* A single-sided note renders on both endpoints' pages, always after the *other* endpoint's name — so a subjectless note binds to whichever endpoint the reader is not on. ~211 directed edges plus the single-noted symmetric set fall back this way. Most read fine because they gloss the relation; the failure class is a note voiced for one page (e.g. data-view→selection's "staking a subset…" read as a description of data-view; toolbar's hosting notes read as the *move* doing the hosting on toolbar's own page). Audit rule per edge: reword to a relation-gloss or subject-naming form, or author the reverse note via the inverse alias / near-side note; the worst six were fixed inline 2026-07-08 (CFF→agency, help→annotation, collaboration→collaboration-foundation, conversation→conversation-quality, toolbar's four hosting notes, plus selection's reverse note on data-view's `enables`). A cheap advisory could flag candidates mechanically: directed edges whose note lacks both endpoints' names.

## Workstream B — situation constructs (strawman, research-gated)

Strawman to be broken, not built: edges gain an optional *condition* (the situation in which the edge applies, typed against the dimension vocabulary action-consequences already exhibits); patterns gain *resulting-context* (and possibly *initiating-situation*) properties; `situationalHints` on `recommends` becomes the general condition mechanism rather than a decision-tree-only artifact; prose decision trees become authorable sources of conditioned edges rather than a parallel format. Deliverable here is schema and authoring rules only — what is authorable, in which channel, and where notes end and conditions begin.

Before committing: the external research gate, framed as *what would this design be wrong about*. Candidate breakage questions: whether conditions on suggestion-grade edges inevitably drift rule-grade (the doc's epistemic stance is the constraint to defend); what condition-bearing-edge prior art says (decision modelling à la DMN, situation calculus, Alexander's sequences and their unfolding conditions, guard conditions in statecharts); whether resulting-context belongs on the node or on the edge (the same fact is authorable in both places — pick one before two authors pick differently); and whether the dimension vocabulary should be controlled at all, given the doc's own warning against premature tag normalisation.

## Workstream C — the hosting relation (decide inside B)

Three candidate resolutions: keep the glossing notes (status quo); mint a `hosts` edge type; or express it through B's constructs (the trigger's location as part of the hosting composition's resulting context). Do not mint an edge type before B settles — a hosting edge added now would be the third relation whose semantics B's constructs would then partially absorb.

## Workstream D — `realised_by` (gated on the index.json validator)

When the closure plan's workstream-2 validator lands, decide the split: `enables` stays within-graph for move composition; component realisation becomes a cross-dataset reference against `index.json` (name to be settled — `realised_by` is the working label). Affects the doc's enables definition, the extractor, and RelatedPatterns rendering. Small once the carrier exists.

## Carried, not committed

From the vocabulary doc's own open questions and closure reflections — acknowledged here so they aren't re-lost, but not scoped in:

- `tensions-with` between qualities (doc question 5) — still waiting on two or three concrete examples.
- Negative-space marking for moves of last resort (state-disabled's all-`alternative` signature; T5 reflection) — node-level, rides only if B's constructs make it nearly free.
- `recommends` in the force-directed layout (doc question 2) and `related`-subcategory promotion to tags (doc question 3) — rendering and tagging questions, not vocabulary.
- Shared theoretical ancestry has no relation (T4 reflection): semantic-zoom and focus-and-context both descend from Furnas's degree-of-interest formalism, which sits *below* both patterns. The research takeaway was explicit — don't force a graph edge through a construct the language doesn't have — so the ancestry lives as parallel prose on both pages under an `alternative` edge. If a third DOI descendant lands (fisheye distortion, overview+detail as a move), revisit whether the ancestor wants a named home (foundation vs woven vocabulary, measured against Bridging Gulfs).
- `alternative` doing tangential work (T4 audit find): selection's `alternative: sorting` edge glosses an interaction ("sorting changes what a range selection refers to mid-flight"), not a mutual-alternative relation. One instance; fix with workstream A's audit pass rather than piecemeal.
- Move-vs-artifact naming for the T6 kept twins (T6 reflection). Sections and Command menu keep the mechanism's name on the pattern side under the bilingual-same-name rule (pattern-role-model.md Decomposition signal 3), but they sit closer to artifact-names than Form does — the move behind Sections is adaptive disclosure. 
- Filtering's builder ↔ command menu, resolved to component level (T6 follow-up, 2026-07-09): the `enables: filtering` edge was dropped — the actor building a filter is making *filtering's* move; what recurs is the command-menu *mechanism*. The relation now lives as filtering.mdx's ComponentRef to the kept Storybook mechanism doc (`components-command-menu--docs`), the transient-feedback→toast idiom. A worked instance of the pattern→mechanism reference shape workstream D formalises.

## Not owned here

The decision-tree merge *implementation*, traversal UX, and situation-awareness accumulation (the graph-situation direction's interactive side); the index.json validator (closure plan workstream 2); any content-side tree-ification of action-consequences or status-feedback (those follow the schema, not the other way round).

## Sequencing

A is one sitting and can run immediately. B is strawman → research gate → doc changelog entry, in that order, unhurried. C and D are verdicts that fall out of B and the validator respectively. Nothing here blocks the remaining closure territories (T4, T6).
