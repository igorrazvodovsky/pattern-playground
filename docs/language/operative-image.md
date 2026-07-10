# Pattern language operative image

Current working picture of the pattern language as it exists today. Use this page
as the main comparison surface against [vision.md](./vision.md): if they diverge,
decide whether the vision should change, the operative image should catch up, or
the difference should become a plan. For the project artifact's current state,
see [../project/operative-image.md](../project/operative-image.md).

This is not a settled specification. Current commitments live in
[`../specs/`](../specs/) once promoted. Implementation commitments normally start
in [`../../plans/`](../../plans/) as executable specifications and may later be
encoded as scripts, schemas, lint rules, generated data, or CI checks.

## Current picture

The authored repertoire lives as pattern MDX in
`apps/patterns/src/content/patterns/`, rendered by the Astro pattern site;
Storybook (`packages/components/src/stories/`) is the component workshop. The
MDX pages are the source material from which the pattern graph is extracted.

A first iteration of the typed-edge layer exists, but it is not yet operational.
The graph is extracted from authored frontmatter `relationships:`, inline `rel=`
annotations, and three structural auto-typings (`surveys`, `enacts`,
`recommends`), with two judgement homes — node-side situations and decision
trees — emitting their own edges and contributing node-level metadata. All existing edges have been migrated from heading-text inference to
explicit authoring, and the `RelatedPatterns` component renders typed edges on
pattern pages. Its edges are suggestion-grade: they help an actor reason about
possible moves, not match a situation against rules. See
[relationship-vocabulary.md](./relationship-vocabulary.md).

What is not yet true is that the layer can be used to generate design. Coverage is
partial (situations populated for a small set, edges uneven across the corpus),
structural gaps remain, and the relationship vocabulary is explicitly provisional
— expected to change through several more iterations of tinkering with edge types
and data-model features before it is useful in real design work. The build is
real; the operational language is still ahead of it.

The role model is settled. The pattern/component distinction is defined in
[pattern-and-form.md](./pattern-and-form.md) and the role model in
[../specs/pattern-role-model.md](../specs/pattern-role-model.md): mechanisms
converge in the form language, moves diverge in the pattern language, and pages
that mix the two decompose. The earlier `umbrella` role has been split into
`pattern` (composite moves, authoritative for their own move) and `collection`
(authored surveys over a territory).

Decision trees are treated as authored situational hints. They expose what the
library currently discriminates on, and what it does not yet know how to
discriminate. See [decision-dimensions.md](./decision-dimensions.md).

Situations are still an early sketch of pattern-as-move semantics. The construct
is deliberately small — an initiating situation and resulting-context clauses,
with `sets-up:` emitting conditional `precedes` edges — and populated for only a
small starting set. These fields are concrete enough for extraction, but not yet
the full move record imagined in the vision.

The Nature of Order register is not yet reached. [levels-of-scale.md](../levels-of-scale.md)
is the first worked translation of a structural property into software; the rest
of the language remains in the Pattern Language register, with the graph as its
strongest current image.

## Detail sources

- [pattern-definition.md](./pattern-definition.md) — operational test for what
  counts as a pattern
- [../specs/pattern-site.md](../specs/pattern-site.md) — content schema, and
  pattern placement
- [../specs/graph-relationship-model.md](../specs/graph-relationship-model.md) —
  settled graph relationship model
- [../specs/pattern-role-model.md](../specs/pattern-role-model.md) — node roles
  and the move/mechanism decomposition rule
- [relationship-vocabulary.md](./relationship-vocabulary.md) — detailed graph
  vocabulary and changelog
- [decision-dimensions.md](./decision-dimensions.md) — current decision-tree
  discriminators
- [design-theory.md](./design-theory.md) — the Pattern Language → Nature of Order
  trajectory
- [../levels-of-scale.md](../levels-of-scale.md) — first worked translation of a
  Nature of Order property into software
- [`apps/patterns/src/content/patterns/`](../../apps/patterns/src/content/patterns/) —
  authored pattern repertoire
- [`apps/patterns/src/data/pattern-graph.json`](../../apps/patterns/src/data/pattern-graph.json) —
  generated graph view
- [relationship-vocabulary.md §Situations](./relationship-vocabulary.md) —
  the node-side situation constructs

## How to use this page

When the vision feels ahead of the repo, compare it to this page and ask:

1. Is the vision still right, but the operative image has not caught up?
2. Has the operative image revealed that the vision is incoherent or incomplete?
3. Is the difference actionable enough to become a plan?

If the answer to the third question is yes, write the executable specification in
[`../../plans/`](../../plans/) rather than expanding this page. Promote stable
residue into [`../specs/`](../specs/) when it becomes current truth.
