# Recognizing Creative Needs in User Interface Design - Notes

## Metadata
- **Title**: Recognizing Creative Needs in User Interface Design
- **Authors**: Michael Terry, Elizabeth D. Mynatt
- **Year**: 2002
- **Source/Conference**: C&C'02 (Creativity & Cognition)
- **DOI**: 10.1145/581710.581718
- **Link**: https://dl.acm.org/doi/10.1145/581710.581718
- **Tags**: #creativity, #ui, #undo, #exploration, #history

## 1. Executive Summary
The paper critiques the "Single State Document Model" (SSDM) prevalent in most software, which forces users to work linearly on one version of a document. This model hinders creative exploration, which is naturally non-linear, iterative, and branching. The authors propose three interface mechanisms to support creativity: **Side Views** (on-demand previews), **Parameter Spectrums** (visual parameter adjustment), and **Design Horizon** (a workspace for managing variations).

## 2. Key Concepts & Frameworks
- **Single State Document Model (SSDM)**: The restrictive model where a document exists in only one state at a time.
- **Reflection-in-Action (Schön)**: The cycle of acting, evaluating the result, and planning the next move. Interfaces must support this tight loop.
- **Side Views**: Tooltips that show a *preview* of what a command will do before it is applied.
- **Parameter Spectrums**: Sliders that show a range of visual previews instead of just a number or a single handle.
- **Design Horizon**: A dedicated workspace (often on a second monitor) for holding snapshots, variations, and history, separating "management of alternatives" from "active editing".

## 3. Design Implications (General)
- **DI1: Support Experimentation**: Users need to try things out without fear of losing work or committing too early.
- **DI2: Support Comparison**: Users need to see alternatives side-by-side (e.g., "Which filter looks better?").
- **DI3: Near-term vs. Long-term History**: Undo is for near-term; Design Horizon is for managing longer-term branches and variations.

## 4. Technical Architecture / Implementation Details
- **Previews**: Requires the ability to render the document (or a part of it) in a temporary state without mutating the main document model.
- **Spectrums**: Requires generating multiple thumbnails by sampling the parameter space (e.g., generating 5 versions of an image with brightness 10, 30, 50, 70, 90).

## 5. Application to Pattern Playground

### 5.1 Existing Foundations Analysis
*   **Relevant Files**:
    *   `src/stories/patterns/Undo.mdx`: Mentions "Branching models" and "Selective undo", which aligns with the paper's critique of linear history.
    *   `src/stories/patterns/Workspace.mdx`: Discusses "Panelled workspaces" and "Multi-context", which partially covers the "Design Horizon" concept of seeing multiple things at once.
    *   `src/stories/patterns/FocusAndContext`: Related to managing detail vs overview, similar to how Design Horizon manages the "forest" of variations.
*   **Assessment**:
    *   [ ] **Aligned**: `Workspace.mdx` supports the *idea* of multiple contexts, but lacks the specific "variation management" semantics.
    *   [ ] **Partial**: `Undo.mdx` acknowledges non-linear history but doesn't specify a UI for it (like Design Horizon).
    *   [ ] **Divergent**: Most of our patterns likely assume a standard "edit state", implicitly following the SSDM unless we build specific "Variation" patterns.

### 5.2 Gap Analysis
*   **Missing Concepts**:
    *   **Parameter Spectrums**: We have no pattern for "visual sliders" or "preview-based controls".
    *   **Side Views**: We have `Explanation` and `Suggestion`, but no specific pattern for "hover to preview command result".
    *   **Variation Management**: We lack a dedicated pattern for "Snapshots" or "Alternatives" that sit alongside the main work.

### 5.3 Proposed Features / Refactors

#### Proposal A: New Pattern "Parameter Spectrum"
*   **Goal**: Create a UI pattern for controls that preview their effect.
*   **Changes**:
    *   Create `src/stories/patterns/ParameterSpectrum.mdx`.
    *   Define it as a variation of `Settings` or `Input`.
    *   *Implementation Sketch*: A slider where the track is composed of thumbnails showing the result of the value at that position.

#### Proposal B: Enhance "Undo" with "History & Variations"
*   **Goal**: Move beyond linear undo.
*   **Changes**:
    *   Update `src/stories/patterns/Undo.mdx` to explicitly include "Design Horizon" concepts (snapshots, branching).
    *   Add a section on "Visual History".

#### Proposal C: New Pattern "Preview" (Side Views)
*   **Goal**: Standardize how we show "what will happen".
*   **Changes**:
    *   Create `src/stories/patterns/Preview.mdx`.
    *   Connect it to `CommandMenu` (hovering a command shows a preview).

### 5.3 Action Items
- [ ] Create `src/stories/patterns/ParameterSpectrum.mdx`
- [ ] Update `src/stories/patterns/Undo.mdx` with "Variation" concepts
- [ ] Create `src/stories/patterns/Preview.mdx`
