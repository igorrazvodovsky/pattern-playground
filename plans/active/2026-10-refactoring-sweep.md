---
title: Refactoring sweep
status: active
kind: work-queue
created: 2026-10-17
last_reviewed: 2026-10-17
area: packages/components, apps/patterns, apps/server, scripts, shared, utils
promoted_to:
superseded_by:
---

# Refactoring sweep

A survey of refactoring opportunities across the code workspaces, taken on
2026-10-17. Four areas were surveyed separately (component library code;
stories, demos and styles; the patterns site and server; scripts, `shared/` and
`utils/`), then the leading claims were re-checked by hand. Items already on
[tech-debt-tracker.md](../tech-debt-tracker.md) are left out.

Line numbers are as of the survey date. Claims not marked *checked* come from
the survey and should be confirmed before acting.

## Order

1. Bugs (done 2026-10-17).
2. Dead-code sweep (done 2026-10-17; three keep-or-retire decisions remain).
3. API client and server handlers together, since both sides share the
   `{success, data, error}` shape.
4. Template extractions (stat tile, card list, overview-plus-detail) — these are
   design calls, one sitting each.
5. Convention fixes, as they come up or batched per territory.

## 1. Bugs

- [x] *Server error handler registered before the routes* (checked).
  `setupMiddleware` added `errorHandler`, and `server.ts` called it before
  `setupRoutes`, so `AppError` and `ZodError` fell through to Express's default
  HTML 500. The handler is now registered after the routes.
- [x] *TemplateField states had no styles* (checked). `tiptap.css` has been
  commented out of the cascade since 2025, and every colour token it uses
  belongs to a retired token system (`--color-*`), so it styles nothing even if
  loaded. TemplateField sets `--editing`, `--invalid`, `__label` and `__error`,
  which had rules only there; the validation message rendered inline with no
  styling. Those four were rewritten in `reference.css` against current tokens.
- [ ] *Rest of `tiptap.css`.* Live classes still styled only there:
  `reference-mention--quote` (`Reference.tsx`; quote styling is open in
  [commenting open questions](2026-10-commenting-open-questions.md)),
  `rich-editor--prompt` (`demos/prompt.tsx`), `rich-editor-container`
  (`demos/bubble-menu.tsx`). Decide each, then delete the file; the remainder
  is older copies of `reference.css` rules and dead `quote-demo-*` and
  `.floating-menu` rules.
- [x] *AI services resolve the server endpoint inconsistently* (checked). Five
  copies of `get…Endpoint` disagreed on dev detection: two read
  `process.env.NODE_ENV`, which is undefined in the browser. Replaced by one
  `apiEndpoint(path)` in `services/api-endpoint.ts`.
- [x] *Failed link preview stays failed for the session* (checked).
  `link-preview.ts` cached `''` on a failed fetch and never evicted it, while
  `pane-content.ts` deliberately evicts failures. Empty results are now evicted.
  The second cache layer itself remains; see
  [link preview component extraction](2026-05-link-preview-component-extraction.md).

## 2. Dead code

Swept 2026-10-17, one territory at a time. Verified with `npm run test` (lint,
Stylelint, 277 Vitest tests), the server and root type checks, the demo
registry check, `extract-graph` (no change to the generated graph) and a full
site build.

Removed:

- *Components package:* the editor plugin loader, lazy wrapper, performance
  monitor, floating-menu slot, unused `plugin-manifest.json` and the copy-me
  `editor-plugins/template/` folder (`PLUGIN_DEVELOPMENT.md` updated);
  `schemas/index.ts`; `useImperativeModal`, `useDragToCreate`,
  `QuoteDrawerContent`; `stories/utils/reference-utils.ts`; the body scroll
  lock, `shimKeyframesHeightAuto`, per-element `setAnimation` (and the unused
  `el` argument of `getAnimation`), `appendToIndexList`,
  `addTaskHistoryEntry`/`updateTaskStatus`, `createNavigationSuggestionRequest`,
  `isIdentityAttribute` (not a duplicate of the private `isIdentity`, which
  takes a binding rather than a path). `utility/shadow-dom.ts` replaced in
  `dropdown.ts` by the light-DOM equivalents. The non-`<dialog>` fallback in
  `pp-modal`; every authored and generated modal wraps a `<dialog>`.
- *CSS:* `pagination.css`, the `drawer--narrow/--wide/--full-height` modifiers,
  `.flex-layout-grid`; the class-less `.stack` wrapper in `demos/deletion.tsx`.
- *Server:* `/api/generate` with its handler, stream function, OpenAI methods
  (including the hard-coded vector store id) and the juice-production schemas.
- *Patterns site:* `demoNames`/`specNames` exports (the verify script parses
  the source, not the export); `mountSpecDemos` and `PATTERN_GRAPH_HOVER_EVENT`
  made module-private.
- *Shared:* 51 unused exports from `shared/data/index.ts`, the unused helpers in
  `finders.ts` and `reference-utils.ts`, `comment-threads.json`,
  `editor-content.json`. `recent-items.json` now points at real world
  individuals (the waste stream became a component; there is no waste-stream
  kind).
- *`utils/`:* removed. `APIError` moved to `services/api-error.ts`; the
  `@utils` alias dropped from both tsconfigs, Vite/Astro/Vitest/Storybook
  config, ESLint and the testing-strategy doc.
- *Scripts:* `write-labels.ts`, `reference-index-prompt.mjs`,
  `audit-related-residue.mjs`, `check-agents-stub.mjs`,
  `check-classification-health.mjs`.

Kept on purpose:

- *Charts* (decided 2026-10-17): the axis/grid/legend primitives,
  `interaction-layers.ts`, the line/area/tree types, the `update*` renderer
  functions and `scaleCoordinator` stay as planned building blocks.
- `stepper__item--warning`: one of a set of status modifiers.
- `EpistemicStatus.astro`: the evidence badges are commented out, but the
  file's header describes them as intended design. Decide whether they return
  or go.
- `scripts/world/verify-views.ts`: listed in the `promoted_to` of
  `plans/completed/2026-08-world-regrounding.md` as residue. It will fail on the
  first new action that changes a view; decide whether it retires (and the
  completed plan's `promoted_to` is updated) or is rebased onto current views.
- The survey's `PatternArticle.astro:46-48` item was an explanatory comment,
  not dead code.

## 3. Consolidation

- [ ] *API client.* Grow `services/api-endpoint.ts` (and `api-error.ts`) into an `api-client.ts`:
  `streamSSE<T>` for the near-identical read loops in `explanation-service.ts`
  and `text-transform-service.ts`; `postJSON<T>` with an optional session cache
  for `model-deduction-service.ts` and `timeline-grouping-service.ts`; use the
  existing unused `ApiResponse<T>` (`types/common.ts:25`) instead of the inline
  response shapes.
- [ ] *Server handlers.* Extract `withTimeout`, `ok(res, data)` and a bounded
  cache; let `ZodError` reach the error handler instead of per-handler
  try/catch. `timeline.ts` and `modelDeduce.ts` are line-for-line twins.
  `suggestions.ts` redefines `ApiResponse` and validates by hand.
- [ ] *Charts.* Setup and keyboard handling are copied across `bar-chart.ts`,
  `scatter-plot.ts`, `choropleth.ts`; move into `ChartComponent` behind
  `itemCount()`, `focusItem(i)`, `activateItem(i)`. The `readyState` guard
  already exists in `D3Component`.
- [ ] *`scripts/lib/`.* Frontmatter parsing is written about seven times
  (`extract-graph-data.ts`, `check-seed-staleness.mjs`, `verify-demo-registry.mjs`,
  `check-plan-promotions.mjs`, `validate-cross-references.ts` twice, …) and the
  copies disagree on `\r?\n`. Folder walking is written four times; the repo
  root is found two ways. `replay.ts` redeclares `Fact` and `ActionRecord`
  instead of importing them from `shared/data/action-types.ts`, and `kindOf`
  is defined twice.
- [ ] *Reference resolution.* `resolveReferenceData` has eight near-identical
  switch arms; `referenceCategories` and `basicReferenceCategories` repeat one
  mapping. One `toReferenceItem` plus a `{type, list, icon}` table.
- [ ] *Patterns site navigation.* Move the ~90 lines of nav building out of
  `Base.astro` frontmatter into `lib/nav-tree.ts`, which also exports the types
  `Nav.tsx` re-declares. Route the hand-built pane URLs (`Base.astro`,
  `SequenceAppearances.astro`, `lib/sequence.ts`, `pages/sequences/[id].astro`)
  through `panePath()`. One `normalisePath` instead of three trailing-slash
  strippers. Memoise sequence appearances, now rebuilt on every pattern page.
  Smaller duplicates: `sentenceCase`/`humaniseSlug`, sequence ordering, the
  Storybook URL default, the `'en-001'` locale, `parseInt(dataset.paneIndex)`.
- [ ] *Modal service.* `openDrawer` and `openDialog` are near-copies;
  `waitForElementReady` polls with rAF where `customElements.whenDefined` would do.
- [ ] *Hierarchical navigation.* `types/hierarchical-navigation.ts` re-declares
  the hook's types and imports from `hooks/`; `HierarchicalSearchResults` is
  declared twice; `use-command-navigation.ts` re-implements the mode logic. The
  hook's memos depend on an inline `config`, so they recompute every render.
- [ ] *tldraw math nodes.* Add/Subtract/Multiply/Divide differ mostly by name; a
  `makeBinaryOpNode` factory. Check first whether this mirrors a tldraw example.
- [ ] *`templates/collection-view/renderers.tsx`* (647 lines): split per
  representation.
- [ ] *Article shell.* `PatternArticle` and `SequenceArticle` duplicate the
  pagefind attributes, header and `pp-toc` pair.

## 4. Template extractions

Design calls; one sitting each.

- [ ] *Stat tile.* `stories/Stat.stories.tsx` (`StatTile`) and
  `demos/purpose-keyed-view.tsx` (`MonitorTile` plus two inline copies). The
  story is already titled `Templates/Stat`.
- [ ] *Entity card list.* `cards--list > EntityCard` is written out eight times
  across demos; `CardRenderer` can't be reused because it needs a full spec.
  Also a shared overview-attributes constant (`['name','category','pricing.msrp']`
  in three demos, a `listedAt` variant in two).
- [ ] *Overview plus detail.* The same split with a `useFitsWidth` fallback in
  `overview-detail.tsx`, `FluidAttributesDemo.tsx`, `coordinated-views.tsx`.
  Several of these put `aria-label` on a plain `div`.
- [ ] *Small demo duplicates.* The deletable list in `deletion.tsx` and
  `transient-feedback.tsx`; `deletion.tsx`'s own `DeleteIconButton`;
  `BackButton` in `scaffold.tsx` can't take a ref, so `problem-curated-view.tsx`
  builds its own.

## 5. Conventions

- [ ] *Unwired checks* (checked): `check-story-buckets.mjs`,
  `check-style-boundary.mjs` and `verify-demo-registry.mjs` appear in no
  `package.json`, though `documentation.md:32` and `build-shadcn-css.mjs:21` say
  they enforce. Commit `eedbccc3` says the style-boundary check was wired into a
  docs-integrity workflow, but the repo has no `.github/` directory. Add to
  `lint` (demo registry with `--no-baseline`).
- [ ] *Server validation messages.* Handlers put the stringified zod issue array
  into `error` (e.g. `"[\n  {\n    \"expected\": …"`) instead of letting
  `ZodError` reach the error handler, which formats `validationErrors`. Fold
  into the server-handler consolidation.
- [ ] *Event names.* `modal:open`/`modal:close` and `breadcrumb-navigation` lack
  the `pp-` prefix and `composed: true`. Dropdown, popup and tooltip dispatch
  plain `Event` where the rest uses `CustomEvent`.
- [ ] *`role` as a JS hook* in `list.ts:90,260`. Widen the ESLint selector at
  `eslint.config.js:88`, which only checks `querySelector`/`closest`/`matches`.
- [ ] *Animation name collisions.* `toast.css` and `explanation.css` redefine
  `fade-in`, `fade-out`, `pulse` inside the components layer, overriding the
  theme keyframes behind `--animation-fade-out` and `--animation-pulse`.
  `chart-spin`, the tldraw spin and `skeleton-pulse` are near-copies of shared ones.
- [ ] *`explanation.css`* hard-codes about 17 spacing, radius and font-size values
  where tokens exist.
- [ ] *Stories.* Faker without shared data or a seed in twelve stories
  (`Dialog` args change every load; `Avatar` re-implements `getRandomFilledIcon`).
  Inline styles where `.flex` or the `centeredLayoutNarrow` decorator exist.
  The focus-trap play steps are copied between `Dialog` and `Drawer`; move to
  `stories/utils/play.ts` with `findOpenDrawer`. 73 stories carry `atomic:*`
  tags nothing reads; 66 use an unregistered `role:component` tag.
- [ ] *`pp-modal` close hook.* `modal.ts` finds close buttons by the
  `.close-button` class; use `data-close` only.
- [ ] *`mock-data.md`* still points authors at `src/stories/data/`, which no
  longer holds the shared data (`shared/data` does).
- [x] *Dropdown submenus from the keyboard.* `pp-list` focuses the first
  submenu item by looking inside the parent item, but `pp-dropdown` has by
  then moved the submenu into its own popup, so ArrowRight opened the submenu
  without entering it, and ArrowLeft inside it never reached the parent list.
  `pp-dropdown` now focuses the first item once the submenu popup shows and
  handles ArrowLeft on that popup. Selection inside a submenu did nothing
  either: `pp-list` dispatched `pp-select` without `bubbles`/`composed`, so
  neither the dropdown's close-on-select nor the submenu re-emit ran. It now
  bubbles; the submenu popup stops the original and re-emits it from the
  dropdown, and focus returns to the trigger as it does for top-level items.
- [ ] *TemplateField invalid state is unreachable.* `--invalid` and
  `__error` render only for a required field that is `filled` with an empty
  value, but submitting an empty value sets `filled: false`. Decide what should
  trigger the state (the demo's Validate button is the obvious candidate),
  then wire it.
- [ ] *`alert()` in the prompt demo.* `PromptTemplateDemo`'s Validate reports
  through `alert()`, which blocks the page. Show the result in the demo instead;
  this pairs with the TemplateField item above.
- [ ] *Small items.* `CommentingPlugin.ts` inlines its own reduced-motion check;
  hook file names mix camelCase and kebab-case; `link-preview.ts` keeps a
  second cache over `getPaneContent`.
