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

## Gate: pattern–foundation link treatment — RESOLVED 2026-07-12

`serves` (pattern → foundation, participation/station-in-frame) landed through
the research gate (`research/pattern-foundation-serves/`) and the vocabulary
changelog. The rule for foundation-target rows is the four-arm reading guide
(tiebreaker note under `instantiates` in the vocabulary doc): concept applied
wholesale → `instantiates`; substrate produced ahead → `precedes`; material
the move's surface is made of → `enables` foundation-side; named station of
the foundation's frame → `serves` pattern-side. A row whose note claims none
of the four arms stays `related` — honest unclaimed adjacency. The noted
foundation-target edges were already swept in the minting pass; the rows left
for this audit are the *bare* ones, judged origin-note by origin-note.

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
