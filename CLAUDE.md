# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development commands

**Frontend (root directory):**
- `npm run test` - Run ESLint and Stylelint
- `npm run storybook` - Start Storybook on port 6006
- `npm run build-storybook` - Build static Storybook

**Backend (server directory):**
- `cd server && npm run dev` - Start Express server with hot reload
- `cd server && npm run build` - Compile TypeScript
- `cd server && npm run start` - Run production server
- `cd server && npm run typecheck` - TypeScript type checking

## Architecture overview

This is a **design system playground** with a hybrid frontend/backend architecture:

### Frontend
- **TypeScript** with **Vite** build system
- **Web Components** (Lit) as primary component architecture
- **React** for Storybook stories and complex components
- **Storybook** for component documentation and development
- **Tiptap** for rich text editing

### Backend
- **Node.js/Express** server with **OpenAI API** integration
- TypeScript with ES modules

### Component architecture
Components follow a **progressive enhancement** strategy:
- CSS-only components that work without JavaScript
- Web Components extend native HTML elements with `pp-` prefix
- Components use custom elements: `<button is="pp-button">` pattern

### Key directories
- `src/components/` - Core Web Components (Lit)
- `src/stories/` - Storybook documentation organized by:
  - `primitives/` - Basic UI elements
  - `components/` - Complex components
  - `compositions/` - Component combinations
  - `patterns/` - Reusable patterns
  - `foundations/` - Design principles
- `src/services/` - API services and utilities
- `server/` - Express backend with AI integration

### Development patterns
- **Atomic Design** principles with clear component hierarchy
- **Composition hooks** for complex React component logic
- **AI adapters** for different component suggestion types
- **Streaming API responses** with Server-Sent Events
- **HTML Web Components** - Progressive enhancement approach using standard HTML with JavaScript sprinkled on top for behaviour
- **Light-DOM Web Components** - Custom elements that use the light DOM instead of shadow DOM for better accessibility and styling inheritance

#### Progressive enhancement
The `<pp-modal>` component demonstrates several key patterns for building progressive enhancement components:
- **Wrapper enhancement** - Wrap existing HTML structures (`<dialog>`, `<div class="modal">`) with custom elements that add behaviour
- **Smart element detection** - Automatically detect and enhance different modal types: `dialog`, `.drawer`, `.modal`, `[role="dialog"]`
- **Auto-wiring** - Automatically connect trigger buttons (`button:not([data-close])`) and close buttons (`[data-close]`, header buttons)

### TypeScript & type safety

- **Type guards**: Create `is*` functions for runtime type checking (e.g., `isIOption`, `isOptionToggleValue`)
- **Interfaces**: Define clear interfaces for component contracts (`IOptionBase`, `IOptionParent`)
- **Generic types**: Use generics for reusable components (`SelectBase<Value>`, `IOption<Value>`)
- **Value converters**: Create custom `ValueConverter` objects for complex attribute parsing
- **Strict typing**: All properties should have explicit types, avoid `any`

### Modern JavaScript/TypeScript features

Use the latest language features and APIs without backward compatibility constraints:
- **ES2023+ features**: Top-level await, private class fields, static class blocks, array methods like `findLast()`, `toSorted()`
- **Import assertions**: Use `with { type: 'json' }` for JSON imports
- **Optional chaining** (`?.`) and **nullish coalescing** (`??`) for safe property access
- **Template literal types** for type-safe string manipulation
- **Const assertions** (`as const`) for immutable type inference
- **Module resolution**: Use `import.meta` for module metadata
- **Decorators**: Use stage 3 decorators for Web Components and class enhancements
- **Native APIs**: Prefer native `fetch()`, `AbortController`, `URL`, `URLSearchParams` over polyfills
- **Modern DOM APIs**: Use `querySelector()`, `closest()`, `matches()`, `toggleAttribute()`

### Event handling & lifecycle

- **Event binding**: Bind all event handlers in constructor using `.bind(this)`
- **Custom events**: Define typed event interfaces and use `this.$emit('event-name', detail)`
- **Event cleanup**: Remove all listeners in `disconnectedCallback()`

## Testing and quality
- TypeScript strict mode enabled
- Components should extend native HTML elements when possible

## Code comments
- **Avoid redundant comments** - Don't comment on what the code already clearly expresses
- **Self-documenting code** - Prefer descriptive names and clear structure over explanatory comments
- **When to comment**: Complex business logic, non-obvious algorithms, or important context that isn't apparent from the code
- **Comment style**: Use `//` for brief explanations, avoid verbose JSDoc blocks for simple interfaces or self-evident functions

## Styling guidelines
- **Never use inline styles** - All styling must be handled through CSS classes
- Add styles to `src/styles/` directory for global styles and shared components
- For Web Components using Shadow DOM, use component-specific CSS files
- Use design system tokens (CSS custom properties) consistently
- Follow BEM naming convention for CSS classes
- Ask before adding new styles

## JavaScript hooks and functionality
- **Use data-* attributes as JavaScript hooks** - Use `data-*` attributes (e.g., `data-reference-picker`, `data-action="toggle"`) for JavaScript event handling and DOM queries
- **Separate styling from scripting** - Never rely on CSS classes for JavaScript functionality; they should remain purely for styling
- **Prefer semantic data attributes** - Use descriptive names like `data-component-name` or `data-action` instead of generic selectors
- **Avoid semantic attribute overloading** - Don't use `role`, `aria-*`, or other accessibility attributes as JavaScript hooks

## Documentation standards

### Documentation format
- Use `.mdx` format for Storybook documentation with rich interactive content
- Include Meta component for proper Storybook integration: `<Meta title="Category/Name" />`
- Mark work-in-progress items with `*` in titles (e.g., "Component Name*")

### Pattern documentation template
When documenting patterns, follow this structure:
- **Description** - Relational definition based on position within system
- **Anatomy** - Structural breakdown (for complex patterns)
- **Variants** - Functional, contextual, accessibility variants
- **States** - Empty, validation, loading states
- **Accessibility** - Concerns and implementation notes
- **Decision tree** - Logic for pattern/variant selection
- **Related patterns** - Precursors, follow-ups, complementary, tangentially related
- **Resources** - External references and research

### Behavioural framework
Use the Intent & Interaction framework (`src/stories/foundations/Behaviours.mdx`) to select and design patterns that support how users move through the interface and perform tasks. The framework is grounded in **Seek–Use–Share** temporal progression and treats interaction as conversational alignment with turn-taking and cooperative principles.

### Content guidelines
- Focus on relational definitions over static properties
- Explain diverse implementations of flexible patterns
- Include transitions between behavioural modes
- Reference established design principles (modularity, hierarchy, complexity management)

### Documentation linking
When creating cross-references between documen£tation files:
- **Storybook URLs**: Generated from Meta title - `<Meta title="Category/Name" />` becomes `../?path=/docs/category-name--docs`
- **URL transformation**:
  - Category/Name → category-name
  - Spaces become hyphens
  - Case is lowercased
  - Asterisks (*) are removed from URLs
- **Link format**: Use relative paths like `[Agency](../?path=/docs/foundations-agency--docs)` for internal Storybook links
- **Cross-pattern links**: Reference related patterns in "Related patterns" sections using proper Storybook URLs

### Writing style
- Use British spelling throughout (behaviour, organisation, colour, etc.)
- **Always use sentence case for headings and titles**

## Mock data and testing

### Mock data best practices
- **External JSON files**: Store all long mock data arrays in separate JSON files
- **JSON imports**: Use the import syntax with type assertion for JSON files:
  ```
  import mockData from './mockData.json' with { type: 'json' };
  ```

### When to extract to JSON
- **Long arrays** (>5 items) with complex object structures
- **Reusable data** that might be shared across multiple components
- **Rich data objects** with multiple properties that would clutter the main file
- **Leave inline** simple arrays with <10 primitive items for basic examples
