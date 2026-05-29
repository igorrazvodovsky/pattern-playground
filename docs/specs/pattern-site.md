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

## Stacked-notes navigation

Following a pattern link does not replace the page — it pushes the target into a horizontal stack of panes.
As the stack grows wider than the viewport, panes collapse into thin vertical _spines_ on both rails: earlier panes tuck under the left edge as you scroll right, later panes stay pinned at the right edge until you scroll back to them.
Nothing ever scrolls off into nowhere — the deck is bounded by the viewport, like a hand of laid-out cards. State lives in the URL via `stackedNotes` query params, so a stacked view is shareable and survives reload.

The whole effect is pure CSS `position: sticky` — there is no scroll listener or JavaScript classifier.

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

The exact geometry (inset formulas, spine and pane widths, z-index, shadows) is in `apps/patterns/src/styles/stack.css`; the scroll-into-view and URL-sync logic lives in `apps/patterns/src/components/StackManager.tsx` and
`apps/patterns/src/lib/stack-store.ts`.

A behavioural invariant to preserve: at the leftmost scroll position the first panes are fully visible and later panes are progressively clipped then spined — a partly-visible pane is _never_ overlapped by the next one.

## Profile sidecars

`.profile.ts` sidecars live co-located with their MDX file, using the same
filename stem (e.g. `undo.profile.ts` alongside `undo.mdx`). The extractor
reads them for structured edge data. The relationship is the same as in
Storybook — the sidecar is an optional companion, not a requirement.

## Document structure

Standard section order for pattern MDX:

1. YAML frontmatter
2. Fun meter (optional but encouraged): a short reflection on intellectual
   engagement with the topic — inversely proportional to how established and
   well-documented the area is
3. `# Title` with a one-sentence definition framed from the human situation
   inward, not from the component outward
4. Core content (varies by pattern type)
5. `## Related patterns` with subcategory headings (_Precursors_,
   _Follow-ups_, _Complementary_, _Tangentially related_, or custom subcategories
   when they better name the relationship)
6. `## Resources & references` for external sources (optional)
