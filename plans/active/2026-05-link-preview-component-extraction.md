---
title: "Extract link preview surface into a reusable component"
status: "active"
kind: "exec-spec"
created: "2026-05"
last_reviewed: "2026-05-26"
area: "components, patterns"
promoted_to: ""
superseded_by: ""
---
# Extract link preview surface into a reusable component

## Context

The link preview feature landed in `apps/patterns/` as an app-specific behaviour module (`src/lib/link-preview.ts`) wired to a CSS popover (`src/styles/link-preview.css`). It works: hover a pattern link, see the title and opening paragraph in a transient popover, move into the popover to read or follow inner links.

The *pattern page* (`actions/seeking/link-preview.mdx`) documents the interaction move and is correctly placed. The *implementation* is tightly coupled to the patterns app — it imports `stack-store`, fetches full HTML pages, extracts excerpts with DOM parsing, and handles stacked-notes click-through.

There is a reusable surface behaviour inside that implementation wanting to be extracted: the hoverable-popover with show/hide timing, hover-bridge, positioning, Escape dismiss, and focus management. This is the same behavioural layer that `pp-tooltip` provides for non-interactive content, extended to support a hoverable body with rich content. The content *fetching* stays app-specific; the *surface* is generic.

### Relationship to existing components

`pp-tooltip` (`packages/components/src/components/tooltip/`) already handles hover-intent, show/hide delays, and popover positioning via `pp-popup` + Floating UI. But it is designed for non-interactive content:
- `pointer-events: none` on the body — cursor cannot enter
- `--max-width: 20rem` — too narrow for rich content
- Dark-themed — not suited for readable prose
- `role="tooltip"` with `aria-live` — wrong semantics for interactive content

The transient-layers-split plan (`plans/active/2026-04-transient-layers-split.md`) already established that tooltip is the non-interactive mode of popover, gated on content interactivity. Link preview is the next step in that same gradient: content that is *readable and navigable* but still *transient and hover-triggered*.

### Relationship to Reference

Reference (`packages/components/src/components/reference/`) uses `ItemInteraction` for its escalation ladder (mini → mid → maxi). The preview tier of Reference is one application of the link preview move. The graph has `actions-seeking-link-preview enables primitives-reference`. Extracting a reusable preview surface means Reference's mini scope could eventually consume the same component rather than reimplementing the hover-preview behaviour through `ItemInteraction`'s own hover handling. That convergence is a future step, not this plan's scope.

## Decision log

- *New component, not a mode on `pp-tooltip`* — `pp-tooltip` wraps `pp-popup` and is designed around `role="tooltip"`, non-interactive content, and `pointer-events: none`. Making it support interactive hoverable content would require forking most of its behaviour behind a mode flag. A sibling component that also wraps `pp-popup` is cleaner: shared positioning substrate, distinct interaction contracts.
- *Named `pp-preview`, not `pp-link-preview`* — the surface is not specific to links. It's a hoverable rich-content popover triggered by hover/focus. A command palette might use it to preview a result; a mention chip might use it to preview a user. The link-specific fetching and click-through stay in app code.
- *Lit web component, not React* — consistent with the project's component stance (`pp-tooltip`, `pp-popup`, `pp-toast` are all Lit). The patterns app already loads Lit components via `register-all.ts`.
- *Delegated usage, not wrapper* — unlike `pp-tooltip` which wraps its trigger as a slot child, `pp-preview` will be a standalone positioned element that app code shows/hides imperatively. This matches how the current `link-preview.ts` works (one singleton element, repositioned per trigger) and avoids wrapping every link in a custom element.

## Scope

In scope:
- A `pp-preview` Lit component in `packages/components/` wrapping `pp-popup`
- Hover-bridge behaviour (cursor can enter the popover body)
- Show/hide delay (configurable via CSS custom properties, matching `pp-tooltip` convention)
- Positioning via `pp-popup` (Floating UI, flip + shift)
- Escape dismiss, scroll dismiss
- Focus management (focusin cancels hide, focusout schedules hide)
- Touch suppression (`hover: none` media query)
- `aria-describedby` wiring
- Storybook documentation page in `packages/components/src/stories/`
- Refactor `apps/patterns/src/lib/link-preview.ts` to consume `pp-preview`
- Registration in `register-all.ts`

Out of scope:
- Converging Reference's `ItemInteraction` hover tier with `pp-preview`. That's a separate piece of work after `pp-preview` stabilises.
- Nested previews (preview-within-preview). Block for now; revisit if a use case emerges.
- Content fetching or excerpt extraction. The component accepts content via slot or property; the app provides it.

## API sketch

```typescript
// Imperative usage (how link-preview.ts would consume it)
const preview = document.querySelector('pp-preview');

// Position relative to a trigger element
preview.anchor = triggerElement;   // or a VirtualElement
preview.placement = 'bottom';

// Set content
preview.innerHTML = '<strong>Title</strong><p>Excerpt...</p>';

// Show / hide
preview.show();   // starts show-delay timer
preview.hide();   // starts hide-delay timer

// Events
// pp-show, pp-after-show, pp-hide, pp-after-hide (same as pp-tooltip)
```

```css
/* Configurable via CSS custom properties */
pp-preview {
  --max-width: 40ch;
  --show-delay: 350ms;
  --hide-delay: 250ms;
}
```

## Steps

### 1. Create `pp-preview` component

*Files:*
- `packages/components/src/components/preview/preview.ts`
- `packages/components/src/components/preview/preview.css`

Build on `pp-popup` (same dependency as `pp-tooltip`). Key differences from tooltip:
- `pointer-events: auto` on the body — hoverable
- Hover-bridge: `mouseenter` on body cancels hide timer; `mouseleave` schedules hide
- Light background, readable typography (matches `popover.css` styling, not tooltip dark theme)
- Larger `--max-width` default (40ch vs 20rem)
- Content via default slot (rich HTML), not just a `content` text attribute

### 2. Register in `register-all.ts`

Add `pp-preview` to the component registry, after `pp-popup` (dependency).

### 3. Storybook documentation

*Files:*
- `packages/components/src/stories/Preview.mdx`
- `packages/components/src/stories/Preview.stories.tsx`

Stories:
- Basic: static rich content, click-triggered
- Hover-triggered: delegated hover on a link, matching the link-preview use case
- With inner links: demonstrate hoverable body with clickable content

Documentation sections: definition (framed from the human situation), variants (hover vs click trigger), accessibility, relationship to Popover and Tooltip (the interactivity gradient), related patterns.

Meta tags: `activity-level:operation`, `atomic:primitive`, `role:component`, `mediation:individual`.

### 4. Refactor patterns app `link-preview.ts`

Replace the manual DOM creation and positioning with `pp-preview`:
- Remove the `getPreviewEl()` singleton creation — use a `<pp-preview>` element instead
- Remove manual `position()` function — `pp-popup` handles this via Floating UI
- Remove manual show/hide delay timers — `pp-preview` handles these internally
- Keep: slug resolution, fetch + excerpt extraction, stacked-notes click-through, scroll dismiss wiring

The refactored module becomes a thin adapter: resolve slug → fetch excerpt → set `pp-preview` content and anchor → call `show()`.

### 5. Update graph

Run `extract-graph-data.ts`. The new `pp-preview` component node should appear with:
- `enables` edge from `pp-popup` (building block)
- Cross-reference from the link-preview pattern page (via "Containers and primitives" or similar header)

### 6. Update transient-layers documentation

The interactivity gradient in Popover.mdx currently goes: tooltip (non-interactive) → popover (interactive, click-triggered). Preview sits between them: interactive but hover-triggered, transient but hoverable. Add a note to Popover.mdx or a cross-reference acknowledging this middle position.

## Open questions

1. *Should `pp-preview` support anchor positioning as a progressive enhancement?* The tech plan (`2026-04-transient-layers-tech.md`) already decided Floating UI now, CSS anchor positioning later. `pp-preview` inherits that decision via `pp-popup`. No new decision needed unless `pp-popup` migrates first.

2. *Should `pp-preview` handle its own hover-bridge, or should `pp-popup` gain a `hover-bridge` mode?* `pp-popup` already has a `hover-bridge` attribute (used by `pp-tooltip`). If that's sufficient, `pp-preview` just enables it. Check whether `pp-popup`'s hover-bridge implementation supports the pointer-events-auto case or only the pointer-events-none tooltip case.

3. *Delegated vs instance-per-trigger.* The current implementation uses a single singleton repositioned per trigger. This is efficient for the patterns app's use case (many links, one preview at a time). Should `pp-preview` support both singleton and per-instance usage? Default: yes, by making it a regular element that can be instantiated either way.

4. *Should `pp-preview` adopt `interestfor` + `popover="hint"` as its substrate?* The Interest Invokers API (`interestfor` attribute) declaratively wires hover intent, show/hide timing, and `aria-describedby`/`aria-details` — subsuming most of the manual JS in the current implementation. Combined with `popover="hint"` (auto-dismisses other hints) and CSS anchor positioning (implicit anchor from `interestfor` trigger), it would replace Floating UI, manual timers, and manual ARIA wiring. However: (a) `interestfor` requires the attribute stamped on each trigger element, which conflicts with the delegated-event model where any matching anchor becomes a trigger dynamically — would need a MutationObserver or DOM walk at load; (b) support is Chrome 142+ only (Oct 2025), Firefox/Safari not yet shipping; (c) the anchor positioning polyfill doesn't support implicit anchors or `position-area` on popovers. Track as a future rebuild substrate once `interestfor` reaches Baseline, not for the initial extraction.

## Risks

- *`pp-popup` hover-bridge gap.* If `pp-popup`'s hover-bridge doesn't work with `pointer-events: auto` on the body, the bridge needs to be reimplemented in `pp-preview`. Low risk — the bridge is a timing mechanism, not a pointer-events trick.
- *Stale content flash.* When reusing a singleton and switching from one trigger to another, the old content may flash before the new content loads. The current implementation handles this by showing a loading state immediately. `pp-preview` should support content replacement while open without a close/reopen cycle.
- *Focus trap conflict.* Interactive content inside the preview (links, buttons) may compete with the trigger's focus. The current implementation handles this via `focusin`/`focusout` on the preview element. Verify this works when the preview is a shadow-DOM component.
