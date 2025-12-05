# Aesthetics and Usability over Time - Notes

## Metadata
- **Title**: Considering Aesthetics and Usability Temporalities in a Model Based Development Process
- **Authors**: Sophie Dupuy-Chessa, Yann Laurillau, Eric Céret
- **Year**: 2016
- **Source/Conference**: IHM'16 (28ième conférence francophone sur l'Interaction Homme-Machine)
- **DOI**: 10.1145/3004107.3004122
- **Link**: https://hal.science/hal-01383714
- **Tags**: #research, #aesthetics, #usability, #temporality, #lifecycle

## 1. Executive Summary
This paper investigates how the relative importance of **Aesthetics** and **Usability** changes over time. Through an experimental study, it demonstrates that **Aesthetics** dominates the user's perception during the initial "Exposure" stage, while **Usability** becomes the dominant factor during the subsequent "Use" stage.

## 2. Key Concepts & Frameworks
### The Two Stages of Experience
1.  **Exposure (First Stage)**:
    *   **Activity**: Visual inspection, browsing without deep interaction.
    *   **Dominant Factor**: **Aesthetics**. High aesthetics leads to high pleasantness/perceived value. Usability has little impact here.
2.  **Use (Second Stage)**:
    *   **Activity**: Goal-oriented interaction, achieving tasks.
    *   **Dominant Factor**: **Usability**. High usability leads to high pleasantness/perceived value. Aesthetics has less impact here (though still non-zero).

### Hypotheses Confirmed
*   **H1**: At Exposure, Aesthetics -> Pleasantness/Value (Confirmed).
*   **H2**: At Exposure, Usability -> No Impact (Confirmed).
*   **H4**: At Use, Usability -> Pleasantness/Value (Confirmed).

## 3. Design Implications (General)
- **First Impressions Matter (Aesthetics)**: To get users through the door (Orientation phase), the interface must be beautiful.
- **Long-term Retention Matters (Usability)**: To keep users (Incorporation phase), the interface must work well.
- **The "Bait and Switch" Risk**: A beautiful but unusable interface will fail in the second stage. A usable but ugly interface might never reach the second stage.

## 4. Application to Pattern Playground

### 4.1 Existing Foundations Analysis
*   **Relevant Files**:
    *   `src/stories/foundations/Temporality.mdx` (Lifecycle section)
    *   `src/stories/patterns/Mastery.mdx` (Incorporation phase)
    *   `src/stories/patterns/Onboarding.mdx` (Orientation phase)
*   **Assessment**:
    *   [ ] **Aligned**: Our "Lifecycle" model (Orientation -> Incorporation) maps perfectly to "Exposure -> Use".
    *   [ ] **Refinement Needed**: We can be more specific about *what* matters in each phase. Currently, `Temporality.mdx` says "High guidance" for Orientation. It should also say "High Aesthetics".

### 4.2 Gap Analysis
*   **Missing Nuance**: We don't explicitly state that **Aesthetics** is a temporal dimension. It's not just "decoration", it's a "phase-dependent requirement".
*   **Mastery vs. Aesthetics**: The `Mastery` pattern focuses on efficiency (Usability). This paper confirms that for experts (Use phase), usability is indeed king.

### 4.3 Proposed Features / Refactors

#### Proposal A: Update Temporality Foundation
*   **Goal**: Refine the "Lifecycle" section to include the "Aesthetics -> Usability" shift.
*   **Changes**:
    *   Update `src/stories/foundations/Temporality.mdx`.
    *   Under **Orientation**: Add "Dominant Quality: Aesthetics".
    *   Under **Incorporation**: Add "Dominant Quality: Usability".

#### Proposal B: Update Onboarding Pattern
*   **Goal**: Emphasize that Onboarding isn't just about *teaching* (Usability), it's about *attracting* (Aesthetics).
*   **Changes**:
    *   Update `src/stories/patterns/Onboarding.mdx` (if we were editing it, but for now, just noting it).

### 4.4 Action Items
- [ ] Update `Temporality.mdx` to reflect the Aesthetics/Usability shift.
