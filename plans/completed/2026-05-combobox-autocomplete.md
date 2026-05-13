# Add a demo story to Autocomplete

## Context

`Autocomplete.mdx` therefore has no companion stories file. The user wants the Autocomplete page to show a working example "for the sake of completeness" — one demo that pulls its weight beyond the Combobox contract by illustrating an Autocomplete-specific design consideration.

The mdx names two such considerations (`Autocomplete.mdx:18-19`):

1. *Recent and frequent items often beat algorithmic suggestions, or at least deserve a spot alongside them.*
2. *Worth distinguishing narrowing (filtering a known list) from expanding (proposing related or trending terms the actor hasn't thought of).*

The chosen demo focus is consideration (1) — Recent + algorithmic. Combobox.Default already shows generic narrowing; layering a Recent group on top is what makes the demo recognisably Autocomplete-shaped rather than a thinner repeat of the contract page.

## Approach

Add one story file, wire it into the mdx, follow the same shape Combobox.mdx uses for its embedded story.

### Files modified

New:

- `src/stories/operations/Autocomplete.stories.tsx`

Edited:

- `src/stories/operations/Autocomplete.mdx`

### `Autocomplete.stories.tsx`

Shape, mirroring `Combobox.stories.tsx`:

- `meta.title = "Operations/Autocomplete"` (matches the current `<Meta title=…>` so the docs URL `operations-autocomplete--docs` and pattern-graph node id stay stable).
- Imports the renamed primitives from `src/components/combobox` — `Combobox`, `ComboboxInput`, `ComboboxList`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxItem`. This is deliberate: `Autocomplete.mdx:25` (after this branch's edits) lists Combobox as the precursor, so the demo realises that relationship visibly.
- One exported story: `Default`.

Story logic for `Default`:

- Local `query` state tracked via `onValueChange` on `ComboboxInput` — needed only to conditionally show/hide the Suggestions group when the input is empty. cmdk owns filtering via its built-in fuzzy scorer; the story does not pass `shouldFilter={false}`.
- Two inline datasets (kept inside the file — no new JSON, since global-search-style query completion is a different shape from the entity-picker datasets in `src/stories/data/`):

  ```
  recentSearches: string[]   // ~4 items
  popularSearches: string[]  // ~6–8 items
  ```

  Choose plausible domain queries (e.g. "Q1 sustainability report", "circular economy", "scope 3 emissions") so the demo reads as a knowledge-work search palette rather than a generic combobox.
- Render structure:

  ```
  <Combobox>
    <ComboboxInput onValueChange={setQuery} placeholder="Search…" />
    <ComboboxList>
      <ComboboxEmpty>No results.</ComboboxEmpty>
      <ComboboxGroup heading="Recent">
        {recentSearches.map(…)}
      </ComboboxGroup>
      {query && (
        <ComboboxGroup heading="Suggestions">
          {popularSearches.map(…)}
        </ComboboxGroup>
      )}
    </ComboboxList>
  </Combobox>
  ```

  So:
  - Empty input shows the Recent group only — recents are useful before the actor types, not during.
  - Non-empty input: Recent group is hidden (typing signals disinterest in recents); cmdk fuzzy-scores items in the Suggestions group.
  - Each `ComboboxItem` uses `<iconify-icon icon="ph:clock-counter-clockwise" slot="prefix" />` for recents and `"ph:magnifying-glass"` for suggestions — matches the icon convention in `Combobox.stories.tsx:21-37`.
  - `onSelect` writes the picked string back into the cmdk value (commits the completion) — illustrates "economy of typing" from `Autocomplete.profile.ts:7`.

- Width wrapper `<div style={{ width: '320px' }}>` (matches Combobox.stories.tsx).

Optional `parameters.docs.description.story` text on `Default` is fine but not required — the mdx body carries the framing.

### `Autocomplete.mdx` edits

Convert the Meta block from `title=`/tags-only to the `of=`/tags pair the new Combobox.mdx uses (`Combobox.mdx:1-6`):

```
import { Canvas, Story, Meta } from '@storybook/addon-docs/blocks';
import * as AutocompleteStories from './Autocomplete.stories.tsx';
import { profile } from './Autocomplete.profile';

<Meta of={ AutocompleteStories } tags={['activity-level:operation', 'atomic:pattern', 'role:pattern', 'mediation:individual']} />
```

Note the role tag stays `role:pattern` — Autocomplete is a move/intent applied to the Combobox contract. The territory plan's role-tag invariant test (`2026-05-combobox-territory.md:112`) holds: Autocomplete prose is situation-and-forces-shaped (when to use it, what alternatives exist), not contract-shaped.

Then add a Canvas block immediately after the one-sentence definition, in the position Combobox.mdx uses:

```
<Canvas>
  <Story of={ AutocompleteStories.Default } />
</Canvas>
```

Place it between `Autocomplete.mdx:12` (the definition sentence) and `Autocomplete.mdx:14` (the assisted-task-completion paragraph). The "Design considerations" heading on line 16 and everything below is unchanged.

The `import { profile } from './Autocomplete.profile';` line on line 2 of the existing mdx already exists; keep it.

## Critical files

- `src/stories/operations/Autocomplete.mdx` — already on this branch with the Combobox precursor link added; needs Meta swap + Canvas insertion.
- `src/stories/operations/Autocomplete.profile.ts` — read only; no changes. The `operates on / produces / enacts` triple frames the story and informs the dataset choice (free-form input where the valid-answer set is large).
- `src/stories/operations/Combobox.stories.tsx` — direct structural template for the new file (icons, wrapper width, story shape).
- `src/stories/operations/Combobox.mdx` — direct structural template for the Meta-and-Canvas wiring.
- `src/components/combobox/index.ts` — exports the primitives the story imports.

## Reused utilities

- `src/components/combobox/` (`Combobox`, `ComboboxInput`, `ComboboxList`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxItem`) — the renamed primitives extracted by the territory work. No new component code.
- `iconify-icon` web component + `src/jsx-types` registration — already used by Combobox.stories.tsx; reuse pattern verbatim.
- `cmdk`'s `shouldFilter={false}` — the convention every existing combobox consumer in this repo uses (`Combobox.mdx:30`).

## Verification

- `npm run storybook` — open *Operations / Autocomplete*; the embedded Canvas renders the Default story; typing into the input narrows both groups; clearing the input restores the Recent-only view; activating an item commits its text into the input.
- *Cross-link sweep*: from the Autocomplete page, clicking the Combobox precursor link lands on the Combobox docs page (URL `operations-combobox--docs`).
- `npm run test` — ESLint clean across the new file.
- *Pattern graph stability*: `src/pattern-graph.json` regeneration (whatever script the project uses; the territory plan refers to it as part of `Verification`) leaves the existing `operations-autocomplete` node and its seven edges intact. The Meta swap from `title=` to `of=` should not change the node id or the tag set — confirm by diffing the regenerated file.
- *Role-tag invariant*: re-read `Autocomplete.mdx` after the edit. The story illustrates a move (the actor types, the system suggests, the actor commits); the prose still talks about when to use the move, not what its contract is. If the prose shifts toward contract semantics, that's a strain signal worth capturing in the territory plan's *Findings*; we don't expect it for this change.
