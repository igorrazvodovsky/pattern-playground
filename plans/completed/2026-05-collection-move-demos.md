---
title: "Consolidate collection-move demos into DataView"
status: "completed"
kind: "exec-spec"
created: "2026-05-22"
completed: "2026-07-07"
area: "pattern-site"
depends_on: "plans/active/2026-05-pattern-demos-migration.md, plans/completed/2026-05-workspace-split.md"
---
# Consolidate collection-move demos into DataView

> _Completed 2026-07-07, executed as territory T2 of
> [2026-07-workspace-split-closure.md](../active/2026-07-workspace-split-closure.md);
> verdicts and outcomes are recorded in that plan's progress log. Two departures
> from the phases below, both deliberate:
>
> - _Lift target._ The DataView substrate landed in
>   `packages/components/src/demos/data-view/`, not `src/components/data-view/`.
>   Phase B's default predates the settled demos-tree convention
>   ([workspace-layout](../../docs/specs/workspace-layout.md), Shared demos): the
>   composition is Product-sample-data-coupled demo substrate, not package API.
>   Slices live beside it in `demos/data-view/slices.tsx` (host-side registry,
>   option 2 as defaulted).
> - _Filtering's standard story_ was not host-composition: it demonstrates the
>   real `components/filter` mechanism, not a stripped-down DataView. It moved
>   as `demos/filtering.tsx` (Class B); the filtering pattern page embeds it
>   alongside a filtering-foregrounded DataView slice, per Phase D's
>   both-demos provision. The LLMFilter story migrated as inline markup
>   (Class A).
>
> Grouping and sorting consolidated as planned (grouping implemented in the
> substrate, closing DataView's `✗ grouping`; filtering already existed — the
> `✗ filtering` TODO was stale). Phase E residue: Selection's verdict rides with
> territory T4, where its Storybook page lives; Search stays uncommitted. No
> spec promotion yet — host-composition has one worked cluster; watch Item view
> and Form per open question 8._

A refinement on top of [2026-05-pattern-demos-migration.md](../active/2026-05-pattern-demos-migration.md). For a specific cluster of patterns — the *collection-level moves* (Filtering, Sorting, Grouping, and likely Selection and Search) — the right migration is not "lift the bespoke story into a Class C island" but "implement the move as a real feature of DataView, then embed a configured slice of DataView wherever the move's pattern page wants to demonstrate it." Each pattern keeps its own page on the pattern site; the demonstration is parameterised from one real composition rather than re-implemented per page.

## Context

The demos-migration plan classifies story migrations into A (pure markup), B (thin shell), C (bespoke JSX standing in for a missing component), and a deferred D (APG-split). Applied to Grouping today, the verdict would be Class C: the story is hand-rolled JSX that composes `pp-button`, native `<details>/<summary>`, the `card` class, and a layout grid into a grouping demonstration. The gap registry would log "no real `Grouping` component" and the demo would migrate as an annotated island.

That verdict misses a structural opportunity. The Grouping story is a stripped-down DataView. DataView already lists Filtering, Sorting, and Grouping as Precursors and marks `✗ filtering` and `✗ grouping` as unfinished work in its MDX comments. The standalone Grouping story exists because DataView hasn't grown grouping yet, not because Grouping itself wants a freestanding demo. Treating it as Class C would build a parallel implementation of a feature DataView is already on the hook to gain — and the parallel implementation would be the wrong altitude to demonstrate from in the first place.

The pattern-language stance sharpens this: [docs/language/pattern-definition.md](../../docs/language/pattern-definition.md) treats patterns as moves, not widgets. Grouping is a move that operates on a containing composition; the composition is what makes the move runnable. DataView is that composition. Demonstrating grouping at its own altitude (a freestanding card grid) misrepresents how the move actually operates — it suggests grouping is a thing you build directly, rather than a property of a host composition that frames a collection for a purpose.

This plan establishes a fifth class — *host-composition* demos — for moves whose proper demonstration lives inside a higher-altitude composition, and routes the collection-moves through it.

## Two framings

1. *Stories as configured slices of one real composition, not as bespoke demos per pattern.* DataView's example components on the pattern site expose multiple parameterised stories: a full DataView, a grouping-foregrounded slice (representation: cards, grouping: on, filtering/sorting: muted), a filtering-foregrounded slice, a sorting-foregrounded slice. One real `DataViewRenderer`, several configured framings. Each pattern page embeds the slice that foregrounds its move.

2. *The pattern's altitude is the language's altitude; the demonstration's altitude is the composition's altitude.* The two need not be the same page. Grouping the *move* keeps its page on the pattern site, with conceptual content (situation, forces, consequences, edges). Grouping the *demonstration* lives inside DataView's implementation and is reached into via embed. This is the levels-of-scale claim being honest with itself: each altitude has its own surface.

## Scope

In scope:

- Define the *host-composition* class as a verdict alongside A/B/C/D in the demos-migration plan, and route collection-move stories through it.
- Lift `DataViewRenderer` out of `packages/components/src/stories/actions/seeking/DataView/` into proper components-package source (e.g. `packages/components/src/components/data-view/`), with the substrate exported via the package's public API for pattern-site islands to import.
- Implement grouping as a real feature of `DataViewRenderer` (closes the `✗ grouping` TODO in DataView.mdx).
- Author parameterised example components (Astro islands) under `packages/components/src/demos/data-view/` that render `DataViewRenderer` with specific configurations. Naming follows the demos-migration convention: `DataViewGroupingSlice.tsx`, `DataViewFilteringSlice.tsx`, etc.
- Migrate the Grouping pattern page from `packages/components/src/stories/actions/sense-making/Grouping.mdx` to `apps/patterns/src/content/patterns/actions/sense-making/grouping.mdx`, embedding the grouping slice.
- Delete `Grouping.stories.tsx` once the migration lands.
- Repeat for Filtering and Sorting: implement in DataView, author slices, migrate pages, delete standalone stories.
- Audit Selection and Search for fit, decide consolidation or per-pattern demo case-by-case.

Out of scope:

- *Filling other gaps in the gap registry.* Components that genuinely need to exist as their own things stay in the gap registry — the host-composition verdict only applies where a host composition exists or is already planned.
- *Patterns that don't fit DataView.* Comparison, Item view, Saved views, and anything whose situation isn't "a collection being framed for a purpose" stay on the demos-migration plan's standard track.
- *Filtering's LLM-filter story.* The `Filtering.stories.tsx` has both a standard `Filtering` story and an `LLMFilter` story showing LLM-assisted attribute resolution. The standard story consolidates into DataView; the LLM-filter behaviour is a distinct mechanic that may not fit a generic DataView slice. Flagged for case-by-case verdict in Phase A.
- *DataView's own feature roadmap beyond grouping/filtering/sorting.* Saved views, semantic zoom, item transitions — those are DataView's concerns, not this plan's.
- *Reifying a generic `<Group>` component.* The point of this plan is precisely the opposite: grouping doesn't need to exist as a standalone component because it's a property of containing compositions.

## The host-composition class

A fifth verdict for the demos-migration audit. Applied when a pattern's existing story is a stripped-down version of a higher-altitude composition that exists, or is planned, as its own pattern.

Test:

1. Does the pattern appear in the host's Precursors list (or equivalent compositional relationship)? — for collection-moves, this is DataView's `Precursors` block enumerating Filtering, Sorting, Grouping.
2. Is the host already responsible for implementing the move, or planned to be? — for collection-moves, DataView's `✗` TODOs already commit to grouping/filtering as features.
3. Would the standalone demo be a parallel implementation of a host feature? — for the Grouping story today, yes: it re-implements card-rendering + group headers + expand/collapse, all of which DataView wants to subsume.

If all three hold, the verdict is *host-composition*. The standalone story does not migrate as A, B, or C; instead, the host gains the feature and a parameterised slice of the host is embedded on the move's pattern page.

## Candidate set

Initial candidates, settled in Phase A:

- *Grouping* — strongest fit. Story is a stripped-down DataView. Migrate first.
- *Filtering* — strong fit for the standard `Filtering` story. The `LLMFilter` story is a separate question.
- *Sorting* — needs audit; likely strong fit (the story probably mirrors the same DataView-shaped composition).
- *Selection* — fit unclear. Selection appears in DataView's Follow-ups, not Precursors. Selection might want its own page-level demo because it acts on the centre DataView produces; consolidation may not improve clarity.
- *Search* — out of scope for this plan unless Phase A finds otherwise. Search has its own design surface beyond data-view-style filtering.

Patterns that surface adjacent in the graph but don't fit:

- *Pagination, Toolbar* — substrate of DataView, not moves DataView hosts. They're enabling primitives, demonstrated through their own component pages.
- *Comparison* — operates on selections of items; its host composition would be Item view or a comparison-specific surface, not DataView.

## Phase A — Pre-flight audit

Before any code moves, settle the candidate set and the slice authoring shape.

### Candidate verdicts

For each candidate (Grouping, Filtering, Sorting, Selection, Search, Filtering's LLMFilter story):

- Apply the host-composition test above.
- Verdict: *host-composition* (consolidate into DataView), *standard* (route through demos-migration plan as Class A/B/C), or *deferred* (needs more design work before either verdict).
- For *host-composition* verdicts: name the DataView feature that the consolidation depends on (grouping support, filtering support, etc.), and note whether the feature exists today, is in DataView's TODO list, or needs to be added to it.

### Slice authoring shape

Decide how parameterised example components are authored. Two shapes:

1. *Pattern-side slices* — each consuming pattern owns its slice. `packages/components/src/demos/grouping/GroupingViaDataView.tsx` imports `DataViewRenderer` from the components package and configures it. Slices live under the consuming pattern's path.

2. *Host-side slices registry* — DataView owns a registry of parameterised slices under `packages/components/src/demos/data-view/`, exposed by name (`grouping-foregrounded`, `filtering-foregrounded`, etc.). Each consuming pattern imports the slice by name.

Default to option 2: it keeps slice authoring central, makes the parameterisation explicit, and means a change to the host's interface only updates one set of slice configurations. Option 1's appeal is locality, but the slices have more in common with each other than with the patterns that embed them.

### DataViewRenderer migration target

Decide where `DataViewRenderer` lands in the components package. Default: `packages/components/src/components/data-view/`, with the public export added to the package's exports field. Naming follows the components-package convention (custom-element-shaped where possible, React-component-shaped where not).

### Files modified

No code changes. Output: a Phase-A audit note at `plans/active/2026-05-collection-move-demos-audit.md` capturing the candidate verdicts, the slice authoring shape decision, the `DataViewRenderer` migration target, and any DataView feature work that has to land before consolidation can proceed.

## Phase B — Lift DataViewRenderer

Move the renderer into proper component source so the pattern site can import it as a stable export rather than reaching into `src/stories/`.

- Move `packages/components/src/stories/actions/seeking/DataView/DataViewRenderer.tsx` to the path settled in Phase A (default: `packages/components/src/components/data-view/DataViewRenderer.tsx`).
- Co-locate any helpers the renderer depends on (sample data shape, layout utilities).
- Add the export to `packages/components/package.json`'s exports field.
- Update `DataView.stories.tsx` to import from the new location.
- Verify Storybook still renders DataView's existing stories from the new source.

### Files modified

- `packages/components/src/components/data-view/DataViewRenderer.tsx` (moved)
- `packages/components/src/stories/actions/seeking/DataView/DataView.stories.tsx` (import path)
- `packages/components/package.json` (exports)

## Phase C — Grouping consolidation

The first host-composition migration. Sequence: feature in DataView → slice → page migration → story deletion.

- *Implement grouping in DataViewRenderer.* Add a `grouping` prop (or equivalent — the API shape is settled during implementation) that takes an attribute key. Render: group header per distinct value, items clustered under each header, expand/collapse via native `<details>` (matching the current Grouping.stories.tsx shape). Sensible defaults; no controlled vocabulary for the attribute.
- *Update DataView's stories.* Add a story that exercises grouping. Update the DataView.mdx's `✗ grouping` TODO comment to `✓ grouping`.
- *Author the grouping slice.* `packages/components/src/demos/data-view/DataViewGroupingSlice.tsx` (path per Phase A's slice authoring decision). Renders `DataViewRenderer` configured for representation: cards, grouping: on (by a sensible default attribute), filtering/sorting controls hidden or de-emphasised. The slice is the focused demonstration the Grouping page embeds.
- *Migrate Grouping's pattern page.* From `packages/components/src/stories/actions/sense-making/Grouping.mdx` to `apps/patterns/src/content/patterns/actions/sense-making/grouping.mdx`. Frontmatter replaces `<Meta>`. The current `## Examples > Cards` section becomes an embed of `DataViewGroupingSlice` as a client-hydrated island. The Table and Canvas TODO subsections stay as TODO until DataView grows those representations (or until the surface-specific enactments warrant their own demos).
- *Delete Grouping.stories.tsx.* Remove the file. Remove the Storybook tree entry under `Actions/Sense-making/Grouping`.
- *Update inbound links.* Pages that point at the old Storybook URL for Grouping (`../?path=/docs/actions-sensemaking-grouping--docs`) need rewriting to the pattern-site route. This overlaps with the cross-surface reference scheme work tracked in the workspace-split plan's Phase D tail.

### Verification

- DataView's grouping feature renders correctly in Storybook and in the pattern-site embed.
- Grouping's pattern page renders the slice as an island; the embedded interactive works (expand/collapse, group headers, card layout).
- The graph extractor's verdict on Grouping doesn't regress: its edges (precedes DataView, complements Filtering/Sorting, enacts whatever quality) are preserved.
- No dangling references to the deleted `Grouping.stories.tsx`.

### Files modified

- `packages/components/src/components/data-view/DataViewRenderer.tsx` (grouping feature)
- `packages/components/src/stories/actions/seeking/DataView/DataView.stories.tsx` (new grouping story)
- `packages/components/src/stories/actions/seeking/DataView/DataView.mdx` (TODO → done)
- `packages/components/src/demos/data-view/DataViewGroupingSlice.tsx` (new)
- `apps/patterns/src/content/patterns/actions/sense-making/grouping.mdx` (migrated)
- `packages/components/src/stories/actions/sense-making/Grouping.mdx` (deleted)
- `packages/components/src/stories/actions/sense-making/Grouping.stories.tsx` (deleted)
- Inbound link updates across remaining Storybook MDX

## Phase D — Filtering and Sorting

Same shape as Phase C, run sequentially for Filtering and Sorting (Filtering first, then Sorting). Each closes one of DataView's `✗` TODOs.

Filtering carries one extra question: the `LLMFilter` story. If Phase A's verdict was *host-composition* for the standard Filtering story but *standard* (or *deferred*) for LLMFilter, the LLM-filter migration follows the demos-migration plan's normal track and may end up as a Class B or C demo on Filtering's pattern page alongside the DataView slice embed. The pattern page can host both: a DataView-slice embed for the standard filter behaviour and a separate island for the LLM-filter mechanic.

### Files modified

- Same shape as Phase C, multiplied across Filtering and Sorting.

## Phase E — Selection, Search, and audit residue

Resolve the deferred candidates from Phase A.

- *Selection.* If Phase A's verdict was *host-composition*: implement selection in DataView, slice, migrate, delete the standalone story. If *standard*: pass back to the demos-migration plan's normal track. Selection's own follow-up edges (Action bar, batch actions) may complicate the slice shape — a selection-foregrounded DataView needs to demonstrate the centre selection produces, which is more involved than grouping's "make groups visible".
- *Search.* Likely deferred to its own design pass; this plan does not commit to consolidation for Search.
- *Any candidate whose Phase A verdict was deferred.* Re-audit and pick a track.

### Files modified

- Depends on Phase A verdicts. Same shape as Phase C for any candidate routed *host-composition*.

## Phase F — Cleanup

- Verify all candidate stories have been migrated or explicitly kept.
- Update the demos-migration audit (`apps/patterns/src/data/story-audit.md`) with the *host-composition* verdicts so the audit's class column is honest about what happened to each entry.
- Update [AGENTS.md](../../AGENTS.md) and [.claude/rules/pattern-content.md](../../.claude/rules/pattern-content.md) if any conventions for slice authoring or cross-surface embedding emerge that future authoring should follow.
- Promote settled decisions to `docs/specs/` if a stable shape emerges around host-composition demos as a general pattern (i.e. if this works well enough that Comparison, Item view, or other host-and-move pairs should follow the same shape).
- Set this plan's `promoted_to` if specs land. Mark completed.

## Open questions

1. *Slice authoring shape (Phase A).* Default is host-side registry; the alternative is pattern-side colocation. Decision affects how slices are discovered, named, and reused across pattern pages.

2. *Where DataViewRenderer lands in the components package (Phase A).* Default is `src/components/data-view/`. The actual fit depends on whether `DataViewRenderer` is the component-package-public name or a wrapper around several smaller exports.

3. *What does the Grouping slice's "default attribute" look like?* The current story groups by `size` (Small/Medium/Large). A good default needs to be intelligible without explanation; the slice may want sample data that obviously benefits from grouping rather than the current faker output.

4. *Should pattern pages also link to the full DataView's pattern page?* Once a pattern's demo is a configured slice of DataView, there's an implicit "see also: DataView" link the reader might want. The graph already carries `Grouping precedes DataView` — surfacing that in the embed's framing (a small caption: "Grouping demonstrated inside DataView") may help the reader follow the altitude shift.

5. *Filtering's LLMFilter story.* Stay as a per-pattern island, or attempt to express the LLM-assisted attribute resolution as a DataView feature itself? The former is the conservative answer; the latter is structurally cleaner but commits DataView to a much larger feature.

6. *Does Selection consolidate?* Open in Phase A. Selection's pattern produces a centre (a chosen subset) on which Action bar and batch actions then act. A selection-foregrounded DataView slice has to demonstrate that produced centre, which is more state-laden than grouping's headers.

7. *What if DataView itself needs to demonstrate grouping conceptually before it grows the feature?* DataView's pattern page may want to show grouping in its example slice today, and the slice depends on the feature existing. Sequencing rule: feature first, slice second, page embeds third. DataView's page can describe grouping in prose with `(TODO)` placeholders for the slice until the feature lands.

8. *General host-composition extensibility.* If this works for collection-moves and DataView, do other host-and-move pairs follow the same shape? Item view + its constituent moves; Form + its field-level moves; Comparison + its dimension moves. Worth watching during Phase C and D to see whether a general pattern is emerging or whether this is a collection-moves-only structural coincidence.

## Risks

- *DataView feature work drags.* Consolidation depends on DataView gaining grouping (then filtering, then sorting) as real features. If DataView's renderer is harder to extend than expected, the candidate pattern pages stay in Storybook longer. Mitigation: Phase A names the feature work explicitly per candidate; if any feature looks risky, route that candidate to the standard demos-migration track instead.

- *Slices over-couple pattern pages to DataView's interface.* If `DataViewRenderer`'s props shift, every pattern page that embeds a slice breaks. Mitigation: keep slices small and configuration-light. The host-side registry shape (option 2 in Phase A) helps — one set of slices to update when the interface shifts, not one per pattern.

- *Loss of focused demonstration.* A DataView slice configured to foreground grouping is still a DataView, with toolbar, representation switcher, and other affordances the reader has to mentally suppress to see the grouping mechanic. Mitigation: slices should de-emphasise unused affordances (hide controls that aren't relevant, dim the surrounding chrome). If a slice can't be made focused enough, consider a hand-authored island as a fallback (Class C) — the host-composition verdict isn't mandatory once Phase A names it.

- *Inbound link drift.* Pages across Storybook still link to `../?path=/docs/actions-sensemaking-grouping--docs`. These need rewriting to the pattern-site route. Mitigation: handled jointly with the cross-surface reference scheme work in the workspace-split plan's Phase D tail.

- *The host-composition verdict turns out to apply to fewer patterns than expected.* If only Grouping fits cleanly, this plan was overhead for one pattern. Mitigation: Phase A's candidate audit gates the commitment — if the verdict only fits Grouping, run Phase C and stop; don't pre-commit to Phases D and E.

- *DataView itself isn't a stable enough host.* DataView is `role:pattern` and still has open questions (saved views, semantic zoom, item transitions). Hosting demonstrations for Filtering/Sorting/Grouping on top of a moving target is fragile. Mitigation: Phase A includes a check on DataView's maturity; if its API is still in flux, defer consolidation until it settles.

## Phase ordering

```
Phase A (audit — candidate verdicts, slice shape, target paths)
    │
    ▼
Phase B (lift DataViewRenderer into proper component source)
    │
    ▼
Phase C (Grouping consolidation — first host-composition migration)
    │
    ▼
Phase D (Filtering, Sorting — replicate Phase C)
    │
    ▼
Phase E (Selection, Search, audit residue)
    │
    ▼
Phase F (cleanup, doc updates, promotion)
```

Phase A is the only true gate. Phase C must complete before Phase D begins — Grouping is the smallest, cleanest fit and serves as the proof-of-shape; running Filtering and Sorting in parallel before Grouping has landed would risk three half-finished migrations. Within Phase D, Filtering and Sorting can interleave once Grouping's pattern is established.

This plan does not block any current pattern work — Grouping, Filtering, and Sorting continue to be authored in their current Storybook locations until each lands its Phase C/D migration. The cross-cutting demos-migration plan continues to operate on the rest of the corpus in parallel.
