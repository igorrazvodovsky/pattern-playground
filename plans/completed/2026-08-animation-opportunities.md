---
title: "Animation: finish the half-built motion"
status: "completed"
kind: "exec-spec"
created: "2026-08-07"
last_reviewed: "2026-08-07"
area: "components, pattern-site"
promoted_to: ""
superseded_by: ""
---

# Animation: finish the half-built motion

- Status: DONE — executed 2026-08-07; all six phases landed, suite green
  (260 tests), surfaces verified in-browser (see Outcome)
- Commit: f6c0bcd7 (plan basis)
- Scope: 6 phases; 7 CSS files, 2 TS/TSX files, 1 Astro-adjacent TSX markup line

A motion sweep of the component library and the pattern site found that the
corpus needs very little *new* motion — its quietness suits a reading
environment — but several animations were authored and never render, and a few
state changes teleport where a short bridge would help. Each phase below passed
a purpose/frequency/speed/function gate; the rejected candidates are recorded
in Boundaries so an executor doesn't "improve" them.

Every phase is independent. Recommended order is as written (highest leverage
first); phases 1–4 are library work, 5–6 are site work.

## Shared vocabulary

All values come from tokens that already exist. Do not invent new tokens.

- Easing, `packages/components/src/styles/animation.css:2-46` (imported into
  the `theme` layer via `tokens.css:14`, reaches the site through
  `apps/patterns/src/styles/lib.css`):
  - `--ease-2: cubic-bezier(0.25, 0, 0.4, 1)` — the general-purpose curve the
    dialog/drawer/sidebar `--animation-*` tokens already use
  - `--ease-out-3: cubic-bezier(0, 0, 0.3, 1)` — used for the site's fast fades
- Durations, `packages/components/src/styles/variables.css:63-67`:
  `--transition-x-fast: 50ms`, `--transition-fast: 150ms`,
  `--transition-medium: 250ms`, `--transition-slow: 500ms`.
- The exemplar for enter/exit through the top layer is
  `apps/patterns/src/styles/link-preview.css:19-36` (transition +
  `allow-discrete` on `display`/`overlay` + `@starting-style`) with its
  reduced-motion block at `:95-106` (movement dropped, opacity kept, duration
  shortened). Phases 1 and 6 imitate it.
- Conventions that bind this plan: component CSS lives in
  `packages/components/src/styles/*.css` inside `@layer components`; classes
  are styling hooks, `data-*` attributes are JS hooks; reduced motion means
  gentler (keep opacity/colour feedback), not zero.

---

## Phase 1 — Dialog and drawer exits actually render

Severity: HIGH. Category: interruptibility / spatial consistency.
Files: `packages/components/src/styles/dialog.css`,
`packages/components/src/styles/drawer.css`,
`packages/components/src/styles/cmdk.css`.

### Problem

Open animates; close snaps. The exit keyframes are assigned to the
non-`[open]` state, which the UA sheet makes `display: none` the instant
`close()` runs, so they never render:

```css
/* dialog.css:86-125 — current (abridged) */
dialog::backdrop {
  animation: blur-in 0.2s forwards;
}

dialog:not([open]) {
  pointer-events: none;
  opacity: 0;
}

@keyframes blur-in {
  from { backdrop-filter: blur(0) opacity(0); }
  to { backdrop-filter: blur(2px) opacity(1); }
}

@media (prefers-reduced-motion: no-preference) {
  dialog {
    animation: var(--animation-scale-down) forwards;   /* exit: never renders */
    animation-timing-function: var(--ease-squish-3);
  }
  dialog[open] {
    animation: var(--animation-slide-in-up) forwards;  /* entry: works */
  }
}

@media (prefers-reduced-motion: no-preference) and (width <= 768px) {
  dialog {
    animation: var(--animation-slide-out-down) forwards; /* exit: never renders */
    animation-timing-function: var(--ease-squish-2);
  }
}
```

```css
/* drawer.css:77-110 — current (abridged) */
dialog.drawer::backdrop {
  animation: blur-in 0.2s forwards;
}

dialog.drawer:not([open]) {
  pointer-events: none;
  opacity: 0;
}

@media (prefers-reduced-motion: no-preference) {
  dialog.drawer--left {
    animation: var(--animation-slide-out-left) forwards;  /* never renders */
    animation-timing-function: var(--ease-squish-3);
  }
  dialog.drawer--left[open] {
    animation: var(--animation-slide-in-right) forwards;  /* works */
  }
  dialog.drawer--right {
    animation: var(--animation-slide-out-right) forwards; /* never renders */
    animation-timing-function: var(--ease-squish-3);
  }
  dialog.drawer--right[open] {
    animation: var(--animation-slide-in-left) forwards;   /* works */
  }
}
```

The `--animation-*` tokens all resolve to `<keyframes> 0.2s var(--ease-2)`
(`animation.css:364-386`); `slide-in-up` starts from `translateY(2rem)`. The
`--ease-squish-*` assignments only ever applied to the exits that never ran, so
nothing shipped ever squished — do not carry them over.

### Target

Convert both surfaces from keyframes to transitions, following
`link-preview.css`. Entries keep today's exact values (0.2s, `var(--ease-2)`,
2rem rise / full-width slide); exits are the same path back at 0.15s.

In `dialog.css`, add to the existing base `dialog { … }` rule (keep all its
box styles):

```css
  opacity: 0;
  translate: 0 2rem;
  transition:
    opacity 0.15s var(--ease-2),
    translate 0.15s var(--ease-2),
    display 0.15s allow-discrete,
    overlay 0.15s allow-discrete;
```

Replace `dialog[open] { display: grid; }` with:

```css
dialog[open] {
  display: grid;
  opacity: 1;
  translate: 0 0;
  transition:
    opacity 0.2s var(--ease-2),
    translate 0.2s var(--ease-2),
    display 0.2s allow-discrete,
    overlay 0.2s allow-discrete;

  @starting-style {
    opacity: 0;
    translate: 0 2rem;
  }
}
```

(The destination state's `transition` governs, so entry runs at 0.2s and exit
at 0.15s.)

Replace the backdrop rule and delete the `blur-in` keyframes:

```css
dialog::backdrop {
  backdrop-filter: blur(0) opacity(0);
  transition:
    backdrop-filter 0.2s ease,
    display 0.2s allow-discrete,
    overlay 0.2s allow-discrete;
}

dialog[open]::backdrop {
  backdrop-filter: blur(2px) opacity(1);

  @starting-style {
    backdrop-filter: blur(0) opacity(0);
  }
}
```

Reduce `dialog:not([open])` to `pointer-events: none;` (opacity now lives in
the base rule). Delete both `prefers-reduced-motion: no-preference` blocks and
the mobile squish block. Add:

```css
@media (prefers-reduced-motion: reduce) {
  dialog,
  dialog[open] {
    translate: none;
    transition-duration: 0.1s;
  }

  dialog::backdrop,
  dialog[open]::backdrop {
    transition-duration: 0.1s;
  }

  @starting-style {
    dialog[open] {
      translate: none;
    }
  }
}
```

This is a deliberate behaviour change under reduce: previously there was no
dialog animation at all; now there is a 0.1s opacity fade with no movement —
gentler, not zero, matching `link-preview.css:95-106`.

In `drawer.css`: delete the `dialog.drawer::backdrop` rule (77-79; it now
inherits the converted `dialog::backdrop`), drop the `opacity: 0` line from
`dialog.drawer:not([open])`, and replace the whole
`@media (prefers-reduced-motion: no-preference)` block (92-110) with:

```css
dialog.drawer--left {
  translate: -100% 0;
}

dialog.drawer--left[open] {
  translate: 0 0;

  @starting-style {
    translate: -100% 0;
  }
}

dialog.drawer--right {
  translate: 100% 0;
}

dialog.drawer--right[open] {
  translate: 0 0;

  @starting-style {
    translate: 100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  dialog.drawer--left,
  dialog.drawer--right,
  dialog.drawer--left[open],
  dialog.drawer--right[open] {
    translate: none;
  }

  @starting-style {
    dialog.drawer--left[open],
    dialog.drawer--right[open] {
      translate: none;
    }
  }
}
```

Timing comes from the base `dialog` / `dialog[open]` transitions in
`dialog.css` (the selectors match `dialog.drawer` too) — that cross-file
dependency is intended. The drawer both slides and fades (base `opacity`
transition); that is acceptable — the slide dominates.

In `cmdk.css` (~line 161), the command-menu backdrop opt-out currently reads
`animation: none; background-color: transparent;`. Animations no longer drive
the backdrop, so add `transition: none;` to keep it inert:

```css
  &::backdrop {
    animation: none;
    transition: none;
    background-color: transparent;
  }
```

No JS changes: `modal.ts` calls `close()` directly, and `allow-discrete` on
`display`/`overlay` is exactly what lets the exit play after that.

### Verification

- Open and close a modal from the Modal/Dialog Storybook stories with pointer,
  Escape, and backdrop click: the panel must sink 2rem and fade over ~0.15s on
  every close path; the backdrop blur must fade out with it.
- Drawer stories: closes slide fully off the correct edge; opening left drawer
  still enters from the left.
- Spam open/close rapidly: transitions must retarget from the current position,
  never jump to the start (this is the point of leaving keyframes).
- Command menu (`/` in the CommandMenu story): backdrop stays invisible.
- DevTools → Rendering → emulate `prefers-reduced-motion: reduce`: no vertical
  or horizontal movement, only a 0.1s fade.

---

## Phase 2 — Toast: every dismissal exits the same way, and the slide actually travels

Severity: MEDIUM. Category: interruptibility / spatial consistency.
Files: `packages/components/src/components/toast/toast.ts`,
`packages/components/src/styles/toast.css`.

### Problem

Timeout dismissal fades out; pointer dismissal is instant. And the authored
enter slide is a no-op: `--_travel-distance: 0` (`toast.css:21`) defeats the
`10px` fallback in the `slide-in` keyframes, so `translateY(var(--_travel-distance, 10px))`
resolves to `translateY(0)`.

```ts
// toast.ts:43 — close button removes with no exit
closeButton.addEventListener('click', () => this.removeToast(toast));

// toast.ts:53-56 — action button likewise
openButton.addEventListener('click', () => {
  onClick();
  this.removeToast(toast);
});

// toast.ts:116-123 — only the timeout path animates
setTimeout(async () => {
  toast.classList.add('fade-out');
  await Promise.allSettled(
    toast.getAnimations().map(a => a.finished)
  );
  this.removeToast(toast);
  resolve();
}, duration);
```

### Target

In `toast.ts`, add one private method and route all three paths through it:

```ts
private async dismissToast(toast: HTMLOutputElement): Promise<void> {
  if (!this.toastGroup?.contains(toast)) return;
  toast.classList.add('fade-out');
  await Promise.allSettled(
    toast.getAnimations().map(a => a.finished)
  );
  this.removeToast(toast);
}
```

- `closeButton` listener becomes `() => { void this.dismissToast(toast); }`.
- `openButton` listener becomes `() => { onClick(); void this.dismissToast(toast); }`.
- `show()`'s timeout body becomes `await this.dismissToast(toast); resolve();`
  (the `contains` guard makes the timeout a no-op after a pointer dismissal).

In `toast.css`:

- `--_travel-distance: 0` → `--_travel-distance: 0.5rem` (the toast group sits
  at the bottom edge; entering from 0.5rem below is the spatial story).
- Make the exit leave the same way, toward the same edge:

```css
@keyframes fade-out {
  to {
    opacity: 0;
    transform: translateY(var(--_travel-distance, 10px));
  }
}
```

- Append:

```css
@media (prefers-reduced-motion: reduce) {
  .toast {
    --_travel-distance: 0;
  }
}
```

(Fades stay; travel goes — gentler, not zero.)

### Verification

- Toast story: a new toast rises 0.5rem while fading in over 0.2s; close
  button, action button, and timeout all fade+sink identically.
- Fire several toasts quickly: the FLIP restack (`toast.ts:77-102`, untouched)
  still slides the group; no double-motion glitch on the entering toast.
- Under emulated reduced motion: pure 0.2s fades, no travel.

---

## Phase 3 — Collapsible panels move with their chevrons

Severity: MEDIUM. Category: missed opportunity (state indication).
Files: `packages/components/src/styles/sidebar.css`,
`apps/patterns/src/components/Nav.tsx`,
`packages/components/src/styles/sections.css`.

Both collapsibles animate the trigger (chevron rotates over 150–200ms) while
the content teleports via a `display` flip — the worst combination: the motion
promises a transition the content doesn't perform.

### 3a — Sidebar nav groups (Base UI Collapsible)

`Nav.tsx:63` renders a bare `<Collapsible.Panel>`; the chevron transition is
`sidebar.css` (`.sidebar-collapsible-chevron { transition: transform 200ms; }`).
Base UI (`@base-ui/react` 1.4.1) exposes `--collapsible-panel-height` plus
`data-starting-style` / `data-ending-style` for exactly this.

Steps:

1. `Nav.tsx:63`: `<Collapsible.Panel>` → `<Collapsible.Panel className="sidebar-collapsible-panel">`.
2. In `sidebar.css`, after the chevron rules (~line 692), add:

```css
  .sidebar-collapsible-panel {
    height: var(--collapsible-panel-height);
    overflow: hidden;
    transition: height 200ms var(--ease-2);
  }

  .sidebar-collapsible-panel[data-starting-style],
  .sidebar-collapsible-panel[data-ending-style] {
    height: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .sidebar-collapsible-panel {
      transition: none;
    }
  }
```

Height is a layout animation — normally avoided, but it is Base UI's
documented pattern, the panels are short menu lists, and 200ms matches the
chevron.

Known interaction: the nav store rehydrates after mount (`Nav.tsx:39-44`), so
persisted-open groups will now animate open ~200ms after page arrival instead
of popping. Feel-check it. If the settle reads as noise, gate the transition on
a `data-motion-ready` attribute set on the nav root in a `useEffect` after a
double `requestAnimationFrame`, and scope the rule to
`[data-motion-ready] .sidebar-collapsible-panel` — only add this if the check
fails.

### 3b — `pp-sections` details mode

`sections.ts:266-270` toggles `data-pp-open`; hiding is
`sections.css:105-108`:

```css
/* current */
pp-sections[data-pp-mode="details"] [data-pp-panel]:not([data-pp-open]) {
  display: none;
}
```

Replace with a progressive enhancement — browsers without `interpolate-size`
keep today's instant flip:

```css
@supports not (interpolate-size: allow-keywords) {
  pp-sections[data-pp-mode="details"] [data-pp-panel]:not([data-pp-open]) {
    display: none;
  }
}

@supports (interpolate-size: allow-keywords) {
  pp-sections[data-pp-mode="details"] [data-pp-panel] {
    interpolate-size: allow-keywords;
    block-size: auto;
    overflow: clip;
    transition:
      block-size 200ms var(--ease-2),
      content-visibility 200ms allow-discrete;
  }

  pp-sections[data-pp-mode="details"] [data-pp-panel]:not([data-pp-open]) {
    block-size: 0;
    content-visibility: hidden;
  }

  @media (prefers-reduced-motion: reduce) {
    pp-sections[data-pp-mode="details"] [data-pp-panel] {
      transition: none;
    }
  }
}
```

`content-visibility: hidden` keeps the closed panel out of the accessibility
tree and out of find-in-page, matching `display: none` semantics; its
`allow-discrete` transition flips it visible at the start of the opening
transition. Tab-bar mode (`sections.css:52-54`) stays instant on purpose.

### Verification

- Site sidebar: toggling a group slides its children open/closed in step with
  the chevron; keyboard toggling behaves the same; no scrollbar flash.
- Sections story (details mode): panel height animates in Chromium; in
  Firefox/Safari it snaps exactly as before (check both). If a panel's first
  child has a large top margin, the open animation may hitch at the start —
  acceptable if minor; note it if not.
- Screen reader spot-check (VoiceOver rotor): closed section content is not
  reachable.
- Reduced motion: both collapse instantly, chevron still rotates (colour/small
  transform feedback is kept deliberately).

---

## Phase 4 — Restore the transitions that are declared but invalid

Severity: LOW (zero design risk — this only makes authored intent real).
Category: feedback.
Files: `packages/components/src/styles/sections.css`,
`packages/components/src/styles/tabs.css`,
`packages/components/src/styles/details.css`.

`--transition-speed` is defined nowhere in the repo, so two declarations are
invalid and dropped; a third puts two property names in one shorthand slot.
All three surface hover/active colour changes at the tens-per-day tier — a
150ms crossfade is the near-imperceptible motion appropriate there.

1. `sections.css:27-29`:

```css
/* current */
transition:
  color var(--transition-speed),
  border-color var(--transition-speed);

/* target */
transition:
  color var(--transition-fast),
  border-color var(--transition-fast);
```

2. `tabs.css:73-75`:

```css
/* current */
transition:
  var(--transition-speed) box-shadow,
  var(--transition-speed) color;

/* target */
transition:
  box-shadow var(--transition-fast),
  color var(--transition-fast);
```

3. `details.css:67`:

```css
/* current — two properties in one slot; declaration dropped */
transition: var(--transition-fast) transform opacity;

/* target */
transition:
  transform var(--transition-fast),
  opacity var(--transition-fast);
```

Verification: Stylelint passes; hovering a tab or section trigger crossfades
colour over 150ms instead of jumping. Grep the repo for any remaining
`--transition-speed` — there must be none.

---

## Phase 5 — Pane spines and shadows stop popping during stack scroll

Severity: MEDIUM. Category: missed opportunity (preventing a jarring change).
File: `apps/patterns/src/styles/stack.css`.

### Problem

As a pane collapses to a rail while scrolling, its vertical label appears via
a `display: none ↔ flex` swap (`stack.css:137-143`) and the depth shadow snaps
on/off with `data-overlapping` (`stack.css:51-53`). Both fire continuously
during scroll, so only near-imperceptible motion is allowed: 150ms opacity.
The `display` flip also shifts `.pane-body` by the spine's 1.75rem every time
— converting the spine to an overlay removes that layout jump as well.

### Target

1. In the layered `.pane-spine` block (`stack.css:68-86`), make the spine an
   overlay on the pane's leading edge — it no longer participates in flex
   layout, so it needs its own opaque background:

```css
  .pane-spine {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    z-index: 1;
    width: var(--pane-spine-w);
    align-items: center;
    justify-content: center;
    background: var(--c-background);
    border: none;
    border-inline-end: var(--border);
    cursor: pointer;
    padding-block: var(--space-m);
    color: var(--c-neutral-400);
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.08em;
    writing-mode: vertical-rl;
    text-transform: uppercase;
    overflow: hidden;
    white-space: nowrap;
  }
```

   (`.pane` is `position: sticky`, which is the containing block. Drop the
   old `flex-shrink: 0` and `background: none`.)

2. Replace the unlayered visibility rules (`stack.css:137-143`) and move the
   mobile spine hiding (currently the layered rule at `:164-166`) out with
   them — unlayered `display: flex` would otherwise beat the layered mobile
   `display: none`:

```css
/* Spine visibility lives OUTSIDE @layer on purpose: the spine is a <button>,
   and the components-layer button reset (display: inline-flex) outranks any
   layered rule. The label fades rather than flipping display so collapse —
   which fires continuously during scroll — doesn't pop. visibility keeps the
   hidden spine unfocusable, as display: none did. */
.pane .pane-spine {
  display: flex;
  visibility: hidden;
  opacity: 0;
  transition:
    opacity 150ms var(--ease-out-3),
    visibility 150ms;
}

.pane[data-collapsed] .pane-spine {
  visibility: visible;
  opacity: 1;
}

@media (width <= 768px) {
  .pane .pane-spine {
    display: none;
  }
}
```

   Delete the now-redundant layered `.pane-spine { display: none; }` inside
   the existing mobile media block.

3. Fade the overlap shadow by transitioning `box-shadow` between two values
   that differ only in alpha (interpolable, 150ms, small paint area):

```css
  /* inside the .pane rule */
  box-shadow: -4px 0 12px -6px oklch(0% 0 0deg / 0%);
  transition: box-shadow 150ms var(--ease-out-3);

  &[data-overlapping] {
    box-shadow: -4px 0 12px -6px oklch(0% 0 0deg / 18%);
  }
```

No reduced-motion addition: these are stationary opacity/shadow fades, the
kind of feedback reduce keeps. The existing
`@media (prefers-reduced-motion: reduce) { .stack { scroll-behavior: auto } }`
block stays as is.

### Verification

- `npm run dev`, open a pattern, push several panes, scroll the stack slowly:
  spine labels fade in/out over ~150ms instead of popping; the pane body no
  longer shifts sideways when a spine appears; shadows ease in as panes start
  to overlap.
- Confirm `StackManager`'s collapse classifier still toggles `data-collapsed`
  / `data-overlapping` correctly (the spine no longer affects pane geometry,
  which the classifier measures — behaviour should be identical or better).
- Tab to a hidden spine: it must not receive focus. Click a visible spine:
  still scrolls its pane into view.
- Scroll fast and watch for paint jank from the shadow transition (DevTools
  performance panel if in doubt). If it visibly janks, fall back to painting
  the shadow on a `::after` overlay and transitioning that element's
  `opacity` — report, don't improvise beyond that.
- Mobile width (≤768px): no spines at all, exactly as before.

---

## Phase 6 — Async content fades in instead of popping

Severity: LOW. Category: missed opportunity (preventing a jarring change).
Files: `apps/patterns/src/components/StackManager.tsx`,
`apps/patterns/src/styles/stack.css`, `apps/patterns/src/styles/app.css`.

### Problem

Pushed panes swap "Loading…" for the full article in one frame
(`StackManager.tsx:248-250`), and demo widgets pop into their empty
`<div data-demo>` mounts whenever their chunk lands
(`lib/demo-registry.ts:85-93`). Both are client-only insertions, so
`@starting-style` alone bridges them — 150ms, opacity only, because the actor
is about to read this content and must not wait on it.

### Target

1. `StackManager.tsx:249` — give the ready article a styling-hook class
   (classes style, `data-*` is for JS, per repo rules):

```tsx
{pane.status === 'ready' && (
  <article className="pane-article" dangerouslySetInnerHTML={{ __html: pane.html }} />
)}
```

2. In `stack.css`, inside `@layer layout` near the loading/error rules:

```css
  /* Client-injected pane content fades in when its fetch lands. */
  .pane-article {
    transition: opacity 150ms var(--ease-out-3);

    @starting-style {
      opacity: 0;
    }
  }
```

3. In `app.css`, beside the existing `.demo-block` rules (~line 128):

```css
[data-demo] > * {
  transition: opacity 150ms var(--ease-out-3);

  @starting-style {
    opacity: 0;
  }
}
```

Scoping notes: the static pane 0 in `Base.astro` renders its article through a
slot, not through `StackManager`, so it never gets `.pane-article` and does
not fade on initial load — that is intended. A demo whose internal re-render
replaces its root DOM node would re-fire the 150ms fade; benign, but if a
specific demo flickers, scope it out by name rather than removing the rule.

No reduced-motion block: opacity-only, 150ms, kept deliberately.

### Verification

- Push a pane on the site: article fades in over ~150ms after load; the
  "Loading…" placeholder is not made slower to appear.
- Scroll to a page with demos: each demo fades in once when its chunk lands;
  interacting with demos (filtering, dragging) causes no re-fades in the
  common cases.

---

## Boundaries

- Do NOT touch: tab panel switching (`tabs.css:120-129` stays a display swap —
  tens-per-day content switching), command-menu open/close behaviour
  (keyboard-initiated; parity only, via the cmdk backdrop edit in phase 1),
  button press feedback (`button.css:62-66` is deliberately instant), the
  `--demo-w` width axis (a transition would fight live drag input and reflow
  prose per frame), the toast FLIP restack, the header auto-hide, the TOC dash,
  dropdown/tooltip WAAPI animations, and the sidebar hydration architecture.
- Do NOT rename or dedupe the colliding `fade-in`/`fade-out`/`pulse` keyframes
  (component layer intentionally wins over `animation.css`); that cleanup is a
  separate audit finding, not this plan.
- Do NOT add dependencies, new tokens, or inline styles; keep all CSS in the
  files named above, in their existing layers.
- If any cited code no longer matches (drift past commit f6c0bcd7), stop and
  report instead of improvising.

## Mechanical verification (after each phase)

- `npm run lint` and `npm run lint:styles` — clean.
- `npm run test` — the full suite (251 tests at time of writing) stays green;
  Storybook interaction tests cover modal, toast, and sections behaviour.
- Feel checks as listed per phase; for anything timing-related, DevTools →
  Animations panel at 10% speed, and the Rendering panel's
  `prefers-reduced-motion` emulation.

## Done when

All six phases land, the suite is green, and a manual pass over: modal
open/close, drawer open/close, toast lifecycle (all three dismissals), sidebar
group toggle, a sections accordion, a stack scroll with 3+ panes, and one
demo-heavy pattern page shows no instant pops on the surfaces named above —
under both motion preferences.

## Outcome (2026-08-07)

All six phases executed as specified. Deviations from the letter of the plan,
each preserving its intent:

- Phase 1: Stylelint's `no-duplicate-selectors` rejected standalone
  `dialog.drawer--left`/`--right` travel rules, so the closed-state
  `translate` declarations live in the existing base `--left`/`--right` rules
  in `drawer.css` instead of a separate block. Computed result identical.
- Two Storybook interaction tests (`Dialog.stories.tsx`, `Drawer.stories.tsx`)
  asserted close-button visibility synchronously after `[open]`; the surfaces
  now genuinely fade in, so those assertions are wrapped in `waitFor`.
- Phase 5: the mobile spine-hiding rule was already outside `@layer` (the plan
  described it as layered); the move happened as written.

Verified by driving a real Chromium against Storybook and the dev site:
dialog and drawer exits render on every close path and retarget mid-flight;
toast enter travels 0.5rem and all three dismissals exit identically; sidebar
panels and sections accordions animate height both ways with
`content-visibility: hidden` keeping closed sections unreachable; spines are
overlay-positioned fades; pane articles and demo mounts carry the 150ms
arrival fade. Reduced-motion variants and scroll-jank were checked by review
of the CSS, not emulation.

Residue: phase 3a's `data-motion-ready` gate (for the persisted-open sidebar
settle after page arrival) was not added — the plan gates it on a failed feel
check; add it if the ~200ms post-hydration settle reads as noise in use.

`npm run lint:styles` fails repo-wide on this machine because the
`stylelint **/*.css` glob sweeps gitignored build artifacts
(`apps/patterns/dist/`, `storybook-static/`, `public/storybook/`); all source
CSS lints clean. Pre-existing, out of this plan's boundaries.
