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

`role:*` metadata is not yet required across the corpus. The active role work
lives in [`plans/active/2026-05-role-metadata.md`](../../plans/active/2026-05-role-metadata.md)
and [`plans/active/2026-04-umbrella-role.md`](../../plans/active/2026-04-umbrella-role.md).
Until that work lands, use
[`docs/language/pattern-definition.md`](../language/pattern-definition.md) as
the operational test for whether something is a pattern.
