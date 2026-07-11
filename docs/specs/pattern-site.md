# Pattern site specification

The pattern site runs on Astro at `apps/patterns/`. It is the primary authoring
and navigation surface for the pattern language — patterns, qualities,
foundations, and collections. Components live in Storybook; patterns live here.

## Content collection schema

Patterns are defined in `apps/patterns/src/content.config.ts` using Astro
content collections with zod-validated frontmatter.

Required fields:

```yaml
title: "Pattern name"          # sentence case, short
role: pattern                  # pattern | collection | quality | foundation | component
```

Optional fields — each an independent _facet_ (see "Classification facets" below):

```yaml
activityLevel: operation       # operation | action | activity (AT altitude)
lifecycle: seeking             # free-form lifecycle stage (Seek–Use–Share family)
group: "conversation/sequence-management"  # nav sub-grouping path within a top group
domain: data-visualization     # domain corpus the entry belongs to
atomic: pattern                # primitive | component | composition | pattern
mediation: individual          # individual | coordination | networking
description: "One sentence"    # used in graph node tooltip and site meta
tags:
  - tag-value
```

`role:component` is valid in the schema but rarely used — component language
entries are the exception, not the rule. Most components live only in Storybook.

## File layout

The content directory is _flat_: every entry lives directly under
`apps/patterns/src/content/patterns/`, with no classification subfolders.

```
apps/patterns/src/content/patterns/
├── undo.mdx
├── constrained-selection.mdx
├── notification.mdx
├── conversation.mdx              # the activity pattern
├── conversation-quality.mdx      # the quality of the same name
└── …
```

The filename stem _is_ the entry's identity: its slug, its route
(`/patterns/<stem>`), its graph node ID, and the target of inter-page links —
all the same string. The collection loader's `generateId`
(`content.config.ts`) makes the stem authoritative independent of on-disk
location, so files could later be regrouped into folders for authoring
convenience without changing any slug.

Stems are globally unique. When a pattern and a quality/foundation share a name,
the pattern keeps the bare stem and the other takes a role suffix
(`conversation-quality.mdx`, `collaboration-foundation.mdx`).

A flat tree is deliberate, see "Classification facets" below and
[`references/semilattice.md`](../../references/semilattice.md).

## Inter-page link format

Plain relative routes rooted at `/patterns/`, using the flat slug (the filename
stem) — never an Activity-Theory path:

```md
[Undo](/patterns/undo)
[Agency](/patterns/agency)
[Good defaults](/patterns/good-defaults)
```

Do not use Storybook URL format (`../?path=/docs/operations-undo--docs`) for
patterns, nor old multi-segment routes (`/patterns/operations/undo`). Both are
tech debt to be cleaned up. (Storybook URLs remain correct for links to
_component_ pages, which still live in Storybook.)

## Classification facets

An entry is classified by independent frontmatter _facets_, none of which is
privileged by the filesystem (the content directory is flat). Each facet is a
lens; navigation and the graph are _projections_ over them.

- `activityLevel` (`operation | action | activity`) — Activity Theory altitude:
  the altitude of the human activity the entry addresses. A
  _pattern-site-only_ classification.
- `lifecycle` — a stage in the Seek–Use–Share family (e.g. `seeking`,
  `coordination`, `evaluation`). Free-form; not derived from `activityLevel`.
- `group` — a slash-delimited path used only to reconstruct the navigation
  sub-tree within a top group (e.g. `conversation/sequence-management`). It
  records a structural grouping verbatim; it makes no semantic claim. It is a
  transitional scaffold carried over from the pre-flatten folder tree, slated
  for retirement.
- `domain` — the domain corpus an entry belongs to (e.g. `data-visualization`).

## Stacked-notes navigation

Following a pattern link does not replace the page — it pushes the target into a horizontal stack of panes.
As the stack grows wider than the viewport, panes collapse into thin vertical _spines_ on both rails: earlier panes tuck under the left edge as you scroll right, later panes stay pinned at the right edge until you scroll back to them.
Nothing ever scrolls off into nowhere — the deck is bounded by the viewport, like a hand of laid-out cards. State lives in the URL via `stackedNotes` query params — including a pane's section anchor (`slug#fragment`, percent-encoded) — so a stacked view is shareable and survives reload down to anchor positions. The section is part of the address, not just wayfinding.

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

## Situations

A pattern's situations (initiating situation, resulting-context clauses) live
in its frontmatter `situation:` block — an optional companion, not a
requirement. The extractor emits them as node metadata, and a resulting clause
with `sets-up:` emits a conditional `precedes` edge. See
[relationship-vocabulary.md](../language/relationship-vocabulary.md) §Situations.

## Document structure

Section order, headings, component embeds, and writing style for pattern MDX are
the authoring rule's job — see
[`.claude/rules/pattern-content.md`](../../.claude/rules/pattern-content.md),
which auto-applies to `apps/patterns/src/content/`.
