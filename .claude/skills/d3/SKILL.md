---
name: d3
description: Creating interactive data visualisations using d3.js. This skill should be used when creating custom charts, graphs, network diagrams, geographic visualisations, or any complex SVG-based data visualisation that requires fine-grained control over visual elements, transitions, or interactions. Use this for bespoke visualisations beyond standard charting libraries, whether in React, Vue, Svelte, vanilla JavaScript, or any other environment.
---

# D3.js visualisation

Use d3 for bespoke, fine-grained SVG work — force layouts, custom encodings,
choreographed transitions — beyond what standard chart libraries offer. For
chart *design* (form choice, colour, accessibility, dashboards), the `dataviz`
skill is the method; in this project categorical series colours come from the
`--c-cat-1..8` tokens.

Project integration points:

- `packages/components/src/components/PatternGraph.tsx` — the existing
  force-directed pattern graph (React with `d3-force` + `d3-scale`); extend it
  rather than starting a second graph component.
- Import per-module (`d3-force`, `d3-scale`, …) or `import * as d3 from 'd3'`;
  clean up simulations, timers, and listeners on disconnect/unmount.

For the full walkthrough — integration patterns (direct DOM vs framework-managed),
common chart recipes, interactivity, transitions, a scales reference, and
common pitfalls — read `references/guide.md`.
