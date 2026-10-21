---
title: Refactoring sweep
status: active
kind: work-queue
created: 2026-10-17
last_reviewed: 2026-10-21
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
2. Dead-code sweep (done 2026-10-17; the keep-or-retire decisions settled 2026-10-20).
3. Consolidation (first pass done 2026-10-18; registry semantics shared
   and demo actions moved out of the catalog 2026-10-20; done).
4. Template extractions (stat tile, card list, overview-plus-detail) — these are
   design calls, one sitting each.
5. Conventions (done 2026-10-18; the story tags and the pp registry's inline
   styles remain).

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
  while focused (`catalog/behaviour/focus-handoff.ts`). The catalog's
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
  (`catalog/behaviour/field-validation.ts`), and json-render has no way to
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
- `EpistemicStatus.astro` (decided 2026-10-20): the evidence badges stay
  commented out, as the file's header describes them as intended design.

Retired 2026-10-20: `scripts/world/verify-views.ts`, which compared the
assembled views against the JSON files the world replaced and would have
failed on the first new action that changed a view. It is gone from the
`promoted_to` of `plans/completed/2026-08-world-regrounding.md`.
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
- [x] *Command menu navigation* (decided 2026-10-20: left as it is).
  `use-command-navigation.ts` keeps its own two-mode state rather than using
  `useHierarchicalNavigation`: it has no debounce, selects leaf commands
  directly, and filters recent items. Folding it in would need hook options
  for each and would change how the menu behaves.
- [x] *Modules beside static specs.* Done 2026-10-20. `demo-registry.ts`
  finds specs with two lazy globs over `demos/specs/`, one for the modules
  and one for the JSON, in place of the hand-kept `specs` map. A slug is a
  module, a JSON spec, or both; the module wins, and a JSON spec without one
  renders with nothing set up. The ten modules that only re-exported their
  JSON are gone (status-feedback, the inline and callout notifications, the
  four empty states, communicating-uncertainty, input-output-mapping,
  sections). The shared helpers (`arm`, `notify`, `settle`, `timers`,
  `mentions`, `toggle`, `selection`, `product-view`, `filter-clauses`) and
  the prompt factory with its JSON template, which no slug renders on its
  own, moved to `demos/specs/shared/`, which the globs skip. The slices that
  build their spec from another spec's factory stay in `demos/specs/`, since
  each is a spec. `catalog/specs.test.ts` uses the same globs and still lints
  all 51 specs; it also names any module in the folder that exports no spec,
  since the site would take it for one. `verify-demo-registry.mjs` lists the
  folder rather than parsing a map. The library names and labels live in
  `lib/demo-libraries.ts`, which `Demo.astro` reads; the loaders stay in
  `demo-registry.ts`, typed by that list, because the frame renders at
  prerender and a loader there would pull the registries into it. Checked in
  the browser: the empty states (JSON only) and the prompt slices (modules)
  mount and switch libraries.
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
- [x] *Item and Card in the pp registry.* Done 2026-10-20 with *Catalog
  semantics written per registry*: both take their title button from
  `usePressableTitle`, and in pp they share `cardAttributes` and `cardDetail`
  for the attributes row and the detail block. Item keeps its own title
  heading (`label card__title flex`, which holds the `titleSuffix`).
- [x] *Detail without what the row shows, written twice* (removed
  2026-10-20). `InPlaceDetail` in
  `templates/collection-view/renderers/entity-detail.tsx` had no user since
  the linked-trio demo became a spec, which builds the same view with
  `itemView('mid', undefined, attributes)` from `specs/shared/product-view.ts`.
- [x] *Catalog semantics written per registry* (done 2026-10-20). The rule
  for `aria-pressed` and `aria-expanded` on a title that opens was written out
  four times (Card and Item in each registry), and each text field repeated
  its bound value, error, id, `aria-describedby` and alert role in both
  libraries. `usePressableTitle(props, emit)` now returns the title button's
  ref and attributes, with focus on show and focus hand-off, and emits
  `focus` and `blur` for an Item. `useField(props, bindings)` returns the
  bound value, the error, the control's attributes and the error's id and
  role, for Input and Select; each library keeps its error element, and
  `errorPrefix` is the announced "Error:". Textarea takes `useBoundField`,
  the value and id alone, so that another field's error on the same path
  does not mark it. `aria-invalid` stays with each
  library, since `pp-input` and `pp-select` set it on their control from
  their own `invalid`. The folder split followed: the library-neutral hooks
  are in `catalog/behaviour/`, each library in `registries/pp/` and
  `registries/shadcn/` (its registry in `index.tsx`, its parts without the
  library prefix, its own lazy mention editor, and in shadcn the
  `composer-field` context its Composer uses). `catalog/shadcn.css`
  scans `registries/shadcn/*.tsx`; the generated sheet is unchanged. Checked
  in the browser in both libraries: a failed submit on the form spec, pressed
  and expanded titles on overview-detail, Item focus and blur on
  coordinated-views, and the mention editors on prompt. Other components
  still write their semantics per registry (Button's hidden label, the
  Dialog and Drawer descriptions); extend the hooks when one drifts.
- [x] *`@json-render/shadcn` for two components* (checked 2026-10-20). The
  shadcn registry took only `Stack` and `Checkbox` from the kit, which does
  not tree-shake and brought embla-carousel, vaul, tailwind-merge and
  class-variance-authority with it. Done 2026-10-20: Stack is a flex box with
  shadcn's gaps (a labelled one is a `section`, and `align: baseline` now
  keeps its label, gap and drop target), and a checkbox row uses the same
  `CheckboxField` (now `registries/shadcn/checkbox.tsx`) as the catalog's
  Checkbox, so its label is no longer set in medium weight. The dependency is
  gone, and `catalog/shadcn.css` scans the shadcn registry's files with one
  glob (now `registries/shadcn/*.tsx`).
  The sheet went from 13.9 KB to 10.7 KB gzipped; every class the registry
  names is still in it. Checked in the browser under shadcn: bound and unbound
  checkbox rows, labelled and drop-target Stacks.
- [x] *Demo actions in the shared catalog* (done 2026-10-20). Each of the
  catalog's seven actions was used by one or two specs, and the registries
  carried `actionsSuppliedBySpecs` no-ops only because the catalog declared
  them. Each action's params and description now sit beside its handler: the
  shared ones (`arm`, `toggle`, `settle`, `notify`) in `demos/specs/shared/`,
  the others (`editRule`, `interpret`, `deduce`) in the module that uses
  them. `SpecSetup.actions` lists the actions a spec can bind, and the
  registries pass no `actions`. The catalog keeps an empty `actions: {}`,
  since leaving the key out breaks the registries' prop inference.
  json-render's provider finds a handler by name, so an action no catalog
  declares still fires. `specs.test.ts` checks each binding against the
  module rather than the catalog: the action is declared, every declaration
  has a handler and every handler a declaration, and each param is one the
  action takes, a literal fits it, and none it needs is missing. Checked in
  the browser: `arm` (inline-confirmation), `toggle` (nested-pairs),
  `notify` (staged-deletion, form) and `editRule` (rule-composition) run
  with no handler warnings.

## 4. Template extractions

Design calls; one sitting each.

- [ ] *Stat tile.* `stories/Stat.stories.tsx` (`StatTile`). The story is
  already titled `Templates/Stat`. The monitor and watch-to-chase demos are
  now specs: the catalog has a `Stat` (the figure, its verdict and detail,
  and `alert`), placed in a Card titled by its label with the trend as a
  Badge in the card's suffix. `alert` now sits on `.stat` rather than on the
  card.
- [ ] *Overview attributes repeated.* The list
  `['name','category','pricing.msrp']` is written out in the overview-detail
  and linked-trio specs. No demo writes out `cards--list > EntityCard` any
  more: in specs, an entity card is a Card titled by the item's name with its
  attributes as labelled Badges (in a list of rows, an `Item` with the same
  Badges), and the item's full view is a Card holding its badges, price,
  description and a `DescriptionList` of the rest, laid out by role in
  `specs/shared/product-view.ts`, as `ItemView` lays out its maxi scope.
- [x] *Slice attributes formatted two ways.* `specs/problem-checklist.ts` and
  `specs/watch-to-chase-tiers.ts` showed the same three attributes on a flag's
  items, one through `AttributeUtils` (a missing value shown as N/A) and the
  other through `cardAttributes`. Done 2026-10-20: both read `sliceAttributes`
  from `specs/shared/product-view.ts`, so the checklist's badges now take the
  binding's labels (Price, Listed) and leave a missing value out.
- [ ] *Item layout by role, twice.* `specs/shared/product-view.ts`, shared by
  the investigate, watch-to-chase, item-view-full, item-view-transitions and
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
  `catalog/behaviour/preview.ts` each implement the reference's preview
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
  `catalog/registries/shadcn/map.tsx` share the tiles (`map/tiles.ts`), but
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
  `catalog/behaviour/mention-editor.ts` each set up Tiptap's mention
  extension and its @ list, both picking a kind and then an item. They differ
  in what they hold: the component looks entities up in `@shared/data` from
  its node view, escalates through `ItemInteraction`, and keeps the picker's
  search and kind in its own state on cmdk; the hook takes content, kinds and
  candidates as data, reports a pressed mention, and keeps focus in the editor
  with the list read through `aria-activedescendant`. Migrating those four
  demos to specs would retire the component's copy.
- [x] *Mention candidates filtered twice.* `specs/reference.ts` and
  `specs/shared/prompt.ts` each turned a category's children into mentions,
  capped the list at eight and matched the label against the query. Done
  2026-10-20: both use `specs/shared/mentions.ts` (`toMention`,
  `mentionQuery`, `matchesQuery`, `maxMentionMatches`); `reference.ts` keeps
  its kind-then-item steps on top.
- [x] *Stale labels in the reference note.* `sustainability-meeting-content`
  in `shared/data/reference-content.json` stored labels that no longer
  matched the ids they point at (`user-2` as David Chen, `PRJ-1` as Customer
  Survey Analysis), and the two other notes, which the Reference stories
  use, had the same drift. Fixed 2026-10-21 by changing ids, not sentences:
  each mention now points at the person or project whose current role or
  status fits its sentence, and stores that item's current name. The
  mentions of users and projects no longer store metadata, since the world
  holds their roles and status; the documents keep theirs.
- [x] *TemplateField had no consumer.* The prompt-template spec fills its
  blanks through slots in `catalog/behaviour/mention-editor.ts`. Done
  2026-10-20: `components/template-field/` is deleted, with the rules in
  `styles/reference.css` that only it used (`--selected`, `--editing`,
  `--invalid`, `__label`, `__error`) and the `.template-field*` block in
  `styles/tiptap.css`. The slots keep `.template-field`, `--filled`,
  `:focus-within` and the input rules.
- [x] *`.message-composer__feedback` had no consumer.* The
  prompt-quality-feedback spec shows its verdict as a Text with a purpose.
  Done 2026-10-20: the feedback line is deleted from `styles/messages.css`,
  and its `rise-in` animation and reduced-motion entries from
  `styles/tiptap.css`.
- [x] *Three copies of per-path timers.* `specs/shared/notify.ts`,
  `specs/shared/settle.ts` and `specs/shared/arm.ts` each kept a map of timers
  by state path. Done 2026-10-20: all three schedule through `keyedTimers` in
  `specs/shared/timers.ts`, which replaces a pending write and skips it once
  the demo has gone.
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
- [x] *Filter chip, twice.* The chip that edits one filter condition was
  written in `components/filter/filter-components.tsx`, tied to the task
  fixtures, and in the pp registry's `FilterTag`. Done 2026-10-21: the
  library's `FilterTag` (`components/filter/filter-tag.tsx`) takes the
  catalog's props with icons resolved and reports `onChange` and `onRemove`;
  the pp registry adapts it inline (the bound `edit`, the emits, the focus
  hand-off). `Filters`, `filter-components.tsx`, `filter-utils.ts` and
  `filter-types.ts` are deleted, and the date dropdown with them: date facets
  already pick through the combobox. The operator list is a radio list, where
  the old one used checkboxes. `catalog/filter-edit.ts` re-exports the
  library's `FilterChange`. The chip has no story of its own; the filtering
  and data-view demos show it. Checked in the browser in both.
- [x] *Overview plus detail.* The linked-trio demo is a spec. Its three
  panes are the catalog's `Panes`, which writes its room to state as `Split`
  does (`behaviour/split-room.ts`), and its list is an `ItemGroup` of
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
- [x] *`BackButton` and `.detail__toolbar` had no consumer.* The
  overview-detail spec's layout menu sits in the card's or popover's `suffix`.
  Done 2026-10-20: `demos/scaffold.tsx` and the `.detail__toolbar` rules in
  `styles/view-family.css` are deleted, and the comment in
  `ItemInteraction.tsx` no longer names the class.
- [x] *The in-place detail sits under the card's press.* In
  `specs/overview-detail.json` the in-place detail was the card's default
  content, so the card's press covered it and the actor could not select its
  text. The spec moved it into the `detail` slot of an `Item` (b2b950b5), but
  in pp the press still covered it: `.detail` was not positioned, so the
  title's stretched `::before` painted over it, where shadcn's detail is
  `relative`. Fixed 2026-10-21: `stretched-link.css` positions a card's
  `> .detail` at `z-index: 0`, above the overlay and below the controls it
  lifts to `z-index: 1`, so a suffix or badge menu still opens over an
  expanded detail. Checked in the browser: the detail's text is clear of the
  press in both overview-detail layouts that show it, the summary still opens,
  and in nested-pairs a card inside a detail opens on its own press. The menu in the suffix reads well
  beside a title that is announced as expanded.
- [ ] *Component and material readouts formatted by hand.*
  `specs/nested-pairs.ts` writes each tier's badges and rows by hand, products
  among them, while `specs/shared/product-view.ts` reads products through the
  product binding. Components and materials have no binding in
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
  `registries/pp/index.tsx` sets spacing and layout in 16 `style={…}` props: the
  Stack's gap and row layout, the Grid's column width, the field and card
  body grids. The switchable-demos plan noted them against
  `.claude/rules/styling.md`, and nothing tracked them since. The registry
  should draw from the library rather than fill gaps locally, so this is a
  library gap: a row utility with a gap and alignment, a grid with a column
  width, and a field layout. Once those exist, the registry uses them.
- [x] *TemplateField invalid state and the prompt demo's `alert()`.* Both
  closed 2026-10-20 without a change: `PromptTemplateDemo` no longer exists,
  and TemplateField is deleted (see §4).
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
