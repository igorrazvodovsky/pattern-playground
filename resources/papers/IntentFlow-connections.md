# 🤖 IntentFlow Connections to Pattern Playground

## Direct Connections to Existing Patterns

### 1. Prompt Pattern (src/stories/patterns/Prompt/)

**Current State**:
- Basic documentation of prompt as "An input for a bot"
- Sections on: Intent, Input mechanisms, Structured prompt, @mentions, Prompt guidance
- Placeholder sections for Quality feedback, Editing assistance, Templates, Suggestions

**IntentFlow Contributions**:

#### Expand Intent Section
Current: "explicit and implicit..."

Should expand with:
1. **Dual Nature of User Input**
   - Goals: High-level, stable objectives
   - Intents: Low-level, fluid strategies/preferences/constraints

2. **Characteristics of Intent**
   - Often subconscious and underspecified
   - Evolves during interaction
   - Emerges from knowledge and cognitive processes
   - Particularly fluid in creation tasks

3. **Four Aspects of Intent Communication** (add as subsections)
   - Intent Articulation: Externalising vague preferences
   - Intent Exploration: Discovering emerging directions
   - Intent Management: Tracking evolving strategies
   - Intent Synchronization: Verifying realisation in output

#### New Patterns to Add

**"Structured Intent Representation"**
- Parsing prompts into editable goal + intent components
- Making system's interpretation visible
- Enabling refinement of vague instructions

**"Intent Dimensions"**
- Representing adjustable aspects of intents as UI controls
- Types: Likert scales, sliders, hashtags
- Generated contextually based on expressed intents

**"Intent-to-Output Linking"**
- Transparent traceability between intents and output
- Hover-based highlighting
- Helps users verify realisation

**"Intent Versioning & Curation"**
- Maintaining intent history across interactions
- Keep/pin for effective intents
- Rollback to previous intent configurations
- Building reusable intent libraries

#### Dual Prompting Mechanisms (new subsection)
1. **Chat-based prompting**: Free-form, any point
2. **Intent-based prompting**: Targeted refinement of specific intent

### 2. Interaction Foundation (src/stories/foundations/Interaction.mdx)

**Current Framework**: Seek–Use–Share with Navigation and Actions

**IntentFlow Alignment**:

#### Intent as Interaction Layer
The paper provides a complementary lens to your existing framework:

**Your Framework** → **IntentFlow Addition**
- Seek (retrieving information) → Intent Articulation (expressing what to seek)
- Use (completing tasks) → Intent Exploration (discovering approaches)
- Share (communicating outcomes) → Intent Management (curating strategies)

All three supported by → Intent Synchronization (verification loop)

#### Navigation Behaviors & Intent
Each navigation mode has associated intent communication needs:

**Navigating** (precise, high intent):
- Needs: Intent Articulation support
- User knows what they want, needs to express it clearly
- Benefit from structured intent representation

**Browsing** (less precise, purposeful):
- Needs: Intent Exploration support
- Goal is forming, needs to discover possibilities
- Benefit from adjustable intent dimensions

**Transactional search** (focused, tool-based):
- Needs: Intent Synchronization support
- Constructed inputs with care, expects accurate delivery
- Benefit from intent-to-output linking

**Exploring** (loosely bounded):
- Needs: Intent Management support
- Understanding of needs sharpens as they go
- Benefit from versioning and curation

#### Actions & Intent Communication

Map your action categories to intent aspects:

**Prerequisites to action** → Intent Articulation
- System evaluates readiness
- Clear prerequisite communication = articulated intents

**Encouragement & nudges** → Intent Exploration
- Suggests opportunities while preserving choice
- Helps discover intents user hasn't considered

**Instructions for action** → Intent Synchronization
- Clear guidance that enables confident completion
- Verification that intent is understood correctly

**Consequences of action** → Intent Management
- Feedback about what changed
- Informs evolution of future intents

**Commitment level** → Intent Articulation + Management
- Matching friction to significance
- High-commitment intents need clear articulation and management

#### Conversational Alignment Extension

Your section on "Interaction as conversational alignment" aligns perfectly with IntentFlow:

**Turn-taking**:
- Seek–Use–Share creates conversational turns
- IntentFlow adds: Intent expression → System interpretation → User verification → System adjustment

**Cooperative principles** (Gricean maxims):
- Quantity: Intent dimensions provide appropriate information density
- Quality: Intent-output linking ensures responses match intent
- Relation: Intent management maintains contextual relevance
- Manner: Structured intent representation provides clarity
- Politeness: Direct manipulation respects actor agency

### 3. Bot Pattern (Referenced in Prompt.mdx)

**Addition**: Bot as Intent Interpreter
- Bot's role includes interpreting both goals and intents
- Needs to distinguish stable goals from fluid intents
- Should make its interpretation visible (synchronization)
- Must adapt to evolving intents over time (management)

### 4. Suggestion Pattern (Referenced in Prompt.mdx)

**IntentFlow Contribution**: Two types of suggestions
1. **Intent Articulation Suggestions**: Help express vague intents
2. **Intent Exploration Suggestions**: Surface alternative options

Different from content suggestions - these are meta-level suggestions about the intent itself.

### 5. Generated Content Pattern (Referenced in Prompt.mdx)

**Addition**: Intent-Linked Generation
- Generated content should be traceable to intents
- Support for intent-to-output linking
- Enable verification of intent realization
- Allow targeted revision of content by adjusting linked intents

### 6. Agency Foundation (Referenced in Prompt.mdx as precursor)

**IntentFlow Perspective**: Agency Through Intent Control
- Agency manifests through ability to:
  - Articulate preferences clearly
  - Explore alternative directions
  - Manage evolving strategies
  - Verify and adjust outcomes

## New Patterns to Create

### 1. Intent Articulation Pattern
**Intent**: Help users express vague, subconscious, or underspecified intents clearly.

**Problem**: Natural language prompts are ambiguous; users struggle to articulate everything they want.

**Solution**:
- Parse prompts into goals (stable) and intents (fluid)
- Extract both explicit and implicit intents
- Present as editable, structured components
- Enable refinement through direct manipulation

**Related**: Prompt, Suggestion, Form validation (Prerequisites to action)

### 2. Intent Exploration Pattern
**Intent**: Support users in discovering alternative or emerging directions for their intents.

**Problem**: Users may not be aware of all possibilities; exploration through prompting is cognitively demanding.

**Solution**:
- Generate adjustable dimensions for each intent
- Provide appropriate UI controls (sliders, buttons, hashtags)
- Show descriptions and impact of dimension values
- Enable quick, low-effort variation testing

**Related**: Suggestion, Progressive disclosure, Filters

### 3. Intent Management Pattern
**Intent**: Provide structured way to track, revise, and curate evolving intents over time.

**Problem**: Intents evolve during interaction; chat-based interfaces scatter them across conversation history.

**Solution**:
- Maintain intents in persistent, structured form
- Enable keep/pin for satisfying intents
- Support versioning with rollback capability
- Allow removal of outdated intents
- Build reusable intent libraries

**Related**: Version history, Bookmarks, Collections, History

### 4. Intent Synchronization Pattern
**Intent**: Align user's communicated intents with system's output through transparency and verification.

**Problem**: Opacity of prompt-to-output connection; users can't verify if intents are realized as intended.

**Solution**:
- Link each intent to corresponding output segments
- Provide visual highlighting on hover
- Show preview of how dimension changes affect output
- Enable verification before committing to changes

**Related**: Transparency, Linking, Preview, Indication

### 5. Dual Prompting Pattern
**Intent**: Support both broad task-level and narrow intent-level prompting.

**Problem**: Single prompting mechanism doesn't support both exploration and refinement.

**Solution**:
- Chat-based prompting: Free-form, affects multiple intents
- Intent-based prompting: Targeted, refines specific intent
- Both update structured intent representation
- Changes reflected in persistent intent state

**Related**: Prompt, Contextual actions, Progressive disclosure

## Conceptual Alignment with Your Framework

### Your "Intent & Interaction" Foundation Structure

Current organization:
- Seek–Use–Share (temporal framework)
- Navigation (4 categories of movement behaviors)
- Actions (5 categories of task completion)
- Conversational alignment

**Proposed Addition**: Intent Communication Layer

This could be added as a fourth major section or woven throughout:

```markdown
## Intent Communication in Interaction

How actors express, discover, manage, and verify their preferences and strategies when working with AI systems. This layer sits between actor intent and system behavior, supporting the translation of human goals into actionable system instructions.

### Intent Articulation
Supporting actors in expressing vague or subconscious preferences clearly...
[Connects to: Prerequisites to action, Navigating, Transactional search]

### Intent Exploration
Helping actors discover alternative or emerging directions...
[Connects to: Encouragement & nudges, Browsing, Exploring]

### Intent Management
Providing structure for tracking evolving strategies over time...
[Connects to: Consequences of action, Re-finding, Hunting]

### Intent Synchronization
Aligning communicated intents with system outputs through transparency...
[Connects to: Instructions for action, Commitment level, All navigation modes]
```

### Integration with Seek–Use–Share

**Trigger & need recognition** → Intent Articulation begins
- Actor recognizes gaps
- Needs help expressing what they want

**Seeking & access** → Intent Exploration
- Actor retrieves information
- Discovers what's possible

**Evaluation & relevance construction** → Intent Synchronization
- Actor assesses relevance
- Verifies intent is realized correctly

**Sense-making & integration** → Intent Management
- Actor synthesizes insights
- Curates effective strategies

**Application & behavioural enactment** → All four aspects
- Actor completes tasks
- Uses curated intents to achieve goals

**Sharing, feedback, & iterative learning** → Intent Management + Reusability
- Actor communicates outcomes
- Shares/reuses curated intent sets

## Broader Thematic Connections

### 1. Scaffolding & Progressive Disclosure
IntentFlow scaffolds intent expression through:
- Extracting implicit intents (reduces cognitive load)
- Providing dimensions as "training wheels"
- Enabling progressive refinement

### 2. Externalization & Cognitive Artifacts
Intent Panel serves as cognitive artifact:
- Externalizes internal thinking
- Enables reflection and manipulation
- Supports distributed cognition

### 3. Direct Manipulation
Strong alignment with direct manipulation principles:
- Continuous representation of intents
- Physical actions (sliders, buttons) instead of complex syntax
- Rapid, incremental, reversible operations
- Immediate visibility of results

### 4. Sensemaking
Intent communication as sensemaking process:
- Foraging for possibilities (Exploration)
- Constructing representation (Articulation)
- Organizing findings (Management)
- Verifying understanding (Synchronization)

## Questions for Further Exploration

1. **Scope of Intent**: Does your Interaction foundation consider human-AI collaboration specifically, or all interaction? IntentFlow is LLM-specific.

2. **Granularity**: Are "intents" in your navigation behaviors (e.g., "high intent" in Navigating) the same concept as IntentFlow's intents?

3. **Multi-actor**: IntentFlow focuses on single user ↔ AI. How does this extend to your Collaboration pattern?

4. **Temporal dynamics**: Your framework has temporal dimension (Seek–Use–Share). IntentFlow adds intent evolution over time. How do these interact?

5. **Domain specificity**: IntentFlow tested on writing. Which of your patterns are writing-specific vs domain-agnostic?

## Recommended Next Steps

1. **Create Intent Communication section** in Interaction.mdx
2. **Expand Prompt pattern** with four aspects framework
3. **Create 5 new patterns** (Articulation, Exploration, Management, Synchronization, Dual Prompting)
4. **Add cross-references** from Navigation/Actions sections to intent communication
5. **Consider**: Should "Intent Communication" be a separate Foundation or stay within Interaction?
6. **Review**: How does this relate to your Conversation foundation?
