# Levels of scale

In this project's usage, *levels of scale* means that a software system is legible at several connected altitudes. You can understand it coarsely from afar and more precisely up close, with each lower level adding specificity without severing continuity with the level above.

The term comes from Christopher Alexander's account of living structure in *The Nature of Order*. In buildings, it refers to the presence of discernible large, medium, small, and tiny features that reinforce one another. In software, the medium is not geometric in the same way, so the property has to be translated. Here is one way of preserving the property in software.

## What the property means in software

Software has levels of scale when:

- the system has a visible gross anatomy
- intent can be traced downward into behaviour, structure, and code
- local details make more sense because a larger frame already exists
- lower-level artifacts can be read as elaborations or deltas on higher-level ones
- changes can often be made locally without forcing a rewrite of the whole

Software lacks levels of scale when:

- everything important seems to live at the same altitude
- code is the only authoritative description of the system
- decisions have to be re-litigated at implementation time because the coarser framing is absent
- the repository feels like an ocean of files rather than a set of distinguishable centres
- agents or humans are forced to infer purpose from local context alone

## Specificity gradient

A reasonable software gradient runs from slower-moving, less specific material to faster-moving, more specific material:

1. World / organizational framing
2. Human goals and motives
3. Tasks and activity structure
4. System behaviours and constraints
5. Architecture and component structure
6. Code, tests, and runtime details

Each layer should contextualise the next one down, so that implementation detail is not carrying the full burden of meaning by itself. The gradient is a way of keeping descriptions at different altitudes connected, so the system can evolve without losing its rationale.

## Project application

In this repository, levels of scale currently show up through a loose stack:

- [docs/core-beliefs.md](./core-beliefs.md) provides the coarsest framing: what kind of project this is, what it values, and what kind of design work it is for
- [docs/conceptual-glossary.md](./conceptual-glossary.md) defines the main conceptual vocabulary
- [docs/relationship-vocabulary.md](./relationship-vocabulary.md) describes how patterns combine as generative moves
- [docs/storybook-taxonomy.md](./storybook-taxonomy.md) gives the main projection for organising the pattern library
- [ARCHITECTURE.md](../ARCHITECTURE.md) describes domain layering and directory structure
- `src/stories/` and `src/components/` hold the synthesised patterns and the implementation substrate

This stack is incomplete, but it already points in the right direction: the project is trying to make the pattern space legible at multiple altitudes rather than collapsing everything into stories or code.

## Why this matters for human↔agent work

The connection to harness engineering is direct: repository-local artifacts are what the agent can actually see. If the higher and slower-moving layers are missing, stale, or disconnected, the agent is pushed into reasoning from the most specific layer available, which usually means code and local file context. That is a structural way of losing levels of scale.

An agent-friendly repository therefore needs more than documentation in the generic sense. It needs connected strata of description:

- coarse framing that states what matters
- intermediate documents that connect concepts to structure
- local implementation artifacts that can be read as specific consequences of that framing

In this sense, `AGENTS.md` is a map, not the scale hierarchy itself. The hierarchy lives in the documents the map points to.

## Authoring implications

When adding or revising material, preserve levels of scale by asking:

- At what altitude does this document or artifact live?
- What larger frame does it depend on?
- What more-specific artifacts should it connect to?
- If this changed, could the next layer down be updated as a delta rather than rediscovered from scratch?

Good signs:

- a story can be related back to a concept, quality, or motive
- an architectural rule can be explained in terms of a higher-level concern
- code changes can be justified by an already-legible pattern or behavioural constraint

Warning signs:

- new distinctions only appear in code
- a plan invents its own vocabulary instead of attaching to existing terms
- docs duplicate implementation detail without explaining why it exists
- multiple artifacts at different scales disagree, and nobody can tell which one is authoritative

## Sources

- Christopher Alexander, *The Nature of Order*
- Dorian Taylor, [The Specificity Gradient](https://doriantaylor.com/the-specificity-gradient)
- Dorian Taylor, [IAC 2023: The Specificity Gradient talk](https://www.youtube.com/watch?v=iiRdzSVKUeI)
