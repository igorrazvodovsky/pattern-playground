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

## Considered, not gaps

Candidates examined and deliberately left out. An entry here means the question
came up, the boundary was worked out, and absence is the decision — not an
oversight to fill.

### Segmented control (2026-07)

Not a component identity — a visual form that either Tabs or a single-select
input can wear. The family (tabs, segmented control, toggle-button group,
button group) looks identical on screen and splits only on what activation
does:

1. *reveals co-present content* → Tabs (`tablist`/`tab`/`tabpanel`; already
   shipped as `pp-tab-group`)
2. *sets a value* → a toggle-group input (`radiogroup` or `aria-pressed`
   buttons; not yet needed)
3. *fires an action* → plain adjacency; `.button-group` in `styles/button.css`
   already covers this as layout, not a component

Survey ground (component.gallery, designsystems.surf): systems that document
"segmented control" as one component end up hosting both roles 1 and 2 under
one skin, or ship two components with the same skin. Apple's HIG spans all
three roles under the single control, guards them only with a purity rule
(never mix selection and action segments in one instance), and draws its
tabs-vs-segmented boundary on a different axis entirely — scope and placement
(tab bar for app sections → tab view for window areas → segmented control for
subviews and inspectors). That scope axis maps to `activity-level` tags, not to
component identity; the web has to pick semantics per use, which is why the
role axis decides here.

Boundary test: if a candidate use survives re-rendering through Sections'
disclosure affordance, it's content organisation (Tabs territory); if the
result is nonsense ("Sort by: Date" as a collapsible region), it was a value
input all along.

If demand arrives, the answer is a Tabs visual variant (role 1) or a new
toggle-group input under Components (role 2) — never one merged entry under
the shared label.
