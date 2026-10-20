---
title: "A brushing demo for coordinated views"
status: active
kind: exec-spec
created: 2026-10-20
last_reviewed: 2026-10-20
area: components, patterns-site
---
# A brushing demo for coordinated views

Outline, needs iteration.

The coordinated-views page names brushing and linking as the canonical
mechanics. Its linked-trio demo shows linking: one selection marked in a list,
a map and a detail. No demo shows brushing, where the actor marks a region of
one view and the matching items are marked or kept in the others.

The page had a cross-filtering demo, parked behind a "remove or redo" note and
removed on 2026-10-20. It was not brushing: two range sliders above a scatter
plot (price × carbon footprint) pruned a list, and the points outside the range
went grey. The marking happened in a separate control, not in the plot.

## What the demo needs

- A scatter plot in the catalog (`packages/components/src/catalog/catalog.ts`)
  that both registries render, with points, axis labels, a selected point, and
  a brushed range written to state so the spec can prune or mark other views.
- A brush drawn on the plot with a pointer, and a way to set the same range
  from the keyboard, since dragging needs a pointer.
- A spec in `packages/components/src/demos/specs/` that couples the plot to a
  list of `Item` rows: brushing prunes or marks the list, and the points
  outside the brush stay in the plot, set back, so the actor keeps the frame.

## Starting points

- The project's library has `pp-scatter-plot`
  (`components/charts/scatter-plot.ts`), with item-by-item keyboard navigation
  through `ChartComponent`. `BrushConfig` in `charts/base/interaction-layers.ts`
  is one of the chart building blocks the refactoring sweep kept on purpose
  (2026-10-17); nothing uses it yet.
- shadcn's chart component is built on Recharts, which is not a dependency
  here. Using it keeps the shadcn side shadcn's own, as the comparison between
  the two libraries needs; an SVG plot styled from shadcn's classes, as the
  shadcn `Map` is, is the alternative.

## Open questions

- Does the brush prune the list, mark it, or offer both? The page's guidelines
  favour keeping the frame visible, which suggests marking, or pruning with the
  count of what was left out.
- Does the scatter plot join the catalog as `ScatterPlot`, or as a general
  chart type with the plot as one form?
- Does the brush share the linked trio's demo, or get a demo of its own?
