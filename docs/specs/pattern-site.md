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

## APG-style splits: name the move, not the widget

When a pattern entry mixes move-level content (situation, forces, consequences,
edges) with mechanism-level content (props, states, anatomy, keyboard, ARIA),
it should be split:

- The _move_ portion is authored as a pattern-site entry named after the
  interaction move it describes, not the widget that implements it. Example:
  "Constrained selection" rather than "Combobox".
- The _mechanism_ portion stays as a component in `packages/components/` under
  the existing widget name.

The naming principle: _what the actor is doing_, not _what the UI element is
called_. This applies to all APG-style controls that earn a pattern-language
entry.

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
