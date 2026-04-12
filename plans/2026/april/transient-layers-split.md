# Plan: Split Popover into Popover and Toast documentation

## Context

`src/stories/operations/Popover.mdx` currently bundles tooltip and toast alongside interactive popover. Toast already has its own stories file and `pp-toast` component but no MDX documentation page.

The Modality foundation already references all three as distinct non-modal patterns (line 28). Notification already frames toast as a delivery type. The graph is ahead of the documentation.

## Decision log

- *Tooltip merged into Popover, not a separate pattern* — the behavioural differences (trigger, dismiss, focus) are conditional on content interactivity, not independent design choices. Placing interactive content in a hover-triggered layer breaks it — that is the threshold, not a separate pattern. The `popover="hint"` spec confirms the platform models tooltip as a popover mode. Popover.mdx now has an "interactivity threshold" section framing tooltip as the non-interactive mode.
- ~~*Tooltip as separate pattern*~~ — superseded 2026-04-03. Original reasoning: divergent graph neighbourhoods and other design systems separating them. Counter: those systems are component libraries, not pattern libraries; the conditional relationship is more useful to document than the split.
- *No "Transient layer" umbrella* — Modality already serves this role and already references all the relevant patterns with a decision tree. An additional umbrella would be structural-only.
- *All three stay at operation level* — the layering/dismiss mechanics are condition-driven and habituated. The *content* inside may be action-level, but the delivery mechanism is operational.
- *Popover API is implementation, not a pattern* — it goes in a "Technical implementation" section within the patterns that use it, not on its own page.

## Steps

### 1. ~~Rewrite `Popover.mdx`~~ ✅ Done (2026-04-03)

Merged tooltip into Popover.mdx with an "interactivity threshold" section. Tooltip stories moved into Popover.stories.tsx. Standalone Tooltip.mdx and Tooltip.stories.tsx deleted. Graph node and edges updated — tooltip edges redirected to popover.

### 2. Create `Toast.mdx`

*File:* `src/stories/operations/Toast.mdx`

Definition: *deliver a brief, non-disruptive message confirming an action's outcome, auto-dismissing after a short interval.*

Sections:
- Behaviours (auto-dismiss, stacking, close button, optional action like undo)
- Timing (how long to display — short for confirmations, longer if there's an action)
- Stacking (FLIP animation approach already in `pp-toast`)
- Accessibility (`role="alert"`, `aria-live="assertive"`, `<output>` element)
- Design considerations (toast vs. callout vs. inline feedback — reference Notification decision tree)
- Related patterns: Notification, Status feedback, Undo, Action consequences, Callout

Meta tags: already set in Toast.stories.tsx — `activity-level:operation`, `atomic:primitive`, `mediation:individual`.

### 3. Update Popover.stories.tsx

Remove Toast stories from `Popover.stories.tsx` (if any remain). Fix the implementation — replace `dangerouslySetInnerHTML` inline scripts with proper React event handling or a small component.

### 4. Update neighbours

Files that need new or updated cross-references:
- `Modality.mdx` — verify links still work; tooltip links should point to popover
- `Notification.mdx` — already links to Toast, verify
- `Dialog.mdx` — already links to Popover, verify
- `Drawer.mdx` — already links to both Popover and Toast, verify
- `ContextMenu.mdx` — already links to Popover, verify
- `ProgressiveDisclosure.mdx` — ✅ updated to point to Popover

### 5. Regenerate graph data

```bash
npx tsx scripts/extract-graph-data.ts
```

Verify that `operations-tooltip` no longer appears as a node and that popover's edges now include progressive-disclosure and learnability.
