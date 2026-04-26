# Label task — thematic edges

Part of [label-queue.md](./label-queue.md). 45 edges across 14 thematic header categories. (Already completed; this plan is retained for reference.)

## What

Edges that landed under a `### ` header that didn't map to a typed edge. Emitted as `related`. Extraction prefers the per-line `— ` annotation as the edge `label` and falls back to the header text when no annotation is present. The header text is also normalised to a lightweight `tag` on the linked node.

The 14 thematic categories are all single-source — each appears under exactly one page's *Related patterns* section. Page-specific editorial cuts, not a controlled vocabulary trying to emerge.

| Category | Count | Source page |
|---|---|---|
| Patterns that manifest prose moves | 10 | foundations-prose |
| Neighbouring foundations | 5 | foundations-prose |
| Activities where prose is central | 5 | foundations-prose |
| Assisted input | 4 | operations-input |
| Adjacent to | 3 | actions-coordination-selection |
| Transient-mode patterns | 3 | foundations-modality |
| Notification as modality gradient | 3 | foundations-modality |
| Foundations & use qualities | 2 | actions-application-nextbest-action |
| Communication and awareness | 2 | activities-collaboration |
| Collaborative decision-making and co-creation | 2 | activities-collaboration |
| Human-AI collaboration | 2 | activities-collaboration |
| Lifecycle | 2 | qualities-learnability |
| Core collaborative components | 1 | activities-collaboration |
| Supporting patterns | 1 | activities-collaboration |

## How

Two-pass:

### Pass 1 — promotion scan (no labels yet)

Two categories are deferred-promotion candidates noted in the Phase 1 changelog:

- *Transient-mode patterns* (3) and *Notification as modality gradient* (3), both from `foundations-modality`, read taxonomically. Candidate `instantiates`. Currently deferred because n=1 source.

Decide whether to promote now or hold. Holding is the conservative call — promoting on n=1 risks minting a type that fits one page's framing and nothing else. Recommend hold; revisit when a second page uses a similar header.

Other thematic categories are clearly editorial and should not be promoted. No further scan needed.

### Pass 2 — author labels, batched by source

Group edges by source page and read the source MDX once per page. For each edge under a thematic header:

- Write one sentence: *what about this link is the author trying to surface that the typed edges don't carry?* This is usually the editorial reason for the bespoke header.
- Where extraction already populated the label from the per-line annotation, decide whether the per-line text is enough. If yes, leave it; the queue won't ask again. If the per-line text is too thin, write a richer one-sentence label.
- For the `foundations-prose` categories: the page is reasoning about its own scope. The label should say what move the linked pattern makes that counts as a "prose move" (or a neighbouring foundation, or a prose-central activity).
- For `activities-collaboration` categories: the page cuts collaboration into editorial slices. The label should say what role the linked pattern plays in that slice.
- For `Lifecycle` (qualities-learnability → onboarding/mastery): the label should say what stage of the learnability lifecycle the activity occupies.

## Suggested batching

| Batch | Source | Edges |
|---|---|---|
| 1 | foundations-prose | 20 (10 + 5 + 5) |
| 2 | activities-collaboration | 8 (2 + 2 + 2 + 1 + 1) |
| 3 | foundations-modality | 6 |
| 4 | operations-input | 4 |
| 5 | actions-coordination-selection | 3 |
| 6 | actions-application-nextbest-action + qualities-learnability | 4 |

Six batches, ~one source MDX read per batch. Each batch is its own session.

## Output

Either edit the source MDX directly (append `— <label>` to the link bullet) or stage in a JSON file and run `npx tsx scripts/write-labels.ts <file>`. The writer handles bulk edits cleanly when the bullets already exist as single-link lines; if a thematic section has multi-link bullets, split them first (one link per bullet) so each can carry its own annotation.

## Done when

- All 45 edges have a `— ` annotation in the source MDX that earns its keep.
- Changelog entry recording: (a) the promotion-scan decision (hold or promote), (b) any further thematic clusters that look ready for promotion in a future round, (c) any MDX restructuring that was needed to make labels placeable.
- Re-running `extract-graph-data.ts` reflects the labels.
