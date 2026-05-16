# Storybook taxonomy specification

Storybook (`packages/components/`) is the development and documentation surface
for *components* (`role:component`). Its sidebar projection uses Activity Theory
levels as a practical navigation convention, not as a design-language claim.

The pattern language — `role:pattern`, `role:umbrella`, `role:quality`,
`role:foundation` — lives in the Astro pattern site (`apps/patterns/`). AT
levels there carry design-language semantics; see
[`docs/specs/pattern-site.md`](pattern-site.md).

## Current top-level projection in Storybook

- `operations/` — component stories organised at the automatic/infrastructural
  AT level
- `actions/` — component stories at the conscious/goal-directed AT level.
  Sub-grouped by lifecycle stage: `seeking/`, `evaluation/`, `sense-making/`,
  `application/`, `coordination/`, and `navigation/`.
- `activities/` — component stories at the motive-driven AT level.
- `foundations/` — theory, principles, and material substrate. Language entries
  for foundations live in the pattern site; this folder holds substrate
  documentation (tokens, type scale, modality CSS) and unmigrated language
  entries pending full bilingual split.
- `qualities/` — cross-cutting experiential dimensions. Language entries live
  in the pattern site; this folder retains substrate documentation and serves
  as a link target for component pages that reference qualities. Will be removed
  once component-page cross-references are rewritten to pattern-site routes.
- `concepts/` — Daniel Jackson-style concept design vocabulary.
- `data-visualization/` — data encoding components.
- `data/` — shared mock data, not pattern material.
- `patterns/` — legacy Atomic Design stubs, not active pattern pages.
- `utils/` — Storybook utilities.

## Placement rule for component stories

New component stories go where the component's primary usage context falls:

1. Automatic condition-response components → `operations/`.
2. Conscious goal-directed components → `actions/` under the closest lifecycle
   stage.
3. Motive-driven composition components → `activities/`.
4. Cross-cutting, substrate, or utility material → `foundations/`, `qualities/`,
   `concepts/`, or `utils/` as appropriate.

Folders are projections, not ontology. `activity-level:*`, `atomic:*`, and
`lifecycle:*` frontmatter preserve other useful readings.

Detailed placement guidance remains in
[`docs/project/storybook-taxonomy.md`](../project/storybook-taxonomy.md).
