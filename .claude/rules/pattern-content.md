---
paths:
  - "apps/patterns/src/content/**/*.md"
  - "apps/patterns/src/content/**/*.mdx"
---

# Pattern site content (apps/patterns)

These rules apply to pattern language content in `apps/patterns/src/content/`.
For component Storybook documentation, see `.claude/rules/documentation.md`.

Sequence files (`apps/patterns/src/content/sequences/`) follow their own schema and authoring bar — [`docs/specs/sequences.md`](../../docs/specs/sequences.md) — not the pattern shape below. The writing-style and link-format sections of this rule still apply to them.

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

A demo from `packages/components/src/demos/` mounts by registry name; a
switchable demo (a spec in `demos/specs/`) mounts by spec slug and gets a
library switch in its frame. `registries=` names the libraries on offer and
`registry=` the starting one; a spec built for one library lists only that one
and gets no switch:

    <Demo name="toast" label="Toast" />
    <Demo spec="inline-confirmation" label="Inline confirmation" />
    <Demo spec="rule-composition" registries={["shadcn"]} label="Rule builder" />

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
  - used                       # applied in actual design work
disclosure: "Written from one screenshot and a hunch; two more sightings would settle it."
```

- `evidence` is valid on `role: pattern` and `role: collection` only. The
  sources behind a `literature` entry are named in prose under
  `## Research on this pattern` or `## Resources & references`, not in frontmatter.
- Rendered text cites a source by its public link (DOI, arXiv, or URL).
- `built` is *not* authorable: it is entailed from `realised_by`. Populate
  `realised_by` and the extractor adds it.
- `disclosure` is never parsed. Write the reason confidence is low and what
  would raise it.

What each kind means, and why they are kinds rather than a maturity ladder:
[`docs/specs/pattern-site.md`](../../docs/specs/pattern-site.md) §Epistemic status.

## Situations and conditional edges

A pattern's two situations are the points where its connections meet, told as prose in frontmatter: where the pattern continues from, and where it leads on to. Both speak to whoever is making, in one voice; there is no separate designer's version:

```yaml
situation:
  initiating: >-
    prose — what already exists when this pattern applies: the structure in place, what the actor is doing in it, the alternatives ruled out, the sequences and larger patterns it helps complete; renders as the opening paragraph
  resulting: >-
    prose — what holds after the pattern is applied and what it leads on to: the patterns that act on its product, the problems it opens, the look-alikes it is not; renders as the connections passage
```

Links in both are Markdown links with no `rel=`; `relationships:` remains the home of every edge. For each edge the page authors, the sentence of the resulting situation (or, failing that, the initiating one) that links the target becomes the edge's gloss, shown on the other endpoint's page. Never author condition text in an edge note ("takes over when…", "fallback if…"): that judgement's home is the source pattern's resulting situation, with the `precedes` edge authored beside it.

The earlier form — `resulting` as a list of clauses, a clause with `sets-up:` emitting `precedes` — is still honoured on pages not yet shaped. Converge on edit.

Decision trees are authored as a Mermaid flowchart in a `## Decision tree` section plus a frontmatter leaf map:

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
- `showRelated: false` in frontmatter — on a shaped page this folds away only the typed index; the passage still renders. On a page not yet shaped it skips the list: opt out per page when the body already
  narrates every relationship inline (e.g. a `collection` whose prose links each
  member). The edges still feed the graph; only the redundant on-page list is
  skipped.

## Document structure

Every file: YAML frontmatter → body → `## Resources & references` last. The page is composed at build time (`integrations/remark-consequences.ts`): the opening paragraph, the section marks, the connections passage and its folded index are rendered from what is described below; an authored `## To-do` is lifted from wherever it sits and shown last, in the code face, as authoring residue.

### Shape of a `role: pattern` page

0. *Opening demo* — optional, at most one, before the opening paragraph: an instance of the pattern above the fold, for recognition before reading.
1. *Opening paragraph* — the initiating situation, `situation.initiating` in frontmatter, rendered before the first mark with the book's leading ellipsis, so it begins lowercase and reads as a continuation. It says what already exists when the pattern is worth reaching for: the structure in place, what the actor is doing in it, the alternatives ruled out, and the larger things this pattern helps complete — the sequences it appears in, named by link, and the larger patterns. Prose only: blank lines separate paragraphs; plain Markdown links and emphasis. It is addressed to whoever is making, in one voice.
2. *Problem* — directly after the first `* * *`: the recurring situation the pattern resolves.
2.1. *Forces* — optional; only when real tensions make the problem hard.
3. *Before Therefore* — what decides whether to reach for the pattern: when it serves and when it constrains, what it costs, what is known about it and how far that is trusted (the evidence, including evidence against it, stated as part of the account rather than argued). For an established pattern this is short. What the pattern costs is said here or in the caution after the instruction.
4. *Therefore* (a.k.a. solution) — `Therefore,` on a line of its own, then the instruction. A caution may follow in plain prose (what overdoing the pattern costs, where the limit lies); permitted, not required.
5. *After Therefore* — how the instruction takes shape: demos, variants, states, components, constraints. 
6. *Connections passage* — the resulting situation, `situation.resulting` in frontmatter, rendered after its own mark before the first tail section: what the pattern leaves behind and leads on to, told as prose with a sentence for what each linked pattern does for this one, the problems it opens, and the distinctions from look-alikes; it ends with trailing ellipsis. The typed index of the same edges and the sequence appearances fold beneath it (the "All connections" disclosure), and no Consequences or Related patterns block is generated. Every edge the page authors must be linked in the page's prose. The body itself does not end in a `* * *`: the passage brings its own mark.

The instruction is the hinge: what decides reaching for the pattern comes before it, how it is realised comes after it, and the passage closes the page. The two bold paragraphs are the skim path.

Then some optional sections
- `## Related components` 
- `## Research on this pattern`
- `## Resources & references`
- `## To-do`

### Pages not yet shaped

A page whose `situation.resulting` is still a clause list, or absent, keeps the earlier renders: `situation.initiating` does not render and the lead narrates it; the clauses render as a generated "Consequences" section before
`## Resources & references`; the edges render as a generated "Related
patterns" list and the sequence appearances as "Appears in" at the foot.
These renders are a fallback for pages not yet converged, with no retirement
date (relationship-vocabulary.md §Retirement).

### Other roles

- `role: quality` — a lens, not a pattern: lead defines the quality, body
  decomposes it into named dimensions with headings of its own.
- `role: foundation` — a framework essay organised by its frame's stations
  (stages, layers, touchpoints).
- `role: collection` — chooser logic: routing prose and/or a decision tree
  over the members it surveys.

All roles keep `## Resources & references` last (`## To-do` may follow it;
the renderer moves it after the page foot either way).

## Writing style

- Frame descriptions from the *human situation inward*, not from the
  implementation outward. Start with what the actor is doing or experiencing.
- Plain practitioner voice: ordinary words and direct statements. No dramatic
  staging, compressed aphorisms, or literary borrowings.
- Reserve "material" for design material: what an interface is built with.
  Name what the actor works on with the most concrete noun the context
  allows (the document, the selection, the collection, the sources), with
  "content" as a fallback.
- British spelling (behaviour, organisation, colour).
- Sentence case for headings and titles.
- Prefer conciseness; each sentence should add new information.
- Write the current state, never its history. No dates, "resolved to", "moved
  from" or other change-log copy in page bodies, to-dos included; `added` and
  `updated` in frontmatter are the only record, and git holds the rest.

## Pattern naming

Name a pattern by the interaction move, not the component that implements it:
"Transient feedback", not "Toast". The name must apply to any valid
implementation of the pattern, and must not share its head noun with an unrelated
existing entry (see the decomposition rule in
`docs/specs/pattern-role-model.md`).
