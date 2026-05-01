---
title: "Action bar story"
status: "active"
kind: "exec-spec"
created: "2026-04"
last_reviewed: "2026-05-01"
area: "storybook"
promoted_to: ""
superseded_by: ""
---
# Action bar story

Plan for adding a live Storybook story to `src/stories/actions/coordination/ActionBar.mdx`.

## Design framing

The action bar is the surface that holds operations applicable to a current selection, summoned by the act of selecting and dismissed by the act of releasing. Its design work is concentrated in the *transitions* — appearance, persistence under scroll, dismissal — and in the *coupling* between selection state and action availability. A useful story therefore has to make the selection-to-bar binding visible, not just render the bar in isolation. Showing an empty action bar with placeholder buttons would teach the wrong thing.

The story's job is to let a viewer:

1. See the resting state (no selection, no bar).
2. Stake a selection and watch the bar arrive.
3. Change the selection scope and watch the count and action set update.
4. Dismiss the selection and watch the bar leave.

Everything else (position variants, overflow, action eligibility) is secondary and can be exposed as Storybook controls or additional named stories.

## What exists, what's missing

*Exists and reusable:*
- `pp-button`, icon buttons via `iconify-icon`
- `pp-list` / `pp-list-item` for an overflow menu
- `pp-dropdown` for the overflow trigger
- `pp-p-plus` (Priority+) for responsive overflow inside the action group
- `pp-checkbox` for selectable rows
- The Toolbar story's structural conventions (flex container, button group, overflow dropdown)
- `pp-modal` — managed surface web component with lifecycle, keyboard dismiss, ARIA setup, event emission. Currently modal-only, but the non-modal behaviours needed here are a subset of what it already does (see *PPModal refactor* below).

*Missing:*
- *No non-modal mode on `pp-modal`.* The component assumes `showModal()`, focus trapping, backdrop clicks, and `aria-modal`. The action bar needs the surface lifecycle without these modal-specific behaviours.
- *No `pp-action-bar` web component.* The library has no Lit primitive for the action bar's surface, transitions, sticky positioning, or selection-binding contract.
- *No selectable list / row-selection helper.* DataView only handles column selection (`selectedAttributes`); row selection has to be staged at the story level.
- *No standard slide/fade enter-exit motion* the bar would use. Bubble menu and Notification both implement their own transitions; nothing is shared.

## Prerequisite: PPModal non-modal refactor

Dialog and Drawer both build on the same stack: `pp-modal` (web component) → `ModalService` → `modal-dom.ts` → `useModalService` (React hook). The action bar needs the same surface lifecycle — enter/exit transitions, keyboard dismiss, ARIA, event emission — but *without* the modal-specific behaviours.

A non-modal Drawer variant is also a known future consumer. That makes two non-modal surfaces arriving shortly, so the refactor pays for itself now rather than being duplicated later.

### What changes in `pp-modal`

Add a `modal` boolean attribute, defaulting to `true` for backward compatibility. Four behaviours become conditional on it:

| Behaviour | `modal` (default) | non-modal |
|---|---|---|
| Open method | `showModal()` (top-layer + backdrop) | `show()` or display toggle |
| Focus trapping | `trapFocus()` on Tab | Skip — surface is reachable but doesn't trap |
| Backdrop click | Closes on click outside | Skip |
| ARIA | `aria-modal="true"` | Omit `aria-modal` |

Everything else stays unconditional: surface discovery, event emission (`modal:open` / `modal:close`), Escape handling, trigger wiring, ARIA `role="dialog"`, React bridging, cleanup.

### Files to modify

- `src/components/modal/modal.ts` — gate the four behaviours on `this.getAttribute('modal') !== 'false'`
- `src/components/modal/modal-dom.ts` — no changes needed; the DOM builders don't set modal-specific attributes
- `src/services/modal-service.ts` — `openDrawer` and `openDialog` continue passing `modal` implicitly (the default is `true`). Add an optional `modal` flag to `ModalOptions` so the future non-modal drawer can opt out.
- `src/hooks/useModalService.ts` — `ModalOptions` type gains the `modal` flag; no logic changes

### What doesn't change

- No rename. The component stays `pp-modal` and the service stays `ModalService`.
- No new web component. The action bar story consumes `pp-modal` in non-modal mode (or composes inline using the same conventions — see below).
- Existing Dialog and Drawer stories are unaffected; they hit the default `modal=true` path.

### Acceptance

- Existing Dialog and Drawer stories render and behave identically (regression check).
- A `<pp-modal modal="false">` surface opens without top-layer, without focus trapping, without backdrop, and without `aria-modal`.
- Escape still dismisses the non-modal surface.
- `modal:open` and `modal:close` events still fire.

## Decision: web component or story-local composition?

With the `pp-modal` refactor in place, two viable shapes for the action bar surface:

1. *Ship `pp-action-bar` as a Lit web component* alongside the story. Lives in `src/components/action-bar/`, registered through `register-all.ts`. Encapsulates: sticky positioning, slot layout (counter / actions / dismiss), enter-exit transitions, an `open` attribute bound to whether a selection exists.

2. *Compose the bar inline in the story* using React + existing primitives, following the same surface contract as `pp-modal` (same event names, same keyboard behaviour, same ARIA attributes). No new web component. The story owns positioning, transitions, and the selection wiring; the surface is just a styled `div` with `pp-button` children.

*Recommendation: option 2 for the first cut.* Reasons:
- The pattern's design tensions are about *coupling and transitions*, which a story can demonstrate without a packaged primitive.
- Premature `pp-action-bar` would lock in slot/API decisions before the pattern has been used in anger anywhere in the library.
- Other coordination patterns (Toolbar, Bubble menu) followed the same path: story first, primitive later if a real consumer materialises.
- It keeps this change reviewable. Adding a web component pulls in registration, light-DOM styling, attribute conventions, and tests — all worth doing once a real consumer asks for it.

The story should use the same conventions as `pp-modal` — Escape to dismiss, `role="toolbar"` on the action group, event names matching `modal:open` / `modal:close` — so that promotion to a `pp-modal`-backed implementation (or a dedicated `pp-action-bar`) is mechanical.

If a second consumer of the action bar appears (e.g., a future selectable List pattern wants the same surface), promote the inline composition into `pp-action-bar` then.

## Story design

File: `src/stories/actions/coordination/ActionBar.stories.tsx`

### Wrapping component

A small React wrapper that owns:
- The list of items being rendered (mock products from `src/stories/data/products.json` — already used by DataView, no new mock data needed).
- A `Set<string>` of selected item ids.
- A handler for toggling selection on a row.
- A handler for "select all visible" / "clear selection".
- A derived `selectionCount` and `selectionMode` (single | multi) that drives which actions appear.

The wrapper renders a simple list (not the full DataView — too much surface area for a story about the bar) with a checkbox per row, and conditionally renders the action bar when `selectionCount > 0`.

### Stories

1. *Default* — list of ~12 items, bottom-anchored action bar. Shows the resting state, the summoning, and the count update.
2. *Top-anchored* — same wrapper, position variant. Demonstrates the position-as-variant claim from the MDX.
3. *With overflow* — same wrapper, but the action group is wide enough to overflow at typical widths so Priority+ (or a manual overflow menu) kicks in. Demonstrates the handoff to Priority+ described in Anatomy.
4. *Single vs multi action eligibility* — same wrapper, action set changes when selection is exactly 1 vs >1. The "Rename" action appears only at count === 1; "Merge" appears only at count >= 2. Demonstrates the Unavailable actions coupling.

All four stories share the wrapper and the mock data. Differences are props passed in.

### Storybook controls (Default story)

- `position`: `'bottom' | 'top'`
- `showCounter`: boolean
- `showDismiss`: boolean
- `actionCount`: number (lets the viewer push the bar into overflow without rebuilding the story)

## Anatomy implementation notes

- *Selection counter* — plain text node, "{n} selected" or "{n} of {total}" when filtered.
- *Dismiss* — icon button with `aria-label="Clear selection"`. Wired to clear the Set, which causes the bar to unmount.
- *Action group* — flex container of `pp-button` elements; for the overflow story, wrap in `pp-p-plus` and pass enough buttons to force collapse.
- *Optional title* — only shown in the "1 of 247" filtered scenario; not part of the main stories to avoid cluttering them.
- *Sticky positioning* — `position: sticky; bottom: 0;` (or `top: 0;` for the top variant) on the bar element, with a transparent backdrop behind it so underlying content stays visible.
- *Enter / exit transition* — CSS `transform: translateY(100%) → 0` plus opacity, ~150ms ease-out. Implemented via a class toggle on mount/unmount or via `@starting-style`.

## Selection state location

The selection set lives in the wrapping React component's `useState`. Reasons:

- A story is the right granularity for "selection that survives scroll but resets on remount".
- Hoisting it to a Zustand store would be over-engineered for a story and would obscure the binding the story is trying to demonstrate.
- The wrapper stays single-file and reviewable.

If the inline composition gets promoted to `pp-action-bar` later, the contract becomes "the consumer owns selection state and passes count + handlers in via props/attributes". The story already shapes the wrapper that way, so the migration is mechanical.

## Files to create or modify

*Phase 1 — PPModal refactor:*
- `src/components/modal/modal.ts` — add `modal` attribute, gate four behaviours
- `src/services/modal-service.ts` — add optional `modal` flag to `ModalOptions`
- `src/hooks/useModalService.ts` — type change only (`ModalOptions` gains `modal`)

*Phase 2 — Action bar story:*

*Create:*
- `src/stories/actions/coordination/ActionBar.stories.tsx` — the wrapper, the four stories, and the (story-local) styles for the bar surface.

*Modify:*
- `src/stories/actions/coordination/ActionBar.mdx` — add the imports for the stories and `<Story of={ActionBarStories.Default} />` (and the others) under the appropriate sections. Most naturally: Default after the opening definition, Top-anchored under Position, With overflow under Anatomy → action group, Single vs multi under Which actions belong here.
- `src/stories/actions/coordination/ActionBar.mdx` fun meter line is "Dependency" — leave the rating as is but the story doesn't change the framing.

*Not creating:*
- No new mock data file. Reuse `src/stories/data/products.json`.
- No `pp-action-bar` web component. Deferred until a real consumer exists.
- No changes to DataView or its TableView. The story uses a simpler list to keep the focus on the bar's behaviour.
- No new shared transition utility. The story owns its own CSS for now.
- No rename of `pp-modal` or `ModalService`. Naming revisited when non-modal drawer ships.

## Open questions to resolve before implementation

1. *Selectable row affordance* — always-visible checkboxes, hover-revealed, or implicit (click-to-select)? The MDX page on Selection treats this as a real design choice. For the Default story, *always-visible checkboxes* is the most legible demonstration; the other options are interesting but would need their own stories. Defer.
2. *Touch / mode-based selection* — out of scope for the first cut. Worth a follow-up if Selection grows its own stories.
3. *Should the overflow story use `pp-p-plus` or a hand-rolled overflow menu?* Priority+ is the canonical mechanism per the MDX. Use it, even though it adds a web-component dependency to the story; it's already used elsewhere in the same folder.
4. *Backdrop behind the bar* — needed at all? Spectrum doesn't use one; a subtle scrim might help separation on busy backgrounds. Default to no backdrop; revisit if the bar visually fights its container.

## Out of scope

- The `pp-action-bar` web component itself (deferred until a second consumer).
- Renaming `pp-modal` → `pp-surface` or `ModalService` → `SurfaceService` (revisit when non-modal drawer ships).
- Non-modal drawer implementation (separate work; the `pp-modal` refactor here is the prerequisite).
- Cross-view persistence demonstration (belongs in a future Selection story, not here — would dilute the focus on the bar).
- Collaborative selection / co-presence (excluded from Selection's scope; same exclusion applies here).
- Keyboard shortcut tour (escape to dismiss is implemented; a full keyboard story would belong with Selection).
- Accessibility audit beyond `aria-label` on the dismiss and a `role="toolbar"` on the action group. Anything deeper waits until the primitive is extracted.

## Acceptance

*Phase 1 — PPModal refactor:*
- Existing Dialog and Drawer stories render and behave identically.
- `<pp-modal modal="false">` opens without top-layer, focus trapping, backdrop, or `aria-modal`.
- Escape still dismisses non-modal surfaces.
- `modal:open` and `modal:close` events fire for both modes.

*Phase 2 — Action bar story:*
- Four stories render in Storybook under `Actions/Coordination/Action bar`.
- The Default story shows: empty resting state → bar appears on first selection → count updates → bar disappears on clear.
- The MDX page renders at least the Default story inline.
- No new lint errors introduced (pre-existing tldraw errors are unrelated).
- `npx tsx scripts/extract-graph-data.ts` runs cleanly; no graph changes expected (the story doesn't add cross-references).
