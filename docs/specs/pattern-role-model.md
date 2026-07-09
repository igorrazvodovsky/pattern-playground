# Pattern role model specification

The current role distinction is conceptual and encoded in content frontmatter
and graph metadata. The two-language framing behind it is
[docs/language/pattern-and-form.md](../language/pattern-and-form.md).

## Settled distinctions

- A `component` is a form-language mechanism: API, rendering, slots, props,
  states, styling, examples, and accessibility contract.
- A `pattern` is a generative interaction move: a recurring human situation,
  forces, invariant behaviour, consequences, and relations to other moves. A composite move (e.g. Form) and a
  general move with variants (e.g. Assisted task completion) are also patterns, not surveys. Scale is carried by `activityLevel` or similar and by edges, never by the role.
- A `collection` is a labelled grouping of related entries for orientation and
  navigation — a survey, not the authoritative source for any move. Following
  SKOS `Collection` semantics, a collection groups members (the `surveys` edge,
  ≈ `skos:member`) but sits *outside* the part-whole/taxonomic hierarchy: it is
  never the broader or narrower term of a move.
- A `quality` is an experiential lens such as Agency, Learnability, or
  Temporality. Qualities are bilingual: language entry in the pattern site,
  implementation substrate in the components package.
- A `foundation` is theory, model, principle, or material substrate. Foundations
  are bilingual in the same way as qualities.
- A `concept` is a software concept vocabulary entry.

`atomic:*` tags are compositional metadata. They do not decide whether a page
is a pattern source, a component source, or a collection.

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
  contains*: one move, several related moves, a composite move plus its
  constituents, a collection plus moves, or no new node — only edges to moves
  that already exist. One move plus one mechanism is
  the common outcome, not the definition; a component is where several moves
  coincide, not the unit of pattern-hood.
- Default to the coarsest node that doesn't lie: author one well-situated move
  and keep suspected sibling moves as named forces or sections within it until
  they earn nodes of their own (see fission signals below).
- Expect to author the move content fresh, from the situation inward. Control
  pages rarely contain the move prose the rule implies.

### Decomposition signals

What the normal classification process lacks when an entry straddles the
move/mechanism seam. Signals are named, not numbered, so the list can grow. See  worked narratives in the decomposition section of
[plans/completed/2026-05-workspace-split.md](../../plans/completed/2026-05-workspace-split.md).

- *The residue test.* Before assuming a mixed page hides a move, attribute
  every chunk of the page to an existing neighbour node. Residue has three
  possible homes: the page's own generative core (Combobox → Bounded choice);
  nothing — the page is a collection regardless of length; or a move at a
  different node entirely, a sibling the page merely instances (Form's
  conversational chunk → Inline interface). A walk that eagerly matches every
  chunk to a neighbour misses the third case; when a chunk only loosely fits
  its assigned neighbour, re-run the attribution. Discriminate residue by
  breadth: craft or substrate serving one container is a *gap* — document it
  at the altitude that already works and promote it only on concrete need;
  residue with its own forces and instances beyond the page that surfaced it
  is a *move* — author it. A page with no residue demotes whole to the form
  language (Dual listbox, Morphing controls).
- *Seam naming.* Test whether the name transfers to any valid realisation of
  the move. A widget name renames to the move (Combobox → Bounded choice); a
  word that names both the human act and the artifact (Form) stays the same
  on both surfaces, bilingual like qualities and foundations. Head-noun
  constraints under Naming below.

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

Explicit role tags cover `role:component`, `role:pattern`, `role:collection`,
`role:quality`, and `role:foundation` in frontmatter (`role:umbrella` is a
deprecated alias of `role:collection`, still accepted by the extractor).
`role:concept` and `role:example` remain uncommitted.

Use [`docs/language/pattern-definition.md`](../language/pattern-definition.md)
as the operational test when assigning or changing a role. The extractor reports
coverage warnings; role assignment remains authored judgement, not validation.
