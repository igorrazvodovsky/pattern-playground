---
title: "Post-split automation residue"
status: "completed"
kind: "exec-spec"
created: "2026-07-11"
last_reviewed: "2026-07-12"
area: "automation, ci, server"
promoted_to: ""
superseded_by: ""
depends_on: "plans/reviews/reconciliation-2026-07-11.md (divergence 5)"
---
# Post-split automation residue

Spawned by the 2026-07-11 reconciliation
(`plans/reviews/reconciliation-2026-07-11.md`, divergence 5). Completed
2026-07-12.

## Problem

The workspace split moved all source out of the repo root, but several
automation surfaces still assumed the pre-split layout:

- `scripts/check-taxonomy-sync.mjs` read root `src/stories`, which no longer
  exists — the script crashed with ENOENT, so the `docs-integrity` PR
  workflow failed on every PR.
- `.github/workflows/claude-code-review.yml` path-filtered on root `src/**`,
  which matched nothing post-split — the review silently never triggered.
- `npm run build` copied `storybook-static` into
  `apps/patterns/public/storybook`, but `astro.config.mjs` sets `publicDir`
  to root `public/` — the copy fed only the cross-reference validator's
  fallback path, and `/storybook` never reached `dist/`.
- The hand-synced mirror of `pattern-graph.json` / `activity-levels.json` in
  `packages/components/src/` could drift silently from the canonical copy in
  `apps/patterns/src/data/`.
- `apps/server` CORS origins still named pre-split ports.
- `scripts/check-classification-health.mjs` read root `src/pattern-graph.json`
  (same ENOENT species, found during implementation) — the mid-month
  classification-health workflow would have crashed.

## Resolutions

1. *Taxonomy sync check retired.* Repointing the script at
   `packages/components/src/stories/` could not fix it: its reference doc,
   `docs/project/storybook-taxonomy.md`, was deliberately retired
   (90975510, 2026-06-02), and the catalogue's buckets now live in story
   titles, not directories — the directory↔doc seam the script checked no
   longer exists. Script and workflow step deleted. If the category set
   recorded by [2026-07-storybook-rebucketing.md](../active/2026-07-storybook-rebucketing.md)
   step 1 wants automated enforcement, a successor check (story titles
   against the recorded set) attaches there.
2. *Review workflow repointed.* `claude-code-review.yml` now path-filters on
   `apps/**`, `packages/**`, `shared/**`, and `scripts/**` sources (including
   `.astro`).
3. */storybook adjudicated: validator-only.* Nothing on the site links to a
   relative `/storybook` (ComponentRef uses `PUBLIC_STORYBOOK_URL`), so the
   copy never was a deployed route. The build step is now
   `build:storybook-index`: it caches only `index.json` into
   `apps/patterns/storybook-index/` (gitignored, never deployed), and the
   validator's fallback reads it there. The `public/storybook` copy is gone.
4. *Graph mirror kept, drift made loud.* Importing the canonical site copy
   from `packages/components` would invert the workspace dependency boundary
   (packages must not import from apps), so the mirror stays.
   `scripts/check-graph-mirror.mjs` compares both copies of both files and
   fails the `docs-integrity` workflow on drift; `npm run extract-graph`
   regenerates both. `check-classification-health.mjs` repointed at the
   canonical `apps/patterns/src/data/pattern-graph.json`.
5. *CORS swept.* `localhost:7007` (React Storybook, retired) and
   `localhost:3000` (pre-split dev app; also the server's own port) removed;
   `localhost:4321` (patterns site dev) added alongside `localhost:6006`
   (Storybook).

## Verification

- `node scripts/check-graph-mirror.mjs` and
  `node scripts/check-classification-health.mjs` run green from the root.
- Standalone site build with `storybook-static` absent resolves the validator
  against the `storybook-index` fallback and builds all pages.
