# Patterns and components

The project works with two things whose jobs are different enough that they must
not share a vocabulary:

- The *pattern language* is the connected structure of *patterns* — generative
  moves organised so an actor can sequence design decisions. Its job is
  divergence within invariants: a pattern names a recurring force-resolution that
  is realised differently every time it is applied. It lives in `apps/patterns/`.
- The *component catalogue* is the connected structure of *components* —
  primitives, controls, compositions, and the rules for combining them. Its job
  is to make each instance cheap to place: a component supplies only what recurs
  across the places it will occupy, leaving what varies to where it lands. It
  lives in `packages/components/`.

`component` is the unit-level role, at any scale — a primitive, a control, a
composition, or any other unit of built material. *Component catalogue* is the
collective term, as *pattern language* is the collective for *pattern*. *Move*
stays an ordinary word for a design act; the unit of the language is a pattern.

## Components are not reusable units

The catalogue's goal is not reuse. It is to support the patterns — which makes
the aspiration *adjustability*, and the measure how cheaply an instance can be
cut to its place.

Alexander has no term for an identical, closed unit: his theory argues against
such units, and the erector-set component appears only as a counter-example. He
does describe building elements. Book 2 ch. 16 §2 lists them — "the elements,
rules, ways of making roofs, edges, windows, steps, the ceiling of a room. The
way to make a wall, the way to make a column." — and the catalogue holds the
same kind of thing. An entry in such a list is not a finished thing: it is the
part of a window that is the same in every window, with whatever differs left
to the wall it goes into. At Eishin every window is recognisably a window, and
no two are identical.

## One word, two registers

Industry usage calls both kinds of thing "patterns": design systems publish
component patterns, and WAI-ARIA Authoring Practices calls its interaction
contracts patterns. Those are *normative* artifacts — they succeed
when no one re-derives them and every implementation converges. Alexander's
patterns are *generative* — they succeed when no two applications are identical.
This project reserves *pattern* for the generative sense. A control or contract
is component material, however thoroughly it is documented.






