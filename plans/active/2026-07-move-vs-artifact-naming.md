---
title: "Move-vs-artifact naming: the T6 kept twins"
status: "active"
kind: "exec-spec"
created: "2026-07-10"
last_reviewed: "2026-07-10"
area: "language, pattern-site"
promoted_to: ""
superseded_by: ""
depends_on: "plans/completed/2026-07-relationship-vocabulary.md (re-homed from its carried list); docs/specs/pattern-role-model.md (bilingual-same-name rule)"
---
# Move-vs-artifact naming: the T6 kept twins

An outline to be iterated on before executing — the candidate list and the renaming criteria both need a sitting to firm up.

## The tension

The naming rule says a pattern is named by the interaction move, not the component that implements it ("Transient feedback", not "Toast"); the name must apply to any valid implementation. The T6 closure kept Sections and Command menu as bilingual twins — the mechanism's name on the pattern side, under the bilingual-same-name rule (pattern-role-model.md, Decomposition signal 3). The reflection that carried here: both sit closer to artifact-names than Form does. The move behind Sections is adaptive disclosure; "Sections" names the artifact that results. Command menu names a summonable surface; the move is invocation-by-name.

Form is the comparison point that makes the twins look off: "form" reads as the activity of structured collection as much as the widget, so the same-name rule costs nothing there. "Sections" mostly doesn't.

## Settled constraints

Three rulings from the split-project move review (2026-07-11) are settled inputs — build on them, don't re-open:

- *The Locative axis (`hosts`) speaks the artifact register legitimately.* Spatial containment is not artifact-specific; activities can be "spatial" too and contain each other (review 01 M4). A relationship type may address the artifact register when the relation itself is register-neutral.
- *Keyboard shortcuts keeps its thing-like name.* The fix was stripping the artifact-grade content (implementation specifics), not renaming; the name is the industry's, and the entry's remaining content carries the move (review 07 M3).
- *Block-based editor keeps the industry name.* An industry-standard artifact name stands when the community of practice that owns the term elsewhere is distant enough that no practical collision arises (review 07 M5; decision log in `2026-07-block-editing-followups.md`).

Together: a name or type legible in the artifact register can still speak the pattern language honestly — renaming is not owed for register alone. Precedents 2 and 3 are the standing evidence for the industry-standard-name exception clause contemplated in the iteration notes below, and bear directly on the Command menu question.

## Work outline

1. Restate the test: does the name apply to any valid implementation of the move? Collect the evidence per twin (how each page's own body names its move).
2. Options per twin: keep the name and record why the same-name rule holds; rename the pattern to the move (slug migration — on a stem collision the pattern keeps the bare slug and the mechanism doc keeps its Storybook id, so the direction of migration matters); or keep the name with a body note naming the underlying move (the cheap middle).
3. While the lens is out, sweep for other artifact-named patterns beyond the T6 pair — one pass, findings only, no bulk renames.
4. Record the outcome where naming rules live (pattern-role-model.md), not in the vocabulary changelog — this is a naming decision, not an edge-vocabulary one.

## Costs to weigh

A slug rename ripples: intra-site links, `relationships:` targets, PatternRef slugs in Storybook MDX, the graph node id, demo ownership keyed by slug. All of it is build-gated (cross-reference validator, extractor warnings), so a rename fails loudly rather than silently — but it is still a corpus-wide touch, and the hand-migration policy applies.

## Notes for iteration

Undecided and needing thought before any execution: whether "adaptive disclosure" is actually the right move-name for Sections (or a Decomposition-signal-3 counterexample); whether Command menu's ubiquity as an industry term outweighs the artifact-name objection; and whether the rule itself wants an explicit exception clause for industry-standard names, recorded in pattern-role-model.md.
