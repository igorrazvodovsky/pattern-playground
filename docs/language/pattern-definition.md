# Pattern definition

What counts as a pattern in this project. Use this when deciding whether material should be treated as a pattern, an implementation component, an activity observation, an anti-pattern, or a collection over a larger territory.

The definition is a test for authoring judgement. The fields that encode its parts (`situation`, `relationships`, `seed`, `evidence`, `disclosure`) are in [docs/specs/pattern-site.md](../specs/pattern-site.md) §Content collection schema.

## Definition

A pattern is a rule for making a kind of centre, and it states that centre's relation to other centres: the situation it continues from and the situation it leads to.

In this medium a centre is a meaning-carrying distinction in the field of
behaviour and attention, not a visual region; a centre can live in text, in
time, or in the state of an exchange
([design-theory.md](./design-theory.md) §Centres in this project's medium).
The rule is written once and makes a new instance each time it is applied,
never the same one twice. The initiating situation says what already exists;
the problem that follows it names the centre that is missing or weak there,
and the body says why that centre matters and what it costs.

A distinction bound to one control, such as its hover or focus state, is part
of that control's contract and stays in the catalogue. It is a pattern when
the same distinction recurs whichever control carries it.

Provenance marking, worked through: the distinction is between what a person
wrote and what the system generated, inside one piece of text. Before the
pattern, machine-made and human-made content move through the same documents
and conversations, and readers calibrate trust by an origin they can no
longer see; nothing in the text shows the difference. After it, origin is
legible at the point of reading, and the next thing to design is whether the
mark survives copying, export and screenshot. Each application looks
different: a label, a badge, embedded metadata, a colour in a diff. The
pattern is the rule that the difference be shown, not any one way of showing
it.

To test a borderline candidate: name the distinction it introduces; name what
is absent before and present after; check that a second instance would be made
for its own place rather than configured from the first.

## Three tests

*Generative.* Can it make an instance the author has not seen? A pattern is a
rule, and each instance is made for its place. A component is a delivered
thing, and every instance is a configuration of it. A complete interaction
contract (semantics, keyboard behaviour, focus model, state behaviour, use
context) is pattern-grade content because it is a rule, and it usually
compresses several patterns. Those patterns enter the language under their own
names, each named by what the actor is doing; the control itself stays in the
component catalogue, so a well-specified combobox is not a pattern, but the
moves its contract bundles may be. How mixed pages are taken apart is
in [docs/specs/pattern-role-model.md](../specs/pattern-role-model.md); the
two-language framing is in
[patterns-and-components.md](./patterns-and-components.md).

*Connective.* Does it have an initiating situation and a resulting situation?
The initiating situation names the larger things the pattern helps complete
and the state it acts on; the resulting situation names the smaller and later
patterns that complete it and the look-alikes it is not; the initiating
situation may name at most one alternative. An entry with neither situation is
a library item, whatever the quality of its body. Typed edges carry the part
of each situation the vocabulary can hold; the prose carries the rest
([relationship-vocabulary.md](./relationship-vocabulary.md) §Situations).

*Falsifiable.* Does it say how sure the author is, and what would count
against it? Two questions are open on every pattern: does the situation occur
as described, and does the rule produce the centre. Three fields carry the
answer, each a different part of it
([pattern-site.md](../specs/pattern-site.md) §Epistemic status): `seed` says
whether the page is a claim at all or a thought being held; `evidence` says
what kinds of backing exist (observed, literature, used; `built` is derived
from `realised_by`, never authored), not how much; `disclosure` is the prose
that says how sure the author is, why, and what would raise it. A seed names a
suspected recurrence. A page without `seed` is read as a claim, and should
have the instances, rationale, consequences and situations to back one. No
rung between the two is declared. Both belong in the library as long as the
difference is visible.

## Pattern, observation, and anti-pattern

HCI literature distinguishes useful neighbouring forms:

- An `activity pattern` describes a recurring behaviour or situation without yet
  recommending it. It is research material.
- A `design pattern` recommends a move that has worked across situations and
  says what it costs. It is guidance.
- An `anti-pattern` names a recurring harmful practice.

The project can use all three, but they should not be collapsed. Only a design
pattern gets a node with generative edges; an activity pattern is held in the
research vault or as a seed page until it recommends something.
An anti-pattern is an annotation on the patterns it warns against, not a node
with generative edges of its own: a collection of anti-patterns lacks the
connective structure that lets one pattern set up the next.

A collection surveys the patterns over a territory and is not itself a move;
what it may and may not carry is in
[docs/specs/pattern-role-model.md](../specs/pattern-role-model.md).

## Pattern language versus catalogue

A catalogue is a retrievable set of entries. A language is a connected
structure that helps an actor generate the next move. A Storybook tree, tag
list, or gallery makes a catalogue navigable without making it a language;
the language is carried by the situations, the typed edges, and the sequences:

- larger situations that set context for smaller patterns (the situations)
- the order in which moves act on each other's products (`precedes`, and the
  sequences collection), kept separate from the larger/smaller relation
- alternatives that expose tradeoffs rather than synonyms
- quality edges that state which experiential dimensions the pattern makes
  legible

The graph is therefore the repository's main claim that the entries form a
language, and the tree is one way in.

The component catalogue is the other half. Patterns supply what a place needs
and why; the catalogue and the foundations supply the forms a maker builds
with ([design-theory.md](./design-theory.md) §Living process). Components
enable patterns without being identical to them, and a pattern's `realised_by`
names which ones.
