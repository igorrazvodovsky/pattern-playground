---
paths:
  - "packages/components/src/styles/**/*.css"
---

# Styling guidelines

## Core principles
- Never use inline styles — all styling through CSS classes in `src/styles/` and shared tokens (CSS custom properties)
- Component CSS is a layered file in `src/styles/` (`layer(components)`), scoped with `@scope (pp-tag-name)` where selector leakage is plausible. Shadow-DOM `?inline` imports are legacy under migration (`plans/active/2026-07-light-dom-refactor.md`)
- Ask before adding new styles — verify the approach aligns with existing conventions first
- CSS classes are for styling only; JavaScript hooks use `data-*` attributes

## Layer structure
Use the existing cascade layers defined in `src/styles/main.css`:
`reset` → `theme` → `global` → `layout` → `components` → `utilities` → `states`

## HUG CSS approach (HTML + Utility + Group)
- Default styles on semantic HTML elements; minimise class usage in markup
- Utility classes for single-purpose adjustments (e.g. `.no-margin-bottom`, `.text-muted`)
- Group classes for collections of elements (e.g. `.list-inline`, `.card-layout`)
- Prefer attribute-based styling for interactive states

## The `demo` container
Every demo host declares `container: demo / inline-size` (site:
`.demo-block__content`; Storybook: `#storybook-root`/`.docs-story`; also
`.view-family__pane` and `.resize-box`). Narrow-container adaptations for
demo-scale assemblies query it by name — `@container demo (inline-size < 36rem)`
— so they respond to the pane, not the viewport.
