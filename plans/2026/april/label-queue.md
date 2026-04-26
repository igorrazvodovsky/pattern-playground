# Label queue — umbrella

*Closed 2026-04-26.* All three sub-tasks complete. Every edge in the queue (axis-flagged, thematic, enacts) carries an authored or reviewed label in the source MDX. The queue file `pattern-graph.label-queue.json` continues to regenerate on each extraction as a coverage report; it should now show 100% labelled for these three reasons.


After Phase 1 extraction landed ([typed-edges.md](./typed-edges.md)), `pattern-graph.label-queue.json` lists 137 edges where a manually authored `label` adds something the type alone can't carry. The queue mixes three reasons that want different work: pure authoring (`enacts`), judgement (`axis-flagged`), and partial research (`thematic`). They are scoped as three separate tasks rather than one sweep, because each wants different reading, different output, and a different commit.

*MDX is the source of truth.* Labels live in the source MDX as the per-link `— ` annotation that extraction reads on the next run. Manual authoring writes back into MDX rather than into the graph. The graph is purely derived data.

## Tasks

| Plan | Reason | Count | Character |
|---|---|---|---|
| [label-axis-flagged.md](./label-axis-flagged.md) | `axis-flagged` | 3 | Judgement — confirm the type or propose a different one |
| [label-thematic.md](./label-thematic.md) | `thematic` | 45 | Partial research — surface any further promotion candidates, then label |
| [label-enacts.md](./label-enacts.md) | `enacts` | 89 | Authoring — one sentence per edge, batched by source pattern |

(The thematic count dropped from 56 to 45 after the `Used by` / `Composed from` / `Containers` promotion in the Phase 1 changelog. The `enacts` count rose by one because the promotion produced one extra pattern→quality path.)

## Sequencing

1. *Axis-flagged* first — three edges, one sitting. Either confirms or revises the type assignments and clears a small failure mode before authoring volume builds up.
2. *Thematic* second — small additional promotion scan, then 45 labels. Cheaper than enacts and may produce one more vocabulary revision.
3. *Enacts* last — largest task, can be batched across multiple sittings without coordination overhead.

Within each task, work in batches small enough to keep the source MDX readable in one context window. Don't try to do all of any task in one Claude session.

## Output discipline

There are two ways to author labels, and which one fits depends on what you're doing:

- *Direct MDX edit.* Open the source MDX, find the link line, append/replace the `— ` annotation. Best for small batches, for cases where the bullet needs restructuring (multi-link bullets, missing sections), and for editorial changes that travel with the label.
- *Staging JSON + write-labels.ts.* Author entries in a JSON file shaped `{source, target, type, label}`, then run `npx tsx scripts/write-labels.ts <file>` to write them into the corresponding MDX bullets. Best for bulk authoring where the bullets already exist and just need annotations.

Either way, the label ends up in MDX. Re-running `npx tsx scripts/extract-graph-data.ts` then re-derives the graph including the new labels.

After each task, commit the MDX edits and append a short changelog entry to [docs/relationship-vocabulary.md](../../../docs/relationship-vocabulary.md) recording any vocabulary revisions, observed drift, or candidates surfaced for future promotion.

## Cross-cutting context discipline

Each task plan is self-contained on purpose. Don't assume the prior task's reading carries over — when a Claude session opens a task, it should read its plan, the queue subset for that task, and the relevant source MDX. The queue is the coverage report; the MDX is the source of truth.

Re-running extraction is safe between tasks: it's pure derivation from MDX. Labels never live in the graph file as authored content.

## Where labels can live in MDX

Extraction prefers per-line `— ` annotations on bullet lines containing exactly one link. Two placements work:

1. *Inside a `## Related patterns` H2 section, under a `### ` thematic header*. Standard placement.
2. *On a labelled bullet anywhere else in the document* — for example under a topical `### Related patterns` H3 inside a `## Foo` section. A document-wide annotation pass picks these up and overrides any header-text fallback label that the same edge picked up elsewhere.

This means an editor can put a labelled bullet wherever it editorially fits without losing the annotation in extraction.

## When the label needs the link to be added

Some `enacts` edges originate from quality references in inline prose, not from a *Related patterns* link. To attach a label there, add the link as a bullet (anywhere — see above). A short `### Enacted qualities` subsection inside the page's `## Related patterns` is a natural home but not the only one.
