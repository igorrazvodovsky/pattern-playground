# Minimalism Heuristics Revisited - Notes

## Metadata
- **Title**: Minimalism Heuristics Revisited: Developing a Practical Review Tool
- **Authors**: Jenni Virtaluoto, Tytti Suojanen, Suvi Isohella
- **Year**: 2019
- **Source/Conference**: Technical Communication (journal)
- **Link**: Published in Technical Communication journal; manuscript accepted August 2019
- **Tags**: #research, #documentation, #minimalism, #heuristics, #help

## 1. Executive summary

A practitioner-focused article revising van der Meij & Carroll's (1995) minimalism heuristics into a practical evaluation tool for technical documentation. The revised heuristics are organized into 3 categories (down from 4 original principles) and tested through a company pilot study.

**Why selected**: The paper's frameworks for structuring help content (do/study/locate) and error-oriented assistance could enrich the Help pattern's taxonomy.

**Scope limitation**: This addresses *technical documentation* (user manuals, help systems) specifically, not UI interaction design broadly. Application should be targeted to help/guidance patterns.

## 2. Key concepts & frameworks

### Original minimalism principles (van der Meij & Carroll, 1995)

| # | Principle | Heuristics |
|---|-----------|------------|
| 1 | Choose an action-oriented approach | Immediate opportunity to act; encourage exploration; respect user's activity |
| 2 | Anchor the tool in the task domain | Real tasks; instruction reflects task structure |
| 3 | Support error recognition and recovery | Prevent mistakes; provide error info when error-prone; support detection, diagnosis, recovery; on-the-spot error info |
| 4 | Support reading to do, study and locate | Be brief; provide closure for chapters |

### Revised heuristics (Virtaluoto et al., 2019)

Reorganized into 3 categories with extended sub-heuristics:

**1. Core tasks and goal-orientation**
- 1.1 Focus on user's core tasks
- 1.2 Reflect real-life task structure
- 1.3 Explain *why* (not just *how*)
- 1.4 Enable immediate work on real tasks
- 1.5 Available when needed
- 1.6 Targeted at relevant touch points

**2. Accessibility**
- 2.1 Concise content selection
- 2.2 Logical, consistent structure
- 2.3 Findability (TOC, index, headings, search)
- 2.4 Understandability (chunking, action-oriented steps, simple language)
- 2.5 Visual clarity

**3. Error management**
- 3.1 Prevent errors
- 3.2 Safety standards compliance
- 3.3 Necessary warnings only
- 3.4 Warnings near relevant procedure
- 3.5 Error info: recognition, diagnosis, solution
- 3.6 Error info near relevant procedure
- 3.7 Troubleshooting section

### Three reading modes (from Principle 4)

A key framework for understanding *why* users seek help:

| Mode | Purpose | Example |
|------|---------|---------|
| Reading to do | Execute a task right now | "How do I export this?" |
| Reading to study | Build mental models | "Why does this work this way?" |
| Reading to locate | Find specific information | "What's the keyboard shortcut for X?" |

## 3. Design implications (general)

- **DI1**: Help content should be organised by user purpose (do/study/locate), not just by topic or feature.
- **DI2**: Error-related help is distinct from normal guidance - it needs proximity to error-prone actions and should support recognition → diagnosis → recovery.
- **DI3**: "Minimalism" in documentation means task-focused efficiency, not visual spareness or content reduction for its own sake.
- **DI4**: The "user journey" framing emphasises help availability at touch points, not just in a centralised help centre.

## 4. Technical architecture / implementation details

The paper proposes a *Minimalist Documentation Process* (Figure 1):

1. Collect user and product information
2. Plan documentation (always go through user journey)
3. Write and illustrate
4. Review and test (apply heuristics here)
5. Update
6. Final review
7. Publish
8. Collect feedback (apply heuristics here too)

The heuristics function as an *evaluation tool* at review phases, not a design/writing guide.

## 5. Application to Pattern Playground

### 5.1 Existing foundations analysis

| Paper concept | Existing file | Assessment |
|--------------|---------------|------------|
| Cognitive efficiency | [Density.mdx](../../../src/stories/foundations/Density.mdx) | **Aligned** - explicitly mentions "minimalism", covers chunking, cites Mayer & Moreno |
| Progressive revelation | [ProgressiveDisclosure.mdx](../../../src/stories/patterns/ProgressiveDisclosure.mdx) | **Aligned** - addresses cognitive load reduction |
| Task-orientation | [Interaction.mdx](../../../src/stories/foundations/Interaction.mdx) | **Aligned** - Seek-Use-Share framework |
| Error management | [StatusFeedback.mdx](../../../src/stories/patterns/StatusFeedback.mdx), [Undo.mdx](../../../src/stories/patterns/Undo.mdx) | **Aligned** - substantial coverage |
| Help structure | [Help.mdx](../../../src/stories/patterns/Help.mdx) | **Partial** - has depth spectrum but missing purpose dimension |
| Learnability | [Learnability.mdx](../../../src/stories/foundations/Learnability.mdx) | **Aligned** - extensive coverage of scaffolding |

### 5.2 Gap analysis

**Gap identified**: Help.mdx organises help by *depth of inquiry* (How → Why → What now) but doesn't address:
- **User purpose**: The do/study/locate framework adds a complementary dimension
- **Error context**: Recovery-oriented help is partially covered by "Agentic" but could be more explicit
- **Locate mode**: Finding specific information is implicit (search) but not framed as distinct help mode

**Not a gap**: Minimalism as a foundation - this is a universal principle that already informs Density and Progressive Disclosure, not a project-specific concept.

### 5.3 Proposed enhancement

Enhance Help.mdx to add a *user purpose* dimension alongside the existing depth spectrum:

| Purpose | Description | Mechanisms |
|---------|-------------|------------|
| Do | Execute task now | Tooltips, input hints, inline guidance |
| Study | Build mental model | Explanations, documentation, "learn more" |
| Locate | Find specific info | Search, index, command palette, glossary |
| Recover | Fix error/get unstuck | Error messages, troubleshooting, contextual suggestions |

### 5.4 Action items

- [x] Create notes file
- [x] Enhance Help.mdx with user-purpose framing (Do/Study/Locate/Recover)
- [x] Restore Interface vs Domain distinction as "Subject matter" dimension
- [x] Add placement guidance ("What belongs where") based on minimalism's proximity principle
