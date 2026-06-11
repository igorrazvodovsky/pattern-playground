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
folders. Every file needs at least `title` and `role`:

```yaml
---
title: "Pattern name"
role: pattern
activityLevel: operation       # AT altitude (operation | action | activity)
lifecycle: seeking             # optional Seek–Use–Share stage
domain: data-visualization     # optional domain corpus
group: "conversation/sequence-management"  # optional nav sub-grouping path
atomic: pattern
mediation: individual
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

## Document structure

Standard section order:

1. YAML frontmatter
2. Fun meter (optional): a short reflection on intellectual engagement —
   inversely proportional to how established and documented the area is
3. `# Title` (sentence case) with a one-sentence definition framed from the
   *human situation inward*, not from the component outward
4. Core content (varies by role: pattern, quality, foundation, umbrella)
5. `## Related patterns` with subcategory headings
6. `## Resources & references` (optional)

## Writing style

- Frame descriptions from the *human situation inward*, not from the
  implementation outward. Start with what the actor is doing or experiencing.
- British spelling (behaviour, organisation, colour).
- Sentence case for headings and titles.
- Prefer conciseness; each sentence should add new information.

## Move naming

Name a pattern by the interaction move, not the component that implements it:
"Transient feedback", not "Toast". The name must apply to any valid
implementation of the move, and must not share its head noun with an unrelated
existing entry (see the decomposition rule in
`docs/specs/pattern-role-model.md`).
