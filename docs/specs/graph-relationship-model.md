# Graph relationship model specification

The pattern graph is a generated knowledge surface derived from authored MDX,
Meta tags, decision trees, and profile sidecars. It supports reasoning about
how interaction moves combine; it is not a rules engine.

## Epistemic stance

Edges, tags, and decision-tree hints are suggestion-grade. They preserve what
has been useful or meaningful in the current corpus, not predicates that can be
matched mechanically against a design situation.

## Current graph data

- Source material lives primarily in `src/stories/**/*.mdx`.
- `scripts/extract-graph-data.ts` derives `src/pattern-graph.json` and related
  generated data.
- Node metadata includes title, category, path, role, tags, and extracted
  classification fields where available.
- Edges carry `source`, `target`, `type`, and optional `label`,
  `extractedFrom`, and situational hints.

## Edge vocabulary

The settled edge vocabulary is:

- `precedes` / `follows`
- `enables`
- `instantiates`
- `complements`
- `tangential`
- `alternative`
- `recommends`
- `related`
- `enacts`
- `surveys`

The detailed definitions, extraction rules, SKOS notes, generative-profile
guidance, and changelog live in
[`docs/language/relationship-vocabulary.md`](../language/relationship-vocabulary.md).
That document is the detailed vocabulary record; this spec is the current
contract summary.
