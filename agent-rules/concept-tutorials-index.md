# Concept Design Methodology - Complete Reference

This directory contains Daniel Jackson's concept design methodology organized into focused, practical files.

## Quick Start

**New to concept design?** Start here:
1. **@agent-rules/concept-design-guide.md** - Overview and core principles (5 min read)
2. **@agent-rules/concept-templates.md** - Practical templates and examples (10 min read)
3. **@agent-rules/operational-principles.md** - Writing effective "if...then" scenarios (15 min read)

## File Organization

### Essential Files (Start Here)
- **@agent-rules/concept-design-guide.md** - Quick start guide and key principles
- **@agent-rules/concept-templates.md** - Templates, examples, checklists, anti-patterns
- **@agent-rules/operational-principles.md** - How to write compelling OPs

### Advanced Theory
- **@agent-rules/concept-state-modeling.md** - Formal state machine modeling
- **@agent-rules/concept-composition.md** - How concepts work together via sync
- **@agent-rules/concept-criteria.md** - What qualifies as a good concept
- **@agent-rules/concept-moves.md** - Six transformational moves for refining concept designs

## Methodology Summary

### Core Idea
Software = collection of interacting **concepts**. Each concept is an independent, reusable unit with:
- **Purpose**: What problem it solves (one sentence)
- **Operational Principle**: "If [user action], then [valuable result]"
- **State**: Data structures needed
- **Actions**: Operations provided

### Key Benefits
- **Reusability**: Same concepts appear across apps (Follow, Upvote, Search)
- **Understandability**: Users learn faster when concepts match mental models
- **Design clarity**: Focus on essential behavior, not implementation
- **Communication**: Easy to explain to stakeholders and team members

### 5-Step Process
1. **Identify concepts** in your domain
2. **Define purpose** for each (one clear sentence)
3. **Write operational principles** showing user value
4. **Model state and actions** (essential data/operations only)
5. **Compose concepts** through synchronization

### Concept Refinement
After initial design, use **concept moves** to improve your design:
- **Split/Merge**: Trade flexibility vs simplicity
- **Unify/Specialise**: Trade generality vs specificity  
- **Tighten/Loosen**: Trade automation vs independent control

## Common Concept Examples

### Authentication & Access
- **Account** - User registration and identity
- **Session** - Temporary authenticated access
- **Password** - Secret-based authentication
- **Role** - Permission-based access control

### Content & Social
- **Post** - Publishing content for others
- **Comment** - Responses to existing content
- **Upvote** - Collective quality ranking
- **Follow** - Subscribing to user content
- **Tag** - Categorization and discovery

### Organization & Productivity
- **Folder** - Hierarchical organization
- **Search** - Content discovery by query
- **Bookmark** - Personal content saving
- **Task** - Work item tracking

## Quick Reference

### Good Operational Principle Template
"If [specific user action], then [valuable system response]"

Examples:
- "If you upvote quality content, then the best items rise to the top"
- "If you follow someone, then their new content appears in your feed"
- "If you tag content with keywords, then you can find related items by searching"

### Design Quality Checklist
- [ ] Can users understand each concept independently?
- [ ] Does each concept solve one clear problem?
- [ ] Are operational principles compelling and specific?
- [ ] Do concepts align with real-world patterns?
- [ ] Are concepts reusable across contexts?

## Background

This methodology comes from Daniel Jackson's book **"The Essence of Software"** and research at MIT. It provides a structured way to think about software design that focuses on user-facing functionality rather than technical implementation.

**Key insight**: Most software complexity comes from concept interactions, not individual concepts. By designing clean, independent concepts and composing them carefully, we can build software that's both powerful and understandable.

## Getting Help

- **For practical application**: Start with templates and examples
- **For theoretical understanding**: Read the complete tutorials
- **For specific questions**: Focus on the relevant specialized file
- **For quick reference**: Use this index to navigate

The methodology is most powerful when applied iteratively - start simple, test with users, refine concepts based on feedback.