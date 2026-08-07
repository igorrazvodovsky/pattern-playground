# Workspace layout specification

The repository is a single npm workspace root with one library package and two
runnable apps.

## Package structure

```
packages/
└── components/             Component library — light-DOM + React components, Storybook (:6006)

apps/
├── patterns/               Pattern language site — Astro (:4321)
└── server/                 Express backend — Node.js + OpenAI (:3000)

shared/                     Fixture-data workspace (@pattern-plgrnd/shared) — sample
                            entities both surfaces render; belongs to neither language

scripts/                    Workspace-level scripts (extract-graph-data.ts)
docs/                       Agent-facing knowledge base (workspace-level)
plans/                      Executable specifications (workspace-level)
references/                 Research inputs and bibliography
```

`packages/` holds libraries you import from. `apps/` holds runtimes you run.
`shared/` is a third workspace for fixture data both surfaces consume — placed
at root because homing it in either package would invert a boundary.
`scripts/`, `docs/`, `plans/`, and `references/` are workspace-level: they
serve all packages and are not co-located with a single workspace.

## What each workspace owns

### `packages/components/`

- Light-DOM Web Components (`pp-` prefix; authoring contract in
  [component-authoring.md](./component-authoring.md)) and React compositions
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

The tenancy is deliberate: demos are named for pattern-language moves but
import component source directly, and co-location with what they wire is the
load-bearing reason they live here rather than in a third place like
`shared/`. If demos ever stop importing components directly, that reason
lapses and the placement question reopens.
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
  is a parking lot for un-promoted components, not its permanent address.

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
`apps/patterns` → `shared` (workspace dep: `@pattern-plgrnd/shared`)
`apps/server` → (no workspace dep; standalone Express app)

The boundary is *documented edge plus convention*: consumers import raw
source through path aliases, and the workspace deps document the edge while
aliases do the resolution. There is no `exports` field — under path aliases
one would be inert, so it enforces nothing (workspace-split closure,
workstream 4 step 2). The observed public surface, recorded when an honest
`exports` field could be written if enforcement is ever wanted:
`@components/register-all.ts` (side-effect registration),
`@components/sidebar`, `@styles/*` (stylesheet entries), and `@pkg/demos/*`
(dynamic, through the demo registry). The site also imports
`@components/charts/network-graph` and `@components/charts/base/chart-types`
for typing only — erased at build, so they are a source-level coupling rather
than part of the runtime surface.
pnpm's phantom-dep isolation is the future enforcement lever if convention
proves insufficient; the package is not published to npm.

## Cross-surface integrity

The build-time cross-reference validator
(`apps/patterns/integrations/validate-cross-references.ts`) gates all
reference seams — site→Storybook (`<ComponentRef id>` and frontmatter
`realised_by` against `index.json`), Storybook→site (`<PatternRef slug>`
against content stems), and site→site (`/patterns/` links) — and it runs in
the *site* build by design, not by accident: the pattern site is the
synthesis surface, so its build vouches for both languages. A bare
`build-storybook` is unchecked and may drift; the canonical root build
(Storybook first, then site) is the single gate that closes the loop.

## Scripts directory

`scripts/extract-graph-data.ts` stays at the workspace root as workspace-level
tooling: under the settled language-only graph (stage 3) it reads only
`apps/patterns/src/content/` and writes only `apps/patterns/src/data/`. It once
wrote a second copy into `packages/components/src/` for a Storybook component
that read the graph; that component is gone, nothing in the package reads the
data, and the copies and their sync check were removed with it. `scripts/`
hosts the other workspace-level checks, so root residency is the pattern, not
an exception.

## Bilingual entries

`role:quality` and `role:foundation` entries are _bilingual_: they have one
foot in the pattern language and one foot in the component substrate.

- The _language entry_ lives in `apps/patterns/src/content/patterns/` — what
  the quality or foundation _is_ as a design concept, with edges to patterns
  that enact it.
- The _substrate_ (CSS tokens, type scale, modality CSS, design-token JSON)
  lives in `packages/components/`.

A foundation earns its language foot by carrying an _interaction-design
concept_ — material that shapes how activity unfolds (assistance, delegation,
modality, prose). Visual material (colour, iconography, layout, motion,
typography) is substrate-only: its Storybook pages carry `role:component` and
no language entry exists or is owed. The workspace-split closure settled this
(workstream 1); the five material pages' former "Concept:" links to
never-built language entries were removed 2026-07-11.
