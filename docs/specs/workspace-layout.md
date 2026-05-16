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

- Pattern MDX/MD files (`role:pattern`, `role:umbrella`, `role:quality`,
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
