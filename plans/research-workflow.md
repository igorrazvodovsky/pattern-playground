# Research Application Workflow

This document outlines the process for reviewing research papers and systematically applying their findings to the project.

## Goal
To transform insights from research papers into concrete, actionable pattern descriptions and their implementations/refact in our codebase.

## The Process

### 1. Selection & Ingestion
*   **Select a Paper**: Choose a paper from `resources/papers/` or add a new one.
*   **Goal Setting**: Briefly define *why* we are reading this paper. What problem are we trying to solve?

### 2. Analysis (The "Notes" Phase)
Create a new notes file using the template: `resources/papers/_template-notes.md`.
Naming convention: `[paper-filename]-notes.md` (e.g., `IntentFlow-notes.md`).

**Key Focus Areas:**
*   **Frameworks**: Does the paper propose a model (e.g., "4 stages of intent")?
*   **Taxonomies**: Does it categorize things in a useful way?
*   **Mechanisms**: specific UI interactions or algorithms.

### 3. Application (The "Bridge" Phase)
This is the critical step where we map *Their* ideas to *Our* code.
Fill out the **Application to Pattern Playground** section in the notes file.

*   **Existing Foundations**: Check `src/stories/`. Do we already have something similar?
    *   *Example*: "The paper discusses 'Asynchronous Collaboration'. We have `foundations/Collaboration.mdx` (concepts), `patterns/Collaboration.mdx` (interaction stages), and `compositions/Commenting.mdx` (implementation). How do they compare?"
*   **Gap Analysis**: What is the paper proposing that we completely lack?
    *   *Example*: "The paper suggests 'Ambiguity Resolution'. We currently don't have this. We should add it."

### 4. Synthesis & Planning
Once the notes are complete and ideas are generated:
1.  **Create Tasks**: Add actionable items to `task.md`.
2.  **Create Implementation Plans**: For complex features, create a specific plan in `plans/` (e.g., `plans/intent-articulation-feature.md`).
3.  **Link**: Ensure the plan references the notes file.

### 5. Implementation & Verification
*   Execute the plan.
*   Verify against the original paper's claims (e.g., "Does this actually reduce cognitive load as promised?").

---

## AI Prompt Template

Use this prompt to instruct an AI assistant to process a paper according to this workflow:

> **Role**: Research Engineer
> **Task**: Analyze the attached research paper and propose an implementation plan for `pattern-playground`.
> 
> **Instructions**:
> 1.  Read the paper thoroughly.
> 2.  Create a notes file in `resources/papers/` using the structure in `resources/papers/_template-notes.md`.
> 3.  **Crucially**, fill out the "Application to Pattern Playground" section.
>     *   **Scan the codebase** (specifically `src/stories`, `specs/`, and `plans/`) to find existing implementations that relate to the paper's concepts.
>     *   **Identify Gaps**: What concepts are missing entirely?
> 4.  Propose specific code changes:
>     *   **Refactors**: How to improve existing components based on the paper.
>     *   **New Features**: What new components need to be built to fill the gaps.
> 5.  Output a list of immediate Action Items.
