---
title: "Combobox primitives extraction"
status: "active"
kind: "exec-spec"
created: "2026-05"
last_reviewed: "2026-05-07"
area: "components"
promoted_to: ""
superseded_by: ""
---
# Combobox primitives extraction

A code refactor that extracts the combobox primitives currently living in `src/components/command-menu/command.tsx` into a sibling `src/components/combobox/` module, with identifiers renamed from `Command*` to `Combobox*`. Pure rename — no behaviour change, no new code, no shim. Sibling to [`2026-05-combobox-territory.md`](./2026-05-combobox-territory.md), which provides the documentation framing.

## Context

`src/components/command-menu/command.tsx` exposes thin React wrappers over [`cmdk`](https://www.npmjs.com/package/cmdk) (`package.json:81`) under names `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandItemPrefix`, `CommandItemSuffix`. Mechanically these are the WAI-ARIA APG combobox primitives — `cmdk` itself implements the combobox pattern under its "Command" branding.

The `Command*` naming is **application-derived**, not mechanism-derived. The primitives are already used by multiple distinct moves:

- `command-menu/command-menu.tsx` — Command menu pattern (the original consumer)
- `reference/ReferencePicker.tsx` — reference picker (combobox over reference items)
- `filter/filter-components.tsx` — Filter value pickers
- `filter/index.ts` — re-exports the same primitives downstream
- 4 story files under `src/stories/actions/seeking/` — story-side composition

This refactor renames the primitives to reflect what they actually are. The rename earns its keep because:

1. Multiple non-command-menu consumers already exist — the misnaming is a real friction (a reference picker importing from `command-menu/command` reads as a categorical mistake to a new reader).
2. The companion documentation plan (`2026-05-combobox-territory.md`) authors a `Combobox.mdx` that names the contract; the code-side identifier should match.
3. Per `pattern-definition.md` and `2026-05-role-metadata.md`, the project's framing is that **combobox is the substrate, command menu is one move that composes it**. The directory layout should make that legible.

Per project style (`AGENTS.md`, `state-management.md`), no backwards-compatibility shim — drop `Command*` re-exports and update all consumers in one pass.

## Scope

Pure rename. No behaviour change. The `CommandMenu` React component, the `command-menu/hooks/`, `command-menu/adapters/`, and the data types in `command-menu-types.ts` (`CommandData`, `CommandChildData`, `CommandItem`-the-type, `RecentItem`) all retain their names — they are command-menu-specific, not combobox primitives.

**Side effect (worth noting, not a separate change)**: `CommandItem` currently means two things — the primitive React component (`command.tsx`) and the data-type union (`command-menu-types.ts`). After the rename, `CommandItem` unambiguously means the data type.

### Identifier rename map

| Old (in `command-menu/command.tsx`) | New (in `combobox/combobox.tsx`) |
|---|---|
| `Command` | `Combobox` |
| `CommandInput` | `ComboboxInput` |
| `CommandList` | `ComboboxList` |
| `CommandEmpty` | `ComboboxEmpty` |
| `CommandGroup` | `ComboboxGroup` |
| `CommandItem` (component) | `ComboboxItem` |
| `CommandItemPrefix` | `ComboboxItemPrefix` |
| `CommandItemSuffix` | `ComboboxItemSuffix` |
| `CommandProps` | `ComboboxProps` |
| `CommandInputProps` | `ComboboxInputProps` |
| `CommandItemProps` | `ComboboxItemProps` |
| `CommandItemPrefixProps` | `ComboboxItemPrefixProps` |
| `CommandItemSuffixProps` | `ComboboxItemSuffixProps` |
| `SlotProps`, `CommandItemSlots`, `useCommandItemSlots` | `SlotProps`, `ComboboxItemSlots`, `useComboboxItemSlots` |

The `import { Command as CommandPrimitive } from "cmdk"` line stays — `cmdk`'s exports keep their names; only the project's wrapper names change. The internal alias becomes `import { Command as ComboboxPrimitive } from "cmdk"` for consistency.

## Files

### New

- `src/components/combobox/combobox.tsx` — primitives, moved verbatim from `command-menu/command.tsx` with the rename map applied. No structural changes to JSX or hook bodies.
- `src/components/combobox/index.ts` — re-exports the primitives.

### Deleted

- `src/components/command-menu/command.tsx` — content moved to `combobox/combobox.tsx`. Per project style, no shim left behind.

### Edited

- `src/components/command-menu/command-menu.tsx` — change import from `./command` to `../combobox`, rename identifiers.
- `src/components/command-menu/ai-fallback-handler.tsx` — change import from `./command` to `../combobox`, rename identifiers.
- `src/components/command-menu/index.ts` — drop the `Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandItemPrefix, CommandItemSuffix` re-exports. Keep `CommandMenu`, `AIFallbackHandler`, hooks, AI types, data types.
- `src/components/reference/ReferencePicker.tsx` — change import from `../command-menu/command` to `../combobox`, rename identifiers in JSX.
- `src/components/filter/index.ts` — drop the `Command*` re-exports (lines 22-32 region). Consumers import from `combobox/` directly.
- `src/components/filter/filter-components.tsx` — change import from `../command-menu/command` to `../combobox`, rename identifiers in JSX.
- `src/stories/actions/seeking/CommandMenu.tsx` — change imports, rename identifiers.
- `src/stories/actions/seeking/Filtering.tsx` — change imports, rename identifiers.
- `src/stories/actions/seeking/DataView/FilterControls.tsx` — change imports, rename identifiers.
- `src/stories/actions/seeking/DataView/ProductFilterValueDropdown.tsx` — change imports, rename identifiers.

### Not modified

- `src/components/command-menu/command-menu-types.ts` — data types stay; they are command-menu-specific.
- `src/components/command-menu/hooks/**` — command-menu-specific compositions.
- `src/components/command-menu/adapters/**` — same.
- `src/components/component-registry.ts`, `src/components/register-all.ts` — these are for Lit `pp-*` web components; React components are unaffected.
- `src/stories/actions/seeking/DataView/aiFilterAdapter.ts` — type imports only (`AICommandResult`, `AICommandItem`); these are AI-command types, not combobox primitives, and stay in `command-menu/`.

## Verification

- `npm run test` — ESLint clean.
- `tsc --noEmit` (or whatever the typecheck command is in `docs/quality/testing-strategy.md`) — no type errors. The renames are pure identifier moves so the type graph should be unchanged.
- `npm run storybook` — load the affected stories and confirm rendering:
  - `Actions/Seeking/Command Menu` — primary command-menu story
  - `Actions/Seeking/Filtering` — filter value picker
  - `Actions/Seeking/Data View / *` — filter controls and product filter dropdown
  - `Operations/Reference` (if exists) — reference picker
- *Grep invariant* — after the change, `grep -r "from.*command-menu/command['\"]" src/` should return zero results, and `grep -rE "\\b(Command|CommandInput|CommandList|CommandEmpty|CommandGroup|CommandItem|CommandItemPrefix|CommandItemSuffix)\\b" src/` should match only data-type uses (`CommandData`, etc.) plus the type union from `command-menu-types.ts` named `CommandItem`. The primitive identifiers should appear nowhere outside `combobox/` and the `cmdk` import alias.

## Risks

- *Name clash on `CommandItem`*: the data-type `CommandItem` in `command-menu-types.ts:68` shadows the primitive component name. After rename this clash dissolves — `CommandItem` unambiguously means the data type.
- *Story breakage*: 4 story files touch the primitives. The rename is mechanical but easy to miscount. Verify each story renders.
- *External consumers of `filter/index.ts` re-exports*: dropping the re-exports from `filter/index.ts` may break files that imported `Command*` from `filter/`. The grep above will catch these. Update them to import from `combobox/`.
- *Future `pp-combobox` (Lit)*: out of scope. If a Lit-side composition ever needs combobox semantics, it can land later as `src/components/combobox/pp-combobox.ts` alongside the React primitives. The directory naming is friendly to both. Per `2026-05-combobox-territory.md`, no current consumer demands it.

## Phase ordering

Single phase. All changes ship together or not at all — leaving the rename half-done would break imports.

## Coordination with `2026-05-combobox-territory.md`

The territory plan's `Combobox.mdx` documentation page references the new `combobox/` location. Two ship orders work:

- *Refactor first* (preferred). Land this plan, then author `Combobox.mdx` against the new location with no follow-up edits needed.
- *Docs first, refactor follows*. `Combobox.mdx` initially names `command-menu/command.tsx` as the realisation; this plan lands later and the docs are updated in the same commit.

The refactor is independently revertible from the docs. The docs are not independently revertible from the refactor (the docs would name a non-existent location).

## Findings

(populate during execution — capture any unexpected coupling, name clashes, or missed consumers)
