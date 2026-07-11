# Episode map — split-project

First review artifact for the Loop 1 recursive run (`/move-review`), per
`plans/active/2026-07-review-practice.md`.

- Branch: `split-project` (168 commits, 983 files, +46 871 / −28 449)
- Merge-base with `main`, pinned: `ef66e6a852ff04cc9de2f64b8734fa4fe97c1d7c`
- Segmentation: by plan trail; commits answering to no plan cluster into
  unplanned episodes by theme and proximity. Episodes are numbered by
  *stakes descending* — read and judge them in file order, one episode per
  sitting.

## Episodes

| # | Episode | Answers to | Territory | Depth |
|---|---------|-----------|-----------|-------|
| 01 | Relationship vocabulary | `plans/completed/2026-07-relationship-vocabulary.md` | `docs/language/relationship-vocabulary.md`, `docs/specs/graph-relationship-model.md`, content frontmatter edges, `research/situation-constructs` | full |
| 02 | Typed relationships | `plans/completed/2026-06-typed-relationships.md` | relationship frontmatter schema + migrations across `apps/patterns/src/content/`, RelatedPatterns component, build tooling, `docs/language/` | full |
| 03 | Workspace split arc | `plans/completed/2026-05-workspace-split.md`, `…-workspace-split-audit.md`, `plans/completed/2026-07-workspace-split-closure.md` | `packages/`, `apps/` creation, territory closures T2–T6, cross-reference validator, dependency boundary, data-viz corpus split, root config | full |
| 04 | Content migration & flattening | `plans/completed/2026-06-flatten-pattern-content.md`, `plans/completed/2026-07-intra-site-link-validation.md`; the "Move <pattern>" sweep answers to the split's content territories | `apps/patterns/src/content/` additions, `src/stories/` deletions, PatternRef rewrites, link validation | full |
| 05 | Site surfaces | `plans/completed/2026-05-pane-spine.md`, `…-cross-surface-nav.md`, `…-sidebar-react.md`; archived: hash-anchor-stacked-notes, cross-surface-links, embed-components, shell-island-refactor | `apps/patterns/src/` layout, styles, pages, nav, link preview, component embedding, shell island | medium |
| 06 | Component reshaping | `plans/completed/2026-05-switch-component.md`, `plans/completed/2026-05-collection-move-demos.md`, `plans/active/2026-05-pattern-demos-migration.md`; combobox/form splits, radio, umbrellas, utilities bucket largely unplanned | `packages/components/src/`, demos substrate, Storybook organisation | medium |
| 07 | Research & new pattern entries | *unplanned episode* (research skill runs; no plan files) | `research/workflow`, `research/block-based-editing`, workflow pattern first stab, keyboard-shortcut pattern, semantic-zoom entry | light |
| 08 | Toolchain | *unplanned episode* (Astro 7 upgrade ran as its own PR #23; the rest is drive-by) | Astro/Vite/ESLint/tsconfig config, dependency bumps, prebundling | light |

## Standing findings from the map itself

- Episodes 07 and 08 answer to no plan on record. Per the practice, an
  unplanned episode is a finding before its review runs. 08 is arguably
  covered by the astro-7-upgrade branch's own PR review; 07 has research
  artifacts but the *pattern entries* they seeded landed without a plan.
- Three plans in one episode (03) reflects one arc — split, audit,
  closure — not three independent efforts; segmenting them apart would
  re-adjudicate the same territory three times.

## Coverage

Every episode needs a written verdict file before the composition pass
(`/move-review compose split-project`) may run.

| # | Episode | Walkthrough | Verdicts written |
|---|---------|-------------|------------------|
| 01 | Relationship vocabulary | ✓ (6 moves) | ✓ 2026-07-11 (5 accept, 1 reframe) |
| 02 | Typed relationships | ✓ (7 moves) | ✓ 2026-07-11 (5 accept, 2 fix) |
| 03 | Workspace split arc | ✓ (7 moves) | ✓ 2026-07-11 (7 fix) |
| 04 | Content migration & flattening | ✓ (6 moves) | ✓ 2026-07-11 (2 accept, 3 fix, 1 reframe) |
| 05 | Site surfaces | ✓ (6 moves) | ✓ 2026-07-11 (3 accept, 3 fix) |
| 06 | Component reshaping | ✓ (7 moves) | ✓ 2026-07-11 (5 accept, 2 fix) |
| 07 | Research & new pattern entries | ✓ (5 moves) | ✓ 2026-07-11 (2 accept, 3 fix) |
| 08 | Toolchain | ✓ (4 moves) | ✓ 2026-07-11 (3 accept, 1 fix) |
