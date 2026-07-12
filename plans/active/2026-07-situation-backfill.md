---
title: "Situation backfill: fill the two situations across the pattern corpus"
status: "active"
kind: "outline"
created: "2026-07"
last_reviewed: "2026-07-11"
area: "language"
promoted_to: ""
superseded_by: ""
---
# Situation backfill: fill the two situations across the pattern corpus

*Thin outline — iterate before executing.* Follow-up from the split-project
move review's composition pass (move 5 of
`plans/archive/split-project/composition.md`).

## Context

The situation constructs landed on the branch: `situation.initiating` /
`situation.resulting` in the schema, emitted as node metadata, with
`sets-up` clauses deriving conditional `precedes` edges
(`docs/language/relationship-vocabulary.md` §Situations). Coverage is thin:
17 of 92 `role:pattern` entries carry a `situation:` block (2026-07-11).
Open question 1 in the vocabulary doc watches whether situations get written
unprompted; this plan is the deliberate pass that doesn't wait to find out.

## Work

1. _Fill the two situations, page by page._ Hand pass over the ~75
   `role:pattern` entries without a `situation:` block: the initiating
   situation as the history of moves already applied (or ruled out), the
   resulting clauses for what holds after — with `sets-up:` where a clause
   genuinely tees up a next move. A page may honestly end with no situation
   block; an empty construct is not authored.
2. _Adjudicate `consequences` against `situation.resulting`._
   `docs/language/vision.md` §Mature move record still lists `consequences`
   as an unrealised field, while `situation.resulting` is defined as "what
   holds after the move is applied, including the new problems it opens."
   With a filled corpus as evidence, decide: does `consequences` survive as
   a distinct field, or is it absorbed — in which case the vision's list
   shrinks. Record the outcome through the vocabulary changelog and the
   vision doc.

## Not owned here

`status` — adjudicated in the same composition sitting as the next
mature-move-record field the corpus is asking for (stubs with finished-page
authority, the schema-less fun meter, first-stab entries with no legible
maturity). Different construct, separate realisation.
