# Pattern language direction

Long-term orientation for the project as it moves from a documented pattern
catalog toward a usable pattern language. This is not an implementation plan or
schema contract.

## Why this exists

The project currently uses `src/stories/` as both documentation surface and
source of truth for the pattern graph. That has worked well enough for a garden,
but it creates a semantic pressure. The long-term direction is to separate three concerns:

- what exists in the pattern language
- how it is rendered or demonstrated
- how it is projected for navigation and sensemaking

## Current pin

The near-term distinction to preserve is:

- A `component` is a reusable implementation or UI part. Its center of gravity
  is API, rendering, slots, props, states, styling, and examples.
- A `pattern` is a reusable interaction move. Its center of gravity is a
  recurring human situation, forces, invariant behavior, consequences, and
  relations to other moves.

Do not treat `atomic:*` as the answer to "is this a pattern?" The `atomic:*`
tag is a compositional projection: primitive, component, composition, pattern.
It says what something is made like, not whether it is a generative move.

The missing axis is role. A possible future role vocabulary is:

- `move`: a true pattern, understood as a generative interaction move
- `mechanism`: component, primitive, control, visual element, or implementation
  substrate
- `contract`: a complete behavior, semantics, and accessibility agreement,
  often attached to controls
- `quality`: an experiential dimension such as Agency or Learnability
- `foundation`: theory, model, principle, or material substrate
- `concept`: a Jackson-style software concept
- `projection`: an umbrella or sensemaking page that gathers a territory but is
  not the authoritative source for one move
- `example`: a concrete instantiation, story variant, screenshot, prototype, or
  product case

This is not yet a required metadata schema. Treat it as the
direction of travel when classifying or refactoring pattern material.

## Definition source

Use [pattern-definition.md](./pattern-definition.md) as the operational test for
what counts as a pattern. This document assumes that definition and focuses on
the repository shape needed to support it: role distinctions, graph semantics,
Storybook's future position, and a possible deeper language layer.

## The shift

The durable distinction is not:

```text
component vs pattern
```

It is:

```text
mechanism vs move vs projection
```

A component can implement a mechanism.

A mechanism can enable a move.

A control can become a move when it carries a complete interaction contract.

A Storybook page can be a projection over many moves.

This keeps the project compatible with its semilattice commitment: no single
tree is the truth, and no single documentation surface should have to carry all
ontological distinctions.

## Storybook's future role

Long term, `src/stories/` should become one projection of a deeper language
layer, not the ontology itself.

Current state:

```text
src/stories/*.mdx -> extracted graph nodes and edges
```

Long-term direction:

```text
language objects -> graph data
language objects -> Storybook pages
language objects -> decision support / agent context
```

Storybook remains important because it makes the material explorable and
demonstrable. It should not be forced to answer every ontology question. Some
pages will be authored as pattern sources; some will be projections; some will
be implementation examples.

## Possible language layer

A future repository shape might look like:

```text
src/language/
  moves/
  mechanisms/
  qualities/
  foundations/
  concepts/
  projections/
  examples/
  graph/
```

It is a long-term shape to keep in mind when new tooling, schemas, or extraction
scripts start straining against MDX as the only source of truth.

### Generative graph

`move -> move`

Uses relationships such as `precedes`, `recommends`, `alternative`, and
`complements`. This is the actual pattern-language layer: it describes how moves
unfold, combine, or substitute for one another.

### Quality graph

`move -> quality`

Uses `enacts`. This records which experiential dimensions a move makes legible.
Quality-to-quality tension may eventually need its own relationship, but only
after concrete examples justify it.

### Implementation graph

`mechanism -> move`

Uses `enables`. This records which primitives, components, controls, or
mechanisms make a move possible. It should not be confused with taxonomy.

### Taxonomic graph

`move -> foundation` or `move -> concept`

Uses `instantiates`. This records when a move is a concrete application of a
more abstract principle, model, or concept.

### Projection graph

`projection -> move`

This relationship is not formalized yet. Possible names include `collects`,
`frames`, or `surveys`. The important point is that projection pages such as an
umbrella "Bot" or "Assisted task completion" page should not be forced to behave
like single moves if they actually gather a territory.

## Mature move record

A mature `move` record might eventually include:

```ts
interface PatternMove {
  id: string;
  name: string;
  situation: string;
  problem: string;
  forces: string[];
  move: string;
  produces: string;
  consequences: string[];
  interactionContract?: string;
  enacts: string[];
  precedes?: string[];
  follows?: string[];
  alternatives?: string[];
  enabledBy?: string[];
  examples?: string[];
  evidence?: string[];
  status: 'seed' | 'observed' | 'settled' | 'deprecated';
}
```

The important fields are `situation`, `problem`, `forces`, `move`, `produces`,
`consequences`, `evidence`, and relationship fields. Those are what make the
object generative rather than catalog-like. The `status` field is the confidence
signal: a seed can be useful, but it should not masquerade as a settled invariant.

## Guidance

When adding or revising material, ask these questions before choosing tags,
edges, or file locations:

1. Is this page an authoritative source for one move, or a projection over a
   territory?
2. Does the thing act on a recurring human situation, or is it mainly an
   implementation mechanism?
3. If it is a control, does the page document a complete interaction contract,
   or only visual/API variants?
4. Which relationship is being asserted: generative sequence, implementation
   enablement, taxonomic instantiation, quality enactment, or editorial
   proximity?
5. Would this distinction be legible to a future agent from repository-local
   artifacts, or is it still living only in prose and assumptions?

Prefer making role and relationship distinctions explicit in docs or source
metadata over relying on path names. Path names are projections. They are useful,
but they are not the ontology.

## Research grounding

The operational definition in
[pattern-definition.md](./pattern-definition.md) is grounded in
[`references/hci-pattern-languages.md`](../../references/hci-pattern-languages.md).
This direction document applies that research grounding to repository structure,
graph roles, and future harness-facing language objects.

## Non-goals

Do not mechanically retrofit the whole library just because this document
exists. The direction is useful only if it clarifies real pressure points.

Do not add new edge types speculatively. Add them when repeated authored
material shows that the current vocabulary is flattening a meaningful
distinction.

Do not demote component documentation. Components, primitives, and controls are
part of the language substrate. The goal is to stop pretending they are all the
same kind of pattern, not to remove them from the graph.

Do not turn the pattern language into a strict rules engine. Existing graph data
is suggestion-grade. The long-term system should help an actor reason, not
replace judgement.

## Open questions

- Should `role:*` become Storybook metadata, language-layer metadata, or both?
- Should contract-bearing controls be modeled as `move`, `contract`, or
  `mechanism` plus `contract`?
- What is the right relationship name for projection pages: `collects`,
  `frames`, `surveys`, or something else?
- When does a repeated Storybook composition become a move rather than an
  example of a move?
- How much of the mature move record belongs in structured data versus MDX
  prose?
