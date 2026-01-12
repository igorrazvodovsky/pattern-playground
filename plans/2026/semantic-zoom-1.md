# Semantic zoom outline

- Semantic zoom behavior: As zoom level changes, each node/card switches to an appropriate level of detail (LOD) rather than simply scaling text up/down. The representation becomes coarser when zooming out and finer when zooming in.
- Graph structure stays legible: Relationships are maintained via directed arrows/curved connectors that re-route smoothly as nodes change size.
- Progressive disclosure by zoom thresholds: Content visibly “snaps” (with animation) between discrete LOD modes (e.g., title-only → summary → full text), rather than continuously reflowing text.
- Nodes: cards on the canvas, connected by directional arrows.
- Node styling:
  - LOD A, Zoomed out: nodes render as solid black circles (no label text).
  - LOD B, Mid zoom: nodes render as small pill/label chips with a short title.
  - LOD C, Closer: nodes render as rectangular cards with a title and paragraph text inside.
  - LOD D, Zoomed in: selected node expands into a large reading panel with full text.
- Interaction and states:
  - Zoom changes representation: When zooming out, detailed text collapses into progressively simpler forms (card → label → circle). When zooming in, the reverse happens (circle → label → card → full reading panel).
- Selection/focus affordance: A blue outline/bounding box appears around the currently selected node/card (and around the expanded reading panel when fully zoomed in), indicating focus/active selection.
- Transition feel (spec-level): Nodes morph between LODs with smooth scaling and content substitution (text disappears/reappears appropriate to the level), while edges remain connected and adjust their anchor points.
- Discrete LOD thresholds: Define explicit zoom breakpoints where a node switches representation (e.g., circle ↔ label ↔ summary card ↔ full reading card)
- Graph continuity: Maintain node positions/relationships; connectors must re-anchor smoothly as node bounds change.
- Focus behavior (optional mode): Focused node gets an outline and becomes dominant. Non-focused nodes reduce detail first (title-only), then de-emphasize (fade/blur) at deepest zoom.

