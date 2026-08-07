---
paths:
  - "apps/patterns/src/content/**/*.md"
  - "apps/patterns/src/content/**/*.mdx"
---

# Pattern site content (apps/patterns)

These rules apply to pattern language content in `apps/patterns/src/content/`.
For component Storybook documentation, see `.claude/rules/documentation.md`.

## Frontmatter (replaces `<Meta>` tags)

Files are flat under `apps/patterns/src/content/patterns/`; the filename stem is
the slug, route, and graph ID. Classification lives in frontmatter facets, not
folders. Every file needs at least `title`, `added` and `role`; the rest are
optional and independent of each other. What the fields mean, and why the tree is
flat, is in [`docs/specs/pattern-site.md`](../../docs/specs/pattern-site.md)
(§Content collection schema, §File layout, §Classification facets); the roles are
defined in [`docs/specs/pattern-role-model.md`](../../docs/specs/pattern-role-model.md).

```yaml
---
title: "Pattern name"
added: 2025-10-17              # the day it joined the library
updated:                       # fill in when the argument patterns
role: pattern                  # pattern | collection | quality | foundation | component
activityLevel: operation       # operation | action | activity
lifecycle: seeking             # Seek–Use–Share stage, free-form
domain: data-visualization     # domain corpus
group: "conversation/sequence-management"  # nav sub-grouping path
atomic: pattern                # primitive | component | composition | pattern
mediation: individual          # individual | coordination | networking
description: "One sentence framed from the human situation."
---
```

Do not use `<Meta title="..." />` or `<Meta of={...} />` in pattern site content.

## Inter-page link format

Use plain relative routes rooted at `/patterns/`, with the flat slug (filename
stem) — never an Activity-Theory path:

```md
[Undo](/patterns/undo)
[Agency](/patterns/agency)
```

Do not use Storybook URL format (`../?path=/docs/...--docs`) for patterns, nor
old multi-segment routes (`/patterns/operations/undo`). Both are tech debt;
rewrite them when editing the file for other reasons. (Storybook URLs stay
correct for links to component pages.)

## Component embeds

Custom elements registered via `register-all.ts` are available on every page.
Write tags directly in MDX for short inline illustrations:

    <pp-button>Undo</pp-button>

Use `<Demo>` for a framed demo sandbox (no import needed):

    <Demo label="Undo trigger">
      <pp-button>Undo</pp-button>
    </Demo>

Use `<ComponentRef>` for inline prose references to Storybook component pages
(no import needed):

    the <ComponentRef id="actions-application-button--docs">Button</ComponentRef> component

Do not hardcode localhost:6006 URLs in content — use `<ComponentRef>`, which reads `PUBLIC_STORYBOOK_URL`.

## Declaring relationships

Typed edges live in frontmatter `relationships:` or inline `{rel="type"}` on links — never inferred from heading text.

Frontmatter declaration (one or many per rel type):

```yaml
relationships:
  precedes: [wizard, step-by-step]
  complements:
    - to: bounded-choice
      note: "the constrained-field move"
    - sections
  composed-of: [data-entry]    # alias for enables (P composed of target)
  instantiates: [good-defaults]
```

Inline narrated edge (body prose):

```mdx
…each field is an act of [bounded choice](/patterns/bounded-choice){rel="composed-of"}…
```

The `{rel="type"}` is stripped at build time by the `remark-rel-strip` plugin and never appears in rendered output.

A `note` may contain inline markdown links (`[text](/patterns/slug#anchor)`); `RelatedPatterns.astro` renders them as real anchors. Quote the note value when it contains `[`, `:` followed by a space, or other YAML-significant characters.

One edge carries up to two notes, one per reading direction. Symmetric edges
(`complements`, `tangential`, `alternative`, `related`): each endpoint may
author its own. Directed edges (`precedes`, `enables`, `instantiates`): the
source authors the forward note, the target adds the reverse one through the
inverse alias (`follows`, `composed-of`, `instances`). Either way, write the
second note only when reading from that side needs different words — a single
note renders on both pages — and never duplicate the same note on both sides.

Voice a note so it works from both pages: name its subject ("annotation supplies
the mechanism for attaching help") or gloss the relation itself. A single note
renders after the *other* endpoint's name each time, so a subjectless one binds
to whichever endpoint the reader is not on; when the wording only works from one
side, author the reverse note instead. The extractor flags notes that name
neither endpoint.

The extractor's subsumption dedup silently drops a `related` edge (and its note) when the pair carries any stronger type — a `related` you author must target a pair with no stronger edge, and a note that matters belongs on the stronger edge.

Valid rel values: `precedes`, `follows`, `enables`, `composed-of`, `instantiates`, `instances`, `variants`, `complements`, `tangential`, `alternative`, `enacts`, `serves`, `surveys`, `hosts`, `hosted-by`, `related`. Direction is fixed by the rel name, not by which page declares it. `recommends` is not authorable — it comes only from decision trees. `serves` is authored on the pattern's page only and targets a foundation; its note names the station of the foundation's frame the pattern covers.

What each type claims, which alias stores which direction, and when an edge is the wrong instrument: `docs/language/relationship-vocabulary.md` (§Relationships and §Authoring model).

Component realisation ("this pattern is realised by this component") is not a
typed edge: author the claim in frontmatter `realised_by` — a list of
Storybook docs ids, validated at build time:

```yaml
realised_by: [actions-application-form--docs]
```

`<ComponentRef>` in body prose is a citation, not a claim — cite freely,
including components the page is not realised by. Never put a `rel=` on a
`<ComponentRef>` and never name a component id in `relationships:`. See
`docs/language/relationship-vocabulary.md` §Component realisation.

## Epistemic status

Say how well-supported the pattern is. Three optional independent frontmatter
fields:

```yaml
seed: true                     # a place to hold a thought — not yet a claim
evidence:
  - observed                   # instances seen in real products or practice
  - literature                 # sources support it
  - kind: literature           # …with a references/ entry named
    ref: design-patterns
  - used                       # applied in actual design work
disclosure: "Written from one screenshot and a hunch; two more sightings would settle it."
```

- `evidence` is valid on `role: pattern` and `role: collection` only; `ref`
  belongs on `literature` and must name a `references/` entry, or the build fails.
- `built` is *not* authorable: it is entailed from `realised_by`. Populate
  `realised_by` and the extractor adds it.
- `disclosure` is never parsed. Write the reason confidence is low and what
  would raise it.

What each kind means, and why they are kinds rather than a maturity ladder:
[`docs/specs/pattern-site.md`](../../docs/specs/pattern-site.md) §Epistemic status.

## Situations and conditional edges

A pattern may carry its two situations in frontmatter — the design situation it
applies in, and the one it leaves behind:

```yaml
situation:
  initiating: >-
    prose — the situation this pattern applies in, told as the history of steps
    already applied (or ruled out)
  resulting:
    - a bare prose clause about what holds after the pattern is applied
    - clause: >-
        a clause that sets up a next pattern; voice it to name its subject —
        it renders on both endpoints' pages
      sets-up: [next-pattern]
```

A `sets-up` clause *emits* a `precedes` edge carrying the clause as derived
condition text. Never author condition text in an edge note ("takes over
when…", "fallback if…") — that judgement's home is the source pattern's
resulting clause (or a decision tree). Don't also declare the same pair under
`relationships: precedes`; the extractor warns on the duplicate.

Decision trees are authored as a Mermaid flowchart in a `## Decision tree`
section plus a frontmatter leaf map:

```yaml
decision-trees:
  - id: deletion
    chart-index: 0   # optional; which <Diagram> on the page (0-based)
    leaves:
      "No confirmation (with undo)": undo
```

See `docs/language/relationship-vocabulary.md` §Situations for the full rules.

### Suppressing the rendered block

`RelatedPatterns.astro` renders a "Related patterns" section at the foot of each
page. Two ways it is skipped:

- `role: quality` — never rendered. A quality is a diagnostic lens, not a
  catalogue; the bridge to patterns lives on the pattern side via `enacts`.
- `showRelated: false` in frontmatter — opt out per page when the body already
  narrates every relationship inline (e.g. a `collection` whose prose links each
  member). The edges still feed the graph; only the redundant on-page list is
  skipped.

## Document structure

Every file: YAML frontmatter → lead prose → body sections → `## Resources &
references` last. No `# Title` in the body — the layout renders the title from
frontmatter. The page foot is a rendered layer, never authored as sections:
"Consequences" renders from `situation.resulting`, then "Related patterns"
from frontmatter edges.

### Standard shape for `role: pattern`

Canonical for new patterns. Existing files converge when edited for other
reasons (same policy as link formats) — no mass rewrite.

1. *Lead* — unlabelled paragraph(s) telling the situation the pattern applies in
   and the problem it resolves, from the human situation inward. This narrates
   `situation.initiating`; the frontmatter stays the machine-readable truth,
   the lead retells it in prose rather than copying it.
2. `## Forces` — optional; only when real tensions make the problem hard.
   Short *X vs. Y* items with a clause on why they pull against each other.
3. `## Solution` — the move itself, stated once. A short pattern whose lead
   already carries the solution may skip the heading.
4. *Concretisation sections* — how the pattern takes shape: `## Variants`,
   `## States`, or headings named after the pattern's own dimensions. This is
   where each pattern's idiosyncratic content lives; heading names here are
   free.
5. *Consequences* — rendered from `situation.resulting` at the page foot,
   before "Related patterns"; never authored as a body section (same rule as
   the Related patterns block). Write what holds after the move — gains and
   costs together — as resulting clauses.
6. `## Resources & references` — always this exact heading (not `Resources`,
   `References`, or `Resources and references`; rename stragglers on edit).
7. `## To-do` — authoring residue, one section at most, always the final
   section of the file.

There is no `## Problem` section: the problem statement is the lead's job, and
prose analysing why the obvious answers fail is `## Forces` material.

`coordinated-views.mdx` and `purpose-keyed-view.mdx` are reference examples of
the shape.

Family templates converge onto the same slots: the conversation family's
`## Metrics` content belongs in `situation.resulting` clauses; the navigation family's
`## Behavioural position` splits between the lead (context) and `## Forces`.
Converge on edit, as above.

Existing `## Related components` sections stay as they are for now; whether
the section survives `realised_by` + `<ComponentRef>` + typed edges is an open
question tracked separately — don't migrate or remove them under this rule.

### Other roles

- `role: quality` — a lens, not a pattern: lead defines the quality, body
  decomposes it into named dimensions with headings of its own.
- `role: foundation` — a framework essay organised by its frame's stations
  (stages, layers, touchpoints).
- `role: collection` — chooser logic: routing prose and/or a decision tree
  over the members it surveys.

All roles keep `## Resources & references` last (before any `## To-do`).

## Writing style

- Frame descriptions from the *human situation inward*, not from the
  implementation outward. Start with what the actor is doing or experiencing.
- Plain practitioner voice: ordinary words and direct statements. No dramatic
  staging, compressed aphorisms, or literary borrowings.
- British spelling (behaviour, organisation, colour).
- Sentence case for headings and titles.
- Prefer conciseness; each sentence should add new information.

## Pattern naming

Name a pattern by the interaction move, not the component that implements it:
"Transient feedback", not "Toast". The name must apply to any valid
implementation of the pattern, and must not share its head noun with an unrelated
existing entry (see the decomposition rule in
`docs/specs/pattern-role-model.md`).
