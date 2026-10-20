# Patterns and concepts

Beside the pattern language and the component catalogue
([patterns-and-components.md](patterns-and-components.md)) the project keeps a
third collection, the *concept catalogue*: one entry per unit of functionality
an actor recognises across systems. Commenting, notifying, staging an item
through its states. The term and the shape are Daniel Jackson's: a concept has a
purpose, an operational principle (the archetypal scenario that shows it
working), state, and the actions that change the state.

## What a concept is, against the other two

- A concept is *normative*, like a component: an actor brings an understanding
  of commenting from every other system that has it, and that familiarity is
  the value. An entry succeeds when an actor recognises it.
- A concept carries *no rendering*, unlike a component. It says what the system
  does and what the actor's acts mean, not how anything is drawn or operated.
- A concept is *not a move*, unlike a pattern. It is what a move is on.
  *Commenting* the pattern is a set of moves (anchor the thread, resolve rather
  than delete); *Commenting* the concept is the thing those moves shape. Where
  a pattern and a concept share a name, that is the relation between them.

A concept's *misfits*, the known scenarios in which it fails its purpose, are
where the catalogue meets the language: a pattern's forces line up with a
concept's misfits far more closely than with its principle, so a pattern that
names a concept is usually a move on one of its misfits.

## Where it lives

`apps/patterns/src/content/concepts/`, a third Astro content collection
beside `patterns/` and `sequences/`, rendered at `/concepts/<id>` with an index
at `/concepts`. The filename stem is the id. Entries are not graph nodes and
never enter the pattern graph.

On the site the catalogue is its own corner, "concept playground", with its
own sidebar: the concepts listed, and the other two corners (patterns,
components) in the footer, the way the pattern corner's footer points at
concepts and components. A concept page still hosts the stack, so a pattern
that acts on it opens beside it.

Frontmatter carries the definition; the body carries the variants that matter
to design. Fields: `purpose` (one sentence), `principle` (prose), `state`
(relations in the world's notation, `name: Kind -> one | opt | set Kind`),
`actions` (names), `misfits`, `aliases`, `depends_on` (concept ids), and
`appears_in` (shipping systems, by name). The schema is in
`apps/patterns/src/content.config.ts`.

Synchronisations are not entries. Concepts are reusable; their composition is
specific to a system and lives with that system. Here `shared/world/rules.json`
is the fixture world's synchronisation set.

## How the three reach each other

- *Pattern → concept*: frontmatter `acts_on` on a pattern page, a list of
  concept ids, with an optional note where the move is on one action or one
  arm of the concept rather than the whole:

  ```yaml
  acts_on:
    - commenting
    - { concept: notifying, note: "delivery and urgency" }
  ```

  This is a cross-dataset reference in exactly the sense of `realised_by`
  ([relationship-vocabulary.md](relationship-vocabulary.md) §Component
  realisation): never an edge, never a concept id in `relationships:`. The
  build-time validator resolves every id against the collection and fails on a
  dangling one; the pattern graph does not carry it; the page
  renders it beside the epistemic status. A concept page lists the patterns
  that act on it from the inverse. Most patterns name no concept, and that is
  the expected shape.
- *Concept → component*: no direct reference. The path runs through patterns,
  `acts_on` one side and `realised_by` the other.
- *Concept → world*: an entry in `shared/world/action-types.json` names its
  concept in a `concept` field, so the fixture world's workspace vocabulary is
  partitioned by the catalogue ([world-ontology.md](../specs/world-ontology.md)
  §Action types). The validator checks the partition both ways: every
  `concept` names an entry, and every world action an entry lists is assigned
  to it. An entry's action the world lacks is the entry's own. A concept page
  marks the actions the world instantiates.

  The catalogue holds generic concepts only: ones an actor meets across
  systems. An action that belongs to the fixture's own domain (its
  circular-economy catalogue, its ledger, its lifecycle assessment) carries no
  `concept`; it is the demos' material, not something the language has a view
  on. The test is `appears_in`: an entry that could name no shipping system
  outside the demos does not belong.

## Naming

Gerunds where the gerund reads naturally (Commenting, Notifying, Staging),
the plain noun phrase where it does not (Running a project, Task tracking, Document keeping). Noun forms that
sound like stored objects (Comment, Task) are avoided: an entry names an
activity the system supports, not a thing it stores. On a stem shared with a
pattern, both keep the bare slug; the route namespace keeps them apart, and
the index says which is which.
