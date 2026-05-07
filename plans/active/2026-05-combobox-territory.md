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

- *Combobox* lands as `role:component` — the contract-bearing mechanism that Autocomplete, Command menu, Filtering, and a future searchable Select all compose with. It is the prototype case named in [`2026-05-role-metadata.md`](./2026-05-role-metadata.md) Open Question 1 ("is `role:control` a needed third role?"). The combobox page is a useful empirical case for that question — its prose may strain the `role:component` reading. Capture the strain if it appears; do not pre-emptively introduce `role:control`.
- *Multiselect* is absorbed into [`Selection.mdx`](../../src/stories/actions/coordination/Selection.mdx) as a cardinality + visibility variant. Rather than fork a new page that would compete with Selection's already richer treatment of persistence, "select all visible vs. matching", and selection-as-imperative-filter duality.
- *Listbox-as-exhaustive-visibility* is deferred. The article's "all options visible" can also be radios or checkboxes, and overlaps with [`Modality.mdx`](../../src/stories/foundations/Modality.mdx)'s framing. No action this round; leave a note for a future pass.
- *Dual listbox* gets a placeholder so the territory map is complete and Selection / ActionBar can cross-link to it. No story, no full pattern doc — a stub with the situation, the forces, and a TODO marker.

## Scope

### A. Combobox component page

New files under `src/stories/operations/`:

- `Combobox.mdx` — `role:component`, `atomic:pattern`, `mediation:individual`. Frame combobox as the WAI-ARIA APG control (text input + popup listbox + selection commit + keyboard model). Cite [APG combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/). Explicitly position it as the mechanism Autocomplete (predicting), Command menu (invoking), Filtering value pickers (narrowing), Searching (retrieving), and a future searchable Select compose with. Note that the page documents a contract, not a move — the situation lives next door.
- `Combobox.profile.ts` — generative profile in the format of [`Select.profile.ts`](../../src/stories/operations/Select.profile.ts). Operates on: a single value drawn from a long or unfamiliar option set. Produces: a typing surface that narrows candidates as the actor types. Enacts: recognition over recall, economy of typing, discoverability of options.
- `Combobox.stories.tsx` — at minimum a Default story illustrating the contract; other stories at the author's discretion.

Cross-links to add:

- `Select.mdx:68` — replace "a future combobox" with a real link.
- `Autocomplete.mdx` — note that combobox is the underlying contract.
- `CommandMenu.mdx` — note that combobox is the underlying contract.
- `Filtering.mdx` — note that combobox is the value-picker substrate.
- `Searching.mdx` — note combobox in the entry/query phase.

**Open question (capture, do not pre-resolve)**: does Combobox earn a `pp-combobox` web component, or is the page a documented contract over existing primitives (Input + Popup + List)? The page can launch with the *documented contract* shape; authoring the web component is its own follow-up plan if and when a story needs it. Per `web-components.md`, a real `pp-combobox` carries the bulletproof loading pattern, central registration, and event lifecycle obligations — non-trivial scope. Defer until a concrete demand surfaces.

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
- `pp-input` (`src/components/input/input.ts`) — combobox text-entry
- `pp-popup` (`src/components/popup/`) — combobox popup positioning
- The React `command-menu` (`src/components/command-menu/`) — exists as a working combobox-shaped surface; reference in Combobox.mdx as an example of the contract being satisfied today
- The React `filter` value pickers (`src/components/filter/`) — another combobox-shaped surface to reference

## Verification

- `npm run storybook` — Combobox, Selection (with new stories), DualListbox pages render, cross-links resolve.
- `npm run test` — ESLint clean across new files.
- *Manual sweep*: open each cross-linked page and confirm the link goes the right direction (no dangling `--docs` URLs). Storybook URL rule is in `.claude/rules/documentation.md`.
- *Pattern graph*: `src/pattern-graph.json` regenerates with new nodes for `operations-combobox` and `actions-coordination-dual-listbox`. Confirm `role:component` is present on Combobox; `role:pattern` on DualListbox; Selection unchanged.
- *Role-tag invariant*: Combobox page reads as a contract / mechanism, not a move. If the prose pulls toward situation/forces/consequences, that is the strain signal for `2026-05-role-metadata.md` Open Question 1 — capture the cases in this plan's *Findings* section before promoting them into the role plan.

## Findings

(populate during execution)

## Open questions

1. *Does authoring the Combobox page surface a strain in `role:component`?* The role-metadata plan's Open Question 1 uses combobox as its test case. Capture any sentence in `Combobox.mdx` where the natural framing pulls toward "situation / forces / consequences" rather than "API / contract / states". If the strain is more than a footnote, that is the empirical signal for `role:control`.

2. *Should `pp-combobox` be authored?* Out of scope for this plan; reopen if a story or example needs a real composed control rather than a documented contract. Likely candidates: a searchable Select demo, a filter value picker demo with async options, a `command-menu` migration if the React implementation is ever ported to web components.

3. *Listbox-as-exhaustive-visibility — pattern, decision-dimension, or Modality extension?* Three coherent answers; no current pressure. Revisit when `Modality.mdx` is next edited or when the Form decision tree gets its next pass.

4. *Does `Selection.stories.tsx` belong as one file with multiple stories, or split into Multi-select and Range stories?* Default to one file; split only if the file outgrows ~300 lines or the cardinalities diverge enough to confuse readers.

## Phase ordering

```
A. Combobox component page (atomic; can ship alone)
   │
   ▼
B. Selection extension + stories (depends on A for combobox cross-link)
   │
   ▼
C. Dual listbox placeholder (depends on B for Selection cross-link)
```

A and C can ship in parallel if needed; B is the integrator. Each phase is independently revertible.
