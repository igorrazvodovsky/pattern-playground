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

1. Bugs (done 2026-10-17; focus after a toast's Undo remains).
2. Dead-code sweep (done 2026-10-17; three keep-or-retire decisions remain).
3. Consolidation (done 2026-10-18; the command menu question remains).
4. Template extractions (stat tile, card list, overview-plus-detail) — these are
   design calls, one sitting each.
5. Conventions (done 2026-10-18; the story tags and the TemplateField
   invalid state with its demo's `alert()` remain).

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
- [x] *Focus was lost when a focused control disappeared in spec demos.* When
  a press hid the control that was pressed, or hid or removed the card or row
  it sat in, the button unmounted and focus fell to `document.body`, so the next
  Tab started from the top of the page. A timer did the same: an armed pair
  reverting took focus with it. Both registries and the old React demos had the
  defect. Each Button in both registries now hands focus on when it unmounts
  while focused (`catalog/registries/focus-handoff.ts`). The catalog's
  `focusNext` prop names the label of the Button that takes it: the first one
  after where the lost button was, else the last one before it. A swap names
  its replacement (Delete names Cancel, Cancel names Delete), and a row removal
  names the same control, which lands on the next row, else the previous one.
  Without a name or a match, focus goes to the demo root, as it already did for
  a dialog whose opener is gone. Buttons inside a dialog are left to the
  dialog. A unit test checks that every `focusNext` matches a Button label in
  its spec.
- [x] *A pp Dialog closed by the browser could not be reopened* (checked).
  The registry set `open` back to false only on `pp-modal-close`, which
  pp-modal sent from its own close path. A close the browser made itself (a
  click outside under `closedby="any"`, a close request such as Android's back
  gesture) left `open` true, so the next press of the opener changed nothing.
  pp-modal also kept that opener and returned focus to it on the following
  close. pp-modal now listens for the dialog's native `close` event and does
  the same work for a close it did not make, including `pp-modal-close`, so
  modalService surfaces are torn down too.
- [x] *Focus was lost when a pp Dialog closed itself and its opener was gone*
  (checked). The fallback to the demo root ran only when the close came from
  state, not from Escape or the close button. The registry now settles both
  the state and the fallback in the dialog's `close` event, which every close
  path ends in. The shadcn registry already did this. The Drawer has the same
  shape but no spec uses it.
- [x] *Timers wrote to demos that had left the page.* `arm` and `notify`
  revert state on a timer. Their handlers now receive `connected` from
  `mountSpecDemos` and skip the write once the demo's element is gone.
- [ ] *`SpecDemo` writes a ref during render.* When the registry changes,
  `settled.current = false` is set in the render body. A render that React
  throws away (concurrent rendering, StrictMode's double render) still clears
  it, and nothing sets it back until a later commit, so a `focusOnShow`
  control that appears in that window does not take focus. Reset it in a
  layout effect keyed on `registry` instead.
- [ ] *Spec-demo roots are never unmounted.* `mountDemos` and `mountSpecDemos`
  create React roots and nothing unmounts them when a pane is truncated or the
  page changes, so effect cleanups never run and a pp Dialog's portalled
  `<pp-modal>` may stay in `<body>`. Not yet checked in the browser. Decide
  where disposal belongs (StackManager's truncation, `astro:before-swap`).
- [ ] *Focus after a toast's Undo.* The Toasts entry's action button is not a
  catalog Button, so it does not hand focus on. In shadcn, Radix moves focus
  to its toast viewport at the end of the page when the toast closes, so the
  next Tab leaves the page. The pp toast has not been checked. Decide whether
  Undo should return focus to the restored item.
- [ ] *Outline on the demo root.* When focus falls back to the demo root (a
  removed card, a Reset that hides itself, a dialog whose opener is gone), the
  whole demo draws the 2px focus outline. Decide whether the root should show
  focus that way or more quietly.
- [ ] *Hidden fields still count in `validateForm`.* A field's `checks`
  register with json-render's validation provider when it mounts
  (`catalog/registries/field-validation.ts`), and json-render has no way to
  unregister them. A field that a spec hides with `visible`, or swaps out in a
  later step, still runs its checks on submit: the form stays invalid and
  nothing on screen says why. The form spec hides no fields, so nothing breaks
  today. Before a spec does, either get an unregister into json-render or
  validate only the fields that are mounted.
- [ ] *Sections whose parts change after mount.* `pp-sections` rewrites the
  children React renders for it: it prepends its own tablist, sets ids and roles
  on the headings and panels, and in details mode moves each heading's text
  into a trigger button. React keeps writing to the nodes it rendered, so a
  bound title would wipe the trigger, and a Section that is added, removed or
  reordered would leave tabs pointing at the wrong panels. In the shadcn
  registry, changing `affordance` remounts the parts and loses the selected
  tab. The `sections` spec is static, so nothing breaks today, and the catalog
  says the parts are fixed once rendered. Before a spec changes them, let
  `pp-sections` render from data rather than rewriting its children, or have
  the pp registry draw the tablist itself.
- [ ] *Combobox announces its list as open when it is closed.* Both
  registries build the catalog's Combobox on cmdk, whose input always sets
  `aria-expanded="true"` and points `aria-controls` at the list, and neither
  prop can be overridden. The list is rendered only while open, so a closed
  combobox claims an open list that is not there. cmdk also names the input
  from its own hidden label, so a visible label is shown beside the field
  without being linked to it, and pressing it does not focus the field. The
  autocomplete spec hides its label, so the second does not show today. Either
  wrap cmdk's input so the registries set these attributes themselves, or
  build the field without cmdk.
- [ ] *A late close event after pp-modal reopens.* `closeModal()` calls
  `dialog.close()`, which queues the `close` event, and `openModal()` resets
  `closingHere` to false. If the same `pp-modal` opens again before that event
  arrives (from a `pp-modal-close` listener, or a close and an open in one
  handler), `handleNativeClose` takes the stale event for a close the browser
  made: it sends `pp-modal-close` and runs `finishClose` on an open dialog, so
  the triggers lose `aria-expanded` and modalService tears down the surface it
  just opened. Not yet reproduced in a demo. Ignore a `close` event while the
  dialog is open, or count closes rather than flag them.
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
- [ ] *Modules beside static specs* (checked). A spec with nothing to set up
  still needs its own `demos/specs/<slug>.ts`, which only imports the JSON and
  exports `{ spec, setup: {} }`, plus a line in `demo-registry.ts`'s `specs`
  map. Six such modules exist (the inline and callout notifications, the four
  empty states), and every static demo migrated adds one. The registry could
  import the JSON when no module exists and default `setup` to `{}`;
  `verify-demo-registry.mjs` would then check against both file kinds.
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

- [ ] *Stat tile.* `stories/Stat.stories.tsx` (`StatTile`). The story is
  already titled `Templates/Stat`. The monitor and watch-to-chase demos are
  now specs: the catalog has a `Stat` (the figure, its verdict and detail,
  and `alert`), placed in a Card titled by its label with the trend as a
  Badge in the card's suffix. `alert` now sits on `.stat` rather than on the
  card.
- [ ] *Entity card list.* `cards--list > EntityCard` is written out seven times
  across demos; `CardRenderer` can't be reused because it needs a full spec.
  Also a shared overview-attributes constant (`['name','category','pricing.msrp']`
  in three demos, a `listedAt` variant in two). In specs, an entity card is a
  Card titled by the item's name with its attributes as labelled Badges, and
  the item's full view is a Card holding its badges, price, description and a
  `DescriptionList` of the rest, laid out by role in `specs/product-view.ts`,
  as `ItemView` lays out its maxi scope.
- [ ] *Slice attributes formatted two ways.* `specs/problem-checklist.ts` and
  `specs/watch-to-chase-tiers.ts` show the same three attributes on a flag's
  items (`category`, `pricing.msrp`, `listedAt`), but the first formats them
  with `AttributeUtils.formatAttributeValue`, which shows a missing value as
  N/A, and the second with `cardAttributes` from `specs/product-view.ts`, which
  leaves it out. Move problem-checklist onto `cardAttributes` and share the
  attribute list.
- [ ] *Item layout by role, twice.* `specs/product-view.ts`, shared by the
  investigate, watch-to-chase, item-view-full, item-view-transitions and
  reference specs (the last lays out users and projects through their own
  bindings), copies `ItemView`'s role filtering and its private `specRows` (a
  record-valued attribute gives one row per key) to lay out a rung. A change
  to how `ItemView` lays out a scope now has to be made in both. The copy is
  also partial: `itemView` keeps the first key attribute, description and
  footer, and has no output for subtitle, caption, tag, thumbnail or custom
  roles. The product's scopes use none of them today, but one added there
  would show in `ItemView` and be left out of the spec demos without a
  warning. It also lays the summary out like the other rungs, where
  `ItemView`'s mini scope shows non-badge attributes as labelled badges. A
  `layoutByRole(binding, scope, item)` helper in `shared/data/bindings` would
  serve both; decide together with `ItemView`'s shape, which is still
  provisional.
- [ ] *Hover bridge, twice.* `components/item-view/ItemInteraction.tsx` and
  `catalog/registries/preview.ts` each implement the reference's preview
  (open after a pause, close after a grace that arriving on the preview
  cancels). Both read `previewTiming`, but only the hook moves the keyboard
  into the preview and back. `ItemInteraction` also keeps the working-rung
  preference in a persisted store, where the item-view-transitions spec keeps
  it in demo state, and its rung icons repeat the registries' `summary`,
  `detail` and `full`. Decide whether `ItemInteraction` should use the hook.
- [ ] *Controls named by label.* A Button's `focusNext` and a Dialog's or
  Drawer's `returnFocus` find their control by its label, and take the first
  match. Two controls with the same label in one demo (two references to the
  same item) would send focus to the wrong one. A stable key the spec gives
  the control would avoid it; change both together.
- [ ] *Leaflet setup, twice.* `components/map/map.ts` and
  `catalog/registries/shadcn-map.tsx` share the tiles (`map/tiles.ts`), but
  each creates the Leaflet map, fits the view without animation, defers
  removing the map while a zoom runs, names each pin, selects it on Enter or
  Space, marks the selected one current, and pans to a selection only when
  it was set from state after the places were framed. Only the pin, the
  popup and the frame belong to each library. A framework-free helper beside
  `map.ts` that takes the pin and popup as arguments would serve both; a fix
  to the keyboard handling or the unmount guard now has to be made twice.
- [ ] *Mention editor, twice.* `components/reference/Reference.tsx` (with
  `ReferenceEditor` and `ReferencePicker`, still used by the prompt,
  bubble-menu, block-based-editor and dynamic-hyperlinks demos) and
  `catalog/registries/mention-editor.ts` each set up Tiptap's mention
  extension and its @ list, both picking a kind and then an item. They differ
  in what they hold: the component looks entities up in `@shared/data` from
  its node view, escalates through `ItemInteraction`, and keeps the picker's
  search and kind in its own state on cmdk; the hook takes content, kinds and
  candidates as data, reports a pressed mention, and keeps focus in the editor
  with the list read through `aria-activedescendant`. Migrating those four
  demos to specs would retire the component's copy.
- [ ] *Stale labels in the reference note.* `sustainability-meeting-content`
  in `shared/data/reference-content.json` stores labels that no longer match
  the ids they point at (`user-2` is stored as David Chen, `PRJ-1` as Customer
  Survey Analysis). The reference spec shows each item's current name, so the
  note now asks technical questions of a supply chain analyst. Rewrite the
  note's sentences or its ids so the two agree.
- [ ] *Full-view spec elements, six times.* `specs/investigate.json`,
  `specs/watch-to-chase-tiers.json` and `specs/item-view-full.json` each hold
  the same full-view elements (a Card with badges, price, description, a
  `DescriptionList` and the listed line), differing only in reading `$item`
  or `$state`, and `specs/item-view-transitions.json` holds the same body
  twice more, for the detail drawer and the full dialog; `specs/reference.json`
  holds the detail body once more. A JSON spec cannot
  import, so a change to the full view has to be made in all of them. The modules beside the specs could build these
  elements once in TypeScript, for a given state path, and merge them into
  each spec.
- [ ] *Overview plus detail.* The same split with a `useFitsWidth` fallback in
  `overview-detail.tsx`, `FluidAttributesDemo.tsx`, `coordinated-views.tsx`.
  Several of these put `aria-label` on a plain `div`.
- [x] *Small demo duplicates.* The deletable list and `DeleteIconButton`
  duplicates went when `deletion.tsx` and `transient-feedback.tsx` became
  specs, and the hand-built back button went when `problem-curated-view.tsx`
  did.

## 5. Conventions

- [x] *Unwired checks.* `check-style-boundary.mjs` and
  `verify-demo-registry.mjs` run in `npm run lint`. The demo-registry check lost
  its migration-era baseline comparison; `--pages` prints the click-through
  list. `check-story-buckets.mjs` was out of date and is deleted, along with
  its mention in `.claude/rules/documentation.md`.
- [x] *Server validation messages.* Done with the server-handler
  consolidation.
- [x] *Event names.* `pp-modal-open`, `pp-modal-close` and
  `pp-breadcrumb-navigate`, all composed. Dropdown, popup and tooltip dispatch
  `CustomEvent`.
- [x] *`role` as a JS hook.* `pp-list` recognises items by tag name. ESLint
  now also rejects `getAttribute('role')`.
- [x] *Animation name collisions.* Toast keyframes are `toast-`-prefixed. The
  sidebar skeleton uses the theme's `blink`, the chart spinner its `spin`; the
  explanation drawer's local `pulse` went with its stylesheet. The tldraw spin also translates and belongs to the
  starter kit, so it stays.
- [x] *`explanation.css`* is deleted. The explanation drawer is built from
  library styles: `.flow` sections, a `.callout.layer` quote, attribute–value
  badges for references, `pp-spinner` with `.muted` for loading and streaming,
  and `.callout.danger` for errors.
- [x] *Stories.* The preview reseeds faker before each story; Card and Dialog,
  which call it at import, seed their own modules. The icon helpers in
  `stories/utils/icons.ts` pick through faker, and Avatar uses them. Flex rows
  use `.flex`, which takes `--flex-gap` where a row needs more room (Badge,
  With button). The remaining inline styles are arg-driven sizes or deliberate
  demo dimensions, including the list widths: `centeredLayoutNarrow` would
  centre the lists, which they do not need. The
  keyboard play steps live in `stories/utils/play.ts`.
- [ ] *Story tags.* 73 stories carry `atomic:*` tags and 66 a `role:component`
  tag that `main.ts` does not register. Nothing reads either since the graph
  became language-only, but `pattern-role-model.md` describes `atomic:*` as
  catalogue metadata and `role:component` as how Storybook pages declare their
  role. Decide whether they stay (and `role:component` is registered) or go
  (and the spec changes).
- [x] *`pp-modal` close hook.* Close buttons are found by `data-close` only.
  The fallback that let any header button close a dialog without one was
  removed on 2026-10-18. No caller relied on it, but a modalService surface
  with header actions and `closable: false` would have closed whenever an
  action was pressed.
- [x] *`mock-data.md`* points at `@shared/data` for shared data;
  `src/stories/data/` is for data one story uses.
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
- [x] *Small items.* `CommentingPlugin.ts` uses `prefersReducedMotion()`. Hook
  files are kebab-case (`use-modal-service.ts`,
  `use-hierarchical-navigation.ts`, and the data-view and dynamic-hyperlinks
  demo hooks). `link-preview.ts` relies on the `getPaneContent` cache and only
  warms it ahead of a show.
