---
name: drift-review
description: Monthly drift review (Loop 3) — reflection-on-action over the month's git log, plans delta, docs delta, and vocabulary changes, read through five fixed lenses (garden constraint, abstraction-ladder coherence, category dynamics, vocabulary drift, dropped threads). Output is observations and questions only, never verdicts; it seeds the author's hand-written working-notes entry. Run monthly, or when the author asks what the month's work says about their thinking.
argument-hint: "[month, e.g. 2026-07; defaults to the current month]"
---

# Drift review (Loop 3)

Reflection-on-action over the month, aimed at the author's *thinking* rather
than the artifact. The agent supplies evidence and prompts; the reflection
itself stays hand-written — LLMs scaffold reflective practice well but tempt
the practitioner to delegate the reflecting, and for a thinking tool that
delegation is fatal. Hence the hard rule: *observations and questions only,
no verdicts, no recommendations phrased as conclusions*.

Defined by `plans/completed/2026-07-review-practice.md`.

## Evidence gathering

For the target month, collect:

- `git log --since/--until` across the repository — commit subjects and the
  shape of activity (where the churn concentrated);
- plans delta: files added, completed, archived, paused, superseded under
  `plans/`, and edits to `plans/index.md` and `plans/tech-debt-tracker.md`;
- docs delta: diffs under `docs/`, especially the vision and operative-image
  pairs and `docs/language/`;
- vocabulary changes: diffs to `docs/language/relationship-vocabulary.md`,
  `docs/language/conceptual-glossary.md`, `docs/specs/pattern-role-model.md`,
  and role/edge frontmatter churn in the content collections.

## The five lenses

Fixed, derived from the project's own commitments — not generic quality
talk. Run as one pass or one subagent per lens; either way *the five reports
stay separate*. Reranking observations across lenses into a single list is
exactly the flattening the fixed lenses exist to prevent.

1. *Garden constraint* — is anything drifting toward audience-serving
   product work? Test against `docs/project/core-beliefs.md`.
2. *Abstraction-ladder coherence* — are qualities/foundations mixing rungs
   again? (The January working note's complaint is the precedent.)
3. *Category dynamics* — splits and merges this month (agency keeps
   splitting): generative differentiation or classification entropy?
   Bowker & Star is the project's reference frame here.
4. *Vocabulary drift* — terms whose meaning moved silently between docs:
   same word, different load in two places, with no edit that acknowledged
   the shift.
5. *Dropped threads* — things started and quietly abandoned. Direction
   changes are the project's method, but they should be chosen, not
   forgotten. Distinguish "parked in `plans/paused/`" (chosen) from
   "last touched mid-gesture" (forgotten).

Each lens report: a handful of observations, each citing its evidence
(commit, diff hunk, plan file), followed by questions addressed to the
author. No verdicts. If a lens finds nothing, it says so — an empty lens is
itself information.

## Output

Write the five reports, kept separate under one file:
`plans/reviews/drift-<YYYY-MM>.md`. End with a short *prompts* section —
three to five questions, drawn from across the lenses, that could open the
month's working-notes entry.

The author's written response becomes (or seeds) the monthly working-notes
entry in `apps/patterns/src/pages/index.astro`. The agent never drafts that
entry.

## Ceremony guard

This loop is itself subject to the garden constraint: if it goes unused for
two cycles, it gets dropped or merged, recorded in a retrospective. Note in
the output file when the previous month's drift file has no corresponding
working-notes entry — that is the disuse signal accumulating.
