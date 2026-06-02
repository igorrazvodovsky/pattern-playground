# Pattern site specification

The pattern site runs on Astro at `apps/patterns/`. It is the primary authoring
and navigation surface for the pattern language — patterns, qualities,
foundations, and umbrellas. Components live in Storybook; patterns live here.

## Content collection schema

Patterns are defined in `apps/patterns/src/content.config.ts` using Astro
content collections with zod-validated frontmatter.

Required fields:

```yaml
title: "Pattern name"          # sentence case, short
role: pattern                  # pattern | umbrella | quality | foundation | component
```

Optional fields:

```yaml
activityLevel: operation       # operation | action | activity
atomic: pattern                # primitive | component | composition | pattern
mediation: individual          # individual | coordination
description: "One sentence"    # used in graph node tooltip and site meta
tags:
  - tag-value
```

`role:component` is valid in the schema but rarely used — component language
entries are the exception, not the rule. Most components live only in Storybook.

## File layout

```
apps/patterns/src/content/patterns/
├── operations/
├── actions/
│   ├── application/
│   ├── coordination/
│   ├── evaluation/
│   ├── navigation/
│   ├── seeking/
│   └── sense-making/
├── activities/
├── foundations/
├── qualities/
└── data-visualization/
```

File names are kebab-case slugs that match the pattern's canonical ID in the
graph (e.g. `undo.mdx`, `constrained-selection.mdx`).

## Inter-page link format

Plain relative routes rooted at `/patterns/`:

```md
[Undo](/patterns/operations/undo)
[Agency](/patterns/qualities/agency)
[Constrained selection](/patterns/operations/constrained-selection)
```

Do not use Storybook URL format (`../?path=/docs/operations-undo--docs`) in
pattern site content. Old-format links in migrated pages are tech debt to be
cleaned up.

## Activity Theory levels in the pattern site

AT levels (`activityLevel: operation | action | activity`) are a
_pattern-site-only_ classification. They describe the altitude of the human
activity the pattern addresses. They are encoded in frontmatter and reflected in
the content directory structure.

Storybook uses AT levels as a sidebar projection for component stories, but this
is a separate organisational convention that does not carry design-language
semantics. The authoritative AT classification for patterns lives in the pattern
site; the Storybook projection is a practical convenience for component
navigation.

See [`plans/completed/2026-03-activity-theory-reorg.md`](../../plans/completed/2026-03-activity-theory-reorg.md)
for the rationale and migration history behind the AT organisation.

## Placement

A pattern's directory follows its `activityLevel` (the folders above mirror the
AT levels); actions additionally pick a lifecycle sub-group. When a pattern
straddles levels, pick one for the directory and let tags and graph edges carry
the overlap — every tree is lossy, the graph is the semilattice (see
[`references/semilattice.md`](../../references/semilattice.md)). Concept
vocabulary lives in the top-level `concepts/` directory, not the pattern content.

The reasoning behind a placement — AT-level tests, granularity, umbrella
strategy — is the `/pattern-classifier` skill's job.

## Stacked-notes navigation

Following a pattern link does not replace the page — it pushes the target into a horizontal stack of panes.
As the stack grows wider than the viewport, panes collapse into thin vertical _spines_ on both rails: earlier panes tuck under the left edge as you scroll right, later panes stay pinned at the right edge until you scroll back to them.
Nothing ever scrolls off into nowhere — the deck is bounded by the viewport, like a hand of laid-out cards. State lives in the URL via `stackedNotes` query params, so a stacked view is shareable and survives reload.

The _geometry_ is mostly CSS `position: sticky`. A
small rAF-throttled scroll handler in `StackManager.tsx` only reflects what is already painted onto two cosmetic state attributes which marks a note when it overlays another:

- `data-collapsed` — set while only a spine's worth of the pane is visible
  (pinned to a rail and clipped or covered). The spine label is revealed _only_
  then; an expanded pane shows no spine. (The spine is a `<button>`, so the
  components-layer button reset outranks any layered rule — its visibility rules
  therefore live outside `@layer`, where they beat every layer.)
- `data-overlapping` — set while the pane actually overlays its predecessor. The
  front-to-back depth shadow is cast _only_ then, never when panes merely sit
  side by side.

- Each pane sticks to a per-pane _left_ inset (its slot in the left rail) and a
  _negative right_ inset of roughly spine-width-minus-pane-width. The negative
  inset is the crux: it lets a pane flow normally and simply be _clipped_ at the
  viewport edge until only a spine's worth would remain, and only _then_ pins it
  as a right-rail spine. A _positive_ right inset — the obvious-looking choice —
  pins a pane the instant it overflows, which slides a still-mostly-visible pane
  on top of the previous one. That asymmetry (flow-then-pin, not pin-on-overflow)
  is the entire trick.
- `z-index` increases with pane order, so later panes always lay over earlier
  ones — earlier panes tuck _under_ on the left, later panes sit _over_ on the
  right, giving the stack its consistent front-to-back order.
- One spine element per pane serves both rails: it is the pane's leading edge, so
  it reads as a left-rail spine when covered by the next pane and as a right-rail
  spine when only that leading edge remains visible.

The exact geometry is in `apps/patterns/src/styles/stack.css`; the overlap/collapse detection, scroll-into-view, and URL-sync logic live in `apps/patterns/src/components/StackManager.tsx` and
`apps/patterns/src/lib/stack-store.ts`.

A behavioural invariant to preserve: at the leftmost scroll position the first panes are fully visible and later panes are progressively clipped then spined — a partly-visible pane is _never_ overlapped by the next one.

## Profile sidecars

`.profile.ts` sidecars live co-located with their MDX file, using the same
filename stem (e.g. `undo.profile.ts` alongside `undo.mdx`). The extractor
reads them for structured edge data. The relationship is the same as in
Storybook — the sidecar is an optional companion, not a requirement.

## Document structure

Section order, headings, component embeds, and writing style for pattern MDX are
the authoring rule's job — see
[`.claude/rules/pattern-content.md`](../../.claude/rules/pattern-content.md),
which auto-applies to `apps/patterns/src/content/`.
