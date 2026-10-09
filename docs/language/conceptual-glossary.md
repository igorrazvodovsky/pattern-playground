# Conceptual glossary

Theoretical terms the project uses as working vocabulary. Each entry gives the term's meaning *in this project's usage*, its source, and where it shows up. Not a controlled vocabulary — add entries as new plans introduce new concepts.

## Activity / action / operation

Three levels of human activity (Leontiev, via Bødker 1991; Kaptelinin & Nardi 2006). *Activities* are motive-driven and sustained (e.g., onboarding a new user). *Actions* are goal-directed and conscious (e.g., choosing a filter). *Operations* are automatic and infrastructural (e.g., scrolling). The project currently (Jun '26) uses these as the primary organising axis for the pattern catalogue (`apps/patterns/src/content/patterns/`) — see [pattern-site.md](../specs/pattern-site.md).

## Centre

A coherent differentiation that can be noticed, pointed at, and acted on (Alexander, *The Nature of Order*). In this project, centres are *psychosemiotic* — meaning-carrying differentiations in behaviour and attention, identified by the distinction they introduce rather than by visual form. See [design-theory.md](./design-theory.md) §"Centres in this project's medium" for worked examples.

## Concept

A fundamental unit of software design defined by structure, behaviour, and purpose (Jackson, *The Essence of Software*). Concepts are functional building blocks that survive the journey from UX to engineering — more abstract than components, more concrete than principles. `concepts/` lists some of the concepts the project might need in future.

## Generative move

A pattern understood not as a catalogue item but as a transformation that produces centres while preserving existing structure (Alexander). Design happens through sequences of such moves, each acting on what already exists. The relationship vocabulary is written in this register — edges describe how patterns combine, not how options are picked. See [design-theory.md](./design-theory.md) for the two-phase trajectory (Pattern Language → Nature of Order).

## Generative sequence

An authored, named ordering of decision steps for one recurring stretch of design work, in the sense of *The Nature of Order* Book 2 ch. 11: fixed order, variable result, each step acting on what the previous steps produced. In this project a sequence is an authored projection over the graph — steps invoke patterns as rules — stored as its own content collection. The order is validated empirically: a sequence fails when a later step forces an earlier decision to be revoked. See [specs/sequences.md](../specs/sequences.md).

## Latent centre

A centre dimly present in a configuration — caused by the structure that exists but not yet developed (Alexander, Book 2 chs. 2, 9). Latent centres are what make a next step non-arbitrary: developing one both respects the existing structure and creates new structure. In sequence terms, an initiating situation states the latency a sub-sequence answers.

## Living process

Any adaptive process that generates living structure step by step through structure-preserving transformations (Alexander, Book 2 ch. 7). Its repeated unit is the fundamental differentiating process; Book 2 lists ten features every living process must have, of which this project imports sequence (4) and patterns-as-generic-rules (6) outright and treats step-by-step adaptation (1) and the-whole-governs (2) as ground assumptions. See [design-theory.md](./design-theory.md) §Living process.

## Pattern

A named, evidence-seeking interaction move that resolves a recurring human situation by balancing forces in a stated context, abstracting practice at a reusable level, producing a centre or affordance, carrying rationale and consequences, and linking to other patterns. In this project, a pattern is not simply a common UI object or a reusable component. It can begin as a seed, but mature pattern status requires examples, rationale, consequences, and relations. See [pattern-definition.md](./pattern-definition.md).

## Pattern language

Rules for how humans interact with form. A connected structure of patterns organised by an explicit principle so an actor can generate, sequence, and adapt design moves. A catalogue makes entries retrievable; a language makes their relationships operational. In this project, the typed graph is the primary claim that the material forms a language rather than only a library. See [patterns-and-components.md](./patterns-and-components.md) for its relationship to the component catalogue.

## Component catalogue

`packages/components/` — the vocabulary of components, primitives and controls, the rules for composing them, and the levels of scale (e.g. primitive → component → composition). By [pattern-definition.md](./pattern-definition.md)'s own distinction it is a catalogue rather than a language: retrievable, not generative. Its goal is to support the patterns, not to maximise reuse. Alexander has no term for an identical closed unit, because his theory argues against such units, but he does describe building elements; ch. 16 §2 lists "the elements, rules, ways of making roofs, edges, windows, steps." See [patterns-and-components.md](./patterns-and-components.md) §"Components are not reusable units".

## Component

A unit of the component catalogue — a component proper, a primitive, a control, or any other unit of built material. Component documentation is normative rather than generative. A component `enables` the patterns it makes possible. See [patterns-and-components.md](./patterns-and-components.md) and the decomposition rule in [pattern-role-model.md](../specs/pattern-role-model.md).

## Levels of scale

A structural property whereby a software system is legible at several connected altitudes, from coarse framing to fine implementation detail. In this project's usage, Dorian Taylor's *specificity gradient* is treated as a concrete software analogue: each lower level adds specificity without severing continuity with the level above. The absence of levels of scale shows up when intent is only recoverable from local code context. See [levels-of-scale.md](../levels-of-scale.md).

## Quality

An experiential dimension along which the effect of a design move can be read — Agency, Conversation, Privacy, Learnability, etc. Qualities are the project's evaluative vocabulary. The `enacts` edge type bridges the two: a pattern *enacts* a quality when its effect is legible in that dimension. See [`apps/patterns/src/content/patterns/qualities/`](../../apps/patterns/src/content/patterns/qualities/) and [design-theory.md](./design-theory.md) §"The role of qualities".

## Semilattice

A mathematical structure where elements participate in multiple overlapping sets simultaneously, unlike a tree where membership is exclusive (Alexander, "A City Is Not a Tree", 1965). The project's pattern space is a semilattice — every pattern belongs to multiple overlapping groupings. The sidebar tree is a useful entry point but not the truth; the graph is the primary navigational surface. See [`docs/language/semilattice.md`](semilattice.md).

## Structure-preserving transformation

A change that extends and intensifies the structure that exists rather than contradicting it (Alexander, Book 2 ch. 2) — conservative and innovative at once: nothing entirely new is injected, yet new structure appears by intensifying what is latent. Relatively few candidate next steps have this character, which is why a found ordering of them is worth keeping. The generative-move reading of patterns and the sequence step both rest on this concept.

## Suggestion-grade

An epistemic stance: the library's edge data, tags, and decision-tree conditions are *hints* that describe what has been useful in similar situations, not predicates to be matched against a query. An actor uses the graph as context for judgement, not as a lookup table. This is a claim about the data's maturity (incomplete, fuzzy) and about the nature of design (not structured retrieval). See [relationship-vocabulary.md](./relationship-vocabulary.md) §"Epistemic stance".

## Typological vs topological classification

Typological classification assigns items to discrete bins; topological classification maps proximity and connectivity, where clusters emerge from structure rather than being imposed (Bowker & Star, *Sorting Things Out*, 1999). The project favours topological. See [`docs/language/semilattice.md`](semilattice.md).
