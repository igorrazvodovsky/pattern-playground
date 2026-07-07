# Workspace layout specification

The repository is a single npm workspace root with one library package and two
runnable apps.

## Package structure

```
packages/
└── components/             Component library — Lit + React components, Storybook (:6006)

apps/
├── patterns/               Pattern language site — Astro (:4321)
└── server/                 Express backend — Node.js + OpenAI (:3000)

scripts/                    Workspace-level scripts (extract-graph-data.ts)
docs/                       Agent-facing knowledge base (workspace-level)
plans/                      Executable specifications (workspace-level)
references/                 Research inputs and bibliography
```

`packages/` holds libraries you import from. `apps/` holds runtimes you run.
`scripts/`, `docs/`, `plans/`, and `references/` are workspace-level: they
serve all packages and are not co-located with a single workspace.

## What each workspace owns

### `packages/components/`

- Web Components (Lit, `pp-` prefix) and React compositions
- Design tokens, global CSS, type scale
- Storybook config and component-facing stories
- `register-all.ts` and the custom-element registry
- Component-specific services and hooks
- The bilingual substrate for `role:foundation` and `role:quality` entries
  (CSS layers, token files, modality CSS) — the _implementation_ side of
  bilingual entries

### `apps/patterns/`

- Pattern MDX/MD files (`role:pattern`, `role:collection`, `role:quality`,
  `role:foundation`)
- Astro site config, page routes, layouts, site-specific components
- Content collection schemas (zod-validated frontmatter)
- Generated graph data (`pattern-graph.json`, `activity-levels.json`)
- Graph extractor output consumed at build time
- The bilingual _language_ side of `role:foundation` and `role:quality` entries

### `apps/server/`

- Express backend (was `server/` at repo root)
- OpenAI API integration, handlers, middleware
- No behavioral change from the move; the path change is structural only

## Shared demos (`packages/components/src/demos/`)

Runnable demonstration components live in `packages/components/src/demos/`. A single demo is frequently consumed by _both_ surfaces and by more than one pattern page — the bubble-menu demo, for instance, is shared by the text-lens, explanation, and commenting pattern pages and by Storybook.
Co-locating demos with the components they wire lets one source feed both
surfaces: Storybook stories import them by relative path, and pattern-site MDX
imports them through the package surface (`@pkg/demos/*`) wrapped in
`<Demo client:only="react">`.

This supersedes the `apps/patterns/src/components/demos/` location named in the
earlier [pattern-demos-migration](../../plans/active/2026-05-pattern-demos-migration.md)
and [collection-move-demos](../../plans/completed/2026-05-collection-move-demos.md)
plans. Those plans assumed each demo was pattern-site-only; the shared-consumption
case moved the home into the components package.

### What `demos/` may and may not hold

- _May hold:_ demo wiring — composition of library components with sample data,
  local state, and layout, plus hooks or glue whose only consumer is a demo.
- _May not hold:_ anything imported by production component code. If
  `components/` imports it, it is substrate and lives in `components/` (or a
  service/util), never in `demos/`.
- _Grey zone — reusable substrate with only a demo consumer:_ a
  framework-agnostic engine or an editor extension may live _temporarily_ in
  `demos/` while the demo is its sole consumer. It is _tagged for promotion_ to
  its structural home in the component library — `components/editor-plugins/<name>/`
  for an editor extension, a service or util for a pure engine — the moment a
  second consumer appears or the capability ships as a real component. `demos/`
  is a parking lot for un-promoted mechanism, not its permanent address.

The distinction is altitude, not reuse-in-principle: the question is not "could
this be reused" but "does anything other than the demo depend on it today."
Building a public API for a single demo consumer is speculative generality;
promotion is trigger-gated.

### Promotion register

Known un-promoted substrate is recorded so the intent is not lost when the
trigger eventually arrives. Current entries:

- The `dynamic-hyperlinks/` demo's n-gram engine (`ngram.ts`) and heatmap Tiptap
  extension (`HeatmapPlugin.ts`) — promotion target and trigger captured in
  [2026-05-heatmap-ngram-promotion](../../plans/active/2026-05-heatmap-ngram-promotion.md).

## Workspace dependency direction

`apps/patterns` → `packages/components` (workspace dep: `@pattern-plgrnd/components`)
`apps/server` → (no workspace dep; standalone Express app)

The components package exports a public API via its `package.json` `exports`
field. Pattern pages that embed live component examples import only what the
components package exports. The boundary is workspace-internal; the package is
not published to npm.

## Scripts directory

`scripts/extract-graph-data.ts` stays at the workspace root because it reads
from both workspaces: pattern content from `apps/patterns/src/content/` and (in
the stage-2 combined data model) component metadata from `packages/components/`.
Moving it into `apps/patterns/` would be correct under stage 3 (linked
datasets), when component data separates into its own manifest. That migration
is out of scope for this spec.

## Bilingual entries

`role:quality` and `role:foundation` entries are _bilingual_: they have one
foot in the pattern language and one foot in the component substrate.

- The _language entry_ lives in `apps/patterns/src/content/patterns/` — what
  the quality or foundation _is_ as a design concept, with edges to patterns
  that enact it.
- The _substrate_ (CSS tokens, type scale, modality CSS, design-token JSON)
  lives in `packages/components/`.
- Component Storybook pages that reference qualities or foundations currently
  link to Storybook URLs. When the cross-surface reference scheme is
  established, those links will point to pattern-site routes. Until then,
  the `qualities/` and `foundations/` folders in `packages/components/src/stories/`
  retain their MDX pages as Storybook documentation for the substrate side;
  they are not removed until those inbound links are rewritten.
