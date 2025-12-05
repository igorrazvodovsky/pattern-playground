# Time and Temporality in HCI Research - Notes

## Metadata
- **Title**: Time and Temporality in HCI Research
- **Authors**: Mikael Wiberg and Erik Stolterman
- **Year**: 2021
- **Source/Conference**: Interacting with Computers, Vol 33 No 3
- **DOI**: 10.1093/iwc/iwab025
- **Link**: https://academic.oup.com/iwc/article/33/3/250/6378804
- **Tags**: #research, #temporality, #hci, #design-theory, #slow-interaction

## 1. Executive Summary
This paper surveys the landscape of "Time and Temporality" in HCI research, arguing that the field is shifting from a focus on static "Things" to dynamic "Events" and "Processes". It categorizes existing research into four areas (Humans, Computers, Interaction, Over Time) and highlights the need for a more explicit theoretical treatment of time in interaction design. It serves as a foundational text for understanding how to design for "lived time" rather than just "clock time".

## 2. Key Concepts & Frameworks
### The Shift: Things -> Events
- **Traditional HCI**: Focused on artifacts, objects, and "things" (nouns).
- **Temporal HCI**: Focuses on events, processes, and "becoming" (verbs). Interaction is inherently temporal.

### The 4 Categories of Temporal Study
The authors propose a model categorizing what is studied:
1.  **Humans**: Empirical studies of how technology affects human time (rhythm, pace, interruptions, "anytime/anywhere" work).
2.  **Computers**: Fundamental computing principles (clock cycles, processing) and temporal visualizations (timelines, dynamic data).
3.  **Interaction**: Temporal explorations of the interface itself (turn-taking, lag, response time, "Slow Interaction").
4.  **Over Time**: Historical perspectives on the field of HCI and how user experience evolves over long periods.

### Key Distinctions
- **Clock Time vs. Lived Time**: The objective, measurable time (chronos) vs. the subjective, experienced time (kairos).
- **Slow Interaction**: A design philosophy that values reflection and pause over efficiency and speed.

## 3. Design Implications (General)
- **Design for Rhythm**: Interfaces should respect and support human rhythms (circadian, work/rest), not just maximize efficiency.
- **Make Time Visible**: Use visualization to help users understand temporal processes (e.g., "TimeSlice" for timelines).
- **Embrace Slowness**: In some contexts (e.g., reflection, creativity), slowness is a feature, not a bug.
- **Temporal Awareness**: Systems should be aware of the "right time" to interact (kairos).

## 4. Technical Architecture / Implementation Details
*The paper is a survey and does not propose a specific technical architecture, but implies:*
- **State Management**: Needs to handle history and future predictions, not just current state.
- **Async Patterns**: Robust handling of latency and asynchronous events is crucial for "fluid" temporality.

## 5. Application to Pattern Playground

### 5.1 Existing Foundations Analysis
*   **Relevant Files**:
    *   `src/stories/foundations/Temporality.md` (Empty!)
    *   `src/stories/foundations/Motion.mdx` (Micro-temporality/Transitions)
    *   `src/stories/patterns/ActivityLog.mdx` (Historical/Audit time)
    *   `src/stories/foundations/Conversation.mdx` (Turn-taking)
*   **Assessment**:
    *   [ ] **Aligned**: `Conversation.mdx` implicitly handles turn-taking, but could be more explicit about "rhythm".
    *   [ ] **Partial**: `Motion.mdx` handles "transitions" but lacks the broader context of "lived time".
    *   [ ] **Divergent**: We lack a central definition of "Temporality". The file exists but is empty.

### 5.2 Gap Analysis
*   **Missing Concepts**:
    *   **The "Temporality" Foundation**: We have the file, but no content. This is the place to define our stance on "Clock vs Lived Time" and "Rhythm".
    *   **Slow Interaction**: We don't have patterns that explicitly encourage "slowing down" or "reflection" (crucial for AI collaboration/agency).
    *   **Temporal Awareness**: Patterns for AI knowing *when* to interrupt.

### 5.3 Proposed Features / Refactors

#### Proposal A: Define the Temporality Foundation
*   **Goal**: Populate `src/stories/foundations/Temporality.md` with a framework based on this paper.
*   **Changes**:
    *   Write `Temporality.mdx` (convert to MDX).
    *   Define "Time as a Material".
    *   Introduce the "Rhythm", "Pace", and "History" dimensions.

#### Proposal B: Enhance Conversation with Temporal Concepts
*   **Goal**: Make "Turn-taking" and "Latency" explicit design materials.
*   **Changes**:
    *   Update `Conversation.mdx` to reference `Temporality`.
    *   Discuss "Artificial Latency" (e.g., AI "thinking" time) as a design tool for trust.

#### Proposal C: New Pattern "Temporal Awareness"
*   **Goal**: A pattern for AI agents that respect user focus and rhythm.
*   **Changes**:
    *   Create `src/stories/patterns/TemporalAwareness.mdx`.
    *   Describe "Interruptibility" and "Notification Batching".

### 5.4 Action Items
- [ ] Rename `src/stories/foundations/Temporality.md` to `.mdx` and populate it.
- [ ] Add "Temporal Awareness" to `task.md` as a future pattern.
