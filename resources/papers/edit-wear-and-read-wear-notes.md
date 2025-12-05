# Edit Wear and Read Wear - Notes

## Metadata
- **Title**: Edit Wear and Read Wear
- **Authors**: William C. Hill, James D. Hollan, Dave Wroblewski, Tim McCandless
- **Year**: 1992
- **Source/Conference**: CHI '92
- **Link**: https://dl.acm.org/doi/10.1145/142750.142751
- **Tags**: #research, #ui, #history, #visualization, #cscw, #wear

## 1. Executive Summary
This paper introduces the concept of "computational wear" — using graphical visualizations to depict the history of interaction with a document. Just as physical objects (books, door handles) show "wear" that indicates usage patterns (dog-eared pages, polished handles), digital objects should display their read and edit history. The authors implement this via "attribute-mapped scrollbars", where marks in the scrollbar trough indicate where edits or reading activity occurred, allowing users to identify "hot spots", stable sections, or frequently read areas. This supports "reflective conversation with work materials" by making the history of the artifact visible in the present.

## 2. Key Concepts & Frameworks
- **Computational Wear**: The digital analog to physical wear. Visualizing history of use on the object itself.
- **Edit Wear**: Visualizing the history of edits (authorship).
- **Read Wear**: Visualizing the history of reading (readership).
- **Attribute-Mapped Scrollbars**: The primary mechanism. Using the scrollbar as a canvas to map document attributes (edit count, read time) to spatial positions.
- **Reflective Conversation**: (From Schön) The idea that professionals interact with their materials, the materials "talk back" (via wear/state), and the professional reframes the problem.
- **Informational Physics**: Designing virtual worlds with specific "laws" (physics) that highlight important relationships (like history) not visible in the real world.

## 3. Design Implications (General)
- **History as Context**: Interaction history shouldn't just be a log file; it should be embedded in the interface "in the action present".
- **Implicit vs Explicit**: Wear is a byproduct of use (implicit), not an explicit annotation. It's "free" information.
- **Visualizing Aggregates**: Wear helps identify patterns (hot spots, neglected areas) that single data points don't show.
- **Social Coordination**: In collaborative settings, wear acts as a coordination signal (e.g., "someone else has been working here").

## 4. Technical Architecture / Implementation Details
- **Instrumentation**: Modified editor (Zmacs) to record events (edits, time spent viewing lines).
- **Data Structure**:
    - Per-line history (timestamps of edits, accumulated read time).
    - Categories (Author A, Reader B, Task X).
- **Visualization**:
    - Scrollbar trough represents the document length.
    - Marks are painted at relative positions.
    - Width/Color of marks represents magnitude (frequency of edits, time read).
- **Logic**: "Read" time is calculated by tracking which lines are visible in the viewport and for how long (subtracting idle time).

## 5. Application to Pattern Playground

### 5.1 Existing Foundations Analysis
*   **`src/stories/foundations/Temporality.mdx`**:
    *   [x] **Aligned**: This foundation discusses time and history. "Wear" is a perfect example of "Accumulation" or "Trace" within Temporality.
*   **`src/stories/patterns/ActivityLog.mdx`**:
    *   [ ] **Partial**: We have a pattern for explicit logs, but it's likely a list view, not an embedded visualization like "wear".
*   **`src/stories/patterns/Annotation.mdx`**:
    *   [ ] **Divergent**: Annotation is usually explicit user action. Wear is implicit. They are complementary.
*   **`src/stories/patterns/Collaboration.mdx`**:
    *   [x] **Aligned**: The paper explicitly mentions CSCW. Wear is a passive collaboration signal.

### 5.2 Gap Analysis
*   **Missing Concepts**:
    *   **"Wear"**: We don't have a specific pattern for "Implicit Interaction History Visualization".
    *   **"Attribute-Mapped Scrollbar"**: We don't have this specific UI mechanism documented.
*   **Missing Interactions**:
    *   **Passive Recording**: We might not have patterns describing how to record "read" events or passive engagement.

### 5.3 Proposed Features / Refactors

#### Proposal A: Add "Wear" Pattern
*   **Goal**: Document the pattern of "Computational Wear".
*   **Changes**:
    *   Create `src/stories/patterns/Wear.mdx`.
    *   Define it as an implicit history visualization.
    *   Link to `Temporality` (Foundation) and `ActivityLog` (Data source).

#### Proposal B: Update `Temporality` Foundation
*   **Goal**: Incorporate "Wear" as a key manifestation of time in UI.
*   **Changes**:
    *   Add a section on "Traces & Wear" to `src/stories/foundations/Temporality.mdx`.
    *   Reference the "Edit Wear and Read Wear" paper.

#### Proposal C: Create "Attribute-Mapped Scrollbar" Primitive or Component
*   **Goal**: A UI element that implements the visualization.
*   **Changes**:
    *   Create `src/stories/components/Scrollbar/AttributeScrollbar.stories.tsx` (concept).
    *   Or add to `src/stories/patterns/Navigation.mdx` (if it exists) or `Overview.mdx`.

### 5.4 Action Items
- [ ] Create `src/stories/patterns/Wear.mdx` <!-- id: 8 -->
- [ ] Update `src/stories/foundations/Temporality.mdx` with "Wear" concepts <!-- id: 9 -->
- [ ] (Optional) Prototype an Attribute-Mapped Scrollbar in `src/stories/components/` <!-- id: 10 -->
