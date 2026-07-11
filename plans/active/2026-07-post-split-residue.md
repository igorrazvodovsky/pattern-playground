# Post-split automation residue

Status: outline — step 1 actionable now, steps 3–4 need adjudication.
Spawned by the 2026-07-11 reconciliation
(`plans/reviews/reconciliation-2026-07-11.md`, divergence 5).

## Problem

The workspace split moved all source out of the repo root, but several
automation surfaces still assume the pre-split layout:

- `scripts/check-taxonomy-sync.mjs` reads root `src/stories`, which no longer
  exists — the script crashes with ENOENT, so the `docs-integrity` PR
  workflow fails on every PR.
- `.github/workflows/claude-code-review.yml` path-filters on root `src/**`,
  which matches nothing post-split — the review silently never triggers.
- `npm run build` copies `storybook-static` into
  `apps/patterns/public/storybook`, but `astro.config.mjs` sets `publicDir`
  to root `public/` — the copy feeds only the cross-reference validator's
  fallback path, and `/storybook` never reaches `dist/`.

Adjacent debt of the same species:

- The hand-synced legacy mirror of `pattern-graph.json` /
  `activity-levels.json` in `packages/components/src/` (the extractor labels
  it legacy; sync commits already exist).
- `apps/server` CORS origins still name pre-split ports.

## Steps

1. Fix `check-taxonomy-sync.mjs` to read
   `packages/components/src/stories/`. Coordinate with
   [2026-07-storybook-rebucketing.md](./2026-07-storybook-rebucketing.md),
   which is reshaping the buckets the script checks — land the fix against
   the post-rebucket taxonomy or make it tolerant of both.
2. Repoint the `claude-code-review.yml` path filter at the workspace roots,
   or retire the workflow deliberately.
3. Adjudicate `/storybook`: either it is meant to deploy with the site (wire
   the copy into the directory Astro actually serves) or the copy is
   validator-only and should say so — move the fallback out of `public/` and
   drop the pretence of a deployed route.
4. Decide the graph-JSON mirror's future: import from the canonical site copy
   via alias, or keep the mirror and give it a sync check so drift is loud.
5. Sweep `apps/server` CORS origins to the post-split ports.
