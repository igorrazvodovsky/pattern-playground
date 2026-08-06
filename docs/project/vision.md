# Project vision

Long-term orientation for the project as a whole — the garden, its two surfaces,
and the tooling around them. It names where the *artifact* is heading, distinct
from where the pattern *language* is heading
([../language/vision.md](../language/vision.md)).

The project's standing posture lives in [core-beliefs.md](./core-beliefs.md);
this page is the forward edge those beliefs point toward. Compare it with
[operative-image.md](./operative-image.md), the current working picture of the
artifact.

## A garden, not a product

The first commitment is a constraint on what the project will *not* become. It
stays a personal design repertoire — a thinking tool for one designer — not a
published product or an audience-serving site. The direction is depth and
coherence, not reach. Features that would only make sense for an audience
(onboarding, broad discoverability, contribution funnels) stay out of scope
unless they also serve the author's own thinking. [core-beliefs.md](./core-beliefs.md)
is the canonical statement; this is its forward-looking edge, and it bounds the
directions below.

## Directions

Two directions extend the garden without productising it. (The content frontier —
which design problems the repertoire covers — lives in
[core-beliefs.md](./core-beliefs.md) as the project's current focus, not here:
coverage themes drift, while these directions are about the artifact's durable
form.) The far horizon for the reading surface itself — documents receding into
projection targets, where the distinction between an address and an identity
dissolves — is sketched in [../levels-of-scale.md](../levels-of-scale.md).

### Bilingual substrate maturity

The component library and the pattern language are two languages with different
jobs (see [../language/patterns-and-components.md](../language/patterns-and-components.md)):
components are cut to their place in the component catalogue, patterns diverge in the pattern language.
The direction is to let each do its job cleanly while the coupling between them
tightens — shared demos feeding both surfaces from one source. The one-entry
question resolved by allocation rather than fusion: each concept has exactly one
descriptive home (a language entry for interaction-design material, a substrate
foot only for visual material), bound by validated cross-surface references.
The remaining direction is keeping that coupling tight as both surfaces grow.
[../specs/workspace-layout.md](../specs/workspace-layout.md) holds the current
substrate split and the bilingual-entry contract.

### Agent-consumable repertoire

The repertoire should be usable by a non-human collaborator, not only browsable
by its author. Docs, the pattern graph, and pattern situations together form a
control layer an AI design actor can reason over and author into — reading the
graph as suggestion-grade context, proposing patterns, and writing back typed
relationships and situations without silently mutating the language. This is the
project-level face of the language's
[agent-usable](../language/vision.md) track; the harness
([../specs/agent-harness.md](../specs/agent-harness.md)) is where it becomes
concrete.

## How to use this page

When project-level work strains against current structure, compare the strain to
this page and to [operative-image.md](./operative-image.md):

1. Is a direction still right, but the operative image has not caught up?
2. Has the current state revealed that a direction is incoherent, or that it
   pulls against the garden constraint?
3. Is the gap actionable enough to become a plan in [`plans/`](../../plans/)?

If the answer to the third question is yes, write the executable specification in
[`plans/`](../../plans/) rather than expanding this page.
