---
title: "Workspace split: closure"
status: "active"
kind: "exec-spec"
created: "2026-07-02"
last_reviewed: "2026-07-02"
area: "architecture, pattern-site, storybook"
promoted_to: ""
superseded_by: ""
depends_on: "plans/active/2026-05-workspace-split.md (closes it), plans/active/2026-05-pattern-demos-migration.md, plans/active/2026-05-collection-move-demos.md"
---
# Workspace split: closure

The [workspace-split plan](2026-05-workspace-split.md) is executed in substance: workspaces exist, the Astro site carries the language (126 content files), the extractor reads pattern content only, typed relationships are migrated. This plan closes it — it owns the residue, corrects one silent departure from the plan, and sequences the three plans the split spawned so the branch can converge instead of accumulating open ends.

## Two framings

1. *Closure is territory-shaped, not file-shaped.* The stalled per-file dedup (4 of ~44 pages closed in May, then nothing) shows the wrong unit. The unit of closure is a territory: a coherent cluster of pattern pages whose Storybook duplicates, demos, and inbound links get resolved together, ending in a verified deletion. Each territory is one completable session with a definition of done.

2. *The graph goes to stage 3 deliberately.* The split plan's landing point was stage 2 — component nodes in the data, filtered from view. What actually shipped is a language-only graph (111 nodes: 90 pattern, 11 quality, 9 foundation, 1 collection; zero components) while [docs/specs/graph-relationship-model.md](../../docs/specs/graph-relationship-model.md) still claims components "contribute nodes to the combined dataset". Rather than restore stage 2, promote the accident into the named end state: language-only graph plus a *component manifest* as the catalogue dataset, with cross-references between the two replacing within-graph component edges.

## Current residue (inventory)

- *~40 stale Storybook duplicates.* Migrated pattern pages whose Storybook `.mdx` twins still exist with `role:pattern` Meta tags. Site copies are equal-or-richer in every sampled pair; the duplicates are inert but keep two sources of truth and hold inbound Storybook links.
- *Three unmigrated pattern-roled entries*: `SemanticZoom.stories.tsx` and `InlineConfirmation.stories.tsx` (stories-only, no MDX on either surface) and Toast → `transient-feedback` (settled in [pattern-role-model.md](../../docs/specs/pattern-role-model.md), not executed).
- *Spec drift*: the graph-relationship-model claim above; the split plan still `in progress` in `plans/active/` while other frontmatter already cites it under `plans/completed/`.
- *Dangling references*: [2026-05-pattern-demos-migration.md](2026-05-pattern-demos-migration.md) `depends_on` a `2026-05-embed-components.md` that does not exist; `apps/patterns/src/data/pattern-graph.baseline.json` is a leftover verification artifact.
- *Foundations material* (`packages/components/src/stories/foundations/` — Color, Iconography, Layout, Motion, Typography): untagged, Storybook-only. Resolved: they describe the UI substrate and *stay in Storybook*; they need explicit role tags, not migration.
- *Data-viz `Elements.mdx`* is tagged `role:umbrella` but lives in the Storybook data-viz corpus, which the project keeps parallel to the generic language. The tag and the parallel-corpus stance disagree — verdict needed (open question 2).
- *The dependency boundary is cosmetic.* Root `package.json` still owns all runtime deps (tldraw, Tiptap, d3, react…); the components package declares almost nothing; `apps/patterns` consumes components via source aliases without declaring the workspace dependency. Details and fix in workstream 4.

## Workstream 1 — Bookkeeping (immediate, one sitting)

- Move [2026-05-workspace-split.md](../completed/2026-05-workspace-split.md) to `plans/completed/`, status `completed`, with a tail note pointing residue ownership here. Its "Decomposition: worked examples and learnings" section stays with it; promotion of the stabilised rules into `pattern-role-model.md` waits for a third worked example (open question 3).
- Move [2026-06-typed-relationships.md](../completed/2026-06-typed-relationships.md) to `plans/completed/` (phases A–E shipped; repair pass done 2026-06-30).
- Fix [graph-relationship-model.md](../../docs/specs/graph-relationship-model.md) "Current graph data": the graph is language-only; component references resolve outside it (manifest signposted, workstream 2).
- Repair the demos plan's `depends_on`; its stale-assumptions preamble is folded into workstream 3's verdict step.
- Delete `apps/patterns/src/data/pattern-graph.baseline.json`.
- Tag the five foundations-material pages explicitly (`role:component` fits their "describes UI substrate" reading; revisit only if one earns a site-side language entry).

## Workstream 2 — Stage 3: component manifest

Strawman (research gate before commit, below):

- Generate a `custom-elements.json` for the `pp-*` Lit elements with `@custom-elements-manifest/analyzer` — the web-components-standard manifest format, not a bespoke schema. Props, slots, events, CSS custom properties come from source, not hand-maintained JSON.
- A thin project-level wrapper (`component-manifest.json` or a build step) adds what CEM doesn't know: Storybook docs URL per component, role/tag metadata, the demos index (`packages/components/src/demos/`), and the handful of React components (PatternGraph etc.) if patterns reference them.
- `<ComponentRef>` resolves against the manifest at build time; a broken component reference fails the site build (today it is unvalidated string interpolation).
- The typed-edges question this unlocks (split `enables` from `realised_by`) becomes a cross-dataset reference, per the original plan's stage-3 sketch. Not executed here — the manifest is the carrier; the vocabulary change is its own decision.

*Research gate* ("what would I be wrong about?"): CEM analyzer coverage for this codebase's Lit idioms and the Lit/React mixture; whether Storybook 10 can consume the same manifest (`setCustomElementsManifest`) so one artifact feeds both surfaces; whether Storybook's own `index.json` is the simpler source for URL resolution than hand-mapping; what adjacent design systems (Shoelace/Web Awesome, Carbon web components) actually ship in their manifests. Run after this strawman, before implementation.

## Workstream 3 — Per-territory closure (the bulk)

For each territory below, one pass with this definition of done:

1. *Demo verdicts.* Every `.stories.tsx` in the territory gets a verdict using the demos plan's classes — Storybook-native / A (pure markup) / B (thin shell) / C (gap island) / host-composition ([collection-move plan](2026-05-collection-move-demos.md)) / retire — reconciled to the realised component-keyed `demos/` tree (demos are keyed by the component they wire, shared across pages; not one file per pattern×story).
2. *Demos moved or kept* per verdict; gap registry updated.
3. *Inbound links rewritten.* Every Storybook `path=/docs/...` link into the territory's pattern pages becomes a `PatternRef`.
4. *Duplicates deleted.* The territory's migrated `.mdx` twins removed from `packages/components/src/stories/`; stories files kept only where a verdict keeps them.
5. *Verified.* Storybook build green; site build green; `grep` finds no remaining `path=/docs/` references to the deleted pages; graph regenerated with no unexpected diff.

Territories, in proposed order:

- *T1 Navigation* (10 pages: flat-navigation, fully-connected, hub-and-spoke, hybrid-patterns, multilevel-tree, navigation-overview, overview-detail, pan-and-zoom, pyramid, step-by-step). Mostly prose and diagrams, few or no stories — the cheap warm-up that proves the batch mechanics.
- *T2 Collection moves / DataView* (Filtering, Sorting, Grouping, ItemView, DataView, View, Dashboard). Executes [2026-05-collection-move-demos.md](2026-05-collection-move-demos.md): lift `DataViewRenderer` into package source, implement grouping/filtering/sorting there, author slices, then close the pages. The heaviest territory, and the one with its own exec-spec.
- *T3 Activities* (AITuning, Conversation, EmbeddedIntelligence, GeneratedContent, LivePresentation, LivingDocument, Onboarding, Prompt, Workspace).
- *T4 Coordination + evaluation* (Commenting, Notification, Selection, FocusAndContext) — plus authoring the missing *Semantic zoom* site entry (stories-only today).
- *T5 Operations* (Autofill, MorphingControls, StateDisabled, StateEmpty) — plus the two settled-but-unexecuted migrations: Toast → `transient-feedback.mdx` and the stories-only *Inline confirmation*.
- *T6 Root composites* (BlockBasedEditor, CommandMenu, NavBar, Sections, Toolbar). These sit closest to the move/mechanism seam; run the residue test per page before deleting (a page here may be hiding a mechanism twin the way Form did).

T1 can start immediately. T2 blocks on nothing but is large; T3–T6 are independent of each other and of workstream 2. The [shell-island refactor](2026-06-shell-island-refactor.md) stays its own plan, ungated — schedule on site-performance pain, not on this sequence.

## Workstream 4 — Realize the dependency boundary

The split moved files, not dependencies. The boundary the plan promised ("deps split along package lines"; "patterns import only what the components package exports") is today directory structure plus aliases:

- The root `package.json` still owns *every* runtime dep, including the component-only heavies the split was meant to isolate (tldraw, Tiptap, the d3 set, motion, cmdk, `@base-ui/react`) — `lit` even sits in root *dev*Dependencies. `@pattern-plgrnd/components` declares one devDep (`remark-gfm`).
- `apps/patterns` does not declare `@pattern-plgrnd/components` or `@pattern-plgrnd/shared`; consumption runs through Vite/tsconfig aliases to raw source (`@pkg`, `@components`, `@shared`). `shared`'s `exports` field exists but nothing resolves through it. Every workspace can phantom-import anything, because npm hoists everything from root.
- No `exports` on the components package (the original plan's open question 7, never answered), no tsconfig project references, and the root `tsconfig.json` includes only `apps/server` + `utils` — a server config wearing root clothes.
- Version drift where the same dep is declared twice: `typescript` ~5.6.2 (root) vs ^5.9.2 (server), `zod` 3.24.2 vs 3.25.76, `zustand` 5.0.8 vs 5.0.13, `lit` duplicated. The server package is named `pattern-playground-server`, outside the `@pattern-plgrnd/` scope.

The fix is layered — ownership first, enforcement later:

1. *Dep ownership pass (mechanical, one sitting).* Move component-only deps into `packages/components` (tldraw, Tiptap, d3, motion, cmdk, base-ui, react-to-webcomponent, floating-ui, iconify, lit, react, zustand, plus Storybook and its addons — components owns that surface). Patterns-only deps are already right. Root keeps only genuinely shared tooling: TypeScript, ESLint, Stylelint, Vite/Vitest, Playwright. Declare the real edges: `apps/patterns` gets `"@pattern-plgrnd/components": "*"` and `"@pattern-plgrnd/shared": "*"` as workspace deps (documenting the edge even while aliases do resolution). Align drifted versions; rename the server package `@pattern-plgrnd/server`. Verify with a clean `npm install` + both builds + `npm ls` sanity.
2. *Enforcement stance (decide, don't drift).* Two coherent options: keep the alias-to-raw-source convention (the repo's established pattern; boundary by convention, cheap) or move to a real `exports`-based API on the components package. Recommendation: keep aliases *now*, and fold the public-API verdict into workstream 2's research gate — the component manifest makes the de-facto public surface legible, which is the input an honest `exports` field needs. Deciding `exports` before the manifest exists would be guessing.
3. *pnpm as the enforcement mechanism (optional, later).* The original plan's open question 6 defaulted to npm. Phantom-dep isolation is pnpm's native behaviour; step 1 is exactly the prerequisite that makes a pnpm switch safe. Revisit after step 1 lands — if the dep graph is honest, switching is mostly mechanical; if npm causes no pain, staying is fine.
4. *tsconfig hygiene (small).* Rename or re-scope the root `tsconfig.json` so it stops masquerading as the workspace config while actually covering `apps/server` + `utils`. Project references remain not-adopted — with `noEmit`, bundler resolution, and alias-to-source imports they buy little; note the decision rather than leaving it open.

Step 1 is independent of everything else in this plan and can run before or between territories. Steps 2–3 wait on workstream 2's research gate.

## Process note

What the branch's history teaches (126 commits, 2026-05-15 → 07-02): the serial move → reflect → move loop earned its cost wherever the work was *reflective* — the decomposition worked examples, Inline interface, the host-composition class all came out of it. It failed wherever the work was *mechanical closure*: the per-file dedup stalled at 4 of ~44 for six weeks, and script-driven content transforms needed five restore commits. The operating rule this plan encodes: reflective work stays serial and session-sized; closure work is batched per territory against a checklist and is not left half-open. Verdicts (step 1) are reflective — do them first, unhurried; steps 2–5 are mechanical — finish them in the same pass. Each territory closure ends with the specification-level loop from [2026-07-review-practice.md](2026-07-review-practice.md); departures from plan discovered mid-territory route to *reframe* (edit this plan), not silent drift — the stage-2 → language-only extractor change is exactly the kind of move that should have left a written decision behind.

## Open questions

1. *Manifest scope for React components.* CEM is custom-elements-shaped; PatternGraph and the demo islands are React. Wrapper entries, a second small manifest, or out of scope for now? Decide at the workstream-2 research gate.
2. *Data-viz corpus membership.* `Elements.mdx` carries `role:umbrella` inside the deliberately parallel data-viz corpus. Either the corpus stays parallel and the page loses the language-role tag, or data-viz umbrellas join the graph. Decide before T-territory work touches data-viz links.
3. *Promoting decomposition rules.* The split plan's nine transferable rules rest on two worked examples. Promote into `pattern-role-model.md` after the next decomposition (T6 is the likely source), keeping narratives in the completed plan.
4. *Storybook's long-term role* is assumed: the component catalogue and substrate surface. Not reopened here.
5. *Components-package `exports` field* (original plan's question 7). Deferred to the workstream-2 research gate; the manifest reveals the real public surface first. Until then the alias-to-raw-source convention stands.
6. *npm vs pnpm* (original plan's question 6). Revisit after the dep-ownership pass; pnpm is the enforcement mechanism if convention proves insufficient.

## Progress log

### 2026-07-02 — Workstream 1 (Bookkeeping) complete

All six items done in one sitting:

- `2026-05-workspace-split.md` → `plans/completed/`, status `completed`, tail note added pointing residue ownership to this plan.
- `2026-06-typed-relationships.md` → `plans/completed/` (no YAML frontmatter; the in-body `Status:` line already recorded phases A–E shipped).
- `graph-relationship-model.md` "Current graph data" corrected: graph is language-only (pattern/quality/foundation/collection); components resolve via the manifest, signposted to workstream 2.
- Demos plan `depends_on` repaired `plans/active/` → `plans/archive/2026-05-embed-components.md` (the file lives in `plans/archive/`); the matching in-body reference fixed too.
- `apps/patterns/src/data/pattern-graph.baseline.json` deleted (was untracked/gitignored; no references anywhere).
- Five foundations pages (`Color`, `Iconography`, `Layout`, `Motion`, `Typography`) tagged `'role:component'`, prepended to their `<Meta>` tags arrays.

No build run: changes are docs/plan moves plus Storybook `<Meta>` tag additions and a deleted verification artifact; none touch the language-only graph or site source. Committed as 36e37a4.

### 2026-07-02 — T1 Navigation closed

The cheapest possible territory, as predicted — and the extreme case: ten pages, *zero* `.stories.tsx`, zero inbound `path=/docs/actions-navigation-*` links from anywhere. Steps against the definition of done:

1. *Verdicts*: nothing to classify — no story references exist in the territory. The navigation corpus never used a single Storybook affordance; it was pure language content on the wrong surface.
2. *Demos/gap registry*: no demos to move. Gap registry created at [`plans/component-gaps.md`](../component-gaps.md) (moved out of `apps/patterns/src/data/` — it is a backlog, not site data; the demos plan's path reference updated). Seeded with two prose-derived entries (mega menu, minimap) plus six judgment-derived ones from reviewing the territory: tree view, stepper, pagination (styles exist, no component), split view, zoom controls, workspace switcher.
3. *Inbound links*: none existed; verified no-op.
4. *Duplicates deleted*: all ten `.mdx` twins removed; `stories/actions/navigation/` is gone.
5. *Verified*: Storybook build green; site build green (116 pages indexed); no residual `actions-navigation` references; graph regenerated — the only diff is the two parity repairs listed next (one new `precedes` edge, one restored lifecycle facet).

Parity drops repaired before deletion (site was equal-or-richer everywhere else):

- `step-by-step`: restored `lifecycle: application` (present in the Storybook Meta tags, dropped in migration) and the progress-indicator `ComponentRef`.
- `flat-navigation`: the precursor relation from Storybook hub-and-spoke ("flat navigation → hub and spoke when items exceed screen capacity") had been flattened to an untyped `related`; promoted to a typed `precedes` edge with the note.
- Stale prose: "TODO: sidebar" in fully-connected (and a bare "Sidebar" in multilevel-tree) predated the Sidebar component, which now exists with a story — both now `ComponentRef`-linked to `components-sidebar--docs`.

Reflections (the watch-outs):

- *What the move says about the split*: T1 confirms the thesis cleanly. These pages' only Storybook function was outbound linking to components (nav bar, tabs, breadcrumbs, dropdown, priority+, sidebar, progress indicator). Navigation patterns are the heaviest `ComponentRef` consumers in the language — the model↔implementation seam here is exactly the cross-surface reference the stage-3 manifest must validate, so this corpus is a good test bed for workstream 2. The stale "TODO: sidebar" that survived after Sidebar shipped is a small argument for manifest-validated refs over prose TODOs.
- *Do navigation patterns fit the pattern definition?* Imperfectly. They are connective topologies chosen among mutual alternatives, not interface moves — hence the unusually dense `alternative` edges among them, rare elsewhere in the graph. Two fit issues worth a future verdict: `hybrid-patterns` is a catalogue of six combinations under one slug (the plural title betrays it) — closer to a collection than a pattern; and every page's behavioural-position section links `/patterns/interaction#…` anchors that are not graph-addressable, so the model↔behaviour relationships stay invisible to the graph. The latter was already noted in navigation-overview's To-do; T1 confirms it is territory-wide, not page-local.

Inputs recorded for later work (not solved in this plan):

- *Edge types can be context-conditional.* The flat-navigation → hub-and-spoke edge reads as `precedes` when the item count is dynamic (growth forces the transition — something triggers the reconsideration) but as plain `alternative` when the count is small and fixed (the actor acknowledges both models; nothing prompts a move between them). The vocabulary forces one label per edge; the note field is where the condition lives today ("when items exceed screen capacity" *is* the condition). This feeds a stated longer-term direction: decision trees merge into the knowledge graph, and patterns gain *consequence / resulting-context* properties plus a way for the actor to *accumulate situation awareness* while traversing. Read through that frame, a conditional `precedes` decomposes: the condition is the join between A's resulting context ("item inventory grows") and B's initiating situation ("items exceed screen capacity") — the same material [decision-dimensions.md](../../docs/language/decision-dimensions.md) calls *situational hints* on `recommends` edges. The convergence point is the graph itself: tree branches, edge conditions, and consequence properties are one construct seen from three ends, and accumulated situation awareness is what lets an actor walk it by situation-matching rather than link-following. Belongs to relationship-vocabulary work.
- *Hybrid patterns want splitting without losing the shared page.* Each of the six combinations is arguably its own pattern (own alternatives, own trigger conditions) but the comparative narrative is the page's value. Needs setup-side work: either multiple graph entries sourced from one file, or anchor-level nodes — the filename-stem = slug = graph-ID identity is the blocker. Same substrate as the behaviour-anchor item in the [tech debt tracker](../tech-debt-tracker.md): both need sub-page graph addressability.

### 2026-07-02 — T5 Operations closed

Six entries: four migrated pages with Storybook twins (Autofill, MorphingControls, StateDisabled, StateEmpty) plus the two settled-but-unexecuted migrations (Toast → `transient-feedback`, stories-only Inline confirmation). `stories/operations/` now holds only the two `role:component` pages that stay (Combobox, Overflow). Steps against the definition of done:

1. *Verdicts* — the first territory with real stories, so the classes got their first genuine exercise:
   - `MorphingControls.stories.tsx`: *FollowUnfollow* and *MultiState* class B (thin useState shells), migrated; *PlayPause* retired (referenced by no MDX on either surface, structural duplicate of the toggle).
   - `InlineConfirmation.stories.tsx`: both stories (*Default*, *StagedDeletion*) turned out to be *already ported* to `demos/deletion.tsx` (`InlineConfirmationDemo`, `StagedDeletionDemo`) and hidden from Storybook with `!autodocs !dev` — the tags mark migrated leftovers. Retired; the new site entry reuses the existing island. A verdict class the plan didn't name: *already-ported* — check `demos/` before porting anything. The general shape: `demos/` is the shared substrate consumed from both surfaces — several pattern pages can reuse one demo, and a Storybook story that wants one imports it from `demos/` rather than keeping a private copy.
   - `Toast.stories.tsx` (Primitives/Toast, component — stays): *Default* and *Multiple* Storybook-native (play test, stacking); *Notification* retired (copy-only duplicate of Default — one consumer, the T4-territory Storybook `Notification.mdx`, repointed at Default); *ToastWithUndo* retired (already ported to `demos/deletion.tsx`).
2. *Demos/gap registry*: new `demos/morphing-controls.tsx` (FollowUnfollowDemo, MultiStateCloseDemo), wired into the site page's empty Toggle / Multi-state close sections. Gap registry +1: *Inline confirm button* — the `InlineConfirmButton` shell was duplicated verbatim between the retired stories file and `demos/deletion.tsx`; the duplication is the gap signal.
3. *Inbound links*: `operations.md` ComponentRefs → site links (morphing-controls, inline-confirmation, and the Toast row now reads "Transient feedback … typically delivered as a toast"); `notification.mdx` and `prose.mdx` prose now link `/patterns/transient-feedback` while keeping `primitives-toast--docs` ComponentRefs where the component is meant (modality, Drawer.mdx untouched — component-level references stay valid). Extractor decision-tree leaves remapped: deletion's `Inline confirmation` and notification's `Toast` now resolve to graph nodes instead of silently skipping.
4. *Deletions*: the four `.mdx` twins, both retired stories files, and `Toast.profile.ts` (moved to site convention as `transient-feedback.profile.ts`).
5. *Verified*: Storybook + site builds green (118 pages, was 116); no residual `operations-*` refs to deleted pages; graph regenerated — 113 nodes (+2), 633 edges; diff is exactly the two new nodes, their authored edges, one new `enacts`, and three new `recommends` from the remapped tree leaves.

The Toast seam, as resolved: `Toast.mdx` stays as the `Primitives/Toast` component doc, slimmed to the mechanism contract (behaviours, stacking, accessibility, ARIA reference) with a `PatternRef` to the move; Timing, the undo-carrying guidance, the related-patterns web, and Carbon/Material references moved to `transient-feedback.mdx`. The profile sidecar describes the move, so it moved with it. Notification's "### Toast" heading keeps the ComponentRef (parallel to Callout/Dialog — the Type section lists delivery mechanisms); the move link lives in its prose.

Inline confirmation was authored fresh (dialog fatigue vs in-place commitment; the second deliberate activation as the whole safeguard), reusing the deletion island — the demos-plan note that demos are shared across pages, exercised for real.

Reflections:

- *Do state descriptions fit the pattern definition?* Split verdict. `state-empty` fits comfortably: it is the system taking a turn — acknowledging absence and scaffolding the next step; its variants are escalating degrees of that scaffolding (the review also surfaced a missing quality edge, now added: `enacts: learnability`). `state-disabled` is the interesting case: it *is* a move (signalling unavailability in place), but the page argues against making it and its only typed edges are `alternative` — the signature of a *move of last resort*. The pattern definition distinguishes anti-patterns from patterns, yet the language has no way to mark an entry as negative-space; state-disabled is the test case if that ever gets named. Not a blocker — a documented move with mostly-bad force resolution is still repertoire.
- *Operations altitude*: T5's entries are largely moves the *system* makes toward the actor (pre-populating, acknowledging, announcing absence), where the actor's side is automatized — consistent with the AT reading of operations, and a contrast with T1's actor-chosen topologies. No vocabulary change needed; worth remembering when a future entry seems to lack an "actor move".
- *Conditional edges, second sighting*: the notification tree emits *two* `recommends` edges to transient-feedback with distinct `situationalHints` paths (status-communication vs dismissible-alert). This is the T1 observation about context-conditional edges showing up natively — the graph already carries two same-typed edges between the same pair distinguished only by situation, which is the construct the decision-tree merge direction needs.

### 2026-07-02 — T5 addendum: demo ownership re-homed

The T5 closure initially left `InlineConfirmationDemo` and `ToastWithUndoDemo` in `demos/deletion.tsx` — provenance-shaped grouping (the page the demos were authored to support), which made inline-confirmation.mdx import from `@pkg/demos/deletion`. Reconciled to move-keyed ownership: the pattern that names the move owns its demo file; referencing pages borrow. Now `demos/inline-confirmation.tsx` and `demos/transient-feedback.tsx` own those demos, deletion.mdx is the borrower (correct reading: deletion is a composite action whose confirmation variants are those operation-level moves), and cross-page scaffolding sits in small shared files (`demos/shared.ts`, `demos/delete-icon-button.tsx`). Rule recorded in the demos plan preamble. Gap-registry row renamed from "Inline confirm button" to "Armed/morphing control" — a component named for the move would freeze the move into a mechanism; the honest gap is the affordance-swap mechanism one level down.

Inputs recorded, deliberately not acted on:

*action-consequences is a decision tree that hasn't noticed it's one — and the vocabulary source for consequence properties.* Its severity ladder is a prose selector over confirmation moves; deletion's Mermaid tree is this framework projected onto one action (the tree's first question is the time-to-recover dimension). Tree-ifying the page would emit `recommends` edges with situational hints to undo, inline-confirmation, dialog, and typed friction. Bigger: its three dimensions (time to recover, scope of impact, cascade effects) are the natural type system for the planned consequence/resulting-context properties — when tree branches, edge conditions, and consequence properties converge in the graph, these dimensions are what the conditions get typed against. Belongs to the graph-situation work, not territory closure. (What did land now: typed notes on its edges, a `related` edge to inline-confirmation with per-direction notes, and `demos/action-consequences.tsx` — a four-action ladder demo on non-deletion actions, chosen to show the framework's range across the *scope* dimension rather than re-embedding deletion's series.)

*Morphing controls sits on the move/mechanism seam.* The pattern reads as a move (replacing an exhausted affordance set with the next relevant one), but its force-resolution is largely mechanism-shaped — state swap, timeout reversion, the accessibility of a control whose label and role change under the actor. It may eventually want the bilingual treatment (`role: component` language entries per pattern-role-model.md), or the armed-control mechanism may earn the component that realises it. Decide when something forces it — the gap-registry row and inline-confirmation's `instantiates` edge both point here. *(Resolved 2026-07-07 — see below.)*

### 2026-07-07 — Morphing controls resolved to the mechanism side; deletion's ladder deferred to the framework

A redundancy review of the confirmation cluster forced the parked seam. Two findings, both acted on:

*Deletion no longer restates the framework.* Its "Variants by confirmation method" section walked the same four rungs as action-consequences' severity ladder in its own words. Now "Choosing a confirmation method": one paragraph handing rung semantics to the framework and the move pages (undo on transient feedback, inline confirmation), with the four demos kept in place as deletion's worked series. The Mermaid decision tree stays — it is the `recommends` source until the graph-situation work absorbs it.

*Morphing controls is a mechanism, and now lives where mechanisms live.* The site pattern page dissolved into a Storybook mechanism-contract doc (`stories/operations/MorphingControls.mdx` + `.stories.tsx`, `role:component`), shaped like the slimmed Toast.mdx: behaviours (in-place swap, distinct states, meaningful transitions), accessibility of a control whose name changes under the actor, PatternRef to inline-confirmation for the move semantics. The stories import `FollowUnfollowDemo`/`MultiStateCloseDemo` from `demos/morphing-controls.tsx` — the two-way substrate exercised in the Storybook direction. This partially reverses T5's twin-deletion verdict on `stories/operations/MorphingControls.*`: those were deleted as migrated twins of a site page that has itself now been judged mechanism-shaped; the new doc is a fresh mechanism contract, not a resurrection. Graph consequences: node and four edges gone (112 nodes / 629 edges), including the stretch `instantiates: progressive-disclosure`. inline-confirmation lost its only `instantiates` edge; its "Materials and hosts" now names the mechanism via ComponentRef — the same pattern→mechanism reference shape as transient-feedback→toast. unavailable-actions' edge became a body-prose ComponentRef; Button.mdx/Switch.mdx/operations.md repointed to the Storybook doc. Both builds green.

### 2026-07-07 — Feedback cluster: transient-feedback broadened, status-feedback reframed as the selector it is

Reviewing transient-feedback against NN/g's indicators/validations/notifications taxonomy showed the cluster runs two orthogonal axes: status-feedback's sections classify by *information type and initiation*, while transient-feedback is a *delivery shape* (the attention contract: peripheral, self-dismissing). Edits landed:

- *transient-feedback* now narrates both of its situations — acknowledgement (actor watching, missability free) and events from elsewhere (missability is the price of non-disruption, so *safe to miss* becomes the admission criterion, with durable homes named for must-eventually-know events). This catches the prose up with the graph, which already carried two `recommends` edges from notification's tree with distinct situational hints. The definition was sharpened around the persistence rule: the message's job must complete in a glance.
- *status-feedback* rewritten in framework voice: three dimensions (initiation, action required, urgency) as the schema, three sections that route to moves instead of restating them (the Notification section previously duplicated notification.mdx's opening).

Inputs recorded, deliberately not acted on:

*status-feedback is the second prose decision tree*, beside action-consequences: its dimensions are a selector over feedback moves and could emit `recommends` edges (→ indication, validation, notification's routing) when the graph-situation work lands. The symmetry is worth keeping visible: action-consequences calibrates friction *before* the act, status-feedback calibrates attention *after* it, and undo is the hinge between them.

*Validation is a registered candidate move* — the persistent, correction-demanding shape (user-input initiated, arrives at the field, must not evaporate). Written as a stub (2026-07-07): `validation.mdx` carries the contract (at the field, fix named, persists until corrected), the reward-early-punish-late timing rule, and edges (`instantiates` status-feedback; form, data-entry, state-disabled). A TODO comment lists what the full page still owes — message voice, error summary, prevention vs correction, a demo, progressive help.
