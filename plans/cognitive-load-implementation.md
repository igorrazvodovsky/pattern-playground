# Cognitive Load Research Application

**Status**: Planning
**Priority**: Low-Medium (targeted enhancements to existing patterns)
**Related Research**: [Mayer & Moreno (2003) Notes](../resources/papers/mayer-moreno-2003-notes.md)

## Context

After analysing Mayer & Moreno's (2003) "Nine Ways to Reduce Cognitive Load in Multimedia Learning", identified opportunities to strengthen existing patterns with empirically-validated cognitive load principles.

**Key insight**: Cognitive load theory is a universal HCI principle (like Gestalt principles or Fitts's Law)—it should inform pattern documentation, not become a new foundation. This is an exploratory design practice focused on mapping pattern relationships, not a comprehensive design textbook.

**Audience**: Experienced designers who will benefit from concise, practical enhancements rather than extensive theoretical exposition.

## Current State

### Strong Existing Alignments

- **Density** foundation already maps to cognitive load dimensions
- **Progressive Disclosure** explicitly mentions reducing cognitive load
- **Status Feedback** already implements signalling/cueing principle
- **Learnability** addresses training demand and scaffolding
- **Onboarding** includes pre-training concepts

### Opportunities for Enhancement

Five targeted enhancements that add value without redundancy:

1. **Density**: Working memory constraints (7±2 items)
2. **Learnability**: Cognitive capacity and expertise relationship
3. **Explanation**: Redundancy warning
4. **Layout**: Spatial contiguity (optional)
5. **Temporality/Motion**: Temporal synchronisation (optional)

## Proposed Enhancements

### Enhancement 1: Density Foundation

**File**: `src/stories/foundations/Density.mdx`
**Effort**: Minimal (1-2 sentences)

**Suggested addition** in information density section:
```markdown
Working memory can typically hold 7±2 distinct items. High information density
challenges this limit—effective designs chunk related information into
meaningful units or use progressive disclosure to manage complexity.
Experienced users can process higher density through domain expertise and
pattern recognition.
```

**Rationale**: Strengthens existing strong foundation with cognitive science backing

### Enhancement 2: Learnability Foundation

**File**: `src/stories/foundations/Learnability.mdx`
**Effort**: Brief section addition

**Suggested addition** in "Training demand" section:
```markdown
### Cognitive capacity

Training demand relates directly to working memory limitations. Novices
allocate cognitive resources to both task execution and learning the interface,
while experts automate basic operations, freeing capacity for complex work.
This is why the same interface density that overwhelms beginners supports
expert efficiency—expertise effectively increases cognitive capacity through
chunking and automation.
```

**Rationale**: Natural fit with existing content on scaffolding and skill progression

### Enhancement 3: Explanation Pattern

**File**: `src/stories/patterns/Explanation.mdx`
**Effort**: Single paragraph

**Suggested addition** in "Amount of detail" section:
```markdown
### Avoiding redundancy

Multiple simultaneous explanations can increase cognitive load rather than
reduce it. Presenting identical information through multiple channels
(e.g., narration + on-screen text + visual demonstration) forces processing
the same content repeatedly. Choose the most effective modality rather than
layering redundant presentations.
```

**Rationale**: Prevents common mistake, addresses gap in current documentation

### Enhancement 4: Layout Foundation (Optional)

**File**: `src/stories/foundations/Layout.mdx`
**Effort**: Brief note

**Suggested addition**:
```markdown
### Proximity and cognitive load

Related elements should be spatially proximate. Separated labels, distant
tooltips, and scattered related content force visual scanning that increases
cognitive load. Place labels near inputs, position popovers adjacent to
triggers, and group related controls to reduce integration effort.
```

**Rationale**: Addresses spatial contiguity principle (may state the obvious for experienced designers)

### Enhancement 5: Temporality/Motion Foundation (Optional)

**File**: `src/stories/foundations/Temporality.mdx` or `Motion.mdx`
**Effort**: Brief note

**Suggested addition** (needs review for best location):
```markdown
### Temporal synchronisation

Present related information simultaneously rather than sequentially when
possible. Delayed feedback, staggered animation of related elements, or
asynchronous revelation of connected content requires holding information
in working memory, increasing cognitive load.
```

**Rationale**: Addresses temporal contiguity (may already be implicit in existing content)

## Implementation Approach

1. Review Density, Learnability, and Explanation files to find natural integration points
2. Draft concise enhancements (1-2 sentences for Density, brief section for Learnability, single paragraph for Explanation)
3. Get feedback on drafts before committing
4. Implement approved enhancements
5. Optionally address Layout and Temporality/Motion if valuable

## Success Criteria

- Enhancements feel like natural extensions of existing content
- No redundancy or overlap with other patterns
- Concise enough for experienced designer audience
- Strengthens pattern documentation without creating new theoretical foundations

## What NOT to Do

- ❌ Create "Cognitive Load" foundation (it's a universal HCI principle, not specific to this practice)
- ❌ Create "Signalling" pattern (Status Feedback already covers this)
- ❌ Create "Contiguity" pattern (belongs as notes in Layout/Temporality foundations)
- ❌ Write extensive theoretical exposition (audience is experienced designers)
- ❌ Propose adaptive complexity infrastructure (beyond current scope)

## Open Questions

1. **Layout enhancement**: Is spatial contiguity worth stating explicitly, or is it obvious to experienced designers?
2. **Temporality/Motion enhancement**: Does existing Motion/Temporality content already implicitly cover synchronisation?
3. **Research attribution**: Should Mayer & Moreno be cited in Resources sections, or is the principle more important than attribution?

## Next Steps

1. ✅ Create research notes and revised plan
2. Review existing Density, Learnability, and Explanation files to find natural integration points
3. Draft concise enhancements
4. Get feedback before committing
5. Implement approved enhancements
