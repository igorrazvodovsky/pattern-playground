# Plan: Interactive force-directed pattern graph

## Context

The Introduction page (`src/stories/Intro.mdx`, lines 36–68) currently shows five static `<article>` cards linking to category overviews. This typological view hides the rich cross-reference network that already exists in the MDX files. Replacing it with a force-directed graph makes visible the clusters, bridge nodes, and density variations that emerge from how patterns actually reference each other — letting the network structure speak alongside (and sometimes against) the categorical bins.

## Approach

Use `d3-force` (new dependency, fits existing D3 ecosystem) to compute layout, React to render SVG. Extract node/edge data from MDX files via a build script, store as JSON.

## Steps

### 1. Install d3-force

```bash
npm install d3-force
npm install -D @types/d3-force
```

Only new dependency. All other needed D3 modules (d3-array, d3-scale, d3-selection, d3-shape) already installed.

### 2. Create data extraction script

*File:* `scripts/extract-graph-data.ts`

Node.js script (run via `npx tsx scripts/extract-graph-data.ts`) that:
- Globs `src/stories/**/*.mdx` (excluding Intro.mdx)
- Extracts `<Meta title="..." />` from each file
- Skips files under `concepts/` category
- Extracts outgoing links matching `\.\./\?path=/docs/([a-z0-9-]+)--docs`
- Maps link URLs back to node IDs to create edges
- Handles titles from co-located `.stories.tsx` files when MDX lacks a Meta title
- Deduplicates by Storybook path
- Outputs to `src/stories/data/pattern-graph.json`

Schema:
```json
{
  "nodes": [{ "id": "patterns-collaboration", "title": "Collaboration", "category": "Patterns", "path": "../?path=/docs/patterns-collaboration--docs" }],
  "edges": [{ "source": "patterns-bot", "target": "patterns-collaboration" }]
}
```

Expected: ~120–130 nodes, ~200+ edges.

### 3. Create PatternGraph React component

*File:* `src/components/PatternGraph.tsx`

Architecture:
- `useEffect` on mount: run `d3-force` simulation synchronously (~300 ticks), store settled x/y positions in state
- Forces: `forceLink` (distance ~80), `forceManyBody` (strength ~-120), `forceCenter`, `forceCollide` (radius ~12), plus gentle `forceX`/`forceY` with category-based target positions (strength ~0.05) to encourage clustering
- React renders SVG after simulation settles: `<line>` edges, `<circle>` nodes, `<text>` labels
- Node colour: categorical palette per category (Foundations, Primitives, Components, Compositions, Patterns, Qualities, Data Visualisation, Visual Elements)
- Node size: base radius ~5px, scaled by degree centrality via `d3-scale` `scaleSqrt`
- Edges: thin lines (0.5–1px), low opacity (~0.3)
- Labels: hidden by default, shown on hover (individual) or when zoom > 1.5× (all)
- Zoom/pan: pointer events + CSS transform on root `<g>` — wheel adjusts scale, drag adjusts translation, double-click resets. Avoids adding `d3-zoom` dependency.
- Click: navigate to node's Storybook path via `window.location`
- Responsive: `ResizeObserver` on container, SVG viewBox adapts to available width. Default height ~600px.

Reference pattern: `src/components/MermaidDiagram.tsx` (React component bridging a rendering library into Storybook MDX via useEffect + useRef).

### 4. Create component styles

*File:* `src/styles/pattern-graph.css`

Using the project's CSS layer architecture:
```css
@layer components {
  .pattern-graph { ... }
  .pattern-graph__node { cursor: pointer; }
  .pattern-graph__edge { ... }
  .pattern-graph__label { transition: opacity 0.2s; }
  .pattern-graph__legend { ... }
}
```

No inline styles (per CLAUDE.md).

### 5. Add legend

Part of the SVG, positioned in a corner. Shows colour-coded dot + category name for each of the 8 categories. Each legend item links to the category's overview page, preserving the original 5 category links and extending to all categories in the graph.

### 6. Integrate into Intro.mdx

*File:* `src/stories/Intro.mdx`

- Add import at top: `import { PatternGraph } from '../components/PatternGraph';`
- Replace lines 36–68 (the `<section id="docs-intro-structure">` block) with `<PatternGraph />`
- Preserve everything else: Borges quote (lines 21–26), surrounding text, the `---` on line 70, and all content below

### 7. Accessibility

- SVG gets `role="img"` + `aria-label`
- Nodes get `role="link"`, `tabindex="0"`, keyboard Enter/Space to navigate
- Legend serves as colour key
- Focus-visible states via CSS

## Files summary

| Action | File |
|--------|------|
| Install | `d3-force`, `@types/d3-force` |
| Create | `scripts/extract-graph-data.ts` |
| Create | `src/stories/data/pattern-graph.json` |
| Create | `src/components/PatternGraph.tsx` |
| Create | `src/styles/pattern-graph.css` |
| Modify | `src/stories/Intro.mdx` (lines 36–68 replaced, import added) |

## Verification

1. Run extraction script → inspect JSON for ~120+ nodes, no concepts, reasonable edge count
2. `npm run storybook` → navigate to Introduction page
3. Graph renders with visible category clusters and colour coding
4. Click a node → navigates to correct Storybook page
5. Zoom (scroll) and pan (drag) work; double-click resets
6. Labels appear on hover and at high zoom
7. Legend shows all categories with working links
8. Borges quote and all surrounding content intact
9. `npm run test` passes (no lint errors)
10. Check on narrow viewport: graph is pannable/zoomable
