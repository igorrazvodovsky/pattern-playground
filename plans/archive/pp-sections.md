# `<pp-sections>` rewrite — HTML web component

Rewrite pp-sections as a true HTML web component: wraps existing semantic markup (headings + content) rather than requiring proprietary `<pp-section>` wrappers and `slot="label"` attributes. `pp-section` is deleted entirely.

## Status

Implementation complete (first pass). Rewrite approved and in progress.

## Motivation

The original `<pp-section>/<span slot="label">` design is JavaScript-first: the markup has no meaning without JS. The HTML web components philosophy (Keith, Leatherman, gomakethings) argues for augmentation over replacement — wrap content that already works. Heading-based markup gives us progressive enhancement for free.

References:
- https://blog.jim-nielsen.com/2023/html-web-components/
- https://adactio.com/journal/20618
- https://gomakethings.com/html-web-components/

## New markup model

```html
<!-- works without JS — valid headings and readable content -->
<pp-sections affordance="tab-bar">
  <h2>Overview</h2>
  <p>The overview gives a high-level summary of the subject.</p>

  <h2>Details</h2>
  <p>Details go deeper into the mechanics.</p>

  <h2>References</h2>
  <p>References list the source material.</p>
</pp-sections>

<!-- pp-h shim: heading-shaped without entering the document outline -->
<pp-sections affordance="tab-bar">
  <pp-h>Overview</pp-h>
  <p>Content...</p>
</pp-sections>
```

## Affordances

Two affordances (down from three — `exclusive-collapse` removed as a separate affordance):

- `tab-bar` — exclusive selection, horizontal tab strip synthesised from heading content
- `details` — independent disclosure, each heading becomes a trigger mirroring `<details>/<summary>` semantics

CSS custom property `--pp-affordance` still works for responsive switching.

## Architecture

### `pp-h` shim

`src/components/h/h.ts` — plain `HTMLElement`, no Lit, no shadow DOM. Treated as a heading by `pp-sections` (`element.matches('h1,h2,h3,h4,h5,h6,pp-h')`). `pp-h { display: block }` in global CSS.

### `pp-sections`

`src/components/sections/sections.ts` — plain `HTMLElement`, no Lit, no shadow DOM.

**Pair parsing:** walk direct children; each heading starts a section, everything until the next heading is its content.

**Panel injection (idempotent):** wrap each section's content elements in `<div data-pp-panel>`. Done once; MutationObserver guard (`_mutating` flag) prevents re-entry.

**Tab-bar mode:**
- Inject `<div data-pp-nav role="tablist">` as first child (once)
- One `<button data-pp-tab role="tab">` per section, content cloned from heading child nodes
- Headings: `data-pp-affordance="tab-bar"` → CSS hides them
- Active panel: `data-pp-active` → CSS shows it; others hidden via `[data-pp-panel]:not([data-pp-active])`
- Keyboard: ArrowRight/Left/Home/End on tab buttons

**Details mode:**
- Remove nav (if present)
- Headings: `data-pp-trigger`, `role="button"`, `tabindex="0"`, `aria-expanded`, `aria-controls`
- Open panels: `data-pp-open` → CSS shows them; others hidden via `[data-pp-panel]:not([data-pp-open])`
- Chevron via `[data-pp-trigger]::after` in global CSS

**CSS affordance:** ResizeObserver reads `--pp-affordance` from computed style when no `affordance` attribute is set.

### CSS

`src/components/sections/sections.css` deleted. All styles in `src/styles/sections.css` using `@layer components` + CSS nesting, imported in `src/styles/main.css`.

## Files

| Action | File |
|--------|------|
| Create | `src/components/h/h.ts` |
| Rewrite | `src/components/sections/sections.ts` |
| Delete | `src/components/sections/sections.css` |
| Delete | `src/components/section/section.ts` |
| Delete | `src/components/section/section.css` |
| Create | `src/styles/sections.css` |
| Edit | `src/styles/main.css` |
| Edit | `src/components/register-all.ts` |
| Edit | `src/types.d.ts` |
| Rewrite | `src/stories/operations/Sections.stories.tsx` |
| Edit | `src/stories/operations/Sections.mdx` |

## What was dropped

- `exclusive-collapse` affordance — exclusivity delegated to consumer (Shoelace pattern) or native `<details name="">` where applicable
- `<pp-section>` wrapper element — markup is now plain HTML
- Shadow DOM — single global stylesheet, no two-surface CSS management
- Lit dependency for `pp-sections` — plain `HTMLElement`
