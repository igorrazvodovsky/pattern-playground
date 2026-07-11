---
title: "Enacts-note audit: align pre-existing labels with the Q-lens convention"
status: "active"
kind: "exec-spec"
created: "2026-07-10"
last_reviewed: "2026-07-10"
area: "language, graph"
promoted_to: ""
superseded_by: ""
depends_on: "plans/completed/2026-07-relationship-vocabulary.md (re-homed from its carried list)"
---
# Enacts-note audit: align pre-existing labels with the Q-lens convention

`enacts` is the bridge from moves to qualities, and its labelling convention is settled in [relationship-vocabulary.md](../../docs/language/relationship-vocabulary.md): a label names *what the move does to the centre* such that the effect is legible through Q's lens — not a restatement of the type ("X supports Q") and not a definition of the quality. The convention postdates most of the notes. The 2026-06-23 purist-stance entry flagged the debt ("pre-existing `enacts` notes were never audited against the Q-lens label convention") and it has been carried ever since; the relationship-vocabulary plan closed without owning it.

Nothing resurfaces this mechanically. The voicing advisory deliberately exempts `enacts` (quality pages render nothing, so there is no reverse reader), and the note-verb advisory checks the mistype-prone directed types, not `enacts`. Without its own pass or its own advisory, the debt is invisible.

Known specimen: `annotation enacts learnability` — "annotations provide the context needed for learning" is supports-Q-shaped, not a Q-lens label. Contrast the convention's positive example: "creates a moment of intentional pause before acting" (confirmation-dialog → agency).

## Scope

- Audit every noted `enacts` edge (116 `enacts` edges at 2026-07-10; the noted subset is smaller — count in the sitting) against the convention. Reword supports-Q-shaped and quality-defining notes to Q-lens labels; hold deliberately where a note genuinely earns its shape, and name the holds.
- Decide whether a third precision-biased advisory earns its keep beside the note-verb check in `scripts/extract-graph-data.ts`: `enacts` notes matching "supports/enables/provides/promotes/improves `<quality>`" phrasings. Same epistemic register as the existing checks — advisory, not error. If most findings are resolved by the audit itself and the tell would sit at zero, consider skipping the advisory and recording why.
- Changelog entry in relationship-vocabulary.md, per its convention (what was considered, what was lost).

## Shape

One sitting, same character as the relationship-vocabulary plan's workstreams A/A′: hygiene against a settled definition, judgement per edge, extractor advisory decided at the end, everything recorded through the changelog.

## Notes for iteration

The tell list above is a first guess — firm it up against the actual notes before wiring anything into the extractor (the note-verb advisory's history shows the tells need to be precision-biased or they drown in ordinary verbs, e.g. bare "enables" was rejected there for exactly this reason).
