# Gloss queue — umbrella

After Phase 1 extraction landed ([typed-edges.md](./typed-edges.md)), `pattern-graph.gloss-queue.json` lists 137 edges awaiting a manually authored `gloss`. The queue mixes three reasons that want different work: pure authoring (`enacts`), judgement (`axis-flagged`), and partial research (`thematic`). They are scoped as three separate tasks rather than one sweep, because each wants different reading, different output, and a different commit.

## Tasks

| Plan | Reason | Count | Character |
|---|---|---|---|
| [gloss-axis-flagged.md](./gloss-axis-flagged.md) | `axis-flagged` | 3 | Judgement — confirm the type or propose a different one |
| [gloss-thematic.md](./gloss-thematic.md) | `thematic` | 45 | Partial research — surface any further promotion candidates, then gloss |
| [gloss-enacts.md](./gloss-enacts.md) | `enacts` | 89 | Authoring — one sentence per edge, batched by source pattern |

(The thematic count dropped from 56 to 45 after the `Used by` / `Composed from` / `Containers` promotion in the Phase 1 changelog. The `enacts` count rose by one because the promotion produced one extra pattern→quality path.)

## Sequencing

1. *Axis-flagged* first — three edges, one sitting. Either confirms or revises the type assignments and clears a small failure mode before authoring volume builds up.
2. *Thematic* second — small additional promotion scan, then 45 glosses. Cheaper than enacts and may produce one more vocabulary revision.
3. *Enacts* last — largest task, can be batched across multiple sittings without coordination overhead.

Within each task, work in batches small enough to keep the source MDX readable in one context window. Don't try to do all of any task in one Claude session.

## Output discipline

- Glosses are authored in a separate JSON file shaped like the queue (`{source, target, type, gloss, glossSource}`), then merged via `npx tsx scripts/merge-glosses.ts <file>`. Don't edit `pattern-graph.json` directly.
- Use `glossSource` to record the authoring pass: `manual`, `llm-pass-1`, `manual-revised`, etc. Lets a future re-author preserve provenance.
- After each task, commit the merge as a separate commit with a short message naming the reason set covered.
- After each task, append a short changelog entry to [docs/relationship-vocabulary.md](../../../docs/relationship-vocabulary.md) recording any vocabulary revisions, observed drift, or candidates surfaced for future promotion.

## Cross-cutting context discipline

Each task plan is self-contained on purpose. Don't assume the prior task's reading carries over — when a Claude session opens a task, it should read its plan, the queue subset for that task, and the relevant source MDX. The queue itself is the working memory, not the chat transcript.

Re-running `npx tsx scripts/extract-graph-data.ts` is safe between tasks: existing glosses are preserved on `(source, target, type)`. If a regeneration drops a gloss (because an endpoint or type changed), the edge re-enters the queue and the changelog should note why.
