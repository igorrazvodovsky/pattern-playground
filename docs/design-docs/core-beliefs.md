# Core beliefs

This is a design research project first, code repository second. A "garden" for cultivating interaction design patterns, understanding their relationships, and exploring the intersection of component-based design systems and pattern libraries with AI/LLM interactions.

## What the project is

A *personal design repertoire* — a collection of interaction patterns, qualities, and concepts that shape how I approach design problems in work-support tools. The focus is on mapping relationships between patterns rather than cataloguing components in isolation. It sits somewhere between a design system and a thinking tool: structure enough to be navigable, loose enough to evolve.

## Commitments

- *Research-first.* The code is a playground for testing ideas, not a production deliverable. Decisions are often aesthetic or philosophical, not purely technical.
- *Relational over static.* Patterns are defined by what they *do in relation to others*, not by their structural properties in isolation. Cross-references, typed edges, and graph navigation are load-bearing, not decorative.
- *Multiple projections, no single tree.* Every classification tree is lossy — the underlying pattern space is a semilattice (Alexander, 1965). The project maintains multiple projections (activity theory for experiential altitude, atomic design for compositional complexity, intent lifecycle for goal resolution) and treats none as canonical. See `references/semilattice.md` for the full argument.
  - *Typological vs topological.* Bowker and Star's distinction: typological classification assigns to discrete bins; topological classification maps proximity and connectivity, where clusters emerge from structure rather than being imposed. The graph is a primary navigational surface, not a secondary annotation on the tree.
- *Human↔AI collaboration as a design domain.* Current focus: how patterns shift when one participant is an AI — assistance, delegation, agency, conversation, transparent reasoning, embedded intelligence.
- *Aesthetic and philosophical decisions sit with the human.* The agent's role is to support, not to resolve questions that are matters of judgement. When in doubt, ask.
- *Synthesis outputs* — `src/stories/` is the product. Storybook (MDX files) documents synthesised design patterns, organised by Activity Theory levels. See `docs/specs/storybook-taxonomy.md` for the current tree.

## Voice

Pattern descriptions frame from the *human situation inward*, not from the component implementation outward. The question is "what does this pattern do for the person?" before "how is it built?"

## References

- Alexander, C. (1965). *A City Is Not a Tree.* Architectural Forum.
- Bowker, G. C., & Star, S. L. (1999). *Sorting Things Out: Classification and Its Consequences.* MIT Press.
- Bødker, S. (1991). *Through the Interface: A Human Activity Approach to User Interface Design.* Lawrence Erlbaum.
- Nardi, B. (Ed.) (1996). *Context and Consciousness: Activity Theory and Human-Computer Interaction.* MIT Press.
- Kaptelinin, V. & Nardi, B. (2006). *Acting with Technology.* MIT Press.
