# Pattern and form languages

The project works with two languages whose jobs are different enough that they must not share a vocabulary:

- The *pattern language* is the connected structure of *moves* — generative
  interaction patterns organised so an actor can sequence design decisions. Its
  job is divergence within invariants: a move names a recurring force-resolution
  that is realised differently every time it is applied. It lives in
  `apps/patterns/`.
- The *form language* is the connected structure of *mechanisms* — components,
  primitives, controls, and the rules for composing them. Its job is
  convergence: a mechanism behaves identically wherever it is deployed. It lives
  in `packages/components/`.

`mechanism` is the unit-level role — a component, primitive, control, or visual
or behavioural element. *Form language* is the collective term, the layer with
its grammar, as *pattern language* is the collective for *move*.

## One word, two registers

Industry usage calls both things "patterns": design systems publish component
patterns, and WAI-ARIA Authoring Practices calls its interaction contracts
patterns. Those are *normative* artifacts — they succeed when no one re-derives
them and every implementation converges. Alexander's patterns are *generative* —
they succeed when no two applications are identical. This project reserves
*pattern* for the generative sense. A control or contract is form-language
material, however thoroughly it is documented.

## The boundary is a projection, not an ontology

"Mechanisms are not patterns" is a statement about naming and default
rendering, not about where pattern-grade content can live. The rendered
language shows moves; the materials stay reachable from the graph data through
*component realisation* — frontmatter `realised_by` ids emitted as node
metadata and resolved against Storybook's catalogue, a cross-dataset reference
rather than an edge, since components are not nodes (see
[relationship-vocabulary.md](./relationship-vocabulary.md) §Component
realisation). A mechanism whose contract carries genuine force-resolution may
earn a bilingual language entry named by the move. The settled commitments are
the "Boundary stance" section of
[pattern-role-model.md](../specs/pattern-role-model.md); the rendering stance
is in [workspace-layout.md](../specs/workspace-layout.md).

## A control is not the unit of pattern-hood

A control page often compresses move content (situation, forces, consequences,
relations) together with mechanism content (props, states, anatomy, keyboard,
accessibility). Such a page *decomposes* — the operational rule is in
[pattern-role-model.md](../specs/pattern-role-model.md).

The fact that matters at the language level: a control is where several moves
*coincide*, not the unit of pattern-hood. Decomposing a control page therefore yields whatever its
territory contains: one move, several related moves, a composite pattern plus its constituents, a collection plus moves, or no new node at all — only edges to moves that already exist.

## Doors to the workshop

An unfolding design exits the language into materials: decision trees may land
on a mechanism, and pattern prose cites components through cross-surface
links. The realisation vocabulary this section once anticipated exists —
frontmatter `realised_by` names the components that realise a move, while
prose `<ComponentRef>` mentions stay claim-free citations
([relationship-vocabulary.md](./relationship-vocabulary.md) §Component
realisation). It arrived as a cross-dataset reference, not a boundary move:
components remain outside the graph. Prose around the citation still carries
the "requires adapting the material thus" telling; if that adaptation content
ever needs structure of its own, that is a new decision, taken through the
vocabulary changelog.

## The aspirational fusion

In [design-theory.md](./design-theory.md)'s endpoint — Alexander's structural
properties, at once form and effect — the two languages fuse. The properties of
living structure are most visible at small scale, which in this medium is
component scale: the boundary between a combobox's input and its popup, the
highlighted candidate as a strong centre.