# Research: Malleability Foundation

**Primary Sources:**
1.  `resources/papers/meridian-overview-detail.pdf` (Meridian)
2.  `resources/papers/malleable-overview-detail.pdf` (Malleable ODIs)
3.  `resources/papers/get-to-the-point.pdf` (Problem-Based Curation)

---

## 1. The Mechanism: Meridian & Malleable ODIs
**Core Insight**: The rigid distinction between "Overview" and "Detail" is artificial. Both are just configurable containers for **Attributes**.

### Key Concepts
*   **Malleability Dimensions**: Users should have agency over:
    1.  **Content**: Checking/unchecking which attributes to see (Pruning/Expanding).
    2.  **Composition**: Deciding how views connect (Side-by-side vs. New Page vs. Overlay).
    3.  **Layout**: Choosing the spatial arrangement (List, Grid, Map, Timeline).
*   **Attribute Roles**: Decoupling data from UI by mapping fields to roles (Title, Subtitle, Thumbnail, Visual) instead of hard-coded component slots.
*   **Generative Attributes**: Using AI to compute new attributes on the fly (e.g., "Is this urgent?" -> [Yes/No]) to enable new filtering/sorting capabilities.

---

## 2. The Strategy: Problem-Based Curation (Get To The Point)
**Core Insight**: The goal of a view is not to "show data" but to **formulate and answer a problem**.

### Key Concepts
*   **Problem-Based Views**: Dashboards should be organized by *Clinical Problem* (e.g., "Fluid Balance"), not by Data Type (e.g., "Labs").
*   **Pruning**: Malleability is largely about *removing* irrelevant signals. A "Curated View" is a pruned view focused on a specific problem context.
*   **Competency Scaffolding**: Standardized views act as checklists/scaffolds for reasoning, ensuring consistency without removing agency.
*   **Agency**: Over-annotation (heavy alerts) reduces agency. The system should provide tools for *active exploration* rather than passive consumption.

---

## 3. Synthesis: The Malleability Foundation

**Definition**: Malleability is the capability of the system to allow actors to **reframe** information representation (Content, Layout, Composition) to suit their active **problem context**.

### Pillars of Malleability
1.  **Dynamic Framing**: No view is static. Every view is a temporary configuration of attributes suitable for the current task.
2.  **Attribute-Centricity**: The atomic unit of design is the Attribute (and its Role), not the Component.
3.  **Contextual Pruning**: The primary action of Malleability is focusing (hiding noise) to reveal the signal relevant to the current problem.

### Impact on Pattern Playground Structure

#### New Foundation: `Foundations/Malleability.mdx`
*   Replaces the static notion of "View System" with a dynamic "Malleable View System".
*   Defines the "Grammar of Malleability" (Content, Composition, Layout).

#### Composition Updates
*   **Dashboard (`Dashboard.mdx`)**:
    *   Reframe as **"Context-Aware Canvas"**.
    *   "Variants" (Monitoring, Drilldown) become **"Presets"** or **"Curated Views"** that users can switch between or customize.
*   **DataView (`DataView/DataView.mdx`)**:
    *   The "Engine" of malleability.
    *   Needs to support **Prompt-Driven Configuration** (e.g., "Show me a comparison of prices") which auto-selects attributes and layout.
*   **ItemView (`ItemView.mdx`)**:
    *   Define "Semantic Levels" (Summary, Detail) as **Attribute Sets**.
    *   Support **Recursive Malleability** (Item Views containing Data Views).
*   **Navigation (`Navigation/navigation-overview.mdx`)**:
    *   Reframe as **"Malleable Routing"**.
    *   Navigation targets are not fixed locations but *relationships* (e.g., "Open this item *next to* my current work").
