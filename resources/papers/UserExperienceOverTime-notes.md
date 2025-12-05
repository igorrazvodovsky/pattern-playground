# User Experience Over Time - Notes

## Metadata
- **Title**: User Experience Over Time: An Initial Framework
- **Authors**: Evangelos Karapanos, John Zimmerman, Jodi Forlizzi, Jean-Bernard Martens
- **Year**: 2009
- **Source/Conference**: CHI 2009
- **DOI**: 10.1145/1518701.1518814
- **Link**: https://dl.acm.org/doi/10.1145/1518701.1518814
- **Tags**: #research, #ux, #temporality, #longitudinal, #adoption

## 1. Executive Summary
This paper proposes a framework for understanding how user experience evolves over time, moving beyond the immediate "out-of-the-box" experience. It identifies three distinct phases of adoption: **Orientation**, **Incorporation**, and **Identification**, driven by forces of familiarity, functional dependency, and emotional attachment.

## 2. Key Concepts & Frameworks
### The Three Phases of Adoption
1.  **Orientation (The "Wow" / "Frustration" Phase)**:
    *   Focus: Learnability, Novelty, Stimulation.
    *   Emotions: Excitement mixed with frustration.
    *   Key Activity: Exploring new features, overcoming initial hurdles.
2.  **Incorporation (The "Daily Life" Phase)**:
    *   Focus: Long-term Usability, Utility, Integration.
    *   Key Activity: The product becomes meaningful in daily contexts. "How does this fit my life?"
    *   Shift: From "How do I use this?" to "What does this do for me?".
3.  **Identification (The "Self" Phase)**:
    *   Focus: Social connection, Self-expression.
    *   Key Activity: The product participates in social interactions and communicates identity.

### The Forces of Change
- **Increasing Familiarity**: Reduces the cognitive load of "Orientation".
- **Functional Dependency**: Drives "Incorporation".
- **Emotional Attachment**: Drives "Identification".

### Micro-temporality vs Macro-temporality
- **Micro**: Single experiential episodes (clicking a button, completing a task).
- **Macro**: The evolution of the relationship over weeks/months.

## 3. Design Implications (General)
- **Design for the Journey**: Don't just design for the "first 5 minutes".
- **Support Transition**: Help users move from "Orientation" (learning) to "Incorporation" (mastery).
- **Shift Metrics**: "Ease of use" matters most at the start; "Utility" and "Identity" matter more later.

## 4. Technical Architecture / Implementation Details
*   **Longitudinal Data**: Systems need to track usage over time to adapt (e.g., "You've used this feature 50 times, would you like a shortcut?").
*   **Adaptive UI**: The interface could change as the user moves from Orientation (verbose, helpful) to Incorporation (efficient, minimal).

## 5. Application to Pattern Playground

### 5.1 Existing Foundations Analysis
*   **Relevant Files**:
    *   `src/stories/patterns/Onboarding.mdx` (Matches "Orientation")
    *   `src/stories/patterns/Adaptation.mdx` (Mechanism for change)
    *   `src/stories/foundations/Temporality.mdx` (The container for these concepts)
*   **Assessment**:
    *   [ ] **Aligned**: `Onboarding.mdx` covers the "Orientation" phase well.
    *   [ ] **Partial**: We lack explicit patterns for "Incorporation" (Mastery/Efficiency) and "Identification".
    *   [ ] **Divergent**: Our current "Temporality" concept (from the previous paper) focuses on "Events/Rhythm". This paper adds the "Lifecycle" dimension.

### 5.2 Gap Analysis
*   **Missing Concepts**:
    *   **The "Lifecycle" Dimension in Temporality**: We need to add "Lifecycle" (Orientation -> Incorporation -> Identification) to the Temporality foundation.
    *   **"Mastery" Pattern**: We need a pattern for how the UI evolves for expert users (Incorporation phase).

### 5.3 Proposed Features / Refactors

#### Proposal A: Update Temporality Foundation
*   **Goal**: Add the "Lifecycle" dimension to `Temporality.mdx`.
*   **Changes**:
    *   Add section: "The Lifecycle of Experience" (Orientation, Incorporation, Identification).
    *   Contrast "Micro-temporality" (Interaction) with "Macro-temporality" (Relationship).

#### Proposal B: Refactor Onboarding Pattern
*   **Goal**: Frame Onboarding as "Orientation" and explicitly define the "Exit Criteria" (when does it end?).
*   **Changes**:
    *   Update `Onboarding.mdx` to reference the "Orientation" phase.

#### Proposal C: New Pattern "Mastery" (or "Incorporation")
*   **Goal**: Design for the long-term user.
*   **Changes**:
    *   Create `src/stories/patterns/Mastery.mdx`.
    *   Focus on shortcuts, customization, and density (increasing density as familiarity grows).

### 5.4 Action Items
- [ ] Update `Temporality.mdx` task to include "Lifecycle" dimension.
- [ ] Add "Mastery" pattern to `task.md`.
