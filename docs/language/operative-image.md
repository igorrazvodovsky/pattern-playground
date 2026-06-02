# Operative image

Current working picture of the pattern language as it exists today. Use this
page as the main comparison surface against [vision.md](./vision.md): if they
diverge, decide whether the vision should change, the operative image should be
updated, or the difference should become a plan.

This is not a settled specification. Current commitments live in
[`docs/specs/`](../specs/) once promoted. Implementation commitments normally
start in [`plans/`](../../plans/) as executable specifications and may later be
encoded as scripts, schemas, lint rules, generated data, or CI checks.

## Current picture

The authored repertoire lives as pattern MDX in
`apps/patterns/src/content/patterns/`, rendered by the Astro pattern site;
Storybook (`packages/components/src/stories/`) is the UI development workshop. The pattern MDX pages are the current source material from which the pattern graph is extracted.

The pattern graph is the strongest current image of the language. It is built
from authored links, frontmatter, decision trees, and profile sidecars. Its typed
edges are suggestion-grade: they help an actor reason about possible moves, not
match a situation against rules. See
[relationship-vocabulary.md](./relationship-vocabulary.md).

The pattern/component distinction is under active formation. The current
working split is: a `component` is an implementation mechanism; a `pattern` is a
generative interaction move acting on a recurring human situation. The possible
future role vocabulary in [vision.md](./vision.md) is not yet implemented.

Decision trees are treated as authored situational hints. They expose what the
library currently discriminates on, and what it does not yet know how to
discriminate. See [decision-dimensions.md](./decision-dimensions.md).

Generative profiles are an early sketch of pattern-as-move semantics. The
sidecar shape is deliberately small: `operatesOn`, `produces`, and `enacts`.
These fields are concrete enough for extraction, but not mature enough to be the
full language object imagined in the vision.

## Detail sources

- [pattern-definition.md](./pattern-definition.md) — operational test for what
  counts as a pattern
- [pattern-site.md](../specs/pattern-site.md) — content schema, and pattern placement
- [graph-relationship-model.md](../specs/graph-relationship-model.md) —
  settled graph relationship model
- [relationship-vocabulary.md](./relationship-vocabulary.md) — detailed graph
  vocabulary and changelog
- [decision-dimensions.md](./decision-dimensions.md) — current decision-tree
  discriminators
- [`apps/patterns/src/content/patterns/`](../../apps/patterns/src/content/patterns/) —
  authored pattern repertoire
- [`packages/components/src/stories/`](../../packages/components/src/stories/) —
  Storybook component source
- [`apps/patterns/src/data/pattern-graph.json`](../../apps/patterns/src/data/pattern-graph.json) —
  generated graph view
- [`apps/patterns/src/content/pattern-profile.ts`](../../apps/patterns/src/content/pattern-profile.ts) —
  current generative-profile sidecar shape

## How to use this page

When the vision feels ahead of the repo, compare it to this page and ask:

1. Is the vision still right, but the operative image has not caught up?
2. Has the operative image revealed that the vision is incoherent or incomplete?
3. Is the difference actionable enough to become a plan?

If the answer to the third question is yes, write the executable specification
in [`plans/`](../../plans/) rather than expanding this page. Promote stable
residue into [`docs/specs/`](../specs/) when it becomes current truth.
