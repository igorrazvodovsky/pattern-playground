# Research Application Workflow

This document outlines the process for reviewing research papers and systematically applying their findings to the project.

## Goal
To transform insights from research papers into concrete, actionable pattern descriptions and their implementations/refact in our codebase.

## The Process

### 1. Selection & Ingestion
*   **Select a Paper**: Choose a paper from `resources/papers/` or add a new one.
*   **Find Online Link**: Even if working from a local PDF, search online for the canonical link (DOI, arXiv, ACM Digital Library, etc.) for proper citation and reference.
*   **Goal Setting**: Briefly define *why* we are reading this paper. What problem are we trying to solve?
*   **Research Broader Context**: Investigate the paper's influence and reception
    *   Check citation count and who cites it (Google Scholar, Semantic Scholar)
    *   Look for responses, critiques, or follow-up research
    *   Identify if this represents emerging consensus or contested territory
*   **Author & Source Credibility**: Evaluate the source's reliability
    *   Check author affiliations, expertise, and previous work
    *   Identify potential conflicts of interest (industry funding, commercial products)
    *   Consider publication venue reputation (peer-reviewed conference, journal, preprint)

### 2. Analysis (The "Notes" Phase)
Create a new notes file using the template: `resources/papers/_template-notes.md`.
Naming convention: `[paper-filename]-notes.md` (e.g., `IntentFlow-notes.md`).

**Key Focus Areas:**
*   **Frameworks**: Does the paper propose a model (e.g., "4 stages of intent")?
*   **Taxonomies**: Does it categorize things in a useful way?
*   **Mechanisms**: specific UI interactions or algorithms.

**Critical Verification Steps:**
*   **Check Research Currency**: Verify if cited research is current or superseded
    *   Example: Miller's "7±2" (1956) has been superseded by Cowan's ~4 chunks (2001)
    *   Search for "[concept] current research [year]" before accepting older findings
*   **Validate Paper Claims**: If uncertain about a framework or concept, re-read the source section
    *   Don't fabricate or embellish frameworks—extract them directly from the paper
    *   Distinguish descriptive papers (surveys) from prescriptive papers (proposing new frameworks)
*   **Assess Perspective & Bias**: Examine the paper's framing and assumptions
    *   What viewpoint does the author take? (e.g., designer-centric vs user-centric)
    *   What's emphasised vs minimised or omitted?
    *   Does the framing serve a particular agenda or commercial interest?
    *   Are alternative explanations or competing frameworks acknowledged?
*   **Test Framework Boundaries**: Apply frameworks to edge cases to understand scope
    *   Example: "Does this apply to human-human collaboration or just human-AI?"

### 3. Application (The "Bridge" Phase)
This is the critical step where we map *Their* ideas to *Our* code.
Fill out the **Application to Pattern Playground** section in the notes file.

**Context Awareness:**
*   **Project Scope**: This is exploratory personal design practice focused on mapping pattern relationships
    *   Foundations are about "underlying structures that ensure unified experience" *in this practice*
    *   Universal HCI principles (Gestalt, Fitts's Law, Cognitive Load Theory) inform patterns but aren't foundations
    *   Ask: "Is this concept specific to how patterns relate in this system, or is it a universal design principle?"
*   **Audience**: Experienced designers
    *   Avoid over-explaining obvious principles (e.g., "related elements should be close")
    *   Keep enhancements concise (1-3 sentences, not full sections)
    *   Trust reader comprehension—don't state the obvious

**Mapping Research to Codebase:**
*   **Existing Foundations**: Check `src/stories/`. Do we already have something similar?
    *   *Example*: "The paper discusses 'Asynchronous Collaboration'. We have `foundations/Collaboration.mdx` (concepts), `patterns/Collaboration.mdx` (interaction stages), and `compositions/Commenting.mdx` (implementation). How do they compare?"
    *   **Check for redundancy**: Does an existing pattern already cover this principle?
        *   Example: Status Feedback already implements signalling/cueing—no separate pattern needed
*   **Gap Analysis**: What is the paper proposing that we completely lack?
    *   *Example*: "The paper suggests 'Ambiguity Resolution'. We currently don't have this. We should add it."
    *   Distinguish between:
        *   **Missing patterns** that should be added
        *   **Enhancement opportunities** for existing patterns (brief additions)
        *   **Universal principles** that should inform but not become foundations
*   **Exploratory Connections**: Look beyond obvious mappings
    *   What unexpected applications exist? (e.g., could a framework about AI interaction inform human-to-human patterns?)
    *   How does this research challenge our current categorisations or assumptions?
    *   Are there cross-cutting themes emerging across multiple papers?
    *   What patterns in the research itself suggest gaps in our taxonomy?

### 4. Synthesis & Planning
Once the notes are complete and ideas are generated:
1.  **Create Tasks**: Add actionable items to `task.md`.
2.  **Create Implementation Plans**: For complex features, create a specific plan in `plans/` (e.g., `plans/intent-articulation-feature.md`).
3.  **Link**: Ensure the plan references the notes file.

### 5. Implementation & Verification
*   Execute the plan.
*   Verify against the original paper's claims (e.g., "Does this actually reduce cognitive load as promised?").

---

## Common Pitfalls & Lessons Learned

### Pitfall 1: Citing Outdated Research
**Problem**: Citing classic research without checking if it's been superseded
**Example**: Miller's "7±2" (1956) is still widely cited but Cowan's ~4 chunks (2001) is current consensus
**Solution**: Always web search "[concept] current research [current year]" before finalizing notes

### Pitfall 2: Creating Redundant Patterns
**Problem**: Proposing new patterns that overlap with existing ones
**Example**: Proposing "Signalling" pattern when Status Feedback already covers indication/attention management
**Solution**: Thoroughly review existing patterns before proposing new ones. Use Grep to search for related concepts.

### Pitfall 3: Misunderstanding Project Scope
**Problem**: Treating universal design principles as project-specific foundations
**Example**: Proposing "Cognitive Load" as a foundation when it's a universal HCI principle like Gestalt or Fitts's Law
**Solution**: Ask: "Is this specific to how patterns relate in THIS system, or is it universal to all design?"
**Reference**: See `Intro.mdx` for project scope clarification

### Pitfall 4: Over-Explaining to Experienced Audience
**Problem**: Adding verbose explanations of obvious principles
**Example**: Explaining that "related elements should be spatially close" to experienced designers
**Solution**: Keep enhancements concise (1-3 sentences). Trust reader expertise.

### Pitfall 5: Treating Enhancement as Foundation
**Problem**: Creating entire new foundations when brief enhancements would suffice
**Example**: Creating "Contiguity" pattern vs adding spatial proximity note to Layout foundation
**Solution**: Prefer enhancing existing patterns with brief, targeted additions over creating new structures

### Pitfall 6: Accepting Research Uncritically
**Problem**: Treating published research as objective truth without examining bias, agenda, or limitations
**Example**: Applying a framework funded by a specific tech company without considering how commercial interests shaped the research questions and conclusions
**Solution**: Always assess perspective and bias (see Critical Verification Steps). Ask: "What isn't this paper telling me? Who benefits from this framing?"

---

## AI Prompt Template

Use this prompt to instruct an AI assistant to process a paper according to this workflow:

> **Role**: Research Engineer
> **Task**: Analyze the attached research paper and propose an implementation plan for `pattern-playground`.
>
> **Instructions**:
> 1.  **Research the context**: Investigate the paper's influence, author credibility, and potential biases before detailed analysis.
> 2.  **Read critically**: As you read, assess the author's perspective, what's emphasised vs omitted, and potential conflicts of interest.
> 3.  Create a notes file in `resources/papers/` using the structure in `resources/papers/_template-notes.md`.
> 4.  **Crucially**, fill out the "Application to Pattern Playground" section.
>     *   **Scan the codebase** (specifically `src/stories`, `specs/`, and `plans/`) to find existing implementations that relate to the paper's concepts.
>     *   **Identify Gaps**: What concepts are missing entirely?
>     *   **Explore unexpected connections**: How might this research apply beyond obvious mappings?
> 5.  Propose specific code changes:
>     *   **Refactors**: How to improve existing components based on the paper.
>     *   **New Features**: What new components need to be built to fill the gaps.
> 6.  Output a list of immediate Action Items.
