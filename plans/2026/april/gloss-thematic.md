# Gloss task — thematic edges

Part of [gloss-queue.md](./gloss-queue.md). 45 edges across 14 labels, after the `Used by` / `Composed from` / `Containers` promotion was completed in the Phase 1 changelog.

## What

Edges that landed under a `### ` header that didn't map to a typed edge. They're emitted as `related` with the original header text as `label`. The label is also normalised to a lightweight `tag` on the linked node (already done; not part of this task).

The remaining 14 labels are all single-source — each appears under exactly one page's *Related patterns* section. They are page-specific editorial cuts, not a controlled vocabulary trying to emerge.

| Label | Count | Source page |
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

### Pass 1 — promotion scan (no glosses yet)

Two labels are deferred-promotion candidates noted in the Phase 1 changelog:

- *Transient-mode patterns* (3) and *Notification as modality gradient* (3), both from `foundations-modality`, read taxonomically. Candidate `instantiates`. Currently deferred because n=1 source.

Decide whether to promote now or hold. Holding is the conservative call — promoting on n=1 risks minting a type that fits one page's framing and nothing else. Recommend hold; revisit when a second page uses a similar header.

Other thematic labels are clearly editorial and should not be promoted. No further scan needed.

### Pass 2 — author glosses, batched by source

Group edges by source page and read the source MDX once per page. For each edge under a thematic header:

- Write one sentence: *what about this link is the author trying to surface that the typed edges don't carry?* This is usually the editorial reason for the bespoke header.
- Don't restate the label. The label is already on the edge; the gloss should say what the label means in this specific link.
- For the `foundations-prose` labels: the page is reasoning about its own scope. The gloss should say what move the linked pattern makes that counts as a "prose move" (or a neighbouring foundation, or a prose-central activity).
- For `activities-collaboration` labels: the page cuts collaboration into editorial slices. The gloss should say what role the linked pattern plays in that slice.
- For `Lifecycle` (qualities-learnability → onboarding/mastery): the gloss should say what stage of the learnability lifecycle the activity occupies.

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

`gloss-thematic.json`, shape matching `merge-glosses.ts`:

```json
{
  "entries": [
    { "source": "...", "target": "...", "type": "related", "gloss": "...", "glossSource": "manual" }
  ]
}
```

Merge: `npx tsx scripts/merge-glosses.ts gloss-thematic.json`. Can be merged per batch or once at the end — both work.

## Done when

- All 45 edges have a `gloss`.
- Changelog entry recording: (a) the promotion-scan decision (hold or promote), (b) any further thematic clusters that look ready for promotion in a future round.
- Re-running `extract-graph-data.ts` preserves all glosses (none dropped from regeneration).
