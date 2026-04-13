# Storybook taxonomy

The canonical answer to "where does a new pattern go?"

## Organising principle

The story tree is organised by *activity theory* levels — *where attention lives* during human activity. See `plans/2026/march/activity-theory-reorg.md` for the rationale and migration history.

### Dual-projection rule

Activity Theory is the *default sidebar projection* because it foregrounds experiential altitude. The Atomic Design categories (primitive, component, composition, pattern) persist as queryable metadata in `<Meta tags={[...]}>` — visible in the graph, available as an alternative projection. No classification is discarded; the question is which one gets the privileged sidebar position.

See `references/semilattice.md` for the deeper argument: every tree is lossy; the answer is multiple projections, not a better tree.

## Current `src/stories/` directory listing

### Operations (automatic, infrastructural)

Things that mediate activity without requiring conscious attention. Flat — short enough to scan without sub-groups.

- `operations/` — ~25 items
- `operations/conversation/` — sub-group with three nested categories: conversational activities, sequence management, conversation management

### Actions (conscious, goal-directed)

Things users deliberately invoke to accomplish specific goals. Sub-grouped by intent lifecycle stage for scannability:

- `actions/seeking/` — retrieving and gathering relevant information
- `actions/evaluation/` — assessing relevance and value
- `actions/sense-making/` — synthesising and organising insights
- `actions/application/` — taking decisions, completing tasks
- `actions/coordination/` — multi-actor alignment
- `actions/navigation/` — navigation model pages (flat, hub-and-spoke, multilevel, etc.)

### Activities (motive-driven, strategic)

Things that shape how work unfolds over time. Flat — ~18 items.

- `activities/`

### Cross-cutting (not part of the AT hierarchy)

- `foundations/` — principles, interaction models, information architecture, collaboration theory
- `foundations/material/` — colour, iconography, layout, motion, typography (the perceptual substrate)
- `qualities/` — cross-cutting attributes (agency, conversation, adaptability, etc.), used as tags
- `concepts/` — Daniel Jackson's concept design vocabulary (collection, event, task, delegation, etc.)

### Special cases

- `data-visualization/` — kept as a top-level placeholder pending fuller development, rather than absorbed into `actions/evaluation/`
- `data/` — shared mock data as JSON files (not patterns)
- `patterns/` — legacy Atomic Design directory; contains only `.md` stubs, not served by Storybook
- `utils/` — Storybook utility components

## Where does a new pattern go?

1. Ask: *does the user consciously engage with this, or does it work automatically?*
   - Automatic, infrastructural → `operations/`
   - Conscious, goal-directed → `actions/` (pick the lifecycle sub-group)
   - Strategic, coordinating multiple actions → `activities/`
2. If it doesn't fit a single level, *pick one* for the tree and use tags + graph edges for the overlap.
3. If it's a cross-cutting attribute or theoretical grounding → `qualities/` or `foundations/`.
4. If it's a concept-design vocabulary term → `concepts/`.
5. Tag every new story with `activity-level:*`, `atomic:*`, and (for actions) `lifecycle:*` in the `<Meta>` block.

For deeper classification work — articulating what a pattern is, mapping it against what exists, and enriching it with research — use `/pattern-classifier`.
