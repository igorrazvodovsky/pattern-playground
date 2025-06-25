# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Frontend (root directory):**
- `npm run test` - Run ESLint and Stylelint
- `npm run storybook` - Start Storybook on port 6006
- `npm run build-storybook` - Build static Storybook

**Backend (server directory):**
- `cd server && npm run dev` - Start Express server with hot reload
- `cd server && npm run build` - Compile TypeScript
- `cd server && npm run start` - Run production server
- `cd server && npm run typecheck` - TypeScript type checking

## Architecture Overview

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

### Component Architecture
Components follow a **progressive enhancement** strategy:
- CSS-only components that work without JavaScript
- Web Components extend native HTML elements with `pp-` prefix
- Components use custom elements: `<button is="pp-button">` pattern

### Key Directories
- `src/components/` - Core Web Components (Lit)
- `src/stories/` - Storybook documentation organized by:
  - `primitives/` - Basic UI elements
  - `components/` - Complex components
  - `compositions/` - Component combinations
  - `patterns/` - Reusable patterns
  - `foundations/` - Design principles
- `src/services/` - API services and utilities
- `server/` - Express backend with AI integration

### Development Patterns
- **Atomic Design** principles with clear component hierarchy
- **Composition hooks** for complex React component logic
- **AI adapters** for different component suggestion types
- **Streaming API responses** with Server-Sent Events

## Testing & Quality
- Use `npm run test` to run linting (ESLint + Stylelint) before commits
- TypeScript strict mode enabled
- Components should extend native HTML elements when possible
- Follow BEM CSS methodology for styling