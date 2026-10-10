---
title: Shaping the pattern pages
status: active
kind: exec-spec
created: 2026-10-10
last_reviewed: 2026-10-10
area: language / pattern pages
promoted_to: .claude/rules/pattern-content.md §Document structure; docs/language/relationship-vocabulary.md §Situations
superseded_by:
---

# Shaping the pattern pages

## Intent

Bring every `role: pattern` page onto the shape settled on 2026-10-10, one page per sitting. The shape is Alexander's page form taken for what is useful here, not reproduced: an opening paragraph that is the initiating situation, a section mark, a bold problem essence, an account of the pattern, `Therefore,` and a bold instruction, the realisation copy after it, and a closing connections passage that is the resulting situation, with the typed index folded beneath it. Both situations are frontmatter prose; the typed edges are the part of each the vocabulary can carry, and each edge's gloss derives from the sentence that links its target.

The rule is written and the machinery is built, but the shape has been tried on two pages only, both chosen because they fit it. That is not enough to conclude anything. The next sittings are tests of the shape as much as migrations: each one is expected to push back on the rule, the two situations, the derived glosses, or the plugin, and the rule and the machinery move when a page shows they should. Treat the procedure below as the current best guess, revised in this file as the sittings teach.

The work on each page is judgement: what the page currently says has to be re-told in the shape without losing what it knows. That is why this is a sitting per page and not a sweep.

Settled references, read before a sitting:

- [.claude/rules/pattern-content.md](../../.claude/rules/pattern-content.md) §Situations and §Document structure: the contract and the shape.
- [docs/language/relationship-vocabulary.md](../../docs/language/relationship-vocabulary.md) §Situations: what a situation is, the derived glosses, the earlier clause-list form and its retirement.
- [docs/project/core-beliefs.md](../../docs/project/core-beliefs.md): patterns are for whoever is making, in one voice.
- Shaped specimens: [wizard](../../apps/patterns/src/content/patterns/wizard.mdx) (an established pattern the evidence qualifies) and [hub and spoke](../../apps/patterns/src/content/patterns/hub-and-spoke.mdx) (a pattern studied in one pure case and generalised).

## Where the corpus stands

Counted 2026-10-10 over 142 pattern-collection files, 119 of them `role: pattern`:

| Feature | Pages |
|---|---|
| Shaped (`situation.resulting` as prose) | 2 |
| `situation.resulting` as a clause list | 113 |
| Clauses with `sets-up` | 41 |
| No `situation:` block at all | 26 |
| `## Variants` or `## States` sections | 18 |
| `## Problem`, `## Forces`, `## Solution` or `## Consequences` headings | 25 |

Pages not yet shaped keep working: the clause list renders as a generated Consequences section, the edges as a generated Related patterns list, and the lead narrates the initiating situation. Nothing breaks by waiting.

## A sitting

One page, one session. The work is reading first and writing second.

1. *Read the page as it is*, with its frontmatter, and the committed version if the working copy differs (`git show HEAD:<path>`, never a stash). List what the page knows: situations, clauses, notes on edges, variants, states, components, constraints, evidence, demos, to-dos.
2. *Read the page's neighbours*: every pattern it links to or is linked from, the sequences it appears in (the folded index on a shaped page, the foot on an unshaped one). The opening and the passage are written from these.
3. *Write the initiating situation* in frontmatter: what already exists when the pattern is worth reaching for, the sequences it appears in named by link, the larger patterns it helps complete, the alternatives already ruled out. It starts lowercase after the rendered ellipsis.
4. *Write the problem essence*: one bold paragraph after the first `* * *`, the recurring situation the pattern resolves, stated rather than argued.
5. *Write the account before Therefore*: when the pattern serves and when it constrains, what it costs, what is known and how far it is trusted, with contrary evidence stated as part of the account. Headings are allowed where they help. For an established pattern this is short.
6. *Write the instruction*: `Therefore,` on its own line, then one bold paragraph. A caution may follow in plain prose.
7. *Place the realisation after Therefore*: the canonical demo first, then variants, states, components, constraints, with their demos. This is where the old `## Variants`, `## States`, `## Structural components` and `## Design constraints` sections go, reworded, not dropped.
8. *Write the resulting situation* in frontmatter: every clause of the old list said as prose, every onward pattern linked with a sentence for what it does for this one, the problems the pattern opens, the look-alikes it is not. It ends where the rendered ellipsis takes over, so without a final full stop.
9. *Clean the relationships*: each `sets-up` target becomes an entry under `precedes`; notes whose content the prose now carries come off; a note that says something the prose does not is either written into the prose or kept. Never author a condition in a note.
10. *Remove what the shape replaces*: the body's trailing `* * *` and any body passage, `## Problem`, `## Forces`, `## Solution`, `## Consequences`, `## Behavioural position`, `## Metrics`, and the lead paragraph the opening now renders. Keep `## Related components`, `## Research on this pattern`, `## Resources & references`, `## To-do`.
11. *Run the checks* below, restart the dev server if the frontmatter schema or the plugin changed, and read the rendered page once from top to bottom.

Checklist for the finished page:

- The opening names the sequences the pattern appears in and the larger patterns, and reads as a continuation.
- Exactly two bold paragraphs: the essence and the instruction.
- Every clause of the old resulting list is said somewhere in the prose.
- Every edge the page authors is linked in its prose; the extractor reports none unspoken.
- Demos appear only after Therefore, or one above the opening paragraph.
- The passage is the last thing before the tail sections, and the body does not end in `* * *`.
- No `sets-up` remains in the frontmatter; `precedes` is authored under `relationships`.
- The voice holds: plain practitioner language, "actor", one addressee.

## Mechanical checks

```bash
npx tsx scripts/extract-graph-data.ts      # "edges unspoken on shaped pages" must be 0; no Situation warnings
grep -c '^\*\*' apps/patterns/src/content/patterns/<slug>.mdx   # bold paragraphs: 2
grep -n 'sets-up' apps/patterns/src/content/patterns/<slug>.mdx # none
```

The extractor checks edges, not clauses. Whether every old clause survived in the prose is the author's check in step 8, against the list made in step 1.

## Testing the shape first

Before any ordering by priority, pick pages that fit the shape badly, because those are where the back and forth will happen. Candidates, each stressing a different part:

- A conversation-family page: thirteen patterns whose initiating situation is which stage the encounter has reached. Tests whether the opening can be a stage in a sequence rather than a structure in place.
- A page that owns a decision tree (the deletion family): the vocabulary says the tree is the initiating situation's home. Tests whether the opening paragraph and the tree can coexist or one has to go.
- A minimal primitive the vocabulary says to skip: tests whether a page with nothing to say at either end still gets an opening and a passage, or whether the shape has an empty form.
- A page with many demos and variants (a navigation model or a form page): tests the order after Therefore and whether the passage still reads as the close when a long realisation sits before it.
- A `seed: true` page: tests what the two bold paragraphs look like when the pattern is a hypothesis.
- A page with many incoming edges and few outgoing: tests whether the derived gloss from the far side reads well, since its page will show mostly other pages' sentences.

Record in this file what each sitting changed in the rule or the machinery, and what it declined to change and why. After five or six such sittings, reread the rule against the record and settle what has held.

## Order after that

Pick by where the next sitting is anyway. Two useful priorities:

- Pages the sequences lean on hardest (the shared stations in [2026-08-sequence-map.md](2026-08-sequence-map.md)), because their openings will name several sequences and test the opening's form.
- Pages with `sets-up` clauses, because each one moves a `precedes` edge into `relationships` and retires a use of the earlier form.

## Sittings record

- 2026-10-10 wizard, hub and spoke: the shape and the machinery were built against these two. Both fit it; neither tested it.

The 26 pages without a situation block get both situations written in the sitting, from the body and the neighbours; the when-to-skip arms in the vocabulary still apply.

## Retirement

When the count of pages with a clause-list `resulting` reaches zero, the earlier form retires in one change: the schema arm in `content.config.ts`, the clause parsing and `sets-up` emission in the extractor, `Consequences.astro`, and the fallback branch in `integrations/remark-consequences.ts`. The vocabulary's §Retirement names the set; the changelog records the retirement. Until then the two paths coexist and no date is set.

## Open items recorded here, not blocking

- A derived gloss shown on the far endpoint's page may contain a link back to that page itself. Watch whether that reads badly; if it does, the renderer can drop the self-link.
- The folded index lowercases the first letter of titles with internal capitals ("intent & Interaction"). Small; fix when it annoys.
- Wizard and hub and spoke still owe a canonical demo after Therefore.
- Whether notes in `relationships` keep being written on shaped pages out of habit is the signal that the gloss derivation is not trusted; the vocabulary changelog entry of 2026-10-10 names it as the thing to watch.
