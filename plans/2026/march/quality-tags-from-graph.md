# Derive quality tags from cross-references

## Context

The tagging plan (`quirky-giggling-creek.md`) proposes manually assigning quality tags to all ~147 stories. But the cross-references already encode most of these relationships: a pattern that links to `qualities-agency--docs` is effectively self-tagging with `agency`. Manual tagging duplicates what the prose already says and creates a second source of truth that can drift.

This plan takes the opposite approach: *extract* quality tags from existing graph edges, surface them in the graph UI and Storybook sidebar, and only use manual overrides for the gaps.

## How it works

```
MDX prose links → extract-graph-data.ts → pattern-graph.json (with qualityTags)
                                         ↘ Meta tags in MDX files → Storybook sidebar filtering
manual overrides (small file) ──────────↗
```

The extraction script is the single point where tags are computed. Quality tags flow downstream to both the graph component and Storybook's native filtering.

## Steps

### 1. Extend extract-graph-data.ts to derive quality tags

Modify `scripts/extract-graph-data.ts`:

- After building edges, iterate each node's outgoing edges
- Any edge targeting a `qualities-*` node produces a quality tag on the source node
- Strip the `qualities-` prefix to get the tag name (e.g., `qualities-agency` → `agency`)
- Also check *incoming* edges from quality pages (a quality page linking to a pattern is equally valid)
- Add `qualityTags: string[]` to the Node interface and output

The 11 known quality IDs:
```
qualities-agency, qualities-conversation, qualities-adaptability,
qualities-malleability, qualities-shareability, qualities-temporality,
qualities-privacy, qualities-learnability, qualities-density,
qualities-formality, qualities-accessibility
```

Node output becomes:
```json
{
  "id": "patterns-notification",
  "title": "Notification",
  "category": "Patterns",
  "path": "../?path=/docs/patterns-notification--docs",
  "qualityTags": ["agency", "temporality"]
}
```

### 2. Add a manual overrides file

Create `src/stories/data/quality-tag-overrides.json`:
```json
{
  "primitives-button": ["a11y", "density"],
  "primitives-input": ["a11y", "formality"],
  "primitives-checkbox": ["a11y"]
}
```

The extraction script merges these with derived tags (union, deduplicated). This file stays small — only entries where a quality relationship is real but a prose link would feel forced. Start empty and fill as gaps become apparent from step 3.

### 3. Generate a coverage report

After extraction, the script prints:
- Total stories with at least one quality tag (derived + overrides)
- Stories with zero quality tags (the gap list)
- Distribution: how many stories per quality

This tells you whether the existing cross-references provide useful coverage or whether the vocabulary doesn't discriminate. If 80% of stories have tags, the approach works. If 20% do, the cross-references are too sparse and manual tagging may be unavoidable.

### 4. Write quality tags into Storybook Meta components

Add a post-extraction step (or a separate script `scripts/write-meta-tags.ts`) that:

- Reads each MDX file
- Finds the `<Meta title="..." />` component
- Rewrites it as `<Meta title="..." tags={['quality:agency', 'quality:temporality']} />`
- For `.stories.tsx` files, adds to the `tags` array in the meta object
- Preserves existing tags (`autodocs`, `!dev`, etc.)

Prefix quality tags with `quality:` to namespace them — Storybook tags are flat strings, and future tag dimensions (AT levels, lifecycle stages) need their own namespace.

This gives Storybook sidebar filtering for free. Users can filter by `quality:agency` in the sidebar without any custom UI.

### 5. Add quality filter to PatternGraph

Extend `src/components/PatternGraph.tsx`:

- Read `qualityTags` from the graph JSON
- Add a row of toggle buttons (one per quality) below or beside the legend
- When a quality is active: highlight nodes that have that tag, dim others
- Multiple qualities can be active (intersection: show nodes with *all* selected qualities)
- Visual: highlighted nodes get full opacity + slightly larger radius; dimmed nodes get reduced opacity; edges between highlighted nodes stay visible, others fade

This is the graph equivalent of Storybook's sidebar filtering — but spatial, showing *where* a quality clusters and which qualities bridge categories.

### 6. Re-run and verify

```bash
npx tsx scripts/extract-graph-data.ts
```

- Inspect `pattern-graph.json` for `qualityTags` on nodes
- Check coverage report output
- `npm run storybook` → verify tags appear in sidebar filter
- Test quality filter toggles in the graph

## Interaction with other plans

- *Activity Theory reorg* (`activity-theory-reorg.md`): AT levels would be a separate field (`activityLevel`) on each node, derived from `activity-levels.json`. Quality tags and AT levels are orthogonal dimensions — both live on the node, each filterable independently.
- *Original tagging plan* (`quirky-giggling-creek.md`): this plan supersedes Step 1 (manual tag assignment) and Step 2 (manual Meta updates). Steps 3–4 from that plan (mirror in graph, graph filtering) are covered here. The original plan can be marked as superseded.
- *Isolated nodes* (`isolated-nodes.md`): adding quality cross-references to currently-isolated pages would both connect them to the graph *and* give them quality tags. Two problems solved by one edit.

## Files

| Action | File |
|--------|------|
| Modify | `scripts/extract-graph-data.ts` — derive qualityTags, merge overrides, print coverage |
| Create | `src/stories/data/quality-tag-overrides.json` — manual fallback tags (start empty) |
| Create | `scripts/write-meta-tags.ts` — propagate tags to MDX/TSX Meta components |
| Modify | `src/components/PatternGraph.tsx` — quality filter toggles |
| Modify | `src/styles/pattern-graph.css` — filter toggle styles, dim/highlight states |
| Modify | `src/pattern-graph.json` — gains `qualityTags` field on nodes |
| Modify | ~147 MDX/TSX files — `tags` prop added to Meta (via script, not by hand) |

## Verification

1. Run extraction → check coverage report shows >50% of stories with at least one quality tag
2. Inspect `pattern-graph.json` — spot-check 10 nodes for correct quality tags
3. `npm run storybook` → filter sidebar by `quality:agency` → verify correct stories appear
4. Graph quality toggles highlight expected clusters
5. Add an override to `quality-tag-overrides.json` → re-run extraction → verify it merges
6. `npm run test` passes
