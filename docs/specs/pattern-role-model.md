# Pattern role model specification

The current role distinction is conceptual and partially encoded. Storybook
pages are not all the same kind of thing, even when they live in the same
projection tree.

## Current settled distinctions

- A `component` is a reusable implementation mechanism: API, rendering, slots,
  props, states, styling, examples, and accessibility contract.
- A `pattern` is a generative interaction move: a recurring human situation,
  forces, invariant behavior, consequences, and relations to other moves.
- An `umbrella` is an authored survey over a territory of related moves, not the
  authoritative source for one move.
- A `quality` is an experiential lens such as Agency, Learnability, or
  Temporality.
- A `foundation` is theory, model, principle, or material substrate.
- A `concept` is a software concept vocabulary entry.

`atomic:*` tags are compositional metadata. They do not decide whether a page
is a pattern source, a component source, or an umbrella.

## Current implementation status

`role:*` metadata is emitted into `src/pattern-graph.json` for every current
graph node. MDX pages own their role tags through Storybook `Meta` tags. CSF
story files own role tags only when they have no co-located MDX page or when an
MDX page already uses CSF metadata as its fallback source.

Explicit role tags currently cover `role:component`, `role:pattern`, and
`role:umbrella`. `role:quality` and `role:foundation` are inferred from
`src/stories/qualities/` and `src/stories/foundations/`. `role:concept` and
`role:example` remain uncommitted.

Use [`docs/language/pattern-definition.md`](../language/pattern-definition.md)
as the operational test when changing a page's role. The extractor reports
coverage and warnings, but role assignment remains authored judgement rather
than validation.
