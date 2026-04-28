# Pattern definition

Operational definition for what counts as a pattern in this project. Use this
when deciding whether material should be treated as a generative interaction
move, an implementation mechanism, an activity observation, an anti-pattern, or
a projection over a larger territory.

This is not yet a metadata schema. It is a test for authoring judgement.

## Working definition of pattern

A pattern is a named, evidence-seeking interaction move that resolves a
recurring human situation by balancing forces in a stated context, abstracting
practice at a reusable level, producing a centre or affordance, carrying
rationale and consequences, and linking to other moves so a designer can
continue the sequence.

On this definition, most components are not patterns. A control can still
qualify as a pattern when its documentation captures a complete interaction
contract, not only a visual part. WAI-ARIA Authoring Practices is the useful
reference point here: controls such as comboboxes and tabs are treated as
patterns because the pattern includes semantics, keyboard behavior, focus model,
state behavior, and use context.

The definition deliberately says *evidence-seeking*, not evidence-proven. The
library contains seeds and hypotheses. That is fine as long as the maturity is
legible. A seed names a suspected recurrence; a mature pattern has examples,
rationale, consequences, and relationships that survive use.

Maturity should eventually be visible as more than editorial confidence. HCI
pattern-development literature suggests checking whether a pattern is findable,
effective, feasible, reliable, and plausible, and whether its confidence is
backed by repeated observations, specialist review, workshops, field use, or
prototype construction. A candidate pattern can still be valuable, but it should
not present itself with the same authority as a repeatedly validated one.

## Minimum pattern test

Before treating a thing as a pattern, ask whether the page can answer most of
these questions:

1. What recurring human situation does it act on?
2. What problem, tension, or instability makes the move necessary?
3. What forces does it balance?
4. What is the invariant core of the move across examples?
5. Is it abstracted at a level practitioners can recognise and reuse?
6. What centre, affordance, or behavioural distinction does it produce?
7. What evidence, examples, observations, or literature support it?
8. Which actor, expertise, task, device, environment, or domain variables affect
   whether it fits?
9. What consequences and value commitments does it carry?
10. What other moves set it up, complete it, enable it, or compete with it?

If the answer is mostly "it renders a UI thing", it is probably a mechanism. If
the answer is mostly "people often do this", it may be an activity pattern or
research observation. If the answer includes situation, forces, rationale,
evidence, and relations, it is closer to a design pattern.

## Pattern, observation, and anti-pattern

HCI literature distinguishes useful neighbouring forms:

- An `activity pattern` describes a recurring behaviour or situation without yet
  recommending it. It is research material.
- A `design pattern` recommends a value-bearing move that has worked across
  situations. It is guidance.
- An `anti-pattern` names recurring harmful practice and the repair that moves
  away from it.

The project can use all three, but they should not be collapsed. The graph
should only treat something as a generative move when it carries the
design-pattern burden: context, forces, rationale, consequences, and relations.

## Pattern language versus catalogue

A catalogue is a retrievable set of entries. A language is a connected structure
that helps an actor generate the next move.

The difference matters here because a Storybook tree, tag list, or gallery can
make a catalogue navigable without making it a pattern language. The language
emerges from an organising principle, typed relations, altitude changes, and
generative sequencing:

- larger situations that set context for smaller moves
- an explicit logic for why entries sit near, above, below, before, or after one
  another
- mechanisms that enable moves without being identical to them
- alternatives that expose tradeoffs rather than synonyms
- follow-up moves that act on centres produced by earlier moves
- quality edges that state which experiential dimensions the move makes legible

This is why the graph is not an index bolted onto the side. It is the
repository's main claim that the entries form a language rather than a bag of
reusable ideas. The tree can be an entry point; the graph and its organising
principles carry the language.

Some HCI pattern work treats pattern languages as a basis for transforming an
interface across contexts of use: device, actor expertise, environment, task, or
data complexity. That is useful for this project as a future adaptation layer,
but it should stay distinct from the core definition of `move`. A transformation
rule uses the language; it is not automatically the same kind of object as the
interaction move being transformed.

Other HCI pattern work treats the language as a process tool for composition.
That reinforces a local rule: relationships should carry semantic weight. A
link that means "alternative", "embeds in", "sets up", "blocks", or "enables"
is more useful than a generic related link because it helps a designer decide
what can be combined, substituted, or sequenced.

## Research grounding

This definition is grounded in
[`references/hci-pattern-languages.md`](../../references/hci-pattern-languages.md).
That note summarises the HCI pattern-language literature behind the project's
distinction between patterns, catalogues, pattern languages, transformation
rules, and pattern-development lifecycles.
