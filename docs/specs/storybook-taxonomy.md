# Storybook taxonomy specification

Storybook is the current authored repertoire and demonstration surface for the
pattern language. Its sidebar projection is Activity Theory: where attention
lives during human activity.

## Current top-level projection

- `operations/` — automatic, infrastructural patterns that absorb or respond to
  conditions without requiring deliberate attention.
- `actions/` — conscious, goal-directed patterns. Actions are sub-grouped by
  lifecycle stage: `seeking/`, `evaluation/`, `sense-making/`, `application/`,
  `coordination/`, and `navigation/`.
- `activities/` — motive-driven patterns that shape work across time.
- `foundations/` — theory, principles, interaction models, and material
  substrate.
- `qualities/` — cross-cutting experiential dimensions.
- `concepts/` — Daniel Jackson-style concept design vocabulary.
- `data-visualization/` — data encoding material kept separate pending fuller
  development.
- `data/` — shared mock data, not pattern material.
- `patterns/` — legacy Atomic Design stubs, not served as active Storybook
  pattern pages.
- `utils/` — Storybook utilities, not pattern material.

## Placement rule

Put a new pattern where its primary reader attention belongs:

1. Automatic condition-response behavior goes in `operations/`.
2. Conscious goal-directed work goes in `actions/` under the closest lifecycle
   stage.
3. Sustained motive-driven work goes in `activities/`.
4. Cross-cutting theory, qualities, concepts, data, and utilities stay outside
   the Activity Theory hierarchy.

Folders are projections, not ontology. `activity-level:*`, `atomic:*`, and
`lifecycle:*` metadata preserve other useful readings. The graph carries
cross-cutting relationships that no tree can represent.

Detailed placement guidance remains in
[`docs/project/storybook-taxonomy.md`](../project/storybook-taxonomy.md).
