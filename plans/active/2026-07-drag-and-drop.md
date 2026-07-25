# Drag and drop: capture as a language entry

The view-system work implemented drag and drop twice without ever making it a
subject: dragging a card between board lanes writes the grouping attribute
(`packages/components/src/demos/data-view/WritableBoardDemo.tsx`), and
dragging an attribute chip from a detail pane into the overview surfaces it
(`packages/components/src/demos/attribute-visibility/FluidAttributesDemo.tsx`).
Both are on main and registered in `apps/patterns/src/lib/demo-registry.ts`
(`writable-board`, `fluid-attributes`), on
`@atlaskit/pragmatic-drag-and-drop` behind a lazy adapter loader
(`packages/components/src/utility/dnd.ts`). This plan decides what that
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

## Verdict (2026-07-25, from research/drag-and-drop/2026-07-25.md)

*Pattern node, one coarse `drag-and-drop.mdx`, `activityLevel: operation` —
the strawman stands, with four amendments.*

1. *Coarseness confirmed, variants renamed.* No corpus splits dnd into
   separate patterns except Scott & Neil (Designing Web Interfaces, 2009),
   whose five — Module, List, Object, Action, Collection — become the
   within-page variant names. Upload is nobody's variant; drop it until
   practice demands it. Tidwell 3rd ed. files "Drag-and-Drop" beside
   keyboard actions as an action-invocation method — direct precedent for
   the Keyboard-shortcuts-level placement.
2. *The accessibility clause was understated.* The twin is two independent
   norms, not one: WCAG 2.1.1 (A) requires a keyboard path to the drag's
   outcome; SC 2.5.7 (AA) separately requires a single-pointer non-dragging
   path, and a keyboard twin alone fails it. A "Move to…" menu discharges
   both. ARIA's dnd states are deprecated with no successor and the APG has
   no dnd pattern — the page should say the ecosystem routes around the
   gesture rather than making it AT-operable (Atlassian's stance; GitHub
   found users across abilities preferring the move dialog).
3. *The framing has a prior name.* "Spatial proxy for a semantic write" is
   Hutchins/Hollan/Norman's articulatory directness, achieved for
   non-spatial meanings by designed metaphor; Draper's inter-referential
   I/O (output serving as input) names the drop target exactly. Refusal
   behaviour argues from metaphor overload (one destination, one meaning
   — the trash-eject failure), not just courtesy. Theory lands in
   `references/` + woven vocabulary, as planned; HHN 1985 is a distil
   candidate (currently only a citation inside Bridging Gulfs.md).
4. *Operation, with the price owned.* Buxton's tension-phrasing chunks
   press–move–release into one habituated unit (mode errors "virtually
   impossible"); MacKenzie/Sellen/Buxton measure dragging at ~3× pointing's
   error rate with lower Fitts' bandwidth. Classify as operation; the page
   carries the counterweight — the twin is the ergonomic fast path too,
   not only the accessible one.

Vocabulary overlap (question 5) resolved as keep-parallel-and-link: d3's
drag/brush/zoom module split, tldraw's brush/translate/hand states, and
Figma's origin-point disambiguation all keep canvas-drag distinct from dnd;
tangential edges to pan-and-zoom and selection, no merge.

Mechanism-only is rejected: UI-Patterns, Apple HIG, NN/g, and Atlassian all
name the practice, and the force-resolution needs an authoritative home.
Phase 2 is licensed.

## Status (2026-07-25)

Phases 1–3 are done. `drag-and-drop.mdx` is authored to the contract with the
verdict's four amendments (Scott & Neil variant names, two-obligation twin,
articulatory-directness vocabulary, operation-with-the-price-owned); it borrows
both demos and declares the seven edges (`enables` × 4, `tangential` × 2,
`enacts` agency). The six mention sites carry inline cross-references where
warranted (selection and pan-and-zoom are covered by the tangential edges,
which render on both endpoints). `extract-graph` is clean — 117 nodes, no new
advisories — and the site builds. Phase 4 stays trigger-gated. The research
note's promotion candidates (HHN 1985 and Buxton distils to `references/`,
`docs/references.md` lines) remain uncurated.

## Phases

### 1. Research gate

As above. No dependencies; can run any time.

### 2. Author the entry

Per the gate's verdict. If a pattern node: write `drag-and-drop.mdx` to the
authoring contract (`.claude/rules/pattern-content.md`) — relational
definition phrased as the move, forces from the Context section above,
variants as sections, typed cross-reference headers so the extractor lands
the edges. Borrow the two demos.

Both demos are on main (view-system reshape merged 2026-07-24); their
borrow map is recorded in
[2026-07-view-system-demos](../completed/2026-07-view-system-demos.md).
No branch dependency remains.

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
