# Pattern role model specification

The current role distinction is conceptual and encoded in content frontmatter
and graph metadata.

## Settled distinctions

- A `component` is a reusable implementation mechanism: API, rendering, slots,
  props, states, styling, examples, and accessibility contract.
- A `pattern` is a generative interaction move: a recurring human situation,
  forces, invariant behavior, consequences, and relations to other moves.
- An `umbrella` is an authored survey over a territory of related moves, not the
  authoritative source for one move.
- A `quality` is an experiential lens such as Agency, Learnability, or
  Temporality. Qualities are bilingual: language entry in the pattern site,
  implementation substrate in the components package.
- A `foundation` is theory, model, principle, or material substrate. Foundations
  are bilingual in the same way as qualities.
- A `concept` is a software concept vocabulary entry.

`atomic:*` tags are compositional metadata. They do not decide whether a page
is a pattern source, a component source, or an umbrella.

## APG-style split rule

When a page mixes move-level content (situation, forces, consequences, edges)
with mechanism-level content (props, states, anatomy, keyboard, ARIA), it must
be split:

- The _move_ portion becomes a pattern-site entry named after the _interaction
  move_, not the widget. Name the move by what the actor is doing: "Constrained
  selection" rather than "Combobox", "Transient feedback" rather than "Toast".
- The _mechanism_ portion stays as a component story under the existing widget
  name.

The split rule applies to any APG-style control whose page describes a full
interaction contract with situational depth, not just mechanism docs. The move
name should transfer to any valid implementation of the move, not just the
canonical widget.

## Current implementation status

`role:*` metadata is emitted into `apps/patterns/src/data/pattern-graph.json`
for every graph node. Pattern-site MDX pages own their role through YAML
frontmatter. Storybook component pages use `<Meta>` tags or `role:component`
in CSF story files.

Explicit role tags cover `role:component`, `role:pattern`, `role:umbrella`,
`role:quality`, and `role:foundation` in frontmatter. `role:concept` and
`role:example` remain uncommitted.

Use [`docs/language/pattern-definition.md`](../language/pattern-definition.md)
as the operational test when assigning or changing a role. The extractor reports
coverage warnings; role assignment remains authored judgement, not validation.
