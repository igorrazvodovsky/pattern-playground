# Plan: Update tldraw

## Context

`src/tldraw/` is a node-graph workflow editor built on `tldraw@4.0.2`. It is structurally a fork of tldraw's upstream `templates/workflow` example with one pattern-playground extension (`nodes/contentCard/`) and a slightly different center-handle approach (`insertNodeWithinConnection.tsx` instead of the upstream `ConnectionCenterHandleOverlayUtil.tsx`).

tldraw 5.0.0 shipped 2026-05-06 and is the first version the upstream workflow template targets (`"tldraw": "workspace:*"` on `main`). Crossing two majors at once introduces:

- *v3→v4 carryover already absorbed at v4.0.2* but anything between us and v4.5.11 still applies (`Editor.batch()`→`Editor.run()`, `markHistoryStoppingPoint()`, `arrow.props.richText`, `--tl-*` CSS prefix, license-key requirement).
- *v4→v5 rewrites*: `ShapeUtil.indicator()` (JSX) → `getIndicatorPath()` (returns `Path2D`, rendered to canvas); `BindingUtil` lifecycle params drop `fromShapeType`/`toShapeType` in favour of full record access; `<Tldraw>` prop reshuffle (`cameraOptions`, `textOptions`, `deepLinks`, `embeds` move under `options`); CSS variables and selectors removed without fallback.

The user chose: *full realign* with upstream as the new baseline, re-layering `ContentCard` on top; *single PR* to v5.0.0 (no intermediate v4.5 stop); use tldraw's experimental `tldraw-migrate` skill as a first pass that we review by hand.

Outcome: `src/tldraw/` runs on tldraw 5.0.0, matches the upstream template directory-for-directory, and preserves the `ContentCard` extension and the Storybook mount.

## Reference points

- Upstream template tree: https://github.com/tldraw/tldraw/tree/main/templates/workflow
- v5.0.0 release notes (each `💥` block has an embedded migration guide): https://github.com/tldraw/tldraw/releases/tag/v5.0.0
- Migration index: https://tldraw.dev/releases
- Migrate skill: https://github.com/tldraw/tldraw/blob/main/skills/tldraw-migrate/README.md

## Inventory: what we have vs upstream

Upstream `templates/workflow/src/` files we already mirror (1:1 names): `constants.tsx`, `utils.ts`, `disableTransparency.tsx`, `connection/`, `nodes/`, `execution/`, `ports/`, `components/`, `hooks/`.

Divergences:

| Area | Upstream | Ours | Action |
|------|----------|------|--------|
| Center handle for inserting node between two connected nodes | `connection/ConnectionCenterHandleOverlayUtil.tsx` (an `OverlayUtil`, new in v5) | `connection/insertNodeWithinConnection.tsx` (side-effects approach) | Replace ours with upstream — v5 overlay util is the canonical pattern. |
| Region overlays | `components/WorkflowRegions.tsx` (rendered via `InFrontOfTheCanvas`) | `components/WorkflowRegions.tsx` exists but unused | Pull in upstream wiring. |
| Content card extension | n/a | `nodes/contentCard/{types.ts, ContentCardShapeUtil.tsx}` | Keep, port to v5 APIs. |
| Drag-to-create hook | not present upstream | `hooks/useDragToCreate.ts` | Confirm it's still needed for `ContentCard`; keep. |
| Entry point | `App.tsx` / `main.tsx` (standalone Vite app) | `src/stories/activities/Workflow.stories.tsx` (Storybook) | Keep Storybook mount; mirror upstream `App.tsx` setup inside it. |

## Critical files

- `package.json` (bump `tldraw` to `^5.0.0`; review React peer dep — we're on `react@^19.1.1`, upstream uses `^19.2.1`)
- `src/tldraw/**` (full directory replaced; details below)
- `src/stories/activities/Workflow.stories.tsx` (entry point — port to v5 `<Tldraw>` prop shape, register ContentCard alongside Node and Connection)

## Implementation steps

### Step 1 — Bump dependency

`package.json:103` — `"tldraw": "^4.0.2"` → `"tldraw": "^5.0.0"`. Run `npm install`. Expect TS errors immediately; don't fix yet.

### Step 2 — Replace baseline from upstream

For each file in `src/tldraw/` that has a 1:1 upstream match, copy the upstream version verbatim. Fetch from `https://raw.githubusercontent.com/tldraw/tldraw/main/templates/workflow/src/<path>`:

- `constants.tsx`, `utils.ts`, `disableTransparency.tsx`
- `connection/ConnectionShapeUtil.tsx`, `connection/ConnectionBindingUtil.tsx`, `connection/keepConnectionsAtBottom.tsx`
- `connection/ConnectionCenterHandleOverlayUtil.tsx` *(new — adopt; delete our `insertNodeWithinConnection.tsx`)*
- `nodes/NodeShapeUtil.tsx`, `nodes/nodePorts.tsx`, `nodes/nodeTypes.tsx`
- `nodes/types/{shared,AddNode,SubtractNode,MultiplyNode,DivideNode,ConditionalNode,SliderNode,EarthquakeNode}.tsx`
- `execution/ExecutionGraph.tsx`, `execution/executionState.ts`
- `ports/{Port,PointingPort,portState,getPortAtPoint}.tsx`
- `components/{OnCanvasComponentPicker,WorkflowToolbar,MathematicalToolbarItem,WorkflowRegions}.tsx`, `components/icons/*`
- Any new `utils/` sibling directory upstream ships

Diff each replaced file against ours before saving — flag any pattern-playground tweaks we want to preserve (likely none in node logic, possibly some in `components/*` styling).

### Step 3 — Re-layer `ContentCard`

`nodes/contentCard/` is ours and stays. Port to v5:

1. `ContentCardShapeUtil.tsx`:
   - `indicator()` returning JSX → `getIndicatorPath(shape): Path2D` returning a `Path2D` of the LOD-appropriate outline (circle for LOD A, rectangle for B–D). *Annotate return type explicitly* — TS infers `never` for placeholder branches otherwise.
   - Confirm `ShapeUtil` class-shape (`static override type`, `static override props: RecordProps<…>`) still matches v5.
   - Geometry imports (`Circle2d`, `Rectangle2d`) come from `tldraw` top-level — no submodule paths.
2. `types.ts`: no migration needed unless we add schema versions (we don't today).
3. Ports defined on `ContentCard` must continue to work through `ConnectionBindingUtil`. Verify by reading the new upstream `ConnectionBindingUtil` — bindings now read full `fromShape`/`toShape` records, so `binding.fromShape.type === 'contentCard'` paths need explicit handling if upstream switches on type.

### Step 4 — Reconcile the Storybook mount

`src/stories/activities/Workflow.stories.tsx`:

- Match upstream `App.tsx` registration: `shapeUtils=[NodeShapeUtil, ConnectionShapeUtil, ContentCardShapeUtil]`, `bindingUtils=[ConnectionBindingUtil]`, `overlayUtils=[ConnectionCenterHandleOverlayUtil]` (new in v5).
- v5 `<Tldraw>` prop changes — move `cameraOptions`/`textOptions`/`deepLinks` into `options={{ … }}` if used. `embeds` (if used) → `EmbedShapeUtil.configure({ embedDefinitions })` passed via `shapeUtils`. Grep for these — TS won't always flag them.
- Keep the existing `onMount` body (initial node seed, snap mode, `PointingPort` splice into the `select` tool, `keepConnectionsAtBottom`, `disableTransparency`, `window.editor` exposure).
- Keep `persistenceKey="workflow"` and the embedded license key.
- Component overrides (`InFrontOfTheCanvas`, `Toolbar`, `MenuPanel`, `StylePanel`) — match upstream `App.tsx`. Render `WorkflowRegions` inside `InFrontOfTheCanvas` per upstream.

### Step 5 — Sweep for v5 breakages the realign won't catch

Grep across `src/tldraw/` and the story file:

- `indicator(` → must be `getIndicatorPath(` in any custom shape we wrote (only `ContentCard` now).
- `fromShapeType` / `toShapeType` → gone; `BindingUtil` hooks read `.type` off the full shape record.
- `Editor.batch(` → `Editor.run(`.
- `editor.mark(` → `editor.markHistoryStoppingPoint(`.
- `stopEventPropagation` → `editor.markEventAsHandled`.
- CSS variables: `--tl-color-snap`, `--tl-color-brush-fill`, `--tl-color-brush-stroke`, `--tl-color-laser`, `--tl-layer-overlays-custom` — removed; selectors `.tl-brush`, `.tl-scribble`, `.tl-handle*` are no-ops. Search our CSS for these.
- `arrow.props.text` direct access (auto-data-migrated but accessor code breaks). Likely a non-issue for us — we don't use arrows.
- Removed `FONT_FAMILIES`, `STROKE_SIZES`, `TEXT_PROPS` constants → use display-values pipeline.

### Step 6 — Run `tldraw-migrate` skill as a sanity pass

Run the upstream `tldraw-migrate` skill across `src/tldraw/`. Treat its output as a checklist, not a commit: tldraw themselves describe it as "a bit of a dice roll". Compare its suggestions against the manual sweep in Step 5; investigate any divergence.

### Step 7 — Type-check and lint

```bash
npx tsc --noEmit
npm run test   # eslint .
```

Resolve errors. Anything not caught here is a runtime regression — Step 8.

## Verification

- *Build*: `npm run storybook`. The "Activities/Workflow" story loads without console errors.
- *Golden path* — create two `Add` nodes, connect output→input, drag the connection center handle to insert a node between, run execution. Output reflects the math.
- *Ports* — hover ports show eligibility highlight; invalid connections (cycles) are rejected.
- *ContentCard* — open whichever story renders `ContentCard`; zoom across all four LOD thresholds (A→B→C→D) and back. Confirm port bindings still attach to content cards.
- *Persistence* — reload the page; canvas restores from `persistenceKey="workflow"`.
- *Undo/redo* — `cmd+z` / `cmd+shift+z` after node creation, connection, and execution.
- *No-arrow regression* — the upstream arrow rewrite (`text` → `richText`) shouldn't affect us, but spot-check that no arrow-related console errors appear.
- *Visual sweep* — selection rings, snap indicators, brush rectangle still render. If any CSS variable from Step 5 was in our stylesheets, the corresponding overlay will silently disappear.

## Risks / open questions

- *React 19.2.1 vs 19.1.1*: upstream template uses a slightly newer 19.x. Likely fine, but if tldraw v5 declares `react@^19.2.0` as a peer we'd need to bump. Check after `npm install`.
- *Storybook 10.3.6 + tldraw 5*: no known incompatibility, but tldraw bundles its own React contexts. If we see "two React copies" warnings, add `tldraw` to Vite's `optimizeDeps` or `dedupe`.
- *License key*: ours is embedded inline. v5 still requires it for production builds; verify Storybook builds don't trip the production check.
- *`ContentCard` indicator path*: the LOD A circle and LOD B+ rectangle outlines need pixel-correct radii — easy to draw the wrong-sized indicator path. Verify against the shape's geometry, not by eye.
- *`WeakCache<Editor, …>` + `createComputedCache`*: still exported from top-level `tldraw` in v5, but cache-invalidation timing in v5 may differ. If execution outputs ever stick to stale values, look here first.
