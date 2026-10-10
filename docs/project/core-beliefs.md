# Core beliefs

This is a design research project first, code repository second. A "garden" for cultivating interaction design patterns, understanding their relationships, and exploring the intersection of component-based design systems and pattern libraries with AI/LLM interactions.

## What the project is

A *personal design repertoire* — a collection of interaction patterns, qualities, and concepts that shape how I approach design problems in work-support tools. The focus is on mapping relationships between patterns rather than cataloguing components in isolation. It sits somewhere between a design system and a thinking tool: structure enough to be navigable, loose enough to evolve.

## Commitments

- *Research-first.* The code is a playground for testing ideas, not a production deliverable. Decisions are often aesthetic or philosophical, not purely technical.
- *Relational over static.* Patterns are defined by what they *do in relation to others*, not by their structural properties in isolation. The project depends on cross-references, typed edges, and graph navigation to say what a pattern is. A pattern's two situations, where it continues from and where it leads on to, are the points where its connections meet, told as prose; the typed edges are the part of them the vocabulary can carry.
- *Multiple projections, no single tree.* Every classification tree is lossy — the underlying pattern space is a semilattice. The project maintains multiple projections (activity theory for experiential altitude, atomic design for compositional complexity, intent lifecycle for goal resolution) and treats none as canonical. See [`docs/language/semilattice.md`](../language/semilattice.md) for the full argument.
  - *Typological vs topological.* Bowker and Star's distinction: typological classification assigns to discrete bins; topological classification maps proximity and connectivity, where clusters emerge from structure rather than being imposed. The graph is a primary navigational surface, not a secondary annotation on the tree.
- *Patterns are for whoever is making.* A pattern is written to the maker, and the maker is not always a designer working ahead of use. It may be the actor reshaping an interface while using it, or an agent composing one on the actor's behalf. One addressee, one voice: a page does not keep a designer's version of its claims apart from an actor's version. Making and using are not treated as two times with two vocabularies; where an ordering claim is needed (a sequence, a `precedes` edge) the test is dependency — does this act on what that produced? — not who acts or when.
- *Human↔AI collaboration as a design domain.* Current focus: how patterns shift when one participant is an AI — assistance, delegation, agency, conversation, transparent reasoning, embedded intelligence. The coverage is moving toward an intent-based interaction paradigm.
- *Aesthetic and philosophical decisions sit with the human.* The agent's role is to support, not to resolve questions that are matters of judgement. When in doubt, ask.
- *Synthesis outputs* — the pattern content in `apps/patterns/src/content/patterns/` is the product, rendered by the Astro pattern site. Storybook (`packages/components/src/stories/`) documents the component substrate. See [pattern-site.md](../specs/pattern-site.md) for the current tree.

## Voice

Pattern descriptions frame from the *human situation inward*, not from the component implementation outward. The question is "what does this pattern do for the person?" before "how is it built?"
