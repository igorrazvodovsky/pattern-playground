---
title: "Promote heatmap extension and n-gram engine out of the dynamic-hyperlinks demo"
status: "deferred"
kind: "exec-spec"
created: "2026-05-31"
area: "components"
depends_on: "docs/specs/workspace-layout.md"
---
# Promote heatmap extension and n-gram engine out of the dynamic-hyperlinks demo

The `dynamic-hyperlinks/` demo carries genuine reusable substrate inside the
demos tree: a framework-agnostic n-gram similarity engine and a Tiptap editor
extension. Per the demos containment rule in
[docs/specs/workspace-layout.md](../../docs/specs/workspace-layout.md), mechanism
belongs in the component library proper and `demos/` holds wiring only. This plan
is the standing promotion target for that substrate. It is _trigger-gated_: it
does not run until a trigger fires, so the engine and extension are not refactored
into a public API while the demo is their only consumer.

## Context

`packages/components/src/demos/dynamic-hyperlinks/` is ~535 LOC across six files,
and they sit at three different altitudes:

- `ngram.ts` (151) — n-gram extraction, phrase scoring, and related-mention
  search. Pure TypeScript, no React, no DOM. The actual engine behind the
  pattern's "soft links". Consumed by the two hooks, not by the demo directly.
- `HeatmapPlugin.ts` (120) — a Tiptap `Extension.create` plus a ProseMirror
  decoration plugin (`HeatmapExtension`, `heatmapPluginKey`, `setHeatmapSpans`).
  A genuine, reusable editor capability — structurally a sibling of the
  extensions under `components/editor-plugins/`.
- `useHeatmap.ts` (25), `useSelectionPopup.ts` (69) — React adapters that bind
  the engine and the extension into React state. Reusable in principle, but the
  most demo-shaped of the set.
- `DynamicHyperlinksDemo.tsx` (149) — the wiring: editor + `documents.json`
  sample corpus + the substrate. This is a demo and stays in `demos/`.
- `types.ts` (21) — `CorpusDocument`, `ScoredSpan` and friends; travel with
  their respective consumers.

The empirical fact that gates this plan: nothing outside the demo folder imports
any of it. There is no shipping dynamic-hyperlinks component. Promoting today
would mint a public API for a single demo caller — speculative generality. So
the substrate stays put until a trigger arrives, and this plan records _where_ it
goes so the intent survives.

This is a sibling of the `DataViewRenderer` lift in
[2026-05-collection-move-demos](../completed/2026-05-collection-move-demos.md) Phase B.
That lift resolved the same question the other way in execution: with only
demo-surface consumers, the substrate landed in the shared `demos/` tree rather
than minting component-package API — the precedent this plan's wait-for-a-trigger
stance follows.

## Trigger

Run this plan when _any_ of the following becomes true:

1. A second consumer wants the n-gram engine or the heatmap extension (another
   demo, a real component, or a service).
2. Dynamic hyperlinks ships as a real capability — a `pp-` element, a registered
   editor plugin, or a feature of an existing composition.
3. A deliberate decision to harden the substrate (tests, stable API) independent
   of a second consumer.

Until a trigger fires, the substrate stays in `demos/dynamic-hyperlinks/` and
this plan stays `deferred`. The demos spec's promotion register points here.

## Scope

In scope (once triggered):

- Move `ngram.ts` to a framework-agnostic home in the component library — a
  service or util, per the state-management rule's "business logic in pure TS".
  Default: `packages/components/src/services/ngram/` (or `src/utility/ngram.ts`
  if it stays a single stateless module). Carry the corpus/score types it owns.
- Move `HeatmapPlugin.ts` to `packages/components/src/components/editor-plugins/heatmap/`
  with an `index.ts` barrel, matching the existing plugin folders (`formatting`,
  `commenting`, `explanation`, `references`).
- Add both to the components package's public surface (the `exports` field — see
  the coordination note below).
- Rewire `DynamicHyperlinksDemo.tsx` and the two hooks to import from the new
  homes instead of relative siblings.
- Decide the hooks' fate (see open questions) and place them accordingly.

Out of scope:

- Building a real `<dynamic-hyperlinks>` element or shipping component. That is a
  capability decision, not a file move, and it is one of the _triggers_ for this
  plan rather than part of it.
- Generalising the engine's or extension's API beyond what the existing consumer
  needs. No speculative surface; promote the shape that exists.
- The pattern page. `apps/patterns/src/content/patterns/actions/seeking/dynamic-hyperlinks.mdx`
  imports the demo, not the substrate, and is unaffected.
- Any other demo in the tree.

## Phases

### Phase A — Decide homes and export shape

- Confirm `ngram.ts`'s home: service folder vs single util module. Default
  service folder if it grows state or config; util if it stays stateless.
- Confirm whether `HeatmapExtension` is promoted as a plain Tiptap extension
  (its current shape) or adapted onto the `editor-plugins/core/Plugin` base that
  `commenting`/`explanation` use. Default: keep it a plain Tiptap extension —
  matching `formatting` — unless it needs the event-bus/slot machinery.
- Confirm the hooks' verdict (open question 1).
- Confirm the `exports` field bootstrap (coordination note).

### Phase B — Move the engine

- Move `ngram.ts` (+ owned types) to its Phase-A home.
- Update `useHeatmap.ts` / `useSelectionPopup.ts` imports.
- Add the export entry.

### Phase C — Move the extension

- Move `HeatmapPlugin.ts` to `components/editor-plugins/heatmap/`, add `index.ts`.
- Update `useHeatmap.ts` / `DynamicHyperlinksDemo.tsx` imports.
- Add the export entry.

### Phase D — Rewire demo and verify

- Place the hooks per the Phase-A verdict; rewire `DynamicHyperlinksDemo.tsx`.
- Run verification.

## Verification

- `npm run build` is clean in both `packages/components/` and `apps/patterns/`.
- The pattern-site `dynamic-hyperlinks` page renders the demo island with the
  same behaviour (heatmap layer + selection-driven mentions), no console errors.
- `grep` confirms no imports of the moved files from their old
  `demos/dynamic-hyperlinks/` paths remain anywhere.
- The demos spec's promotion register entry for dynamic-hyperlinks is removed
  (substrate is no longer un-promoted); this plan is marked completed.

## Files modified

- `packages/components/src/demos/dynamic-hyperlinks/ngram.ts` (moved)
- `packages/components/src/demos/dynamic-hyperlinks/HeatmapPlugin.ts` (moved)
- `packages/components/src/demos/dynamic-hyperlinks/{useHeatmap,useSelectionPopup}.ts` (imports; possibly moved)
- `packages/components/src/demos/dynamic-hyperlinks/DynamicHyperlinksDemo.tsx` (imports)
- `packages/components/src/demos/dynamic-hyperlinks/types.ts` (split/moved with consumers)
- New: `packages/components/src/services/ngram/` (or `src/utility/ngram.ts`)
- New: `packages/components/src/components/editor-plugins/heatmap/`
- `packages/components/package.json` (`exports` entries)

## Open questions

1. _Hooks: demo glue or shipped substrate?_ `useHeatmap` and `useSelectionPopup`
   bind the engine and extension into React. If the heatmap capability is meant to
   be consumed by other React surfaces, they belong alongside the extension (or in
   a hooks folder) and get exported. If they are demo-specific orchestration, they
   stay in `demos/`. Default: keep in `demos/` until a second React consumer wants
   the binding — promote only the engine and the extension, which are the
   surface-agnostic pieces.

2. _Engine home: service vs util._ `ngram.ts` is stateless functions today. A util
   module is the lighter fit; a service folder is right only if it grows
   configuration or caching. Default util unless Phase A finds state.

3. _Extension base class._ Adopt `editor-plugins/core/Plugin` or stay a plain
   Tiptap extension? `formatting` is plain; `commenting`/`explanation` use the
   core base. Heatmap has no comment-thread/slot needs, so plain is the default.

4. _Sample corpus._ `documents.json` is demo fixture data and stays in the demo.
   The engine must not depend on it — confirm during the move that `ngram.ts`
   takes the corpus as an argument rather than importing the fixture.

## Coordination

- The components package's `package.json` has _no `exports` field yet_ —
  workspace-split open question 7 (component public API) is unresolved, so today
  everything is reachable by relative/alias import. This plan needs at least the
  two promoted paths exposed. If the `exports` field still does not exist when a
  trigger fires, bootstrapping it (even narrowly, just these entries) is part of
  Phase A — and should be coordinated with whatever broader public-API decision
  is pending, rather than minting a one-off surface.

## Risks

- _Speculative generality._ Promoting before a real second consumer builds a
  public API for one demo caller. Mitigation: the trigger gate — this plan does
  not auto-run; it waits for a consumer or a shipping decision.
- _Exports surface churn._ Adding two ad-hoc `exports` entries ahead of the
  broader public-API verdict could fragment the surface. Mitigation: coordinate
  with workspace-split open question 7; keep the additions minimal and consistent
  with the eventual scheme.
- _Hidden fixture coupling._ If `ngram.ts` secretly imports `documents.json`, the
  engine is not actually framework/data-agnostic. Mitigation: open question 4's
  check during the move.
