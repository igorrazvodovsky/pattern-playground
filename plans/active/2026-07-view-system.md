---
title: "View system: retire the hub, reframe the family"
status: "active"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-12"
area: "language, graph"
promoted_to: ""
superseded_by: ""
---
# View system: retire the hub, reframe the family

## Context

The view-system research project (Dropbox `PARA/1 Projects/view system/`,
2026-07-12) maps the pattern family in which one underlying model is given
many coexisting projections. Its unit definition: a view is a named
projection of a model — query + representation + arrangement — and the
family boundary is the shared model, not the shared screen. Three
literatures (clinical informatics, malleable-ODI HCI, BI practice)
independently conclude that a single fixed view is a category error; value
lives in a system of views differentiated by task, increasingly composed at
use-time. The research's own pattern notes are artifacts of that project —
source material for authoring, not replacement text.

Corpus decisions taken 2026-07-12 against that research:

1. `view.mdx` retires. Its contents distribute; only interconnected
   patterns remain — no hub. A collection conversion was considered and
   rejected: the page's "dimensions" were other patterns' content filed
   under one roof, and its boundary prose does more work as edge notes on
   the exact pairs where confusion arises.
2. `dashboard.mdx` renames to `needs-based-view.mdx` (its title is already
   "Needs-based view") and becomes the family's largest move — the top the
   composition patterns help complete. Written as a move (situation,
   forces, consequences), never as a survey; edges do the surveying.
   Renamed again 2026-07-16 to `purpose-keyed-view.mdx` ("Purpose-keyed
   view"): the page's own prose keys on *purpose*, not need; "-keyed"
   names the mechanism; "task" was rejected for narrowing past the
   monitoring variant and colliding with vis task-taxonomy vocabulary.
   The new name was name-checked by the author.
3. `overview-detail.mdx` reframes from "simultaneous split panes" (one
   layout value) to the full pattern: two coexisting projections of one
   collection at different abstraction rungs, coupled by the current item
   propagating. Scoped to item-structured models.
4. `coordinated-views` is minted — the one missing composition node.
5. `data-view.mdx` and `item-view.mdx` tighten around the projection
   anatomy and the representation ladder; no reshape.
6. Authorship-axis material (saved views, role presets, pinboard, enforced
   sharing) stays prose with named fission triggers; no new nodes yet.

The family algebra the reframes commit to: a data-view is many item-views
at one uniform low rung plus framing controls; overview-detail holds two
rungs open at once (population low, focused item high); semantic zoom moves
the whole population one rung at a time under a scale control;
focus-and-context varies the rung per item with distance from attention.
Cockburn's taxonomy falls out of how ladder rungs are distributed across
space, time, and attention.

## Phase 0 — gates, before authoring

1. _Read `malleable-odi.pdf`_ (Papers store). Gates Phase 2: the reframed
   overview-detail's spine is Min et al.'s content / composition / layout
   design space; the canonical note is solid but the dimension sub-values
   and the customisation evidence deserve the primary.
2. _Read `meridian.pdf`._ Gates the saved-view minting decision and the
   authorship narration (Phases 3 and 5): the Meridian spec is the
   saved-view object generalised, and its malleability component is
   "on by default, selectively disabled".
3. _Skim the `Points of View` canonical note_ (vault) before weaving the
   unit definition into data-view's opening (Phase 3).
4. _Research gate `research/view-system/`_ (query.yml + dated findings),
   framed "what would I be wrong about?":
   - The overview-detail carving knowingly disagrees with Tidwell, whom
     navigation-overview cites: she splits Two-Panel Selector /
     One-Window Drilldown / Alternative Views into separate patterns.
     Check NN/g master-detail and welie.com as well; confirm no stronger
     counter-argument to the one-node shape before committing.
   - Name checks: "needs-based view" in the wild; "coordinated views"
     against the CMV community's "coordinated multiple views".
   - Writable-views prior art on the UI side (does any language name
     editing-through-a-projection?).

   Canonical notes suffice for the remaining sources (Get To The Point,
   Baldonado, Sarikaya, DaaS, The Eyes Have It; Cockburn was absorbed via
   `research/semantic-zoom/`).

## Phase 1 — Needs-based view

Rename `dashboard.mdx` → `needs-based-view.mdx` (filename stem is slug and
graph ID). Inbound updates: data-visualization.mdx's `related` edge target;
the commented assistance.mdx block's URL if uncommented.

Content:

- Problem statement carries the three-literature claim: the
  well-visualised general dashboard beat the EHR on every measure and
  residents still failed problem formulation; developers instantiate one
  view for everyone; the pre-built report cannot keep pace with the
  questions. The bottleneck is characterisation, not access.
- Absorb view.mdx's intent dimension — monitoring / analytical exploration
  / drilldown investigation stay as variants, now stated once in the
  corpus.
- New section, graduated tiers: ambient → at-a-glance → focused, staged on
  a recurring workflow's rhythm; each tier designed for its attention
  budget; movement inward is deliberately solicited; the outer tier is
  often deliberately common to the group. Non-clinical instance: CI status
  badge → checks list → per-check log.
- New section, problem-curated views: a checklist keyed to detected
  problems, doubling as index, navigation, status, and audit trail;
  curation carries provenance; annotation asymmetry guards against
  priming; the exploratory escape hatch is structurally required, not
  optional; codifiability is the scoping condition and its blind spot.
  Full-recurrence instance: the IDE problems panel.
- Situation block. Edges: `serves: assistance` (station: perceiving —
  compresses state into a glanceable monitoring overview);
  `enacts: adaptation` migrates from view.mdx; keep and sharpen the
  data-view / item-view `related` pair.
- Resources: Get To The Point, Sarikaya, DaaS, Bunin (both posts),
  Barakov.

## Phase 2 — Overview-detail reframe; mint Coordinated views

`overview-detail.mdx`:

- Identity: two coexisting projections of one collection at different
  abstraction rungs, connected by the current item propagating between
  them. Spine: content / composition / layout (Min et al.). Simultaneity
  demotes to one layout value; the list-page → item-page roundtrip
  (new-page layout) is claimed — it currently has no corpus home.
- Forces and evidence: the overview's attribute subset is everyone's
  ceiling (Airbnb's map shows only price); users prefer overviews even
  where they don't improve performance; combined techniques beat any
  single one. Composition: recursion (ODIs nest inside detail views),
  intermediate detail tiers.
- Scope: item-structured models only. Continuous-space O+D — minimap →
  source, overview map with field-of-view box — is out; a boundary note
  routes it to pan-and-zoom plus coordinated-views (navigational
  slaving).
- Edges: upgrade the data-view / item-view `related` pair to
  `composed-of: [data-view, item-view]`; add
  `instantiates: coordinated-views`; re-note the hub-and-spoke
  `alternative` (the boundary is shared model vs heterogeneous sections;
  "the sequential alternative" is wrong — the sequential form is this
  pattern's own new-page layout); add `complements: semantic-zoom` with
  the combination evidence. The coupling is focus propagation, not
  selection-as-staking (selection.mdx draws this line); say so in prose,
  don't author a selection edge here.
- navigation-overview.mdx: update the survey note (from "simultaneous
  display (split view)" to the coupling framing, simultaneity as the
  topology-relevant variant); optionally add a second tree leaf landing on
  overview-detail with a roundtrip hint — two recommends rows of one
  decision is sanctioned by the vocabulary.
  Went further 2026-07-16: the survey restratified by the shape of what is
  navigated — continuous space (pan-and-zoom), prescribed sequence
  (step-by-step, pyramid), one collection (overview-detail, voiced as the
  handoff to the view family), heterogeneous sections (the topologies
  proper). The old `Simultaneous` tree leaf (split-pane residue) was
  removed — the two-sections-at-once case is workspace territory, noted in
  prose; the monitoring behaviour line now points at purpose-keyed view.
- Situation block.

`coordinated-views.mdx` (new; `role: pattern`, `group: coordination`):

- Move: couple several projections of one model so selection, navigation,
  and highlighting propagate — relationships become something the actor
  sees rather than remembers and infers.
- Solution: coupling functions mapping objects and navigational state
  across views; Baldonado's eight guidelines as the trade-off machinery
  (when: diversity, complementarity, decomposition, parsimony; how:
  space/time optimisation, self-evidence — sub-100 ms propagation or
  visibly decouple — consistency, attention management).
- Consequences: visual comparison replaces remember-and-infer; cue
  accuracy is a correctness property (false positives imply relationships
  that don't hold, latency above ~100 ms creates false negatives);
  parsimony — merge views with near-identical semantics, couple only
  where coupling demonstrably helps.
- Instances, product-first to resist chartward drift: Obsidian's editor /
  graph / backlinks panes, email triage list + reading pane, booking
  list + map + detail, BI cross-filtering.
- Edges: `composed-of: [selection]` with a note honouring the
  selection-vs-focus distinction (propagated designation is the coupling
  payload; in the overview-detail case it is focus). Demo optional —
  data-view slices could later be wired into a linked pair; not owed at
  mint.
- Situation block. Resources: Baldonado 2000; Roberts 2007 queued as the
  deepening read.

## Phase 3 — Data-view and item-view tighten

`data-view.mdx`:

- Opening weaves the unit definition: a named projection of a model —
  query + representation + arrangement — and the toolbar is that anatomy
  (filter = query; view switcher = representation; sort/group =
  arrangement; attribute selector = the malleable overview). Reword the
  "within the [view system](/patterns/view)" phrase; the family name
  survives as plain prose.
- Representation switching narrated as the core product move: one
  collection as list, board, table, calendar — the move Notion, Airtable,
  and Obsidian Bases ship as core product.
- Attribute selection = Fluid Attributes; evidence from the malleable-ODI
  read (8.33% of sites offered any customisation; hoarders vs
  minimalists).
- Saved views gets its single home here (view.mdx's duplicate dies):
  default / role / personal authorship; the saved spec captures the whole
  framing; lifecycle consequence — saved framings go stale and accumulate,
  pruning is part of the pattern; extract-task ancestry (The Eyes Have
  It).
- New section, writable views: which edits are legal through which
  representation; how refused or ambiguous writes surface; dragging a card
  between board columns as a write executed through a projection.
  Product-grounded now; the view-update-problem reading deepens it later.
- Time as a framing axis (snapshot / trend / history) in one line, linked
  to temporality.
- Edges: drop the bare `related: view`; add `composed-of: [item-view]`
  (many item-views at one uniform rung — sharpens the current
  "single-entity counterpart" note); `enacts: malleability` and
  `enacts: density` migrate from view.mdx with sharp, move-specific notes.
- Demo narration: the `controls` prop is designer-side disabling of
  malleability — enforced framing is degenerate framing, still a framing.

`item-view.mdx`:

- Adopt "representation ladder" as the section language (semantic-zoom
  already speaks it); name the entity-page reading at the full/dedicated
  scope (the detail side promoted to a destination).
- Decide whether the ladder gains a glyph/mark rung below reference —
  Min et al.'s visual abstractions (colour shading, dots) are per-item
  renderings that carry no name. Decide during authoring.
- Absorb view.mdx's transition judgement into §Transitions: the choice of
  mechanism depends on the relationship between views and the need to
  preserve spatial context.
- Situation blocks on both pages.

## Phase 4 — Retire view.mdx

Precondition: Phases 1–3 landed, so every receiving home exists.

- Verify the distribution before deleting: scope dimension → the
  item-view / data-view split itself; granularity → item-view; intent →
  purpose-keyed-view; time → data-view; navigation mechanisms → item-view
  §Transitions + overview-detail layout + navigation-overview; saved
  views → data-view; unit definition → data-view opening, theory lineage
  (MVC, database views, Points of View) → references; boundary → edge
  notes (workspace, pan-and-zoom, data-visualization notes already carry
  it); enacts → migrated in Phases 1 and 3.
- Delete the file. Inbound sweep: malleability.mdx body link
  `[views](/patterns/view)`; "within the view system" phrases in
  item-view.mdx and purpose-keyed-view.mdx bodies.
- Redirects: none configured today. Add astro config `redirects` entries
  `/patterns/dashboard` → `/patterns/purpose-keyed-view` and
  `/patterns/view` → `/patterns/purpose-keyed-view`, or accept stale URLs.
  The config entries are cheap; prefer them.
- Regenerate the pattern graph; run the extractor/validator; check
  RelatedPatterns rendering on every touched page; confirm the
  navigation-overview tree leaf still resolves (overview-detail's slug is
  unchanged).

## Phase 5 — small touches

- semantic-zoom.mdx: a semantic-resize variant line (container geometry,
  not zoom, drives the representation switch — Masonview); Meridian's
  `shownAttributes` as evidence the mechanism reduces to per-level
  attribute selection. Re-home the judgement from the worksheet's two lost
  notes ("density-preserving transitions between framings") — likely a
  density-flavoured note or enact on this page.
- focus-and-context.mdx: one line on cue-based techniques as the
  orthogonal fourth Cockburn branch; revisit the fun-meter doubt — the
  taxonomy answers "does this stand on its own" with yes.
- malleability.mdx: an authorship-axis paragraph — design-time → use-time;
  malleable by default, selectively disabled; enforced commonality as a
  deliberate ceiling, usually scoped to a ritual or role rather than
  unscoped. Repoint its body link from `/patterns/view` to data-view's
  saved views.
- `group:` decision: the family pages scatter across sense-making /
  seeking / evaluation / navigation. Decide one shared nav group or keep
  the scatter deliberately; apply in one pass. Decided 2026-07-16: keep
  the scatter — each page sits in the activity group its move serves,
  the family is carried by its typed edges, and a shared nav group would
  rebuild the retired hub in navigation clothing (coordinated-views
  minted into `coordination`).

## Worksheet coordination

Rows in `plans/active/2026-07-related-residue-worksheet.md` this plan
touches — annotate as superseded when the phase lands; verdicts are not
pre-filled from here:

- view ↔ semantic-zoom (lost note) — mooted by retirement; judgement
  re-homed in Phase 5.
- dashboard ↔ semantic-zoom (lost note) — same judgement, re-homed.
- data-view `related` → view — mooted; edge dropped in Phase 3.
- overview-detail ↔ data-view / item-view §A2 rows — superseded by the
  composed-of upgrade in Phase 2.
- filtering / sorting / grouping ↔ data-view `precedes` rows — the
  projection anatomy supplies an argument (they are constituents of the
  framing, the query and arrangement, so `enables` rather than
  `precedes`); the verdicts stay with the worksheet process.

Untouched rows proceed independently.

## Deferred, with triggers

- _Workspace boundary_: the reshape carved the screen-composition seam
  (coupled projections → coordinated-views; heterogeneous contexts →
  workspace) in prose only, and workspace's pre-reshape edge notes collide
  with the new vocabulary. Spun out to `2026-07-workspace-boundary.md`.

- _Saved view node_: decide after the Meridian read; mint when another
  page needs to point at it, or when preset / pinboard / personal-lens
  material earns nodes and wants a genus.
- _Enforced shared view_: mint when collaboration-foundation or
  shareability needs the target; until then the malleability ceiling line
  and the tiers outer-tier line carry it.
- _Problem-curated view fission_: when the assistance / AI-patterns side
  needs an inbound edge (kin to next-best-action; the perceiving
  station). Done 2026-07-16, ahead of that trigger — the purpose-keyed
  restructure exposed that the section cuts across the page's own
  variant carving. Gated on a research pass first
  (`research/problem-curated-view/`), which found an independent
  second lineage (Tricorder / static-analysis actionability) and
  corrected the annotation-asymmetry commitment to "annotate the
  judgement moment". Node minted as `problem-curated-view.mdx`
  (instantiates purpose-keyed-view; serves assistance at perceiving;
  the parent's `enacts: adaptation` moved with it).
- _Graduated tiers fission_: when composition pages need the
  workflow-staged variant addressable. (The tiers material lives under
  purpose-keyed view's "From watch to chase" section since the
  2026-07-16 restructure: variants ordered by when the keying happens,
  tiers narrated as the monitoring→drilldown escalation.)
- _Coordinated-views deepening_: Roberts 2007.
- _Writable views deepening_: Bancilhon & Spyratos and bidirectional
  lenses; a drag-between-groups interaction in the data-view demo.
- _Pinboard / role preset / generated view / personal lens_: authorship
  prose only; the research project keeps feeding them.
- _The `dashboard` slug_: freed by the rename; re-minted 2026-07-16 as a
  placeholder data-viz-domain entry (Sarikaya's visual genre) cross-linked
  with purpose-keyed-view — its presence makes the artefact/purpose boundary
  visible from both sides. The placeholder houses the PatternFly/Carbon
  links displaced from the old dashboard page; its To-do carries the
  fill-in work (design factors, tile layout, cross-tile consistency). The
  `/patterns/dashboard` redirect was dropped in its favour.
- _ItemView component scope vocabulary_ (`micro/mini/mid/maxi` vs the
  ladder's names): a component-side seam, separate workstream. The
  Haystack/Fresnel lens lineage independently supports the adapter
  architecture; only the naming drifted.
- _Cue-based techniques_: no node owed; the focus-and-context line is the
  whole obligation.

## Not owned here

- Worksheet verdicts (2026-07-related-residue-audit) — coordination only.
- Situation backfill for pages this plan doesn't touch
  (2026-07-situation-backfill).
- The component-side ItemView rework.
- The research project's own synthesis essay (fixed view → view system).
