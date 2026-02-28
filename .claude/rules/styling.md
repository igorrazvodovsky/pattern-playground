---
paths:
  - "src/styles/**/*.css"
---

# Styling guidelines

## Core principles
- Never use inline styles - All styling must be handled through CSS classes
- Add styles to `src/styles/` directory for global styles and shared components
- For Web Components using Shadow DOM, use component-specific CSS files
- Use design system tokens (CSS custom properties) consistently
- Ask before adding new styles

## CSS architecture methodology
Follow a layered CSS architecture using CSS cascade layers:

*CSS Layers for predictable cascade control:*
Use the existing layer structure defined in `src/styles/main.css`:
- `reset` - Browser reset and normalisation styles
- `theme` - Design tokens and theme-related custom properties
- `global` - Global base styles applied to HTML elements
- `layout` - Layout-specific styles (Grid, Flexbox patterns)
- `components` - Component-specific styling
- `utilities` - Single-purpose utility classes
- `states` - State-based styling and interactions

*HUG CSS approach (HTML + Utility + Group):*
- *HTML*: Apply default styles directly to semantic HTML elements
- *Utility classes*: Single-purpose classes for minor adjustments (e.g., `.no-margin-bottom`, `.text-muted`)
- *Group classes*: Complex styling for collections of elements (e.g., `.list-inline`, `.card-layout`)
- Minimise class usage in HTML markup by leveraging semantic elements
- Use attribute-based styling for interactive states when possible

## Modern CSS for dynamic components
- *Custom properties API*: Use CSS custom properties to create flexible, themeable components
  - Example: `--button-color: var(--primary)` enables easy variant creation
  - Prefer custom properties over hardcoded values for reusability
- *Container queries*: Design components that adapt to their own available space
  - Use `@container (min-width: 40ch)` for size-based queries
  - Leverage style queries: `@container style(--show-menu: true)`
  - Implement quantity queries with `:has()` for dynamic content adaptation
- *Progressive enhancement*: Build resilient components that gracefully degrade
  - Use `:has()` for conditional styling with fallbacks
  - Implement feature detection for advanced CSS properties
- *Modern layout primitives*: Leverage contemporary CSS layout capabilities
  - Use CSS Grid and Flexbox for flexible component layouts
  - Apply `clamp()` for fluid, responsive typography
  - Utilise container query units (`cqi`, `cqw`) where appropriate
- *Accessibility-first styling*: Ensure inclusive design through CSS
  - Use `:focus-visible` for improved focus management
  - Implement WCAG-compliant focus states and contrast ratios
  - Support reflow requirements for responsive design

## Anti-patterns
- Never use inline styles - All styling must go through CSS classes or design tokens
- Don't rely on CSS classes for JavaScript hooks - Use `data-*` attributes instead
- Don't add styles without asking - Verify approach aligns with design system first
