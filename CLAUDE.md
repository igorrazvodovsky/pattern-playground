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

## Testing and quality
- Use `npm run test` to run linting (ESLint + Stylelint) before commits
- TypeScript strict mode enabled
- Components should extend native HTML elements when possible
- Follow BEM CSS methodology for styling

## Styling guidelines
- **Never use inline styles** - All styling must be handled through CSS classes
- Add styles to `src/styles/` directory for global styles and shared components
- For Web Components using Shadow DOM, use component-specific CSS files
- Use design system tokens (CSS custom properties) consistently
- Follow BEM naming convention for CSS classes

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
- **Examples of usage** - Integration with other patterns
- **Best practices** - Dos and don'ts
- **Accessibility** - Concerns and implementation notes
- **Decision tree** - Logic for pattern/variant selection
- **Related patterns** - Precursors, follow-ups, complementary, tangentially related
- **Resources** - External references and research

### Behavioural framework
When designing components/patterns, consider actor behaviour modes:
- **Motivated movement** - Navigating, browsing, transactional search
- **Delightful discovery** - Exploring, monitoring, passive discovery
- **Foggy finding** - Re-finding, uncovering, hunting
- **Doing the job** - Executing, integrating, consuming, flow, learning

### Content guidelines
- Focus on relational definitions over static properties
- Explain diverse implementations of flexible patterns
- Include transitions between behavioural modes
- Reference established design principles (modularity, hierarchy, complexity management)

### Documentation linking
When creating cross-references between documentation files:
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
- Use sentence case for headings and titles