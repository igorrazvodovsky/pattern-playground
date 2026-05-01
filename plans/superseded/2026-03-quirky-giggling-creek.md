---
title: "Add tagging to Storybook stories"
status: "superseded"
kind: "exec-spec"
created: "2026-03"
last_reviewed: "2026-05-01"
area: "metadata"
promoted_to: ""
superseded_by: "plans/paused/2026-03-quality-tags-from-graph.md"
---
# Add tagging to Storybook stories

## Context

The semilattice document (`resources/semilattice.md`, task 3) calls for tags as "explicit set memberships that allow faceted filtering alongside the emergent topology of the graph." The sidebar tree forces each pattern into one location; tags let patterns participate in multiple sets simultaneously — the core semilattice idea.

The challenge is choosing a vocabulary that's *principled* rather than ad-hoc. Bottom-up extraction risks noise. The system already defines its own cross-cutting dimensions: the 11 *Qualities* in `src/stories/qualities/`. These are finite, well-defined, and deliberately designed to cut across the tree hierarchy — exactly what tags should do.

## Tag vocabulary

Use the 11 Qualities as the primary tag dimension. Each tag is the kebab-case quality name:

`agency` · `conversation` · `adaptability` · `malleability` · `shareability` · `temporality` · `privacy` · `learnability` · `density` · `formality` · `a11y`

These already have clear definitions and scope (see `src/stories/qualities/Overview.mdx`). Every story gets tagged with the qualities it most enacts — typically 1–4 per story.

This avoids inventing a parallel taxonomy. Tags like "AI", "async", "system-initiated" are *already captured* by qualities: AI interaction is a question of Agency and Conversation; async is Temporality; system-initiated is Agency (proactive/co-operative end of the spectrum).

If gaps emerge during tagging (things that genuinely don't map to any quality), we add tags then — but start with this constrained set.

## Implementation

### Step 1: Tag assignment spreadsheet

Before touching any files, produce a mapping of all ~147 stories to their quality tags. This is a judgement-intensive step — each story needs to be read (or at least skimmed) to determine which qualities it enacts.

Output: a JSON file at `src/stories/data/story-tags.json` structured as:
```json
{
  "patterns-conversation": ["agency", "conversation", "adaptability"],
  "primitives-button": ["a11y", "density"],
  ...
}
```

Keys match the node IDs already used in `pattern-graph.json`.

### Step 2: Add tags to MDX Meta components

For each MDX file, update the `<Meta>` component:

```mdx
<!-- Before -->
<Meta title="Patterns/Conversation" />

<!-- After -->
<Meta title="Patterns/Conversation" tags={['agency', 'conversation', 'adaptability']} />
```

Storybook 10 supports `tags` on the MDX `<Meta>` component natively. These tags enable sidebar filtering.

Note: the global `tags: ['autodocs']` in `preview.ts` applies to all stories already; per-story tags are additive. Stories with `['!autodocs']` or `['!dev']` keep those — new quality tags are added alongside.

For `.stories.tsx` files (Avatar, Tabs, Dialog, etc.), add tags to their `meta` object:
```ts
const meta = {
  title: 'Primitives/Avatar',
  tags: ['autodocs', 'a11y', 'density'],
  ...
} satisfies Meta<AvatarProps>;
```

### Step 3: Mirror tags in pattern-graph.json

Add a `tags` array to each node in `src/pattern-graph.json`:

```json
{
  "id": "patterns-conversation",
  "title": "Conversation",
  "category": "Patterns",
  "path": "../?path=/docs/patterns-conversation--docs",
  "tags": ["agency", "conversation", "adaptability"]
}
```

This enables the PatternGraph component to use tags for filtering, colouring, or clustering — supporting the "alternative projections" goal from the semilattice doc.

### Step 4: Update PatternGraph to support tag filtering

Out of scope for this task, but the tag data in `pattern-graph.json` enables future work: filter/highlight by quality in the graph view, colour nodes by dominant quality, etc.

## Files to modify

- `src/stories/data/story-tags.json` — *new*, tag assignment reference
- `src/pattern-graph.json` — add `tags` to each node
- All ~147 MDX/TSX files with `<Meta>` — add `tags` prop
- `.storybook/preview.ts` — no changes needed (global `autodocs` tag unaffected)

## Verification

1. Run `npm run storybook` and confirm stories load without errors
2. Check that tags appear in Storybook's sidebar filtering (Storybook 10 shows tags in the sidebar filter panel)
3. Spot-check 5–10 stories to verify tag assignments make sense
4. Verify `pattern-graph.json` is valid JSON with tags on every node
5. Run `npm run test` (ESLint) to catch any syntax issues in modified files
