# Pane spine for stacked notes

## Context

Stacked notes panes sit in a horizontal scroll container. As the user scrolls right to a newer pane, earlier panes slide off to the left and their titles disappear. A "spine" — a narrow vertical strip on each pane's right edge showing the title rotated 90° — surfaces those hidden panes the way a book spine surfaces a shelf's contents.

Marked out-of-scope in the stacked notes plan ("ship without if it complicates the layout"). Pre-condition: the stacked notes feature is shipped and stable.

## Behaviour

- Each pane carries a spine at its right edge.
- Spine is invisible (`opacity: 0`) while the pane is fully in the scroll viewport.
- Spine fades in when the pane is partially or fully scrolled off to the left.
- Not shown on the rightmost visible pane (it's fully in view, ratio = 1).
- Clicking the spine scrolls the pane back into full view (`scrollIntoView({ inline: 'start' })`).
- Spine is a `<button>` so it is keyboard- and SR-reachable.
- Text reads bottom-to-top (book spine convention): `writing-mode: vertical-rl; transform: rotate(180deg)`.
- Hidden entirely on mobile (single-pane view — spine has no meaning there).
- Respects `prefers-reduced-motion`: `transition: none`.

## Architecture

### Layout restructure

Currently `.pane` carries `overflow-y: auto`. Adding a non-scrolling spine column requires splitting the pane into two children: a scrollable body and a fixed-width spine strip.

Before:
```
section.pane (overflow-y: auto)
  article / children
```

After:
```
section.pane (display: flex; flex-direction: row; overflow-y: hidden)
  div.pane-body (flex: 1; overflow-y: auto)
    article / children
  button.pane-spine (fixed width, non-scrolling)
    span (rotated title)
```

The CSS selector `.pane article` remains valid (descendant, not direct child) so no ripple to other rules.

### Visibility detection: IntersectionObserver

`position: sticky; right: 0` inside an `overflow-y: auto` pane doesn't reliably produce the desired horizontal stick behaviour across browsers. IntersectionObserver with the `.stack` element as `root` is more reliable and keeps the CSS simple.

```ts
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      if (entry.intersectionRatio < 0.98) {
        el.dataset.spined = '';
      } else {
        delete el.dataset.spined;
      }
    }
  },
  { root: stackEl, threshold: [0.98, 1.0] },
);
```

Threshold `0.98` rather than `1.0` to avoid false triggers from sub-pixel rounding.

CSS toggle:
```css
.pane-spine { opacity: 0; }
.pane[data-spined] .pane-spine { opacity: 1; }
```

### Scroll-back click

```ts
const scrollPaneIntoView = (paneEl: HTMLElement) => {
  paneEl.scrollIntoView({ inline: 'start', behavior: 'smooth', block: 'nearest' });
};
```

Pass the section ref down to the spine button via a callback prop, or read it from the DOM using the `data-pane-index` attribute.

## Files

Modify:

- `apps/patterns/src/components/StackManager.tsx`
  - Wrap pane content in `<div className="pane-body">`.
  - Add `<button className="pane-spine">` sibling with the pane title.
  - Add a `useEffect` that creates the IntersectionObserver against `stackRef.current`, observes all `[data-pane-index]` sections, and disconnects on cleanup. Re-run when `panes.length` changes (new pane observed immediately).

- `apps/patterns/src/styles/stack.css`
  - Add `display: flex; flex-direction: row; overflow-y: hidden` to `.pane`.
  - Add `.pane-body { flex: 1 1 0; min-width: 0; overflow-y: auto; }`.
  - Move `overflow-y: auto` off `.pane` and onto `.pane-body`.
  - Add `.pane-spine` rules (width, writing-mode, opacity, transition, cursor, focus ring).
  - Add `.pane[data-spined] .pane-spine { opacity: 1; }`.
  - Suppress spine on mobile: `.pane-spine { display: none; }` inside the `@media (max-width: 768px)` block.

## CSS sketch

```css
.pane {
  /* existing flex-basis, scroll-snap, border, filter rules stay */
  display: flex;
  flex-direction: row;
  overflow-y: hidden; /* was: auto — moved to .pane-body */
}

.pane-body {
  flex: 1 1 0;
  min-width: 0;
  overflow-y: auto;
}

.pane-spine {
  flex-shrink: 0;
  width: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-inline-start: var(--border);
  cursor: pointer;
  padding-block: var(--space-m);
  opacity: 0;
  transition: opacity 0.2s ease;
  color: var(--c-neutral-400);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.08em;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-transform: uppercase;
  overflow: hidden;
  white-space: nowrap;
}

.pane-spine:hover {
  color: var(--c-neutral-700);
}

.pane-spine:focus-visible {
  outline: 2px solid var(--c-accent-500);
  outline-offset: -2px;
}

.pane[data-spined] .pane-spine {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .pane-spine { transition: none; }
}

@media (max-width: 768px) {
  .pane-spine { display: none; }
}
```

## Verification

1. Two panes open. Scroll right past pane 0. Expect: pane 0's spine fades in, showing the title vertically.
2. Click the spine. Expect: pane 0 scrolls back into full view; spine fades out.
3. Single pane (no stacking). Expect: no spine visible.
4. Three panes. Expect: panes 0 and 1 show spines; pane 2 (rightmost) does not.
5. Keyboard: tab to spine button, press Enter. Expect: scrolls pane into view, focus moves to pane heading.
6. Mobile (375px). Expect: spine absent.
7. `prefers-reduced-motion`. Expect: no fade transition, spine appears/disappears instantly.

## Open questions

- Spine width on very narrow patterns: `text-overflow: ellipsis` on the span, or let it clip via `overflow: hidden` on the button.
- Whether the spine strip should dim along with the pane's `filter: saturate(0.8)` (it does automatically, since it inherits from `.pane`).
- Spine title for pane 0 (server-rendered content): title is available as a prop to `StackManager`, so no extra fetch needed.
