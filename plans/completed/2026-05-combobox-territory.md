---
title: "Combobox and adjacent surfaces"
status: "active"
kind: "exec-spec"
created: "2026-05"
last_reviewed: "2026-05-07"
area: "patterns"
promoted_to: ""
superseded_by: ""
---
# Combobox and adjacent surfaces

A plan to land Combobox as a `role:component` page, extend `Selection.mdx` with a multi-cardinality treatment and example stories, and add a Dual listbox placeholder so the article's territory is mapped without flattening the project's intent-based slicing of moves (Autocomplete, Command menu, Filtering, Searching, Select).

## Context

Smashing Magazine's *[Combobox vs Multiselect vs Listbox](https://www.smashingmagazine.com/2026/02/combobox-vs-multiselect-vs-listbox/)* organises five list-selection surfaces by widget shape (option count × default visibility). The project already covers most of this territory by **intent**, in `Autocomplete`, `Command menu`, `Filtering`, `Searching`, `Selection`, `Select`, `Dropdown`, and `List`. The article's framing collapses what the project deliberately keeps separate.

The conversation-level decision is to treat the article as one input, not a canonical decomposition:

- *Combobox* lands as `role:component` — the contract-bearing mechanism that Autocomplete, Command menu, Filtering, Searching, and a future searchable Select all compose with. The mechanism is **already realised** in this codebase: `cmdk` (`package.json:81`) implements the WAI-ARIA combobox pattern, and `src/components/command-menu/command.tsx` exposes thin wrappers under `Command*` names. The companion plan [`2026-05-combobox-primitives-extraction.md`](./2026-05-combobox-primitives-extraction.md) renames those primitives to `Combobox*` under `src/components/combobox/`, after which `Combobox.mdx` documents the contract that the renamed primitives realise. The Combobox case decomposes cleanly under the existing role binary — see *Findings* — so [`2026-05-role-metadata.md`](./2026-05-role-metadata.md) Open Question 1 about `role:control` likely doesn't need to be promoted.
- *Multiselect* is absorbed into [`Selection.mdx`](../../src/stories/actions/coordination/Selection.mdx) as a cardinality + visibility variant. Rather than fork a new page that would compete with Selection's already richer treatment of persistence, "select all visible vs. matching", and selection-as-imperative-filter duality.
- *Listbox-as-exhaustive-visibility* is deferred. The article's "all options visible" can also be radios or checkboxes, and overlaps with [`Modality.mdx`](../../src/stories/foundations/Modality.mdx)'s framing. No action this round; leave a note for a future pass.
- *Dual listbox* gets a placeholder so the territory map is complete and Selection / ActionBar can cross-link to it. No story, no full pattern doc — a stub with the situation, the forces, and a TODO marker.

## Scope

### A. Combobox component page

New files under `src/stories/operations/`:

- `Combobox.mdx` — `role:component`, `atomic:pattern`, `mediation:individual`. Frame combobox as the WAI-ARIA APG control (text input + popup listbox + selection commit + keyboard model). Cite [APG combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) and [`cmdk`](https://www.npmjs.com/package/cmdk). Name `src/components/combobox/` (post-refactor) as the realisation. Explicitly position the contract as the mechanism Autocomplete (predicting), Command menu (invoking), Filtering value pickers (narrowing), Searching (retrieving), Reference picker (lookup), and a future searchable Select compose with. The page documents a contract, not a move — the situation lives next door in each consuming pattern.
- `Combobox.profile.ts` — generative profile in the format of [`Select.profile.ts`](../../src/stories/operations/Select.profile.ts). Operates on: a single value drawn from a long or unfamiliar option set. Produces: a typing surface that narrows candidates as the actor types. Enacts: recognition over recall, economy of typing, discoverability of options.
- `Combobox.stories.tsx` — at minimum a Default story illustrating the contract using the renamed `Combobox*` primitives; other stories at the author's discretion.

Cross-links to add:

- `Select.mdx:68` — replace "a future combobox" with a real link.
- `Autocomplete.mdx` — note that combobox is the underlying contract.
- `CommandMenu.mdx` — note that combobox is the underlying contract; the command-menu primitives `Command*` were renamed to `Combobox*` in the extraction refactor.
- `Filtering.mdx` — note that combobox is the value-picker substrate.
- `Searching.mdx` — note combobox in the entry/query phase.

**`pp-combobox` (Lit web component) — out of scope.** Initial framing kept this as an open question. After tracing the consumers (`reference/ReferencePicker.tsx`, `filter/filter-components.tsx`, `command-menu.tsx`, plus stories), every current need is satisfied by the React combobox primitives `cmdk` provides. Lit-side primitives (`pp-list`, `pp-input`, `pp-popup`) cover the simpler cases without needing a composed `pp-combobox`. Reopen only when a Lit-side composition demands combobox semantics (none currently does). The directory naming chosen by the extraction plan (`src/components/combobox/`) is friendly to a future `pp-combobox.ts` sibling if that day comes.

### B. Selection multi-select extension

Edit and add:

- [`Selection.mdx`](../../src/stories/actions/coordination/Selection.mdx) — extend the *Multi-selection* and *Visibility and discoverability* sections with the article's distinctions: chip rendering as ambient feedback, "Select All / Clear All" affordance threshold, the "select all visible vs. all matching" follow-up affordance (already present — sharpen rather than duplicate). Cross-link to the new Combobox page where the multi-cardinality combobox variant is the substrate.
- New `Selection.stories.tsx` (currently absent) — example stories that render multi-select using `pp-list` with `multiselectable` (`src/components/list/list.ts:26`) and `pp-list-item` with checkbox affordance. Cover at least: inline always-visible checkboxes, mode-based reveal, and a "Select all visible / all 1,234" follow-up affordance. The mock-data convention in `.claude/rules/mock-data.md` applies.
- `Selection.mdx` Meta — add `<Meta of={SelectionStories} />` once the stories file exists, to wire the docs page to the stories.

### C. Dual listbox placeholder

New file:

- `src/stories/actions/coordination/DualListbox.mdx` — short stub. `role:pattern`, `atomic:pattern`. Frame the situation (committing a bulk assignment with side-by-side review of source and selection before applying), the forces (commitment scale, error cost, reviewability), the alternatives (inline multiselect when commitment is cheap; transfer list when it is consequential). Mark it explicitly as a seed — no canonical example yet. Add a TODO calling for a project example that motivates a full treatment.

Cross-links to add:

- `Selection.mdx` — list Dual listbox in *Adjacent to* or *Containers*, framed as "the staged-commit variant".
- `ActionBar.mdx` — note dual listbox as an alternative when the action set is "assign these to that".
- `plans/tech-debt-tracker.md` — add an entry "Dual listbox seeds an example" so the placeholder doesn't drift.

### D. Listbox / exhaustive visibility — deferred

No action this round. The article's *listbox = always visible options* conflates the ARIA listbox role (a popup primitive used inside combobox) with the design choice of exhaustive visibility, which can equally be radios or checkboxes. The Form decision tree's option-count branch (`docs/language/decision-dimensions.md`) and `Modality.mdx` partly cover it. Capture as a follow-up open question rather than an action item.

## Files modified

New:
- `src/stories/operations/Combobox.mdx`
- `src/stories/operations/Combobox.profile.ts`
- `src/stories/operations/Combobox.stories.tsx`
- `src/stories/actions/coordination/Selection.stories.tsx`
- `src/stories/actions/coordination/DualListbox.mdx`

Edited:
- `src/stories/operations/Select.mdx` — replace "future combobox" with a live link
- `src/stories/operations/Autocomplete.mdx` — note combobox as substrate
- `src/stories/actions/seeking/CommandMenu.mdx` — note combobox as substrate
- `src/stories/actions/seeking/Filtering.mdx` — note combobox as substrate
- `src/stories/actions/seeking/Searching.mdx` — note combobox in entry phase
- `src/stories/actions/coordination/Selection.mdx` — multi-select extension + stories Meta + DualListbox cross-link
- `src/stories/actions/coordination/ActionBar.mdx` — DualListbox cross-link
- `plans/tech-debt-tracker.md` — DualListbox seed entry
- `src/pattern-graph.json` — regenerated by extraction once Meta tags are added

Out of scope:
- `pp-combobox` web component (deferred)
- Listbox-as-exhaustive-visibility pattern page (deferred)
- Decision-dimension extension to the Form tree (deferred)

## Reused utilities

- `pp-list` with `multiselectable` (`src/components/list/list.ts`) — substrate for Selection multi-select stories
- `pp-list-item` with checkbox/radio types (`src/components/list-item/list-item.ts`) — option rendering
- `pp-input` (`src/components/input/input.ts`) — minor combobox primitive on the Lit side (not a current consumer)
- `pp-popup` (`src/components/popup/`) — minor combobox primitive on the Lit side (not a current consumer)
- The React combobox primitives at `src/components/combobox/` (post-refactor) — the realisation Combobox.mdx documents
- `command-menu/CommandMenu` (`src/components/command-menu/command-menu.tsx`) — Command menu pattern's React composition over the combobox primitives
- `filter/FilterValueDropdown` and friends (`src/components/filter/filter-components.tsx`) — filter value pickers as a second combobox consumer
- `reference/ReferencePicker` (`src/components/reference/ReferencePicker.tsx`) — reference picker as a third combobox consumer; useful prior art for the searchable-Select pattern

## Verification

- `npm run storybook` — Combobox, Selection (with new stories), DualListbox pages render, cross-links resolve.
- `npm run test` — ESLint clean across new files.
- *Manual sweep*: open each cross-linked page and confirm the link goes the right direction (no dangling `--docs` URLs). Storybook URL rule is in `.claude/rules/documentation.md`.
- *Pattern graph*: `src/pattern-graph.json` regenerates with new nodes for `operations-combobox` and `actions-coordination-dual-listbox`. Confirm `role:component` is present on Combobox; `role:pattern` on DualListbox; Selection unchanged.
- *Role-tag invariant*: Combobox page reads as a contract / mechanism, not a move. If the prose pulls toward situation/forces/consequences, that is the strain signal for `2026-05-role-metadata.md` Open Question 1 — capture the cases in this plan's *Findings* section before promoting them into the role plan.

## Findings

- *The `role:component` reading holds for Combobox.* Tracing the existing consumers (`command-menu`, `filter`, `reference/ReferencePicker`) shows three distinct moves — invoke a command, narrow a filter, look up a reference — composing the same primitive. The page's natural prose is "what the contract is" (semantics, keyboard, focus, popup positioning, narrowing behaviour); the situation belongs to each consumer. Open Question 1 in [`2026-05-role-metadata.md`](./2026-05-role-metadata.md) about whether `role:control` deserves to exist can be answered **no, not on this case** — combobox decomposes cleanly under the existing component/pattern binary.

## Open questions

1. *Listbox-as-exhaustive-visibility — pattern, decision-dimension, or Modality extension?* Three coherent answers; no current pressure. Revisit when `Modality.mdx` is next edited or when the Form decision tree gets its next pass.

2. *Does `Selection.stories.tsx` belong as one file with multiple stories, or split into Multi-select and Range stories?* Default to one file; split only if the file outgrows ~300 lines or the cardinalities diverge enough to confuse readers.

## Phase ordering

```
0. Combobox primitives extraction (separate plan: 2026-05-combobox-primitives-extraction.md)
   │
   ▼
A. Combobox component page (depends on 0 for the path/identifiers it documents)
   │
   ▼
B. Selection extension + stories (depends on A for combobox cross-link)
   │
   ▼
C. Dual listbox placeholder (depends on B for Selection cross-link)
```

The extraction refactor is the gate. A, B, C are this plan's phases; each is independently revertible. A and C can ship in parallel after the refactor lands.
