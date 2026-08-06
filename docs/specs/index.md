# Settled specifications

Settled specifications describe what the project treats as true now. They sit
between the long-range vision (`docs/project/vision.md` and
`docs/language/vision.md`) and the executable work packets in `plans/`.

- [Agent harness](agent-harness.md) — repository knowledge, agent-facing entry
  points, and plan/spec boundaries.
- [Workspace layout](workspace-layout.md) — package structure, what each
  workspace owns, bilingual entries, and workspace dependency direction.
- [Pattern site](pattern-site.md) — what the content schema's fields mean, file
  layout and slugs, classification facets, stacked-notes navigation, and
  toolchain posture. The frontmatter template and authoring conventions live in
  `.claude/rules/pattern-content.md`.
- [Graph relationship model](graph-relationship-model.md) — current graph data
  model, edge vocabulary, and epistemic stance.
- [Component authoring](component-authoring.md) — the light-DOM decision
  ladder, subtree-ownership discipline, `data-slot` composition, and styling
  through the cascade.
- [Pattern role model](pattern-role-model.md) — distinction between components,
  patterns, collections, qualities, foundations, and concepts; boundary stance
  and the pattern/component decomposition rule.

Historical rationale and execution traces remain in `plans/`. When a completed
plan changes what is true now, update the relevant settled spec.
