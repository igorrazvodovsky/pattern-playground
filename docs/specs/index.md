# Settled specifications

Settled specifications describe what the project treats as true now. They sit
between the long-range vision (`docs/project/vision.md` and
`docs/language/vision.md`) and the executable work packets in `plans/`.

- [Agent harness](agent-harness.md) — repository knowledge, agent-facing entry
  points, and plan/spec boundaries.
- [Workspace layout](workspace-layout.md) — package structure, what each
  workspace owns, bilingual entries, and workspace dependency direction.
- [Pattern site](pattern-site.md) — what the content schema's fields mean, file
  layout and slugs, classification facets, stacked-notes navigation, the
  sequence collection, and toolchain posture. The frontmatter template and
  authoring conventions live in `.claude/rules/pattern-content.md`.
- [Sequences](sequences.md) — the sequence collection: what a sequence is,
  file format and field meanings, the authoring bar, rendering, and
  validation.
- [Graph relationship model](graph-relationship-model.md) — current graph data
  model, edge vocabulary, and epistemic stance.
- [Component authoring](component-authoring.md) — the light-DOM decision
  ladder, subtree-ownership discipline, `data-slot` composition, and styling
  through the cascade.
- [World ontology](world-ontology.md) — the four phenomena the fixture world is
  built from, the log-as-truth discipline, the relation and action-type
  registries, what counts as a fact versus a derivation, and the
  world/data boundary.
- [Pattern role model](pattern-role-model.md) — distinction between components,
  patterns, collections, qualities, foundations, and concepts; boundary stance
  and the pattern/component decomposition rule.

A commitment is settled enough for this layer when violating it in a new instance would be an error rather than a disagreement. If a new instance could
reasonably diverge, the call is still judgment and belongs in a plan. Specs govern classes of instances — every pattern page, every edge, every component; a spec that describes a single artifact is usually an operative-image entry instead.

Historical rationale and execution traces remain in `plans/`. When a completed
plan changes what is true now, update the relevant settled spec.
