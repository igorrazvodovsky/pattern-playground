# Conceptual glossary

Theoretical terms the project uses as working vocabulary. Each entry gives the term's meaning *in this project's usage*, its source, and where it shows up. Not a controlled vocabulary — add entries as new plans introduce new concepts.

## Activity / action / operation

Three levels of human activity (Leontiev, via Bødker 1991; Kaptelinin & Nardi 2006). *Activities* are motive-driven and sustained (e.g., onboarding a new user). *Actions* are goal-directed and conscious (e.g., choosing a filter). *Operations* are automatic and infrastructural (e.g., scrolling). The project uses these as the primary organising axis for `src/stories/` — see [storybook-taxonomy.md](../project/storybook-taxonomy.md).

## Centre

A coherent differentiation that can be noticed, pointed at, and acted on (Alexander, *The Nature of Order*). In this project, centres are *psychosemiotic* — meaning-carrying differentiations in behaviour and attention, identified by the distinction they introduce rather than by visual form. See [design-theory.md](./design-theory.md) §"Centres in this project's medium" for worked examples.

## Concept

A fundamental unit of software design defined by structure, behaviour, and purpose (Jackson, *The Essence of Software*). Concepts are functional building blocks that survive the journey from UX to engineering — more abstract than components, more concrete than principles. The project's `src/stories/concepts/` directory houses concept-level patterns. See [`references/Concept design.md`](../../references/Concept%20design.md).

## Generative move

A pattern understood not as a catalogue item but as a transformation that produces centres while preserving existing structure (Alexander). Design happens through sequences of such moves, each acting on what already exists. The relationship vocabulary is written in this register — edges describe how moves combine, not how options are picked. See [design-theory.md](./design-theory.md) for the two-phase trajectory (Pattern Language → Nature of Order).

## Pattern

A named, evidence-seeking interaction move that resolves a recurring human situation by balancing forces in a stated context, abstracting practice at a reusable level, producing a centre or affordance, carrying rationale and consequences, and linking to other moves. In this project, a pattern is not simply a common UI object or a reusable component. It can begin as a seed, but mature pattern status requires examples, rationale, consequences, and relations. See [pattern-definition.md](./pattern-definition.md) and [`references/hci-pattern-languages.md`](../../references/hci-pattern-languages.md).

## Pattern language

A connected structure of patterns organised by an explicit principle so an actor can generate, sequence, and adapt design moves. A catalogue makes entries retrievable; a language makes their relationships operational. In this project, the typed graph is the primary claim that the material forms a language rather than only a library.

## Levels of scale

A structural property whereby a software system is legible at several connected altitudes, from coarse framing to fine implementation detail. In this project's usage, Dorian Taylor's *specificity gradient* is treated as a concrete software analogue: each lower level adds specificity without severing continuity with the level above. The absence of levels of scale shows up when intent is only recoverable from local code context. See [levels-of-scale.md](./levels-of-scale.md).

## Quality

An experiential dimension along which the effect of a design move can be read — Agency, Conversation, Privacy, Learnability, etc. Qualities are the project's evaluative vocabulary. The `enacts` edge type bridges the two: a pattern *enacts* a quality when its effect is legible in that dimension. See [`src/stories/qualities/`](../../src/stories/qualities/) and [design-theory.md](./design-theory.md) §"The role of qualities".

## Semilattice

A mathematical structure where elements participate in multiple overlapping sets simultaneously, unlike a tree where membership is exclusive (Alexander, "A City Is Not a Tree", 1965). The project's pattern space is a semilattice — every pattern belongs to multiple overlapping groupings. The sidebar tree is a useful entry point but not the truth; the graph is the primary navigational surface. See [`references/semilattice.md`](../../references/semilattice.md).

## Suggestion-grade

An epistemic stance: the library's edge data, tags, and decision-tree conditions are *hints* that describe what has been useful in similar situations, not predicates to be matched against a query. An actor uses the graph as context for judgement, not as a lookup table. This is a claim about the data's maturity (incomplete, fuzzy) and about the nature of design (not structured retrieval). See [relationship-vocabulary.md](./relationship-vocabulary.md) §"Epistemic stance".

## Typological vs topological classification

Typological classification assigns items to discrete bins; topological classification maps proximity and connectivity, where clusters emerge from structure rather than being imposed (Bowker & Star, *Sorting Things Out*, 1999). The project favours topological. See [`references/semilattice.md`](../../references/semilattice.md).
