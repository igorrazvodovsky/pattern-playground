# Drag and drop: capture as a language entry

The view-system work implemented drag and drop twice without ever making it a
subject: dragging a card between board lanes writes the grouping attribute
(`WritableBoardDemo`), and dragging an attribute chip from a detail pane into
the overview surfaces it (`FluidAttributesDemo`). Both live uncommitted on the
`view-system-reshape` worktree, on `@atlaskit/pragmatic-drag-and-drop` behind a
lazy adapter loader (`demos/view-family/dnd.ts`). This plan decides what that
practice becomes in the library — a pattern node, a mechanism annotation, or
both — and authors the result. The classification is *open*: a strawman is
recorded below, and a research gate sits between it and any authored page.

## Context

Drag and drop currently appears in the corpus only as a passing
input-modality mention, in five pages: selection (drag-rectangle),
pan-and-zoom (drag to pan), mastery (gesture list), data-view
(write-through-projection), grouping (writable lanes), attribute-visibility
(surfacing). The moves those last three describe already have homes; the
technique itself has no node, and nothing owns its force-resolution.

The two implementations resolved the same forces the same way, which is what
makes this look pattern-grade rather than plumbing:

- *The gesture is a spatial proxy for a semantic operation.* The destination
  carries the meaning; dropping writes the attribute the destination
  represents. The write travels with the semantics (the groupBy), not with
  the board or the gesture.
- *A destination whose meaning is computed refuses the write*, and the
  refusal surfaces (status line) rather than silently failing — grouping by
  price band makes the same gesture illegal.
- *Drag is an accelerator, never the sole path.* Every drag has a non-pointer
  twin performing the identical write: the "Move to…" menu on cards, the
  show/hide toggle on attribute chips.

## Strawman classification

Held loosely; the research gate exists to break it.

One coarse pattern node, `drag-and-drop.mdx`:

- *Name.* "Drag and drop" stands under the industry-standard-name clause in
  `docs/specs/pattern-role-model.md` — the practice community's own term for
  the move, the same footing as Keyboard shortcuts.
- *Role and level.* `role: pattern`, `activityLevel: operation`,
  `mediation: individual`, no `lifecycle` field. The gesture habituates to
  something a skilled actor "just does"; the design work is making legal
  targets legible and refusals audible. Operation-level precedents: Keyboard
  shortcuts, Bounded choice.
- *Coarseness.* Reorder-within-list, transfer-between-containers,
  surface-into-view, drop-to-upload stay as named variants inside the page
  until fission signals appear.
- *Edges.* `enables` → data-view, grouping, attribute-visibility, sorting
  (manual reorder). Tangential → pan-and-zoom (same gesture, spatial
  navigation rather than semantic write) and selection (drag-rectangle).
  `enacts` → agency. Accessibility is the central design consideration, not
  a footnote. Direct-manipulation theory grounds the page through
  `references/`, not a foundation node.
- *Demos.* The page borrows both existing demos — refused vs. accepted
  write, menu twin vs. toggle twin.

The alternative the strawman rejects: pure mechanism — no language node,
a Storybook Utilities entry for the scaffolding, enriched mentions in the
five pages. Cost: the proxy/refusal/non-pointer-twin resolution has no
authoritative home and gets restated wherever drag appears. The gate can
still return this verdict if the literature carves the territory that way.

## Research gate

What would the strawman be wrong about? Run the `research` skill →
`research/drag-and-drop/` (persistent `query.yml`, dated synthesis), aimed
at these questions:

1. *Is it a move at all, or an input technique?* How do the pattern corpora
   carve it — Tidwell, van Welie, NN/g, Apple HIG, Material, Atlassian's own
   pragmatic-drag-and-drop design guidance? If the corpora treat drag and
   drop as one named pattern, the coarse node stands; if they split reorder
   from transfer from upload, the coarseness claim weakens.
2. *Does the accessibility stance hold as normative?* WCAG 2.2 SC 2.5.7
   (Dragging Movements) appears to make the non-pointer twin a requirement,
   not craft — confirm, and collect the accessible-dnd interaction research
   (ARIA patterns, screen-reader dnd studies).
3. *Does the "spatial proxy for a semantic write" framing survive contact?*
   Direct-manipulation theory (Shneiderman; Hutchins, Hollan & Norman's gulf
   framing) may name this better or differently. Measure any foundation
   temptation against Bridging Gulfs — theory goes to `references/` and
   woven vocabulary, not a foundation node.
4. *Operation or action?* The habituation claim is asserted, not evidenced.
   Check whether the literature places dnd attention-demand nearer pan/zoom
   (operation) or deliberate commands (action) — target legibility during a
   drag is focal in a way keyboard shortcuts are not.
5. *Vocabulary overlap.* "Drag" in canvas/data-viz contexts (pan, marquee,
   brush) shares the word but not the move — keep parallel and link, don't
   merge by label match.

Gate output: a dated synthesis note plus a short verdict section appended to
this plan (pattern node / mechanism only / both, and at which level). The
verdict, not the strawman, licenses Phase 2.

## Phases

### 1. Research gate

As above. Independent of the view-system branch; can run any time.

### 2. Author the entry

Per the gate's verdict. If a pattern node: write `drag-and-drop.mdx` to the
authoring contract (`.claude/rules/pattern-content.md`) — relational
definition phrased as the move, forces from the Context section above,
variants as sections, typed cross-reference headers so the extractor lands
the edges. Borrow the two demos.

Dependency: both demos are uncommitted on the `view-system-reshape`
worktree and their borrow map belongs to
[2026-07-view-system-demos](2026-07-view-system-demos.md) — this phase rides
with or after that work landing, on the same branch.

### 3. Update neighbours

Sweep the six mention sites (selection, pan-and-zoom, mastery, data-view,
grouping, attribute-visibility) and add cross-references where the mention
warrants one; run `npm run extract-graph`; check the new node's
neighbourhood for edge-axis anomalies.

### 4. Storybook Utilities entry — trigger-gated

The scaffolding (`dnd.ts` loader, draggable/drop-target wiring,
`data-dragging`/`data-drop-over` conventions) stays demo-local for now.
Promote it to a Utilities catalogue entry only when a second consumer needs
shared scaffolding or a reusable block emerges — not speculatively.
