# Pattern Playground Context

## Project Philosophy
**This is primarily a design research and knowledge management project.**
While it is technically a software repository (React/Lit/Storybook), its core purpose is to serve as a "garden" for cultivating design patterns, understanding their relationships, and exploring the intersection of traditional design systems with AI/LLM interactions.

**Core Objective:** To map relationships between patterns (Foundations, Primitives, Components, Compositions, Patterns) and understand how they connect, specifically focusing on Collaboration and Conversation in the context of AI.

## Knowledge Architecture

The project is divided into "Input" (Research) and "Output" (Synthesis).

### 1. Research (Input) - `resources/`
This directory holds raw materials, notes, and academic sources.
*   **`resources/papers/`**: PDF repositories of academic papers (e.g., "The Essence of Software", "Understanding Computers and Cognition").
*   **`resources/*.md`**: Notes and summaries of books/papers (e.g., `Complexity.md`, `Relational design.md`).
*   **Workflow:** When analyzing a new paper, save the PDF here and create a corresponding markdown note file for summary and analysis.

### 2. Synthesis (Output) - `src/stories/`
This is the "Product". It uses Storybook (`.mdx` files) to document synthesized design patterns.
*   **`foundations/`**: Underlying structures (Agency, Conversation, Intent).
*   **`primitives/`**: Base building blocks (buttons, inputs).
*   **`components/`**: Main UI blocks (bubbles, cards).
*   **`compositions/`**: Complex assemblies (Chat, Editors).
*   **`patterns/`**: Best practice solutions for actor needs (Collaboration, Prompts).
*   **`concepts/`**: Abstract design concepts (Concept Design methodology).

## Documentation Standards

### Writing Patterns (`.mdx`)
All pattern documentation should reside in `src/stories/`.
*   **Template:** Follow the structure in `src/stories/Template.md`.
*   **Focus:** Prioritize **relational definitions** over static properties. Define what a pattern *does* in relation to others.
*   **Key Sections:**
    *   *Anatomy & Variants*: Structural breakdown.
    *   *Decision Tree*: When to use this vs. others.
    *   *Related Patterns*: **Critical Section.** Must define Precursors, Follow-ups, Complementary, and Tangentially related patterns.

### Current Research Focus (Nov 2025)
*   **Conversation & Collaboration:** Treating interaction as coordinated turn-taking.
*   **AI/LLM Patterns:** Moving beyond "chatbots" to "embedded intelligence".
*   **Agency:** How human agency shifts during co-creation with AI.

## Technical Context (The "Playground")

This research is backed by a working code playground to test ideas.

### Tech Stack
*   **Frontend:** TypeScript, Vite, Lit (Web Components), React (Storybook), Tiptap (Rich Text).
*   **Backend:** Node.js/Express (for AI integration experiments).

### Key Commands
*   **Run Documentation (Storybook):** `npm run storybook` (Access at `http://localhost:6006`)
*   **Lint/Test:** `npm run test`
*   **Backend:** `cd server && npm run dev`

### Development Conventions
*   **Components:** `pp-` prefix, Light DOM preferred.
*   **Files:** `src/stories/data/` for shared JSON mock data.
*   **Styles:** `src/styles/` (CSS layers). No inline styles.