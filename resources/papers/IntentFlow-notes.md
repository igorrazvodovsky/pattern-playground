# 🤖 IntentFlow Paper - Working Notes

## Paper Metadata
- **Title**: IntentFlow: Supporting Interactive and Fluid Intent Communication with Large Language Models
- **Authors**: Yoonsu Kim, Brandon Chin, Kihoon Son, Seoyoung Kim, Juho Kim (KAIST)
- **Type**: System paper with Systematic Literature Review (SLR)
- **Domain**: Human-AI Interaction, LLM-based writing assistants

## Core Framework: Four Aspects of Intent Communication

### 1. Intent Articulation
**Definition**: Helping users express subconscious or underspecified intents more clearly and precisely.

**Characteristics**:
- Convergent process
- Externalises vague intent into concrete instructions
- Addresses the difficulty of articulating intent through natural language alone

**In IntentFlow**:
- Prompts parsed into Goals (high-level, stable) vs Intents (low-level, fluid)
- Extraction includes both explicit and implicit intents
- Presented as editable UI components

### 2. Intent Exploration
**Definition**: Supporting users in discovering new, emerging intents they may not have been initially aware of.

**Characteristics**:
- Divergent process
- Encourages expanding initial scope
- Surfaces subconscious intents

**In IntentFlow**:
- Intent dimensions with adjustable UI controls (sliders, radio buttons, hashtags)
- Hover-based explanations of dimension values
- Direct manipulation enables quick exploration

### 3. Intent Management
**Definition**: Providing structured representation for users to manage fluid, evolving nature of intents over time.

**Characteristics**:
- Persistent and organised way to track intents
- Supports revision and revisiting throughout task
- Enables curation of evolving strategies

**In IntentFlow**:
- Keep/pin functionality for satisfying intents
- Version history with associated intent states
- Ability to roll back to previous versions
- Makes intent removal natural (vs awkward negative prompting)

### 4. Intent Synchronization
**Definition**: Aligning user's communicated intents with LLM's output by making transparent how each intent is reflected.

**Characteristics**:
- Bi-directional verification process
- Enables users to verify whether intents are realised as intended
- Helps refine mental model of system

**In IntentFlow**:
- Hover-over-intent highlights corresponding output segments
- Intent-to-output linking module
- Transparent traceability between inputs and generated text

## Design Implications

### DI1: Distinguish and Externalize Goals and Intents
User prompts conflate high-level goals with low-level intents. System should parse into two layers:
- **Goals**: Stable, overarching objectives
- **Intents**: Fluid, actionable preferences

Extract both explicit and implicit intents, map to system behaviours, present in editable form.

### DI2: Provide Easily Adjustable Exploratory Spaces
Beyond identifying intents, surface alternative options (tones, structures, emphases). Make them easy to manipulate through direct manipulation to reduce exploration effort.

### DI3: Support Versioning and Curation
Maintain intents in structured, persistent form. Allow users to:
- Revisit and compare different versions
- Mark/fix effective intents
- Selectively retain or release as needed
- Gradually curate intent sets

### DI4: Make Intent-Output Connections Transparent
Explicitly link each intent to output parts it influences. Enable:
- Seeing which output segments correspond to which intents
- Understanding how modifying intents propagates changes
- Previewing potential effects before committing

## Key Findings from User Study (N=12)

### Behavioral Changes
- **67% fewer Correct actions** with IntentFlow vs Baseline
- **284% more Adjust actions** in IntentFlow
- **488% more Delete actions** in IntentFlow
- Add actions comparable between systems

### User Experience Improvements
- Significantly higher ratings across all 11 measures (M1-M11)
- **21% lower cognitive workload** (NASA-TLX)
- Lower effort and frustration

### Interaction Pattern Shift
**Baseline (chat-based)**:
- Frequent Correct actions due to system not maintaining context
- Rollback used after failures to restate intents
- Intents scattered across conversation history

**IntentFlow**:
- Adjust used for targeted revisions
- Rollback used for exploration (trying variations)
- Intents preserved in structured panel

### Intent Reusability
Participants expressed interest in reusing curated intent sets for similar future tasks, treating them like "libraries" of writing strategies.

## Connections to Cognitive Task Analysis

The paper grounds intent in cognitive research:
- Intent is not spontaneously generated
- Emerges from knowledge, cognitive processes, and goal configuration
- Particularly fluid in creation tasks (writing, drawing) due to iterative nature
- Requires continuous reflection and refinement

## Subconscious & Fluid Characteristics

Drawing from interpersonal communication research:
- **Goals**: Explicit, relatively stable
- **Intents**: Fine-grained, sometimes subconscious, evolve dynamically

Key insight: Users often interact with LLMs in ways that resemble human-to-human communication, but current interfaces don't support the fluid, evolving nature of human intent.

## Technical Architecture

### Intent Panel Structure
1. **Goal Section**: Task goal, domain, topic (stable anchors)
2. **Intent List Section**: Discrete intents with keep/delete/edit
3. **Intent Dimension Section**: Adjustable dimensions with UI controls

### Module Pipeline
1. **Entrypoint Chat Module** → coordinates updates
2. **Goal Module** → extracts stable task elements
3. **Intent Module** → infers explicit and implicit intents
4. **Dimension Module** → generates adjustable dimensions with appropriate UI
5. **Preview Module** → generates hover descriptions for dimension values
6. **Output Module** → generates text based on full intent state
7. **Linking Module** → connects intents to output segments

### Dual Prompting Mechanisms
1. **Chat-based Prompting**: Free-form prompts at any point
2. **Intent-based Prompting**: Refine specific intent using button next to element

## Generalizability Beyond Writing

Table 4 in paper shows how design implications apply to:
- Data Analysis
- Image Editing
- Music Composition

Common pattern: Intent articulation, exploration, management, and synchronization are domain-agnostic aspects of human-AI co-creation.

## Research Gaps & Future Directions

### Identified Limitations
1. **Conflict resolution**: No support for managing conflicting intents
2. **Prioritization**: Difficult to track/prioritize as intent set grows
3. **Proactive support**: Mixed-initiative approaches could detect conflicts
4. **Intermediate representations**: Could surface how system interprets intents
5. **Multimodal input**: Currently limited to text and UI manipulation

### Emerging Challenges
- Managing relationships between intents (not just individual intents)
- Sustaining awareness of evolving preferences over time
- Ensuring continuity of alignment across outputs

## Terminology & Definitions

**Intent-based outcome specification**: UI paradigm where users tell computer what they want, rather than how to do it (Jakob Nielsen)

**Goal vs Intent**:
- Goal: High-level objective (stable)
- Intent: Low-level strategies, preferences, constraints (fluid)

**Intent communication aspects** (this paper's framework):
- Articulation (convergent)
- Exploration (divergent)
- Management (temporal)
- Synchronization (bi-directional)

## Empirical Evidence

### Technical Evaluation (N=60)
Evaluated across 12 representative prompts (2 per writing context):
- 95% agreement on goal alignment
- 95% agreement on intent completeness
- 94% agreement on intent-output linking accuracy
- 86-87% agreement on intent dimensions

### User Study Results
- IntentFlow helped users discover, elaborate, and consolidate intents
- Shift from reactive error correction to proactive intent refinement
- Structured representation enabled easier removal of outdated intents
- Curated intent sets seen as reusable for future tasks

## Related Work Positioning

Paper positions IntentFlow as synthesising scattered insights from prior work:
- Prompt refinement and suggestion (articulation)
- Direct manipulation (exploration)
- Reifying prompts as objects (management)
- Linking prompts to outputs (synchronization)

Key contribution: First system to support all four aspects holistically in an integrated workflow.
