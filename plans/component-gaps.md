# Component gap registry

Missing components whose absence becomes legible when pattern pages leave
Storybook (see `plans/active/2026-05-pattern-demos-migration.md`). One row per
missing component. A standing backlog, sibling to the
[tech debt tracker](tech-debt-tracker.md): an entry here means a pattern is
describing or illustrating something the library can't yet compose from parts.

Story context is the `.stories.tsx` demo that stood in for the component.
"prose TODO" marks gaps named in the pattern's own prose; "judgment" marks gaps
inferred while reviewing a territory, beyond what the prose asks for.

| Component | Pattern(s) needing it | Story context | Notes |
|---|---|---|---|
| Mega menu | Fully connected | — (prose TODO, T1) | Named alongside nav bar, sidebar, and tabs as an implementation of the model |
| Minimap | Pan and zoom | — (prose TODO, T1) | Orientation aid for spatial navigation; overview-detail in miniature |
| Tree view | Multilevel tree | — (judgment, T1) | The "expandable tree" variant has no implementing primitive; sidebar composes one ad hoc |
| Stepper | Step by step, wizard | — (judgment, T1) | Navigation-overview names "stepper components". Interactive step navigation with step states — distinct from the read-only progress indicator |
| Pagination | Pyramid, step by step | — (judgment, T1) | Half-exists: `styles/pagination.css` ships full markup styling but no component or story consumes it |
| Split view | Overview and detail | — (judgment, T1) | No master–detail layout container; the pattern's "split view" variant has nothing to point at |
| Zoom controls | Pan and zoom | — (judgment, T1) | Zoom in/out/fit control cluster; tldraw exists as a dep but there is no reusable control-level piece |
| Workspace switcher | Hub and spoke, hybrid patterns | — (judgment, T1, speculative) | The hub + flat hybrid's "launch screen or app switcher"; DataView's ViewSwitcher is the nearest existing shape but switches views, not workspaces |
| Schema-driven filter | Filtering, Data view | DataView.stories.tsx (judgment, T2) | `components/filter` hardwires one enum set (Status/Priority/Assignee); `demos/data-view` carries a second, product-shaped implementation (ProductFilters + FilterControls). The duplication is the gap signal: a filter generic over an attribute schema would collapse both |
