# Concept Design Methodology

Based on Daniel Jackson's "The Essence of Software" - https://essenceofsoftware.com/

## Quick Start Guide

### What is a Concept?
A **concept** is a reusable unit of functionality that can be understood independently. It has:
- **Purpose**: What problem it solves
- **Operational Principle (OP)**: How users achieve that purpose
- **State**: What data it maintains
- **Actions**: What operations it provides

### Example: Upvote Concept
- **Purpose**: Let users collectively rank content by quality
- **OP**: If you upvote good content and downvote bad content, then popular items will rise to the top
- **State**: Items, votes per item, user voting history
- **Actions**: upvote(), downvote(), getScore()

### How to Apply This Methodology
1. **Identify concepts** in your domain (start with user-facing functionality)
2. **Define each concept's purpose** (one clear sentence)
3. **Write operational principles** ("if...then" scenarios showing value)
4. **Model state and actions** (what data and operations are needed)
5. **Compose concepts** through synchronisation (how they work together)
6. **Refine with concept moves** (split/merge, unify/specialise, tighten/loosen)

## Key Principles

### Software = Concepts
Any software app, service or system can be viewed as a **collection of interacting concepts**. Like genes, most concepts are common across apps - all social media has Follow/Friend, content apps have Upvote, almost all apps have Password authentication.

### Concepts vs Features
- **Concepts** can be defined independently and reused between apps
- **Features** are generally inseparable from their specific app
- When you learn HackerNews has Upvote, you understand it because you've seen the same concept elsewhere

### Practical Tips
**Analysis and Design:**
- **Inventory existing apps**: List all concepts to understand strengths and weaknesses
- **Product differentiation**: Identify unique concepts that give competitive advantage
- **Define product families**: Group products by shared concepts

**Implementation Strategy:**
- **Reuse familiar concepts**: Users learn faster when concepts match their mental models
- **Align with life patterns**: Ground concepts in real-world behaviours people already know
- **Start simple**: Begin with core concepts before adding complexity
- **One purpose per concept**: If a concept serves multiple purposes, consider splitting it
- **Use concept moves for refinement**: Apply transformational moves to improve flexibility, generality, or automation

## File Structure

This methodology is split across several focused files:

- @agent-rules/concept-design-guide.md (this file) - Quick start and overview
- @agent-rules/concept-templates.md - Practical templates and examples
- @agent-rules/operational-principles.md - How to write effective "if...then" scenarios
- @agent-rules/concept-state-modeling.md - Modeling data and behavior formally
- @agent-rules/concept-composition.md - How concepts work together
- @agent-rules/concept-criteria.md - What qualifies as a good concept
- @agent-rules/concept-moves.md - Six transformational moves for refining designs

## Common Concept Examples

### Authentication Concepts
- **Account**: User registration and identity management
- **Session**: Temporary authenticated access
- **Password**: Secret-based authentication

### Content Concepts
- **Post**: Publishing content for others to see
- **Comment**: Adding responses to existing content
- **Upvote**: Collective quality ranking
- **Tag**: Categorisation and discovery

### Organisation Concepts
- **Folder**: Hierarchical content organisation
- **Search**: Content discovery by query
- **Filter**: Content refinement by criteria

### Communication Concepts
- **Message**: Private content exchange
- **Follow**: Subscribing to user content
- **Notification**: System-initiated user alerts

## Concept Moves for Design Refinement

Once you have an initial concept design, use **concept moves** to improve it. These are six transformational techniques organized in three dual pairs:

### Split ↔ Merge (Flexibility vs Simplicity)
- **Split**: Break one concept into multiple independent concepts for more user control
- **Merge**: Combine multiple concepts for simplicity and tight integration

### Unify ↔ Specialise (Generality vs Specificity)  
- **Unify**: Replace specialised concepts with one general-purpose concept
- **Specialise**: Split general concepts into optimised variants for specific scenarios

### Tighten ↔ Loosen (Automation vs Independent Control)
- **Tighten**: Increase synchronisation between concepts to prevent errors
- **Loosen**: Reduce coupling to give users more flexibility in sequencing actions

**Example**: Split a monolithic "Photocopy" concept into separate "Print" and "Scan" concepts to give users independent control over each function.

## Next Steps

1. **Start with templates**: Use @agent-rules/concept-templates.md for practical guidance
2. **Learn operational principles**: Read @agent-rules/operational-principles.md to write effective scenarios
3. **Study composition**: Understand how concepts work together in @agent-rules/concept-composition.md
4. **Master concept moves**: Apply @agent-rules/concept-moves.md to refine your designs
5. **Deep dive**: Use @agent-rules/concept-tutorials-index.md to navigate advanced topics

