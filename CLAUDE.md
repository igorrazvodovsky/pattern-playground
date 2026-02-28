# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Domain-specific rules (styling, web components, documentation, etc.) live in `.claude/rules/` and activate automatically based on file paths.

## Table of contents
- [Quick reference](#quick-reference)
- [Development commands](#development-commands)
- [Architecture overview](#architecture-overview)
- [Testing and quality](#testing-and-quality)
- [Code comments](#code-comments)
- [Code review workflow](#code-review-workflow)
- [Anti-patterns](#anti-patterns)

## Quick reference

### Common commands
```bash
npm run test              # Run ESLint (use 'npm run test styles' for Stylelint)
npm run storybook         # Start Storybook on port 6006
cd server && npm run dev  # Start Express server with hot reload
```

### Component conventions
- *Prefix*: All custom elements use `pp-` prefix (e.g., `<pp-button>`, `<pp-modal>`)
- *Registration*: All components registered via `src/components/register-all.ts`
- *Loading*: Use bulletproof loading pattern with DOM readiness checks

### File organization
- `src/components/` - Core components
- `src/stories/` - Storybook documentation (primitives, components, compositions, patterns, foundations)
- `src/stories/data/` - Shared mock data as JSON files
- `src/services/` - API services and utilities
- `src/styles/` - Global styles (never use inline styles)
- `server/` - Express backend with AI integration

### When to use what
- *Lit vs React*: Lit for production components, React for Storybook stories and complex compositions
- *Zustand vs Context*: Zustand for complex state needing persistence, Context for simple prop drilling
- *Light DOM vs Shadow DOM*: Light DOM for better accessibility/styling inheritance (preferred)
- *Mock data*: Extract to JSON files if >5 complex items or reusable across components

### Key patterns
- Progressive enhancement (CSS-only → JavaScript enhanced)
- Framework-agnostic services with plugin architecture
- Pointer-based abstractions for universal features
- Centralized component registration with dependency management

## Development commands

*Frontend (root directory):*
- `npm run test` - Run ESLint
- `npm run storybook` - Start Storybook on port 6006
- `npm run build-storybook` - Build static Storybook

*Backend (server directory):*
- `cd server && npm run dev` - Start Express server with hot reload
- `cd server && npm run build` - Compile TypeScript
- `cd server && npm run start` - Run production server
- `cd server && npm run typecheck` - TypeScript type checking

## Architecture overview

This is a *design system playground* with a hybrid frontend/backend architecture:

### Frontend
- TypeScript with Vite build system
- Web Components (Lit) as primary component architecture
- React for Storybook stories and complex components
- Storybook for component documentation and development
- Tiptap for rich text editing

### Backend
- Node.js/Express server with OpenAI API integration
- TypeScript with ES modules

### Key directories
- `src/components/` - Core components
- `src/stories/` - Storybook documentation organized by: primitives, components, compositions, patterns, foundations, data
- `src/services/` - API services and utilities
- `server/` - Express backend with AI integration

### Development patterns
- Atomic Design principles with clear component hierarchy
- Progressive enhancement (CSS-only → JS enhanced)
- HTML Web Components and Light-DOM Web Components
- Centralized component registration with dependency-aware ordering
- Leverage existing dependencies before adding new ones
- Clean separation of concerns: core services, integrations, UI layers

## Testing and quality
- TypeScript strict mode enabled
- Components should extend native HTML elements when possible

## Code comments
- *Avoid redundant comments* - Don't comment on what the code already clearly expresses
- *Self-documenting code* - Prefer descriptive names and clear structure over explanatory comments
- *When to comment*: Complex business logic, non-obvious algorithms, or important context that isn't apparent from the code
- *Comment style*: Use `//` for brief explanations, avoid verbose JSDoc blocks for simple interfaces or self-evident functions

## Code review workflow
After completing any implementation or change to code:
1. Use the code-reviewer agent to review the code for quality, security, maintainability, errors, inconsistencies, and best practice violations.
   - Invoke via: `Task` tool with `subagent_type: "code-reviewer"`
   - Provide file paths or directories to review in the prompt
   - Agent runs autonomously and returns findings in a single report
2. Implement any suggestions or improvements identified by the code-reviewer
3. Only consider the implementation complete after addressing code review feedback

## Anti-patterns

### Code organization
- Don't inline long mock data - Extract arrays with >5 complex items to JSON files
- Don't write redundant comments - Code should be self-documenting; comment only non-obvious logic
