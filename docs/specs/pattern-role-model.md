# Pattern role model specification

The current role distinction is conceptual and encoded in content frontmatter
and graph metadata. The two-language framing behind it is
[docs/language/pattern-and-form.md](../language/pattern-and-form.md).

## Settled distinctions

- A `component` is a form-language mechanism: API, rendering, slots, props,
  states, styling, examples, and accessibility contract.
- A `pattern` is a generative interaction move: a recurring human situation,
  forces, invariant behaviour, consequences, and relations to other moves.
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

## Boundary stance

The move/mechanism boundary is a naming and default-rendering decision, not an
ontological claim:

- Mechanisms remain graph nodes.
- `enables` is the bridge between the languages: a mechanism *enables* the
  moves it makes possible.
- A mechanism whose interaction contract carries genuine force-resolution may
  earn a language entry, bilingual like qualities and foundations.
  `role: component` is valid in the content schema for exactly this case.

## Decomposition rule

When a page mixes move-level content (situation, forces, consequences,
relations) with mechanism-level content (props, states, anatomy, keyboard,
accessibility), it decomposes:

- The mechanism content keeps the component's existing name in the form
  language (Storybook).
- The move content enters the pattern language *as whatever its territory
  contains*: one move, several related moves, an umbrella plus moves, or no new
  node — only edges to moves that already exist. One move plus one mechanism is
  the common outcome, not the definition; a component is where several moves
  coincide, not the unit of pattern-hood.
- Default to the coarsest node that doesn't lie: author one well-situated move
  and keep suspected sibling moves as named forces or sections within it until
  they earn nodes of their own (see fission signals below).
- Expect to author the move content fresh, from the situation inward. Control
  pages rarely contain the move prose the rule implies.

### Naming

- Name a move by what the actor is doing, not by the component that implements
  it: "Transient feedback", not "Toast". The name must transfer to any valid
  implementation of the move.
- Avoid head-noun collisions with existing entries: a new move must not share
  its head noun with an unrelated entry (a value-commitment move cannot be
  called "… selection" while *Selection* names staking items in a collection).

### Fission signals

A deliberately coarse move node self-corrects when these are watched for.
Differentiate an existing move into siblings when:

- its Related-patterns section grows subsections with disjoint neighbourhoods
- a decision tree appears *inside* the pattern — a tree is a territory routing
  between its own children
- its profile fields disagree — `operatesOn` describes one situation,
  `produces` a centre from a different one
- its prose accumulates "in some variants…" clauses

These are findings to take through the normal classification process
(`pattern-classifier`), not failures.

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
