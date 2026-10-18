---
title: Refactoring sweep
status: active
kind: work-queue
created: 2026-10-17
last_reviewed: 2026-10-18
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
3. Consolidation (done 2026-10-18; the command menu question remains).
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

- [x] *OpenAI calls rejected by the configured model* (checked 2026-10-18).
  `gpt-5.6-luna` refuses `max_tokens` and any `temperature` other than 1, so
  every AI endpoint except the text lens failed. The four calls in
  `services/openai.ts` now send `max_completion_tokens` and no `temperature`;
  all five endpoints answer against the live model.

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
- *CSS:* `pagination.css`, the `drawer--narrow/--wide/--full-height` modifiers;
  the class-less `.stack` wrapper in `demos/deletion.tsx`.
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
- `.flex-layout-grid`: a layout utility kept for authoring, even though no
  markup uses it at the moment.
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

- [x] *API client.* `services/api-client.ts` replaces `api-endpoint.ts` and
  `api-error.ts`. It holds `apiEndpoint`, `APIError`, `postJSON<T>` (typed by
  `ApiResponse<T>`, with an optional session-storage cache key) and
  `streamSSE`. All five services go through it. `streamSSE` also fixes three
  faults in the old read loops: an event split across two reads was dropped,
  an `error` event was caught by the parse guard and only logged, so `onError`
  never ran, and `complete` left only the inner loop. A stream that closes
  before `complete` now rejects instead of reporting partial text as finished,
  and the body is cancelled when reading stops. A non-OK response carries the
  server's error message, with the invalid fields for a validation failure.
  `api-client.test.ts` covers these cases. The streaming
  services no longer clear a newer stream's abort controller when an older one
  finishes.
- [x] *Server handlers.* `handlers/shared.ts` holds `withTimeout`, `ok` and
  `BoundedCache`. Every handler parses with its zod schema and lets `ZodError`
  reach the error handler (checked: each endpoint answers 400 with
  `validationErrors`). `suggestions.ts` validates with a new
  `suggestionRequestSchema`. The two SSE writers in `services/streaming.ts`
  became one `streamSSE`, which also stops generating when the client
  disconnects (it used to run to the 30 s timeout). The two identical chunk
  types became one `StreamChunk`.
- [x] *Charts.* `ChartComponent` owns item-by-item keyboard navigation: a
  chart that sets `itemNavigationName` becomes a focusable image whose arrow
  keys, Home and End move through `itemCount()` items, announcing
  `describeItem(i)`, and Enter or Space calls `activateItem(i)`; `onItemFocus(i)`
  runs after each move (the choropleth emits `pp-choropleth-focus` there). The bar chart,
  scatter plot and choropleth implement those three hooks; the network graph,
  which focuses its own nodes, leaves the name unset. Activation now passes the
  real `KeyboardEvent` as `originalEvent` rather than a synthetic click (no
  consumer reads it). The choropleth's spoken name is "Map", so its label
  before the first render reads "Map" rather than "Choropleth".
- [x] *`scripts/lib/`.* `scripts/lib/files.ts` holds `repoRoot`, `walkFiles`,
  `frontmatterBlock`, `parseFrontmatter` and `stripFrontmatter` (one regex,
  `\r?\n` throughout). It is erasable TypeScript, so the `.mjs` scripts import
  it directly under Node's type stripping. Every script finds the repo root
  through it, which also fixes `check-seed-staleness.mjs` reading from the
  working directory. `replay.ts` imports `Fact` and `ActionRecord` from
  `shared/data/action-types.ts`. Two copies stay on purpose:
  `validate-cross-references.ts` is an Astro integration inside
  `apps/patterns`, which should not depend on workspace-level scripts, so it
  keeps its own walker and one local frontmatter reader (both of its copies
  now go through it); and `kindOf` stays in both `replay.ts` and
  `world-views.ts`, because the replay generates the `facts.json` that
  `world-views.ts` reads.
- [x] *Reference resolution.* `shared/data/index.ts` has one
  `referenceSources` table; `referenceCategories`, `basicReferenceCategories`
  and `resolveReferenceData` all build items through `toReferenceItem`. The
  categories are unchanged. `resolveReferenceData` now returns the reference
  type (`material`) rather than the entity's own subtype (`metal`), which
  `Reference.tsx` cast to a `ReferenceType` it was not; it no longer returns
  `description` or a quote's `content`, which nothing read.
- [x] *Patterns site navigation.* `lib/nav-tree.ts` builds the sidebar tree and
  exports the types `Nav.tsx` uses. Pattern and sequence URLs go through
  `panePath()`. `pane-path.ts` gained `normalisePath` (replacing the strippers
  in `active-path.ts`, `pattern-graph-hover.ts` and `parsePanePath`) and
  `paneIndexOf(el)` (replacing five `parseInt(dataset.paneIndex)` reads).
  `lib/sequence.ts` exports `bySequenceOrder` and `sequenceAppearances()`,
  which caches the appearance index against the sequences' content digests.
  `lib/site.ts` holds the Storybook URL and the site locale, which `Nav.tsx`
  and `ComponentRef` import directly. `buildNavTree()` caches the tree against
  both collections' content digests. `humaniseSlug`
  replaced the nav's `sentenceCase`. The built HTML is unchanged.
- [x] *Modal service.* `openDrawer` and `openDialog` build their surface and
  hand it to one private `mount`; the element is opened after
  `customElements.whenDefined('pp-modal')`, since `open()` needs only the
  upgraded element. If the element is not defined within two seconds, the
  surface is torn down and the error logged.
- [x] *Hierarchical navigation.* `types/hierarchical-navigation.ts` keeps only
  the item types and imports its bases from `utility/hierarchical-search.ts`;
  the hook's config, state and result types live with the hook, and
  `HierarchicalSearchResults` is declared once, in the search utility. The hook
  reads the latest config through a ref, so the search re-runs only when the
  query, context or data change, and its actions keep stable identities.
- [ ] *Command menu navigation.* `use-command-navigation.ts` keeps its own
  two-mode state rather than using `useHierarchicalNavigation`: it has no
  debounce, selects leaf commands directly, and filters recent items. Folding
  it in would need hook options for each, and would change how the menu
  behaves. Decide whether that is wanted.
- [x] *tldraw math nodes.* Left as they are. `src/tldraw/` is tldraw's workflow
  starter kit (its formatting, `WorkflowValue`, the same node set including
  Earthquake), and keeping the nodes as written keeps them comparable with
  upstream.
- [x] *`templates/collection-view/renderers`.* Split into a folder: `shared.ts`
  (coupling types and identity helpers), `entity-card.tsx`,
  `entity-detail.tsx`, `card.tsx`, `table.tsx`, `map.tsx`, `plot.tsx`,
  `board-lanes.tsx`, and `index.tsx` with the registry and `ViewSpecRenderer`.
  Import paths are unchanged.
- [x] *Article shell.* `ArticleShell.astro` holds the `<article>`, pagefind
  attributes, header and `pp-toc` pair; `PatternArticle` and `SequenceArticle`
  fill its `meta` slot and body. The commented-out badges are now source
  comments, so they no longer ship in every page's HTML.

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
- [x] *Server validation messages.* Done with the server-handler
  consolidation.
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
