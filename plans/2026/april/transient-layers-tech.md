# Plan: Technical implementation for Popover, Tooltip, and Toast

## Context

Companion to `transient-layers-split.md` (pattern documentation restructuring). This plan covers the technical implementation: fixing bugs in the current Popover stories, improving `pp-toast`, and deciding the positioning strategy going forward.

## Current state and issues

### Popover.stories.tsx — ✅ Fixed (2026-04-03)
Inline `dangerouslySetInnerHTML` scripts replaced with proper React components and `play` functions. Tooltip stories now use the existing `pp-tooltip` web component. Popover story uses native `popover="auto"` with `popoverTarget` for declarative binding.

### pp-tooltip / pp-popup
`pp-tooltip` already implements the layering + positioning split this plan advocates: it wraps `pp-popup`, which uses `@floating-ui/dom` for positioning internally. Hover intent, focus triggers, keyboard dismiss (CloseWatcher), and `aria-describedby` are all handled. This was not known when the plan was written.

### pp-toast component
- Auto-dismiss relies on CSS animation `finished` promise (line 114–122 of `toast.ts`) — toast disappears when its *entry animation* ends, not after a readable duration. This is likely a bug or at least surprising behaviour.
- No configurable duration parameter
- `innerHTML` with string interpolation (line 26, 47) — minor XSS risk if `text` contains HTML. Low severity since it's internal, but worth sanitising.
- No Popover API usage (nor needed — toasts are fixed-position, not anchored)

## Decision: positioning strategy

*Separate the two concerns:*

1. **Layering** — use the Popover API (`popover` attribute, `showPopover()`/`hidePopover()`) for top-layer rendering and light-dismiss. Well-supported in 2026.
2. **Positioning** — use Floating UI for now. When anchor positioning reaches baseline support, migrate to CSS-only. This is a progressive enhancement path, not a fork.

This means the Popover API handles *showing/hiding/dismissing* while Floating UI handles *where the content appears relative to its trigger*. They compose naturally.

## Steps

### 1. Fix pp-toast auto-dismiss timing

*File:* `src/components/toast/toast.ts`

Add a `duration` parameter to `show()` (default ~4000ms). The toast should:
1. Animate in (CSS transition)
2. Wait for `duration` ms
3. Animate out
4. Remove from DOM

Replace the current "remove when animation finishes" logic with an explicit timer. Keep the FLIP animation for stacking — that part works well.

Also: sanitise `text` input — use `textContent` assignment instead of `innerHTML` for the message span, or at minimum escape HTML entities.

```typescript
public show(text: string, onClick?: () => void, duration = 4000): Promise<void> {
  const toast = this.createToast(text, onClick);
  this.addToast(toast);

  return new Promise<void>((resolve) => {
    setTimeout(async () => {
      // trigger exit animation
      toast.classList.add('fade-out');
      await Promise.allSettled(
        toast.getAnimations().map(a => a.finished)
      );
      this.removeToast(toast);
      resolve();
    }, duration);
  });
}
```

Update static method signature to pass through duration.

### 2. ~~Create a popover positioning utility~~ — Superseded

`pp-popup` already wraps `@floating-ui/dom` (installed as a dependency) and handles positioning for `pp-tooltip`. No separate React hook or vanilla utility is needed for stories — they use `pp-tooltip` directly.

The remaining question is whether the *click-triggered Popover* story should demonstrate positioned content. Currently the Popover story uses native `popover="auto"` without anchor positioning — the popover appears in its default browser position (centred). This is fine for demonstrating the pattern's *behaviour* (light-dismiss, focus management), but doesn't show positioned popovers. If a positioned click-popover story is needed later, `pp-popup` can be used directly.

### 3. ~~Rewrite Popover stories with proper React~~ ✅ Done (2026-04-03)

Inline `dangerouslySetInnerHTML` scripts replaced with proper React JSX using `popoverTarget` for declarative binding and a `play` function for auto-opening. One story: `Popover` (click to open, click outside to close).

### 4. ~~Create Tooltip stories~~ ✅ Done (2026-04-03)

Implemented differently than planned. Instead of building React components with `popover="manual"` + Floating UI + `aria-describedby` from scratch, the stories use the existing `pp-tooltip` web component which already handles hover intent, focus triggers, positioning (via `pp-popup`), keyboard dismiss (CloseWatcher), and accessibility.

Stories: `Tooltip` (hover a button), `TooltipOnIcon` (icon button with visually hidden label).

### 5. ~~Evaluate whether pp-popover Web Component is needed~~ — Resolved

Decision: *no `pp-popover` needed.* The existing components cover both cases:
- *Non-interactive (tooltip)*: `pp-tooltip` wraps `pp-popup` for positioned, hover/focus-triggered content
- *Interactive (popover)*: the native Popover API (`popover="auto"` + `popoverTarget`) handles showing/hiding/dismissing; positioning is either browser-default (centred) or can use `pp-popup` if anchored placement is needed

Other components (dropdown, context menu) that need popover positioning can use `pp-popup` directly — it's already the shared utility this step was looking for.

### 6. CSS anchor positioning as progressive enhancement

Don't remove the anchor positioning CSS — keep it as a progressive enhancement layer. Structure:

```css
/* Base: Floating UI handles positioning via inline styles */
[popover] {
  /* reset browser default popover positioning */
  inset: unset;
}

/* Enhancement: browsers with anchor positioning support */
@supports (anchor-name: --a) {
  [popover].anchored {
    position-anchor: var(--anchor);
    /* ... anchor positioning rules ... */
  }
}
```

This way Floating UI provides the baseline, and anchor positioning takes over where supported. The Floating UI `autoUpdate` can be conditionally disabled when `@supports` matches.

## Open questions

- ~~*Floating UI dependency status*~~ — Resolved: `@floating-ui/dom` is installed and used by `pp-popup`.
- *Toast duration UX* — 4s is a common default (Material uses 4–10s). Should toasts with actions (undo) get longer duration? Probably yes — 8–10s when `onClick` is provided.
- ~~*Tooltip delay*~~ — Resolved: `pp-tooltip` reads `--show-delay` and `--hide-delay` from CSS custom properties, making it configurable per-instance via CSS without a JS API.
