---
title: "Embed live components in apps/patterns"
status: "active"
kind: "exec-spec"
created: "2026-05-16"
area: "pattern-site"
---

# Embed live components in apps/patterns

## Context

The workspace split is complete. The Astro pattern site runs; patterns read from `apps/patterns/src/content/patterns/`; all 44 custom elements are already registered globally via `import '@components/register-all.ts'` in `Base.astro:55`. The infrastructure is ready but untouched: zero live component embeds exist in pattern content today. The one static occurrence (`state-empty.mdx`) writes raw `pp-button` markup with no hydration.

This plan closes two residual items from `plans/completed/2026-05-workspace-split.md`:

- *Open Question 10* — bilingual rendering for Foundations/Qualities: embed substrate previews or link to Storybook?
- *Phase D tail item 3* — cross-surface reference scheme (how pattern prose references Storybook component pages).

Decision on both: embed for illustrative demos; link for fuller docs. A lightweight `<Example>` wrapper provides the embed surface. A `<ComponentRef>` inline component plus a `PUBLIC_STORYBOOK_URL` env var provide the link surface. Neither requires per-author imports — both are wired as global MDX components.

## What already works (no changes needed)

`register-all.ts` is a side-effect import in `Base.astro`. Custom elements registered there self-upgrade anywhere on the page, including inside MDX. Authors can already write:

```mdx
The undo trigger is typically a button:

<pp-button>Undo</pp-button>
```

and it will render. The plan establishes this as a *documented* convention, adds a framed wrapper for fuller demos, and adds inline component references.

## Files to create

### `apps/patterns/src/components/Example.tsx`

A framed demo sandbox. Props:

- `children` — the live markup/components to display
- `label?` — short caption displayed below the demo
- `storyId?` — Storybook story ID (e.g. `"operations-undo--docs"`); when present renders a "View in Storybook" link using `PUBLIC_STORYBOOK_URL`

Style: a bordered, lightly padded box. Class `example-block`. Keep it minimal — not a Storybook canvas replacement.

### `apps/patterns/src/components/ComponentRef.tsx`

Inline prose reference to a Storybook component page. Props:

- `id` — Storybook story ID (e.g. `"actions-application-button--docs"`)
- `children` — link text

Renders as `<a href="${STORYBOOK_URL}/?path=/docs/${id}" target="_blank" rel="noopener">`. Reading `PUBLIC_STORYBOOK_URL` from `import.meta.env` with a fallback to `http://localhost:6006`.

### `apps/patterns/.env`

```
PUBLIC_STORYBOOK_URL=http://localhost:6006
```

Add `apps/patterns/.env` to `.gitignore` root entry if not already ignored; add `apps/patterns/.env.example` as the committed template.

### CSS in `apps/patterns/src/styles/app.css`

Add `.example-block` styles: border using `var(--border)`, rounded corners, padding `var(--space-m)`, background `var(--c-surface)`.

## Files to modify

### `apps/patterns/src/pages/patterns/[...slug].astro`

Import `Example` and `ComponentRef`. Change:

```astro
const { Content } = await render(entry);
```

to:

```astro
import { Example } from '../../components/Example';
import { ComponentRef } from '../../components/ComponentRef';
const { Content } = await render(entry, { components: { Example, ComponentRef } });
```

No import needed in MDX files — both components are globally available.

### `.claude/rules/pattern-content.md`

Add a new section *Component embeds* after the *Inter-page link format* section:

```md
## Component embeds

Custom elements registered via `register-all.ts` are available on every page.
Write tags directly in MDX for short inline illustrations:

    <pp-button>Undo</pp-button>

Use `<Example>` for a framed demo sandbox (no import needed):

    <Example label="Undo trigger" storyId="operations-undo--docs">
      <pp-button>Undo</pp-button>
    </Example>

Use `<ComponentRef>` for inline prose references to Storybook component pages
(no import needed):

    the <ComponentRef id="actions-application-button--docs">Button</ComponentRef> component

Do not hardcode localhost:6006 URLs in content — use `<ComponentRef>` or `storyId`
on `<Example>`, both of which read `PUBLIC_STORYBOOK_URL`.
```

### 2–3 showcase MDX pages

Update at least two existing content pages to demonstrate both embed shapes. Good candidates:

- `operations/undo.mdx` — add a short `<Example>` block in the *Structure* section showing the undo trigger button
- A quality or foundation page (e.g. `qualities/agency.mdx` or `foundations/modality.mdx`) — add an `<Example>` showing a live component that enacts the quality

Do not force examples onto pages that don't benefit — author discretion is the convention.

## Out of scope

- Building a Storybook-equivalent docs surface inside the pattern site
- Migrating all pattern pages — showcase only
- PatternGraph island (separate plan)
- Unmigrated foundations/material subtree (Color, Typography, Motion) — those pages don't exist yet
- Stage 3 of the data-model arc (linked datasets / component-manifest.json)

## Verification

1. `cd apps/patterns && npm run dev` — site starts on port 4321
2. Navigate to one of the updated showcase pages — `<Example>` renders a bordered box with a live component inside
3. Clicking the custom element behaves correctly (button responds to click/keyboard)
4. "View in Storybook" link on `<Example storyId="...">` opens the correct Storybook URL
5. `<ComponentRef>` renders as a working link to Storybook
6. `npm run build` exits cleanly — no TypeScript errors, no broken imports
