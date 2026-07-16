---
paths:
  - "packages/components/src/components/**/*.ts"
---

# Web components

## Decision ladder (take the first rung that suffices)
1. *Native HTML + CSS* — no custom element. A button is a `<button>` with a class; a switch is `<input type="checkbox" role="switch">` styled. Check `src/styles/` for an existing CSS-only treatment before writing any TS.
2. *Composite enhancement* — a light-DOM custom element that renders nothing and enhances the children it's given (roles, listeners, attributes).
3. *Light-DOM render* — the element owns and renders its subtree (`createRenderRoot() { return this }` in Lit). Document that author-provided children will be clobbered.
4. *Shadow DOM* — only with a written justification in the component file (genuine style isolation or third-party embedding). Existing shadow components are legacy under migration: see `plans/active/2026-07-light-dom-refactor.md`.

Slots exist only on rung 4. Compose through real children; where named regions are needed, use `data-slot="…"` attributes on children.

## Light-DOM discipline
- *Subtree ownership*: rung-2 components must never re-render children they didn't create — reactive updates mutate attributes/classes on existing elements.
- *Styles live in the cascade*: component CSS goes in `src/styles/` as a layered file (`layer(components)`), scoped with `@scope (pp-tag-name)` where selector leakage is plausible. No `?inline` imports into `static styles` for new components.
- *Pre-upgrade content*: author HTML that is acceptable before the element upgrades; add a `:not(:defined)` rule only when that's not achievable.
- *No customised built-ins* (`extends HTMLButtonElement`, `is="…"`): WebKit doesn't implement them. Use rung 1 instead.

## Event handling & lifecycle
- *Event binding*: Bind all event handlers in constructor using `.bind(this)`
- *Custom events*: Define typed event interfaces and use `this.$emit('event-name', detail)`
- *Event cleanup*: Remove all listeners in `disconnectedCallback()`
- *Bulletproof initialization*: Use DOM readiness checks in `connectedCallback()` to ensure reliable component startup

## Bulletproof loading implementation
All web components follow a bulletproof loading pattern to ensure reliable initialization:

```typescript
connectedCallback() {
  super.connectedCallback(); // For Lit components
  if (document.readyState !== 'loading') {
    this.init();
    return;
  }
  document.addEventListener('DOMContentLoaded', () => this.init());
}

private init() {
  // Component initialization logic here
  this.setupEventListeners();
  this.setAttribute('role', 'appropriate-role');
}
```

Reference: Based on [bulletproof web component loading patterns](https://gomakethings.com/bulletproof-web-component-loading/)

## Component registration system
- *Centralized registration*: All components are registered via `src/components/register-all.ts`
- *Dependency management*: Components with dependencies (e.g., `pp-tab-group` depends on `pp-tab` and `pp-tab-panel`) are registered in proper order
- *Individual `customElements.define()` calls removed*: Components rely on the centralized registry for consistent instantiation order

## Component lifecycle best practices
- *DOM readiness checks*: Always check document readiness before component initialization
- *Dependency awareness*: Components that depend on other custom elements should be registered after their dependencies
- *Progressive enhancement*: Components enhance existing HTML gracefully, regardless of script loading timing

## JavaScript hooks
- Use `data-*` attributes as JavaScript hooks (e.g., `data-reference-picker`, `data-action="toggle"`) for event handling and DOM queries
- Never rely on CSS classes for JavaScript functionality; they should remain purely for styling
- Prefer semantic data attributes - use descriptive names like `data-component-name` or `data-action` instead of generic selectors
- Don't use `role`, `aria-*`, or other accessibility attributes as JavaScript hooks

## Anti-patterns
- Don't skip bulletproof loading pattern - Always check `document.readyState` in `connectedCallback()`
- Don't create components without checking existing solutions - Leverage existing dependencies first
- Don't define components individually - Use centralized registration in `register-all.ts`
- Don't mix concerns - Keep services framework-agnostic, separate from UI integrations
- Don't use Shadow DOM by default - Take the lowest rung of the decision ladder that suffices; rung 4 requires a written justification
- Don't add `<slot>` or `::slotted`/`part=` styling outside rung-4 components
- Don't forget event cleanup - Remove all listeners in `disconnectedCallback()`
- Don't use semantic attributes as JS hooks - Avoid using `role`, `aria-*` for event handling
