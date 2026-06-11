# Vision

Long-term orientation for the project as it moves from a documented pattern catalog toward a usable pattern language. It names the organizing direction and
includes a few concrete sketches to make that direction discussable. It is not an implementation plan or schema contract.

Compare this vision with [operative-image.md](./operative-image.md), which
describes the current working picture.

## Possible language layer

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

### Umbrella graph

`umbrella -> move`

Uses `surveys`. Umbrella pages such as "Bot" or "Assisted task completion"
should not be forced to behave like single moves if they gather a territory.

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

1. Is this page an authoritative source for one move, or an umbrella over a
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
