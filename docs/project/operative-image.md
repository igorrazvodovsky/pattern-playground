# Project operative image

Current working picture of the project as a whole — the surfaces, the substrate,
and the tooling as they exist today. Use this as the comparison surface against
[vision.md](./vision.md): where they diverge, decide whether the vision should
change, the operative image should catch up, or the gap should become a plan.

For the pattern *language*'s current picture, see
[../language/operative-image.md](../language/operative-image.md). For the settled
architecture, see [../specs/workspace-layout.md](../specs/workspace-layout.md).

## Current picture

The project is a single npm workspace with one library package, two runnable
apps, and a fixtures workspace: the component library (`packages/components/`,
Lit + React, Storybook on :6006), the pattern site (`apps/patterns/`, Astro on
:4321), an Express backend (`apps/server/`, currently parked — no root script
drives it), and `shared/` (fixture data feeding both surfaces).
[../specs/workspace-layout.md](../specs/workspace-layout.md). Root `concepts/`
and `todo/` are pre-collection strata no build path reads.

Two surfaces carry the work. The pattern site is the product — pattern MDX
rendered by Astro, with the extracted graph as a navigational surface. Storybook
is the component workshop. `role:quality` and `role:foundation` entries are
bilingual, with a language foot in the pattern site and a substrate foot in the
components package. Runnable demos live once in
`packages/components/src/demos/` and feed both surfaces.

The agent layer exists in outline: `docs/` is the agent-facing knowledge base,
`CLAUDE.md` the thin entry map, [`plans/`](../../plans/) the executable
specifications, and [`../specs/`](../specs/) the settled commitments.

## Where the picture meets the vision

Measured against the directions in [vision.md](./vision.md):

- *Garden, not a product*: holds. The project is personal and structured for the
  author's own thinking; nothing currently pulls toward audience features.
- *Bilingual substrate maturity*: realised by allocation. Shared demos feed both
  surfaces from one source, cross-surface references are typed elements
  (PatternRef/ComponentRef) validated at build, and the one-entry question
  resolved by giving each concept exactly one descriptive home — a language
  entry for interaction-design material, substrate-only for visual material —
  so no two-page state remains. See the bilingual-entries section of
  [../specs/workspace-layout.md](../specs/workspace-layout.md).
- *Agent-consumable repertoire*: early. The knowledge base, the agent-harness
  spec ([../specs/agent-harness.md](../specs/agent-harness.md)), and the
  plan/spec contract exist. Pattern situations — the node-level metadata an
  actor would read — are populated for only a small starting set.

The repertoire's content frontier — the intent-based coverage named in
[core-beliefs.md](./core-beliefs.md) — sits outside these structural directions:
the foundations and touchpoint work (agency, delegation, agentive touchpoints,
see-think-do) are active plans, thin in landed patterns so far.

## Navigation and reading

The pattern site's reading surface — stacked-notes panes that collapse into
spines on both rails, and the force-directed graph view — is current
infrastructure serving the garden. Content organisation is projection, not
position: the corpus is a flat directory whose filename stems are the
identities (slugs, routes, graph node IDs), and every navigation surface —
sidebar groups, graph categories — is computed from classification facets, one
site-wide projection mode at a time (see the classification-facets section of
[../specs/pattern-site.md](../specs/pattern-site.md)); the handwritten
collection overviews are gone in favour of projections.

## Detail sources

- [vision.md](./vision.md) — where the artifact is heading
- [core-beliefs.md](./core-beliefs.md) — project philosophy, voice, scope
- [../specs/workspace-layout.md](../specs/workspace-layout.md) — package
  structure and what each workspace owns
- [../specs/agent-harness.md](../specs/agent-harness.md) — agent-facing control
  layer
- [../../plans/index.md](../../plans/index.md) — active product and tooling work
