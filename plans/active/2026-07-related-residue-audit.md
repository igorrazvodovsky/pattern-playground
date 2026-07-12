# Related-link residue audit

Restore, or deliberately release, what the relationships migration dropped.
Follow-up from the split-project move review (episode 04, move 3 of
`plans/archive/split-project/04-content-migration.md`).

## Context

On the split-project branch, "Related patterns" prose sections were migrated
into typed frontmatter `relationships:` in batches, followed by seven
hand-repair commits restoring notes the batches dropped (the failure mode:
entries written as bare slugs lose their prose note). The repairs recovered
much but not all of it — sampled residue at the endpoint:

- `information-architecture` carries `precedes: searching` but the origin note
  ("Without good IA, search is brittle") is gone; the edge sits as a bare slug
  beside noted siblings.
- temporality → suggestion ("visualising the future") has no successor edge in
  either direction.
- Whole bare-slug `related` lists persist (e.g. `collaboration-foundation`
  `related: - bot`).

Some residue may be genuinely lost nuance; some may have been removed
deliberately during the repairs or since. Only the author can tell the two
apart, per item.

## Gate: pattern–foundation link treatment

Links between patterns and foundations are currently in limbo: no settled
edge treatment exists for them beyond the foundation tiebreaker under
`instantiates` in `docs/language/relationship-vocabulary.md` (concept applied
by the pattern → `instantiates`; substrate produced ahead → `precedes`),
which types the clear cases but names no default home for the rest. Candidate
direction: mirror what was done for pattern–quality links (patterns carry the
edge toward the quality). The question is on the vocabulary doc's standing
register as open question 8; decide it there before judging foundation-target
rows, or those judgements will be made against a moving target.

## Work

1. _Produce the full list._ Diff every entry's "Related patterns" prose at the
   merge-base (`ef66e6a`) against its endpoint frontmatter `relationships:`.
   A script is fine here — this is verification, not migration. Output one row
   per origin link: origin entry, target, original note text, endpoint state
   (edge present with note / edge present bare / edge absent).
2. _Judge each row._ By hand, author only: *truly lost* (restore the note or
   edge, choosing the right edge type under current vocabulary), *removed
   deliberately* (nothing to do), or *release now* (accept the removal on
   inspection). Foundation-target rows wait for the gate above.
3. _Definition of done._ Every row judged; restorations committed; any
   bare-slug edge still standing afterwards is a deliberate seed, not
   unexamined residue.
