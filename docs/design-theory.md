# Design theory

## Two phases of Alexander

The project's theoretical orientation draws on two phases of Christopher Alexander's work, which represent different stages of what the library aspires to become.

*Pattern Language — current.* Alexander's *A Pattern Language* is a navigational vocabulary: a structured set of moves with typed relationships between them. Patterns are not catalogue items but operations an actor can apply; the relationships describe how moves combine in practice. Design proceeds through sequences of decisions, each acting on what already exists. An actor uses the vocabulary to reason about sequences of design decisions, with the data functioning as suggestion-grade hints rather than rules. This is where the library currently lives: the typed edge schema and the graph it produces are Pattern Language infrastructure.

*Nature of Order — aspirational.* Alexander's later work introduces structural *properties* — strong centres, levels of scale, thick boundaries, alternating repetition, gradients, and ten others — that function as recursive production rules. Each property is both a characteristic of living structure and a transformation that creates it: to strengthen a centre, create a boundary; a boundary is itself a centre; to strengthen a boundary, establish a gradient leading to it. This gives design a genuine grammar. The library aspires toward this register.

Getting from Pattern Language to Nature of Order means discovering interaction-design analogues of Alexander's structural properties — configurations that reliably produce certain experiential effects across diverse users and contexts.

## Centres in this project's medium

In architecture, centres are geometric — a window, a courtyard, an alcove. In interaction design, centres are *psychosemiotic*: meaning-carrying differentiations in the field of behaviour and attention. A confirmation dialog is a centre not because of its visual rectangle but because it differentiates deliberate action from accidental. A wizard is a centre because it differentiates "inside a guided sequence" from "open space." Centres in this medium are identified by the distinction they introduce, regardless of modality (visual, temporal, conversational).

## The role of qualities

The project's qualities — Agency, Conversation, Malleability, Temporality, etc. — are not structural properties in the Nature of Order sense. Alexander's properties have a dual noun-verb character: they describe structural characteristics of living structure AND serve as the transformations that create it. The library's qualities are noun-only: experiential dimensions along which the effect of a move can be read, not recursive production rules.

Qualities are scaffolding for the later discovery. The `enacts` edges that connect patterns to qualities track which moves have legible effect in which dimensions. Over a large enough corpus, if certain structural configurations consistently correlate with certain quality effects, those configurations become candidates for properties — structural rules that could eventually replace the current hint-grade associations.

## Further reading

- `docs/levels-of-scale.md` — the first worked translation of a Nature of Order property to software
- `docs/relationship-vocabulary.md` — the Pattern Language layer: edge types and their generative interpretation
- `docs/conceptual-glossary.md` — definitions of Centre, Generative Move, Quality, and related terms
