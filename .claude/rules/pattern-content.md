---
paths:
  - "apps/patterns/src/content/**/*.md"
  - "apps/patterns/src/content/**/*.mdx"
---

# Pattern site content (apps/patterns)

These rules apply to pattern language content in `apps/patterns/src/content/`.
For component Storybook documentation, see `.claude/rules/documentation.md`.

Sequence files (`apps/patterns/src/content/sequences/`) follow their own schema and authoring bar — [`docs/specs/sequences.md`](../../docs/specs/sequences.md) — not the pattern shape below. Concept files (`apps/patterns/src/content/concepts/`) likewise follow their own shape — [`docs/language/patterns-and-concepts.md`](../../docs/language/patterns-and-concepts.md): frontmatter definition, short body on the variants that matter to design, no situation block, no relationships. Language files (`apps/patterns/src/content/languages/`) hold a `patterns` list and a short lead, described in [`docs/specs/pattern-site.md`](../../docs/specs/pattern-site.md) §Project languages. The writing-style and link-format sections of this rule still apply to all three; a concept is linked as `/concepts/<id>`.

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

Use `<Figure>` for a prescription figure, a drawing of the relations the pattern imposes. `name` resolves to `apps/patterns/src/figures/<name>/<name>.svg`; how figures are drawn and prepared is in `docs/specs/pattern-site.md` §Figures.

    <Figure name="undo" />
    <Figure name="handoff" caption="…" />

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

A pattern's two situations are frontmatter prose: where the pattern continues from, and where it leads on to. What they are, how edge sentences are derived from them, and the rules that govern them are in [`docs/language/relationship-vocabulary.md`](../../docs/language/relationship-vocabulary.md) §Situations. What each one says, and which neighbours it names, is in §Shape of a `role: pattern` page below (steps 1 and 6).

```yaml
situation:
  initiating: >-
    prose — renders as the opening paragraph (step 1)
  resulting: >-
    prose — renders as the connections passage (step 6)
```

When writing them:

- Links are plain Markdown links with no `rel=`; `relationships:` remains the home of every edge. Every edge the page authors, except `enacts`, is linked somewhere in the page's prose; the extractor reports any that is not. Only a link in a situation gives the edge its sentence.
- The sentence that links an edge's target becomes that edge's sentence, and the far page may quote it in quotation marks. A sentence that will be quoted reads better without a dangling pronoun.
- Never author condition text in an edge note ("takes over when…", "fallback if…"). The condition belongs in the source pattern's resulting situation, with the `precedes` or `alternative` edge authored beside it.
- The earlier form, `resulting` as a list of clauses with `sets-up:` emitting `precedes`, is still honoured on pages not yet shaped. Converge on edit (relationship-vocabulary.md §Situations, *The earlier representation*).

Decision trees are authored as a Mermaid flowchart in a `## Decision tree` section plus a frontmatter leaf map:

```yaml
decision-trees:
  - id: deletion
    chart-index: 0   # optional; which <Diagram> on the page (0-based)
    leaves:
      "No confirmation (with undo)": undo
```

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
1. *Opening paragraph* — the initiating situation, `situation.initiating` in frontmatter, rendered before the first mark. It opens with an ellipsis so it reads as a continuation. It says what already exists when the pattern is worth reaching for: the structure in place, what the actor is doing in it, and the larger patterns this pattern continues from or helps complete. It may name the artifact the pattern works on ("the artifact holds more content than one view can show"). Which neighbours it names is a matter of direction: the wholes it is part of, a predecessor whose product this acts on, a same-level partner used together with it, an alternative where ruling it out is part of the situation, and a sequence only where naming it helps explain the context; other neighbours wait for the passage or the index. An alternative is named with what rules it out, and it is the one the maker would otherwise reach for, not every option; a last-resort pattern names each alternative that failed. If the opening reads as a comparison of options, it is doing the index's job. Wholes joined by "or" (the pattern completes any of several) are not alternatives. A widely used pattern keeps a short opening and lets the index carry the rest. One to three sentences is the norm. Prose only: blank lines separate paragraphs; plain Markdown links and emphasis. It is addressed to whoever is making, in one voice.
2. *Problem* — directly after the first `* * *`: the recurring situation the pattern resolves.
2.1. *Forces* — optional; only when real tensions make the problem hard.
3. *Before Therefore* — what decides whether to reach for the pattern: when it serves and when it constrains, what it costs, what is known about it and how far that is trusted (the evidence, including evidence against it, stated as part of the account rather than argued). For an established pattern this is short. What the pattern costs is said here or in the caution after the instruction.
4. *Therefore* (a.k.a. solution) — `Therefore,` on a line of its own, then the instruction. A caution may follow in plain prose (what overdoing the pattern costs, where the limit lies); permitted, not required. Limits on the instruction go here.
5. *After Therefore* — the prescription figure, where the pattern has one: a `<Figure>` drawing the relations the instruction imposes with as few marks as they need, stated in words by the instruction or a caption. A demo may follow it. Either or both; the instruction then runs straight on into the connections passage.
6. *Connections passage* — the resulting situation, `situation.resulting` in frontmatter, rendered after its own mark before the first tail section: what the pattern leaves behind and leads on to, told as prose with a sentence for what each linked pattern does for this one: the smaller and later patterns that act on its product, the problems it opens, the distinctions from look-alikes, and, where the rule stops holding past some condition, what takes over (with the `alternative` edge beside it). Its last sentence ends with a typed ellipsis (`…`) and no closing period; the renderer adds nothing. The typed index of the same edges and the sequence appearances fold beneath it (the "All connections" disclosure); an incoming connection neither situation names still appears there. No Consequences or Related patterns block is generated. A part of the pattern that is a pattern in its own right is linked here, usually as a `composed-of` edge; where the language has no page for it, or the nearest page covers a different move, seed one (`seed: true`) rather than link a poor fit.

The instruction is the hinge: what decides reaching for the pattern comes before it, and what it leads on to follows it in the passage. The detail of realising it is reference material, kept after the passage so it does not stand between the instruction and the connections. The two bold paragraphs are the skim path.

The renderer heads the parts the shape leaves unheaded, so they appear in the table of contents and in heading navigation: *Problem* replaces the first mark, *Solution* replaces the `Therefore,` line, and *Connections* heads the passage, all shown as muted, centred, capitalised labels at body size that do the mark's job. Keep authoring `Therefore,` on its own line: it is the hinge the renderer reads, and the word is replaced on the page. Do not author these headings. The tail sections (`## In practice` onward) keep ordinary headings; the two registers separate the pattern from its apparatus. A heading authored inside the pattern proper (a `## Forces`, where step 10 of the migration plan allows one) sits under *Problem*, so it is a `###`, or a lead-in sentence where the list is short. Nothing after `Therefore,` needs a heading, since only the caution, the figure and one demo sit there.

Then some optional sections
- `## In practice` — variants, states, the parts of a typical realisation, and their demos, with `###` subheadings where they help
- `## Related components` — component anatomy, alongside `realised_by` in frontmatter
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
- Reserve "material" for design material: what an interface is built with.
  Name what the actor works on with the most concrete noun the context
  allows (the document, the selection, the collection, the sources), with
  "content" as a fallback.
- Write the current state, never its history. No dates, "resolved to", "moved
  from" or other change-log copy in page bodies, to-dos included; `added` and
  `updated` in frontmatter are the only record, and git holds the rest.

## Pattern naming

Name a pattern by the centre it makes, not the component that implements it:
"Transient feedback", not "Toast". In this medium a centre often lives in time or
in the state of an exchange, so the name is often an act the actor recognises
("Regeneration", "Instructed revision"). The name must apply to any valid
implementation of the pattern, and must not share its head noun with an unrelated
existing entry (see the decomposition rule in
`docs/specs/pattern-role-model.md`).
