# Maturity status tags

## Context

The story collection spans a wide range of completeness — from thoroughly explored patterns to conceptual sketches with TODO placeholders. Nothing currently surfaces this. A user browsing the sidebar or an LLM retrieving patterns has no way to know whether a pattern's thinking is settled, still forming, or barely started.

This is a design repertoire, not a component library. Many patterns are *intentionally* documentation-only — they describe non-code aspects of experience or are instructions for assembling other patterns. Having no `.stories.tsx` is not a gap to fill; it's the appropriate form for that pattern. Similarly, patterns with implementations vary widely in render completeness — and that's fine. Completeness is not the goal. The maturity status tracks *how settled the thinking is*, not how much code exists.

Maturity and render type are *authored metadata*, like AT level and lifecycle stage — they live in each story's `<Meta tags={[...]}>` and are the source of truth. The author is the one who knows whether a pattern's thinking is settled or still searching. The project does contain signals that can *suggest* an initial classification (TODO markers, content density, cross-reference richness), and a one-time seeding script uses these to bootstrap the tags. After that, they're maintained by hand as part of normal story authoring.

## Maturity model

Two independent dimensions, not a single ladder:

### Thinking maturity (how settled is the idea?)

| Label | Meaning |
|-------|---------|
| `sketch` | Early exploration. Major open questions, structural TODOs, sparse content. The pattern is a placeholder for future thinking. |
| `developing` | Substantial thinking in progress. Sections exist but have inline TODOs, missing examples, or unresolved questions. Actively being shaped. |
| `settled` | The thinking is coherent and stable. Cross-references in place, few or no TODOs. May evolve but isn't searching for its shape. |

### Render type (what form does it take?)

| Label | Meaning |
|-------|---------|
| `prose` | Documentation only. No interactive render. This is the correct form for conceptual patterns, assembly instructions, and non-code concerns. |
| `template` | Has a static HTML template or minimal render. Enough to show the pattern's shape without investing in interactivity. |
| `interactive` | Has `.stories.tsx` with rendered component variants. The pattern benefits from live demonstration. |

These are independent. A `settled` + `prose` pattern (like Collaboration) is fully mature — it doesn't need an interactive render. A `developing` + `interactive` pattern (like a component with some story variants but incomplete documentation) is mature in one dimension but not the other.

The node output carries both:
```json
{
  "id": "patterns-collaboration",
  "title": "Collaboration",
  "maturity": "settled",
  "renderType": "prose"
}
```

## Seeding heuristics

These signals are used by a one-time seeding script to bootstrap initial `maturity:*` and `render:*` tags across all story files. After seeding, the tags are hand-maintained — the heuristics are not re-run.

### Thinking maturity signals

Settled signals:
- Few or no TODO markers (0-1 inline TODOs, no `## TODO:` headings)
- Has "Related patterns" section with cross-references
- Content length > 60 lines (excluding imports/Meta)
- Fun meter ≥ 4 correlates but is not deterministic — a high fun meter with many TODOs is still `developing`

Developing signals:
- 2+ inline `{/* TODO: */}` markers
- Has `## TODO:` headings (structural gaps)
- Substantial content exists but sections are incomplete
- Fun meter ratings of 2-3 often land here

Sketch signals:
- Content under 30 lines
- Multiple `## TODO:` headings with little content between them
- No cross-references to other patterns
- No "Related patterns" or "Resources & references" sections

### Render type signals

- Has `.stories.tsx` with `export const` story variants → `interactive`
- Has co-located `.html` template files imported by stories → `template`
- MDX-only, no story file → `prose`

Render type detection doesn't need scoring logic — it's structural presence, not a judgement call. Stories can share implementations across patterns (a component render may serve multiple pattern pages), so co-location is checked loosely: any `.stories.tsx` in the same directory or referenced via `<Meta of={...} />` counts.

## Implementation

### Step 1: Seed initial tags

Create a one-time seeding script (`scripts/seed-maturity-tags.ts`) that:

- For each MDX file, applies the heuristics above to determine `maturity` and `renderType`
- Writes `maturity:sketch|developing|settled` and `render:prose|template|interactive` into each story's `<Meta tags={[...]}>` array, alongside existing AT-level and lifecycle tags
- Prints a summary report:
  - Thinking maturity distribution: `sketch: N, developing: N, settled: N`
  - Render type distribution: `prose: N, template: N, interactive: N`
  - Cross-tabulation (e.g., `settled + prose: N, developing + interactive: N`)
  - List of sketches (patterns where thinking hasn't started in earnest)

After running, review the assignments and adjust any that the heuristics misjudged. The seeding script is run once and can be deleted afterwards.

### Step 2: Extend extract-graph-data.ts

`scripts/extract-graph-data.ts` already reads `activity-level:*`, `atomic:*`, and `lifecycle:*` tags via `extractMetaTags()`. Extend it to also read `maturity:*` and `render:*` tags from story files, adding `maturity` and `renderType` fields to the `ActivityLevel` interface and JSON output.

No derivation logic in the extraction script — it reads what the story files declare, same as for AT level and lifecycle stage.

### Step 3: Surface in Storybook sidebar

Since maturity and render tags live in `<Meta tags={[...]}>`, they're immediately available for Storybook sidebar filtering — same mechanism as AT-level tags, no additional plumbing needed.

Tag namespaces:
- `maturity:sketch`, `maturity:developing`, `maturity:settled`
- `render:prose`, `render:template`, `render:interactive`

Two namespaces because they're independent dimensions. Filtering by `maturity:settled` shows all patterns with stable thinking regardless of render type. Filtering by `render:interactive` shows everything with live demos regardless of thinking maturity.

### Step 4: Surface in PatternGraph

Thinking maturity as node fill opacity: `settled` full, `developing` medium, `sketch` faint. Render type as node shape or border: circle for `prose`, square for `interactive`, diamond for `template`. Keep subtle — these are secondary encodings.

## Interaction with other plans

- *Quality tags* (`quality-tags-from-graph.md`): maturity/render and quality tags are independent fields on the same node. All are hand-authored in story `<Meta>` tags and read by the extraction script.
- *Activity Theory reorg* (`activity-theory-reorg.md`): AT level and maturity are independent. A sketch can be at any AT level.
- *Isolated nodes* (`isolated-nodes.md`): isolated nodes likely correlate with `sketch` maturity — sparse cross-references mean fewer graph edges. The status report surfaces this.

## Files

| Action | File |
|--------|------|
| Create | `scripts/seed-maturity-tags.ts` — one-time seeding script (delete after use) |
| Modify | All MDX files — `maturity:*` and `render:*` tags added to `<Meta tags={[...]}>` |
| Modify | `scripts/extract-graph-data.ts` — read maturity + renderType from tags, add to JSON output |
| Modify | `src/components/PatternGraph.tsx` — maturity/render visual encoding |
| Modify | `src/styles/pattern-graph.css` — opacity and shape styles |

## Verification

1. Run seeding script → review the summary report for plausible distribution
2. Spot-check 10 stories across both dimensions: verify `maturity` and `renderType` match actual content; adjust any misjudged tags by hand
3. Confirm prose-only patterns with settled thinking are `settled` + `prose`, not penalised for lacking a render
4. Confirm a pattern with `.stories.tsx` but many TODOs in prose gets `developing` + `interactive` (not `settled`)
5. Run `scripts/extract-graph-data.ts` → verify maturity and renderType fields appear in `activity-levels.json`
6. `npm run storybook` → filter sidebar by `maturity:settled` → verify results include prose-only patterns
7. Graph shows visual distinction between dimensions
8. `npm run test` passes
