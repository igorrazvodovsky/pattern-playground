---
title: Refactoring sweep
status: active
kind: work-queue
created: 2026-10-17
last_reviewed: 2026-10-20
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

A second survey on 2026-10-20 covered the switchable demos only: the catalog,
both registries, the spec modules, and their mounting in the site, read against
json-render 0.21.1 and its documentation. Its items are in §3 and §5.

## Order

1. Bugs (done 2026-10-17; focus after a toast's Undo remains).
2. Dead-code sweep (done 2026-10-17; three keep-or-retire decisions remain).
3. Consolidation (first pass done 2026-10-18; the command menu question and
   the switchable-demo items remain).
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
- [x] *`SpecDemo` writes a ref during render.* When the registry changed,
  `settled.current = false` was set in the render body. A render that React
  throws away (concurrent rendering, StrictMode's double render) still cleared
  it, and nothing set it back until a later commit, so a `focusOnShow`
  control that appeared in that window did not take focus. A layout effect in
  `SpecDemo` would run after its children's, too late to stop them. Fixed
  2026-10-20: `SpecDemo` records the registry it last committed with, and
  `DemoSettled` provides a function that compares it with the registry of the
  current render, so nothing is written during render.
- [x] *Spec-demo roots are never unmounted.* `mountDemos` and `mountSpecDemos`
  created React roots and nothing unmounted them when a pane was truncated or
  the page changed, so effect cleanups never ran and a pp Dialog's portalled
  `<pp-modal>` stayed in `<body>`. Fixed 2026-10-20: `demo-registry.ts` keeps
  the roots it creates, and `unmountDetachedDemos` unmounts those whose
  element has left the page. StackManager calls it when its panes change, and
  `Base.astro` on `astro:after-swap`. Checked in the browser: replacing a
  stacked pane with its dialog open, or navigating away, removes the dialogs
  from `<body>`, and the pane mounts fresh when it comes back. Handlers keep
  their `connected` check, since they live outside the React tree.
- [ ] *Focus after a toast's Undo.* The Toasts entry's action button is not a
  catalog Button, so it does not hand focus on. In shadcn, Radix moves focus
  to its toast viewport at the end of the page when the toast closes, so the
  next Tab leaves the page. The pp toast has not been checked. Decide whether
  Undo should return focus to the restored item.
- [ ] *Outline on the demo root.* When focus falls back to the demo root (a
  removed card, a Reset that hides itself, a dialog whose opener is gone), the
  whole demo draws the 2px focus outline. Decide whether the root should show
  focus that way or more quietly.
- [x] *Hidden fields still count in `validateForm`.* A field's `checks`
  register with json-render's validation provider when it mounts
  (`catalog/registries/field-validation.ts`), and json-render has no way to
  unregister them. Fixed 2026-10-20: a hidden element unmounts, and a field
  that unmounts registers empty checks under its path, so `validateForm`
  passes it. A field inside a hidden container or a repeat is covered the
  same way.
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
- [x] *Combobox announces its list as open when it is closed.* Both
  registries build the catalog's Combobox on cmdk, whose input always sets
  `aria-expanded="true"` and points `aria-controls` at the list, and neither
  prop can be overridden. The list is rendered only while open, so a closed
  combobox claimed an open list that was not there. cmdk also names the input
  from its own hidden label, so a visible label was shown beside the field
  without being linked to it. Fixed 2026-10-20, by neither of the two ways
  first proposed: `useCandidateList` sets `aria-expanded` and `aria-controls`
  on the input in a layout effect, and links the visible label to the input's
  id. This works because cmdk 1.1.1 never changes those attributes after
  mount, so React does not write them again; a cmdk upgrade that makes them
  change per render would undo it silently. Checked in the browser in both
  libraries: the attributes follow whether the list is rendered. The label
  link is untested in a demo, since the autocomplete spec hides its label,
  and the effect sets it only when the list opens or closes.
- [x] *A late close event after pp-modal reopens.* `closeModal()` calls
  `dialog.close()`, which queues the `close` event, and `openModal()` resets
  `closingHere` to false. If the same `pp-modal` opened again before that
  event arrived (from a `pp-modal-close` listener, or a close and an open in
  one handler), `handleNativeClose` took the stale event for a close the
  browser made: it sent `pp-modal-close` and ran `finishClose` on an open
  dialog. Fixed in b8965c70: `handleNativeClose` ignores a `close` event while
  the dialog is open.
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
  map. Seven such modules exist (status-feedback, the inline and callout
  notifications, the four empty states), and every static demo migrated adds
  one. The registry could import the JSON when no module exists and default
  `setup` to `{}`.

  Sharper form (checked 2026-10-20): `catalog/specs.test.ts` already finds
  spec modules with `import.meta.glob`. The same glob in `demo-registry.ts`,
  lazy rather than eager, would replace the hand-kept `specs` map, and
  `verify-demo-registry.mjs` could list the spec files instead of parsing the
  map with a regex. The glob needs `demos/specs/` to hold only specs and
  their modules, so the shared helpers (`arm`, `notify`, `settle`, `timers`,
  `mentions`, `toggle`, `selection`, `product-view`, `filter-clauses`) and the slice variants that
  reuse another spec's JSON would move to a folder of their own or be named
  so the glob skips them. The libraries are also listed in three places: the
  `Library` type and `libraryLabels` in `Demo.astro`, and the `registries`
  map in `demo-registry.ts`. One manifest of name, label and loader would
  serve all three.
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
- [ ] *Item and Card in the pp registry.* The pp `Item` repeats the pp
  `Card`'s title button (the same `aria-pressed`/`aria-expanded` expression),
  its `card__attributes badges` row and its `.detail flow pad` block, so a fix
  to one misses the other. Item already differs: it has no `focusOnShow`, and
  its title is `label flex` rather than `label card__title`. Share the title
  and detail parts, or render Item as a Card inside a list item. The shadcn
  registry has the same pair; see *Catalog semantics written per registry*.
- [ ] *Detail without what the row shows, written twice.* `InPlaceDetail` in
  `templates/collection-view/renderers/entity-detail.tsx` has no user since
  the linked-trio demo became a spec, which builds the same view with
  `itemView('mid', undefined, attributes)` from `specs/product-view.ts`.
  Decide whether the template keeps it for collection views or it goes.
- [ ] *Catalog semantics written per registry* (checked 2026-10-20). What a
  catalog prop means for assistive technology and focus is written out again
  in each registry. The rule for `aria-pressed` and `aria-expanded` on a title
  that opens (`opens`, `selected`, `expanded`) appears four times: Card and
  Item in `registries/pp.tsx` and in `registries/shadcn.tsx`. Each field
  (Input, Select, Textarea, Combobox and the rest) repeats in both libraries
  the bound value, the field error, the id, `aria-describedby` and the error's
  alert role. A copy that drifts would show as a difference between the
  libraries when it is a defect, which weakens the test switchable demos run.
  The registries already share hooks for focus hand-off, disclosure state,
  candidate lists and field validation; extending that to the rest
  (`usePressableTitle(props, emit)`, `useField(props, bindings)` and similar)
  would write each meaning once and leave each library its markup and styles.
  This settles *Item and Card in the pp registry* too. A folder split would
  show the boundary: `catalog/behaviour/` for the library-neutral hooks,
  `registries/pp/` and `registries/shadcn/` for each library, where today
  `registries/` holds all three.
- [x] *`@json-render/shadcn` for two components* (checked 2026-10-20). The
  shadcn registry took only `Stack` and `Checkbox` from the kit, which does
  not tree-shake and brought embla-carousel, vaul, tailwind-merge and
  class-variance-authority with it. Done 2026-10-20: Stack is a flex box with
  shadcn's gaps (a labelled one is a `section`, and `align: baseline` now
  keeps its label, gap and drop target), and a checkbox row uses the same
  `CheckboxField` (`registries/shadcn-checkbox.tsx`) as the catalog's
  Checkbox, so its label is no longer set in medium weight. The dependency is
  gone, and `catalog/shadcn.css` scans `registries/shadcn*.tsx` with one glob.
  The sheet went from 13.9 KB to 10.7 KB gzipped; every class the registry
  names is still in it. Checked in the browser under shadcn: bound and unbound
  checkbox rows, labelled and drop-target Stacks.
- [ ] *Demo actions in the shared catalog* (checked 2026-10-20). Four of the
  catalog's seven actions are used by one spec each (`toggle` by nested-pairs,
  `editRule` by rule-composition, `interpret` by filtering, `deduce` by
  contextual-navigation), and the other three by two specs at most. The
  `actionsSuppliedBySpecs` no-ops exist only because the catalog declares
  actions: `defineRegistry` requires a handler for each declared action in its
  types, and makes `actions` optional when there are none. At runtime
  `JSONUIProvider` takes handlers under any name. Each action's definition
  (params and description) could move beside its handler, the catalog would
  hold components only, and the generated-demos plan would get the per-demo
  action list it needs for its prompts. `specs.test.ts` would then check a
  spec's actions against its module rather than the catalog. Confirm first
  that both registries type-check with `actions` left out, and that a handler
  declared only in a module still fires.

## 4. Template extractions

Design calls; one sitting each.

- [ ] *Stat tile.* `stories/Stat.stories.tsx` (`StatTile`). The story is
  already titled `Templates/Stat`. The monitor and watch-to-chase demos are
  now specs: the catalog has a `Stat` (the figure, its verdict and detail,
  and `alert`), placed in a Card titled by its label with the trend as a
  Badge in the card's suffix. `alert` now sits on `.stat` rather than on the
  card.
- [ ] *Overview attributes repeated.* The list `['name','category','pricing.msrp']`
  is written out in the overview-detail and linked-trio specs. No demo writes
  out `cards--list > EntityCard` any more: in specs, an entity card is a Card
  titled by the item's name with its attributes as labelled Badges (in a list
  of rows, an `Item` with the same Badges), and the item's full view is a Card
  holding its badges, price, description and a `DescriptionList` of the rest,
  laid out by role in `specs/product-view.ts`, as `ItemView` lays out its maxi
  scope.
- [x] *Slice attributes formatted two ways.* `specs/problem-checklist.ts` and
  `specs/watch-to-chase-tiers.ts` showed the same three attributes on a flag's
  items, one through `AttributeUtils` (a missing value shown as N/A) and the
  other through `cardAttributes`. Done 2026-10-20: both read
  `sliceAttributes` from `specs/product-view.ts`, so the checklist's badges
  now take the binding's labels (Price, Listed) and leave a missing value out.
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
- [x] *Mention candidates filtered twice.* `specs/reference.ts` and
  `specs/prompt.ts` each turned a category's children into mentions, capped
  the list at eight and matched the label against the query. Done
  2026-10-20: both use `specs/mentions.ts` (`toMention`, `mentionQuery`,
  `matchesQuery`, `maxMentionMatches`); `reference.ts` keeps its
  kind-then-item steps on top.
- [ ] *Stale labels in the reference note.* `sustainability-meeting-content`
  in `shared/data/reference-content.json` stores labels that no longer match
  the ids they point at (`user-2` is stored as David Chen, `PRJ-1` as Customer
  Survey Analysis). The reference spec shows each item's current name, so the
  note now asks technical questions of a supply chain analyst. Rewrite the
  note's sentences or its ids so the two agree.
- [ ] *TemplateField has no consumer.* The prompt-template spec fills its
  blanks through slots in `catalog/registries/mention-editor.ts`, so
  `components/template-field/` (a Tiptap node whose blank turns into an input
  when pressed, with fill, clear and validate commands) is no longer used. The
  slots keep `.template-field` and `--filled` from `styles/reference.css`;
  `--selected`, `--editing`, `--invalid`, `__label` and `__error` styled only
  the component. `styles/tiptap.css`, whose import is commented out, holds a
  second full set of `.template-field*` rules that would fight the slots'
  `--filled` and `:focus-within` if switched back on. Delete the component,
  those rules and the tiptap.css block, or keep the component for a story.
- [ ] *`.message-composer__feedback` has no consumer.* The prompt-quality-feedback
  spec shows its verdict as a Text with a purpose after the composer, so the
  feedback line in `styles/messages.css` (with its badge and spinner spacing)
  is no longer used, nor are its animation and reduced-motion rules in
  `styles/tiptap.css`, whose import is commented out. Delete both, or have the
  pp Composer draw a feedback line if the catalog gains one.
- [x] *Three copies of per-path timers.* `specs/notify.ts`, `specs/settle.ts`
  and `specs/arm.ts` each kept a map of timers by state path. Done
  2026-10-20: all three schedule through `keyedTimers` in `specs/timers.ts`,
  which replaces a pending write and skips it once the demo has gone.
- [ ] *A purpose Text wraps its icon above long text in pp.* The pp registry
  lays a Text with a purpose out with `.flex`, which wraps in a demo host
  narrower than 40rem, so a message longer than one line drops onto the next
  line below its icon. shadcn keeps the icon beside the text. The
  prompt-quality-feedback messages are short enough to fit one line for now.
  The library needs a row whose text shrinks and wraps beside its icon.
- [ ] *Product readout repeated in specs.* The readout of a product at one
  rung (a Card with badges, price, description, a `DescriptionList` and the
  listed line) is written out in many specs, differing only in the state path
  it reads or in reading `$item` rather than `$state`.
  `specs/investigate.json`, `specs/watch-to-chase-tiers.json` and
  `specs/item-view-full.json` hold it once each;
  `specs/item-view-transitions.json` twice, for the detail drawer and the full
  dialog; `specs/reference.json` once; `specs/linked-trio.json` twice; and
  `specs/overview-detail.json` three times (in place, the detail its pane and
  popover share, the page). A change to the readout has to be made in every
  copy. The same goes for repeated conditions and handlers inside one spec:
  `specs/overview-detail.json` writes the rule for when the in-place layout
  is in force three times (and its complement twice), and its four layout
  menu items repeat the same three actions, differing only in the layout.

  json-render 0.21.1 has no way to reuse a subtree: inside a spec only
  `repeat` stamps out elements, `$template` interpolates strings only, and
  directives produce prop values, not elements (checked 2026-10-20). So the
  fix is one of two, and each goes against an earlier decision:
  - A catalog type that renders the readout from one prop. This puts a
    domain-level type in the catalog, which the switchable-demos plan chose
    not to do: types are named at component altitude.
  - The modules beside the specs build the elements once in TypeScript, for
    a given state path, and merge them into each spec. The JSON is then no
    longer the whole spec, and a generated spec cannot use the shared part.

  Decide which, together with *Item layout by role, twice*, since
  `product-view.ts` is where the TypeScript form would live.
- [ ] *Filter chip, twice.* The chip that edits one filter condition
  (attribute, operator, values, remove) is written in
  `components/filter/filter-components.tsx`, tied to the task fixtures, and
  in `catalog/registries/pp-filter-tag.tsx`, the catalog's `FilterTag`, which
  takes everything as props. Every demo that filters is now a spec and edits
  conditions through `FilterTag`, with operators and options from
  `demos/specs/filter-clauses.ts`, so the library chip (`Filters` in
  `components/filter/filters.tsx`) has no user and no story. Decide whether
  it takes `FilterTag`'s props and becomes the component the pp registry
  draws, or goes.
- [x] *Overview plus detail.* The linked-trio demo is a spec. Its three
  panes are the catalog's `Panes`, which writes its room to state as `Split`
  does (`registries/split-room.ts`), and its list is an `ItemGroup` of
  `Item` rows (shadcn's Item; the library's list of cards).
- [x] *`top-layer=""` no longer turned the top layer on.* React's
  `top-layer=""` set pp-popup's boolean property to an empty string, which
  reads as false. Done 2026-10-20: the pp registry's Reference preview,
  `ItemInteraction.tsx`'s summary and `Popover.stories.tsx` pass booleans, and
  `jsx-types.ts` types both props as `boolean`, so `=""` no longer
  type-checks. Checked in the browser: the story's panel opens in the top
  layer and closes on an outside click; the Reference preview (the
  item-view-transitions demo) and the summary (the Item view Escalation
  story) open in the top layer, stay open while the pointer is on them, and
  close when it leaves. Two faults surfaced once the top layer was really on.
  `popover.css`'s slide-in `translate` for `[popover]:popover-open` reached
  pp-popup and was cancelled only by the popup's position correction;
  `popup.css` now sets `translate: none` on an open top-layer pp-popup. And
  the Popover story's button could not close its panel: pointerdown
  light-dismissed it, and the click's toggle reopened it in the same React
  batch. The story now reads the press against the state found at
  pointerdown. A trigger that toggles a `light-dismiss` popup has the same
  problem anywhere; showing the popover with the anchor as `source` does not
  help, since Chrome counts only a `popovertarget` button as the invoker for
  light dismiss.
- [ ] *`BackButton` and `.detail__toolbar` have no consumer.* The
  overview-detail layout demo is a spec, so `BackButton` in
  `demos/scaffold.tsx` is no longer imported, and the `.detail__toolbar` rules
  in `styles/view-family.css` (the corner control, faded until the detail is
  hovered) have no markup; `ItemInteraction.tsx` names the class only in a
  comment. The spec's layout menu sits in the card's or popover's `suffix`
  instead. Delete them, or have a pp `Card` or `Popover` draw its suffix as
  that corner control.
- [ ] *The in-place detail sits under the card's press.* In
  `specs/overview-detail.json` the in-place detail is the card's default
  content, so the card's press covers it and the actor cannot select its
  text. The Card's `detail` slot, shown while `expanded`, keeps it clear of
  the press, as `specs/nested-pairs.json` does. Moving it there also reads
  the title as expanded rather than pressed, so check that the menu in the
  card's suffix still makes sense beside it.
- [ ] *Component and material readouts formatted by hand.*
  `specs/nested-pairs.ts` writes each tier's badges and rows by hand,
  products among them, while `specs/product-view.ts` reads products through
  the product binding. Components and materials have no binding in
  `shared/data/bindings`. Give them one, and the nested-pairs tiers can read
  all three the way the other specs read products.
- [ ] *One spec is not a tree.* `specs/nested-pairs.json` renders its pair
  again inside its own detail (`card` → `detail` → `overviews` → `pair` →
  `card`), and `card` has two parents. json-render's renderer follows it
  until the data runs out, but `indexTree` in `@json-render/core`, which its
  spec generation and editing paths call, rejects a spec with cycles or
  shared children. Nothing here calls those paths on demo specs. If a spec
  lint or a generation step starts to, the recursion needs another form,
  such as one element group per depth built in the module.
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
- [ ] *Inline styles in the pp registry* (checked 2026-10-20).
  `registries/pp.tsx` sets spacing and layout in 16 `style={…}` props: the
  Stack's gap and row layout, the Grid's column width, the field and card
  body grids. The switchable-demos plan noted them against
  `.claude/rules/styling.md`, and nothing tracked them since. The registry
  should draw from the library rather than fill gaps locally, so this is a
  library gap: a row utility with a gap and alignment, a grid with a column
  width, and a field layout. Once those exist, the registry uses them.
- [ ] *TemplateField invalid state is unreachable.* `--invalid` and
  `__error` render only for a required field that is `filled` with an empty
  value, but submitting an empty value sets `filled: false`. Decide what should
  trigger the state (the demo's Validate button is the obvious candidate),
  then wire it.
- [ ] *`alert()` in the prompt demo.* `PromptTemplateDemo`'s Validate reports
  through `alert()`, which blocks the page. Show the result in the demo instead;
  this pairs with the TemplateField item above.
- [x] *Arrow keys in a dropdown started from the wrong row.* ArrowUp on a
  `pp-dropdown` trigger focuses the last item, but once the popup had
  animated in, the dropdown made the first item current again. Focus and the
  roving tabindex then parted, so the next arrow key counted from the first
  item. The dropdown now leaves the current item alone when an item already
  has focus, and `pp-list` counts arrow keys and Enter from the focused item.
  The Dropdown story's play test covers it.
- [x] *Small items.* `CommentingPlugin.ts` uses `prefersReducedMotion()`. Hook
  files are kebab-case (`use-modal-service.ts`,
  `use-hierarchical-navigation.ts`, and the data-view and dynamic-hyperlinks
  demo hooks). `link-preview.ts` relies on the `getPaneContent` cache and only
  warms it ahead of a show.
