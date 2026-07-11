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

Decision on both: embed for illustrative demos; link for fuller docs. A lightweight `<Demo>` wrapper provides the embed surface. A `<ComponentRef>` inline component plus a `PUBLIC_STORYBOOK_URL` env var provide the link surface. Neither requires per-author imports — both are wired as global MDX components.

This is a substrate-only plan. Migrating existing Storybook story demos to the pattern site is a separate task: see `plans/active/2026-05-pattern-demos-migration.md`. That plan depends on this one being complete.

## What already works (no changes needed)

`register-all.ts` is a side-effect import in `Base.astro`. Custom elements registered there self-upgrade anywhere on the page, including inside MDX. Authors can already write:

```mdx
The undo trigger is typically a button:

<pp-button>Undo</pp-button>
```

and it will render. The plan establishes this as a *documented* convention, adds a framed wrapper for fuller demos, and adds inline component references.

## Files to create

### `apps/patterns/src/components/Demo.tsx`

A framed demo sandbox. Props:

- `children` — the live markup/components to display
- `label?` — short caption displayed below the demo
- `storyId?` — Storybook story ID (e.g. `"operations-undo--docs"`); when present renders a "View in Storybook" link using `PUBLIC_STORYBOOK_URL`

Style: a bordered, lightly padded box. Class `demo-block`. Keep it minimal — not a Storybook canvas replacement.

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

Add `.demo-block` styles: border using `var(--border)`, rounded corners, padding `var(--space-m)`, background `var(--c-surface)`.

## Files to modify

### `apps/patterns/src/pages/patterns/[...slug].astro`

Import `Demo` and `ComponentRef`. Change:

```astro
const { Content } = await render(entry);
```

to:

```astro
import { Demo } from '../../components/Demo';
import { ComponentRef } from '../../components/ComponentRef';
const { Content } = await render(entry, { components: { Demo, ComponentRef } });
```

No import needed in MDX files — both components are globally available.

### `.claude/rules/pattern-content.md`

Add a new section *Component embeds* after the *Inter-page link format* section:

```md
## Component embeds

Custom elements registered via `register-all.ts` are available on every page.
Write tags directly in MDX for short inline illustrations:

    <pp-button>Undo</pp-button>

Use `<Demo>` for a framed demo sandbox (no import needed):

    <Demo label="Undo trigger" storyId="operations-undo--docs">
      <pp-button>Undo</pp-button>
    </Demo>

Use `<ComponentRef>` for inline prose references to Storybook component pages
(no import needed):

    the <ComponentRef id="actions-application-button--docs">Button</ComponentRef> component

Do not hardcode localhost:6006 URLs in content — use `<ComponentRef>` or `storyId`
on `<Demo>`, both of which read `PUBLIC_STORYBOOK_URL`.
```

### One verification page

Add a single `<Demo>` and one `<ComponentRef>` to an existing pattern page to prove both components work end-to-end. `operations/state-empty.mdx` is the natural candidate — it already has inline `pp-button` usage; wrapping one of the existing blocks in `<Demo>` is a minimal change that proves the mechanism. This is substrate verification, not the start of a migration effort.

## Out of scope

- Migrating any Storybook story demos to the pattern site — that is `2026-05-pattern-demos-migration.md`
- Story audit and classification
- Building a Storybook-equivalent docs surface inside the pattern site
- PatternGraph island (separate plan)
- Unmigrated foundations/material subtree (Color, Typography, Motion) — those pages don't exist yet
- Stage 3 of the data-model arc (linked datasets / component-manifest.json)

## Verification

1. `cd apps/patterns && npm run dev` — site starts on port 4321
2. Navigate to the verification page — `<Demo>` renders a bordered box with a live component inside
3. The custom element behaves correctly (button responds to click/keyboard)
4. The `storyId` link on `<Demo>` opens the correct Storybook URL
5. `<ComponentRef>` renders as a working link to the Storybook component page
6. `npm run build` exits cleanly — no TypeScript errors, no broken imports
