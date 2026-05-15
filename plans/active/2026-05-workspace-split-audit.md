---
title: "Phase A audit — workspace split pre-flight"
status: "active"
kind: "audit"
created: "2026-05-15"
last_reviewed: "2026-05-15"
area: "architecture"
parent_plan: "2026-05-workspace-split.md"
---
# Phase A audit — workspace split pre-flight

Covers the four Phase A questions: role coverage, move/mechanism split, cross-cutting material, and extractor coupling. The Astro Lit-renderer prototype is flagged as outstanding — it is the remaining gate before Phase B.

---

## 1. Role coverage

170 MDX files across `src/stories/`. Current state by folder:

| Folder | MDX files | Explicit `role:` | Inferred from path | Unset (not excluded) |
|---|---|---|---|---|
| `actions/` | 60 | 59 | — | 0 (1 Overview, intentionally excluded) |
| `activities/` | 17 | 16 | — | 0 (1 Overview) |
| `concepts/` | 18 | 0 | — | 18 (extractor skips `Concepts` category) |
| `data-visualization/` | 3 | 2 | — | 0 (1 Overview) |
| `foundations/` | 16 | 0 | 16 (`role:foundation`) | 0 |
| `operations/` | 43 | 42 | — | 0 (1 Overview) |
| `qualities/` | 12 | 0 | 12 (`role:quality`) | 0 |

The `patterns/` folder holds 6 `.md` stubs (Checklist, Consent, SemanticZoom, SigningIn, Synthesis, TemporalAwareness) with no MDX and no role metadata; the extractor does not process them.

### Verdicts

- *Overview files* (one per folder): correctly excluded; no role required.
- *`qualities/` and `foundations/` files*: role is currently inferred from path by the extractor. This works for the Storybook-era extractor. For the Astro content-collection system, role needs to be explicit in frontmatter — Phase D adds it during the migration.
- *`concepts/` folder*: the extractor skips the entire `Concepts` category (line 838). These 18 files are invisible to the graph. Phase D decision: concepts should become `role:pattern` nodes (they document vocabulary used throughout the pattern language) and the `Concepts`-skip rule in the extractor should be removed in Phase E. The `concepts/conversational/` subfolder (9 files) and `concepts/agentic-systems/` (1 file) are the priority additions.
- *`patterns/` stubs*: low-content drafts. Not blockers for Phase B. Migrate as `role:pattern` in Phase D if content warrants it; otherwise hold.

*No unresolved blockers.* Role coverage is sufficient to proceed to Phase B with the provisions above.

---

## 2. Move/mechanism split audit

Scope: every entry in `src/stories/operations/` and any other entry the plan calls out. Verdicts: *pure-move*, *pure-mechanism*, or *APG-style split needed*.

### Pure-move entries — no split

These are already authored as pattern-level moves; they just need correct role tagging in Phase D.

| File | Current role | Verdict |
|---|---|---|
| `Undo.mdx` | `role:pattern` ✓ | Pure move. Keep. |
| `Autofill.mdx` | `role:pattern` ✓ | Pure move. Keep. |
| `GoodDefaults.mdx` | `role:pattern` ✓ | Pure move. Keep. |
| `DeepLinking.mdx` | `role:pattern` ✓ | Pure move. Keep. |
| `StateDisabled.mdx` | `role:pattern` ✓ | Pure move. Keep. |
| `StateEmpty.mdx` | `role:pattern` ✓ | Pure move. Keep. |
| `UnavailableActions.mdx` | `role:pattern` ✓ | Pure move. Keep. |
| `Autocomplete.mdx` | `role:pattern` ✓ | Already move-level ("assisted narrowing"). Keep. |
| `MorphingControls.mdx` | `role:pattern` ✓ | Move-level. Keep. |
| `Sections.mdx` | `role:pattern` ✓ | Move-level. Keep. |
| `StatusFeedback.mdx` | `role:umbrella` ✓ | Umbrella. Keep. |

*Role correction flagged:*
- `Toast.mdx` is currently tagged `role:component` but its content is entirely move-level (transient feedback, timing, stacking strategy, non-disruptive confirmation). The mechanism (the visual overlay widget) is implemented in the component but not documented in the MDX. Toast should be re-tagged `role:pattern` in Phase D. No move/mechanism split required — it is a pure move.

- `InlineConfirmation` exists only as `.stories.tsx`, no MDX. The plan identifies it as a pure-move entry. A `InlineConfirmation.mdx` with `role:pattern` should be created in Phase D (or Phase C as a schema-driving sample).

### Pure-mechanism entries — no split

| File | Current role | Notes |
|---|---|---|
| `Input.mdx` | `role:component` ✓ | Primitive text field. No move content. |
| `Select.mdx` | `role:component` ✓ | `atomic:primitive`. Short bounded set. No move. |
| `Checkbox.mdx` | `role:component` ✓ | Boolean toggle mechanism. No split. |
| `Button.mdx` | `role:component` ✓ | Pure mechanism. |
| `Badge.mdx` | `role:component` ✓ | Display mechanism. |
| `Breadcrumbs.mdx` | `role:component` ✓ | Navigation mechanism. |
| `Callout.mdx` | `role:component` ✓ | Display mechanism. |
| `KeyboardKey.mdx` | `role:component` ✓ | Display atom. |
| `Popover.mdx` | `role:component` ✓ | Positioning mechanism. No split. |
| `ProgressIndicator.mdx` | `role:component` ✓ | Mechanism under StatusFeedback umbrella. |
| `Range.mdx` | `role:component` ✓ | Slider mechanism. |
| `Reference.mdx` | `role:component` ✓ | Mechanism. |
| `Switch.mdx` | `role:component` ✓ | Binary toggle. |
| `Tag.mdx` | `role:component` ✓ | Display mechanism. |
| `Textarea.mdx` | `role:component` ✓ | Multiline input primitive. |
| `Overflow.mdx` | `role:component` ✓ | No stories; display mechanism. |

### APG-style split needed

#### Combobox

Current: `role:component`, `atomic:pattern`, has `Combobox.stories.tsx` and `Combobox.profile.ts`.

The Combobox entry mixes move-level content (the situation: narrowing a large or unbounded set through typed filtering; the consequences: reduces decision fatigue, enables progressive disclosure of options) with mechanism-level content (multiple-selection prop, validation, disabled state, grouped options, grouped anatomy). The current MDX is 58 lines and already documents both.

*Proposed move name:* **Constrained selection** — the actor is selecting from a bounded set they may not fully know, using typing to narrow it. This names the move rather than the widget and covers the shared contract of Combobox, Autocomplete, Command menu, and filtered dropdowns.

*Move portion* (migrates to pattern site as `constrained-selection.mdx`, `role:pattern`):
- Situation: actor must select a value from a large or incompletely-known set; free text is not valid
- Forces: typing reduces scan cost; but the actor needs to know the set exists and what to type
- Consequences: lowers cognitive load for large sets; breaks down if options are truly unknown to the actor
- Edges: enables → Command menu, Filtering, Searching; built-on → Input, Select (simpler counterpart); contrast → Free text entry

*Mechanism portion* (stays in `packages/components/` as `Combobox.mdx`, `role:component`):
- Props: `multiple`, `disabled`, `aria-invalid`
- States: empty, typing, open, selected, invalid, disabled
- Anatomy: text input + popup listbox + optional clear button
- Keyboard model: ARIA Combobox pattern (APG)
- ARIA: `role="combobox"`, `aria-expanded`, `aria-autocomplete`, `aria-activedescendant`

*AT altitude*: Move portion keeps Operations altitude in pattern site. Mechanism portion leaves AT cascade.

*Blocker status:* not a blocker for Phase B or C. Must be resolved before Phase D's bulk migration begins.

---

## 3. Cross-cutting material verdicts

| Directory | Home | Rationale |
|---|---|---|
| `docs/language/` | `apps/patterns/` | Primary consumer is pattern-language authoring and the graph extractor. |
| `docs/specs/` | `apps/patterns/` | Documents conventions used in pattern authoring and the content-collection schema. |
| `docs/research/` | `apps/patterns/` | Feeds pattern authoring; no component-side consumer. |
| `docs/quality/` | `apps/patterns/` | Quality specs inform pattern edges and language entries. |
| `docs/project/` | workspace root | Project-management material; serves both workspaces. |
| `references/` | `apps/patterns/` | Pattern-language bibliography and HCI references. |
| `research/` | `apps/patterns/` | Research notes; primary consumer is pattern authoring. |
| `plans/` | workspace root | Describes workspace-level changes; serves all workspaces. |

The `docs/` subdirectories that land in `apps/patterns/` should be moved during Phase D, co-located with pattern content. The workspace-root items stay in place.

---

## 4. Extractor coupling audit

Source: [scripts/extract-graph-data.ts](../../scripts/extract-graph-data.ts) (1148 lines).

| Assumption | Location | Phase E action |
|---|---|---|
| `<Meta title="...">` regex for deriving node ID and category | lines 228–230, used at line 821 | *Replace* with YAML frontmatter `title` and `category` fields. The Astro content-collection schema is the new source of truth. |
| `<Meta of={...} tags={[...]}>` regex for extracting role and other tags | lines 232–237, used at lines 847–848 | *Replace* with frontmatter `role`, `activity-level`, `atomic`, `mediation` fields. |
| `.stories.tsx` fallback — when no `<Meta title>` is found in MDX, reads the co-located stories file for title and tags | lines 825–831 | *Remove*. Once all metadata lives in MDX frontmatter, there is no co-located stories fallback. Component pages in `packages/components/` that need graph presence will have explicit MDX with frontmatter. |
| `LINK_PATTERN` regex `../?path=/docs/<id>--docs` for typed-link resolution | line 294, used at lines 334, 343–344 | *Replace* with the inter-page link format chosen in Phase C (plain relative routes are the default; wikilinks or a `pattern:` scheme are alternatives). The replacement regex should match the new format. |
| `Concepts` category skip: `if (category === 'Concepts' \|\| category === 'Introduction') continue;` | line 838 | *Remove* the `Concepts` skip. Concepts become graph nodes in the pattern site (`role:pattern`). `Introduction` skip stays or becomes a `role:` exclusion. |
| `Overview` skip: `if (shortTitle === 'Overview' && !DECISION_TREES[provisionalId]) continue;` | line 841 | *Keep*. Overview files remain excluded unless they contain a decision tree. |
| Output URL format: `../?path=/docs/${id}--docs` (node `path` field) | line 843 | *Replace* with pattern-site route format (e.g. `/patterns/${id}`). |
| `storiesDir` source path root | top of processing loop | *Replace* with `apps/patterns/src/content/patterns/` as the new source root. |

None of these are blockers for Phase B or C. They are Phase E work.

---

## 5. Astro Lit-renderer prototype — outstanding

The prototype specified in the plan has not been built yet. It is the remaining gate before Phase B can begin. Required verification:

1. A local Astro app that imports a Lit component from a sibling package (simulating `packages/components/`).
2. The component renders correctly on a page using `client:only="lit"` or equivalent.
3. The `register-all.ts` registry pattern does not break inside Astro's island boundaries.
4. View transitions do not break custom-element registration.

*Recommendation:* Bootstrap the prototype as the first action in Phase B — create the `apps/patterns/` Astro skeleton first, wire in one Lit component from `packages/components/`, and verify before moving any content. This collapses Phase A's prototype requirement and Phase B's app skeleton into the same step.

---

## Phase A verdict

Phase A closes with one outstanding item (the prototype) and two action items for Phase D:

1. *Prototype gate:* build the Astro + Lit island prototype at the start of Phase B before committing to any content migration.
2. *Role corrections in Phase D:* re-tag `Toast.mdx` from `role:component` to `role:pattern`; create `InlineConfirmation.mdx` with `role:pattern`; add explicit role frontmatter to all `qualities/` and `foundations/` files during migration.
3. *Combobox split in Phase D:* execute the move/mechanism split per the verdict above. No other entries require splitting.

All other audit questions are resolved. Phase B (workspace restructure) may proceed once the prototype confirms the Astro + Lit island approach.
