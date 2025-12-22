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

Four targeted enhancements that add value without redundancy:

1. **Density**: Working memory constraints (~4 chunks, not 7±2)
2. **Learnability**: Cognitive capacity and expertise relationship
3. **Mastery**: Automation frees cognitive resources (brief connection)
4. **Explanation**: Redundancy warning

## Proposed Enhancements

### Enhancement 1: Density Foundation

**File**: `src/stories/foundations/Density.mdx`
**Effort**: Minimal (2-3 sentences)

**Suggested addition** in information density section:
```markdown
Working memory can hold roughly 3-5 chunks of information at once. High
information density challenges this constraint—effective designs group related
information into meaningful units that can be processed as single chunks.
Expertise expands effective capacity: experienced users recognise domain
patterns and automatically chunk information, enabling them to process higher
density interfaces that would overwhelm novices.
```

**Rationale**: Uses current research (Cowan's ~4 chunks vs outdated Miller's 7±2), explains chunking mechanism that connects to expertise

### Enhancement 2: Learnability Foundation

**File**: `src/stories/foundations/Learnability.mdx`
**Effort**: Brief section addition

**Suggested addition** in "Training demand" section:
```markdown
### Cognitive capacity

Training demand relates directly to working memory constraints. Novices
allocate cognitive resources to both interface operation and task execution,
while experts automate basic operations, freeing capacity for complex work.
Expertise effectively expands cognitive capacity through chunking and
automation—the same interface density that overwhelms beginners supports
expert efficiency.
```

**Rationale**: Natural fit with existing content on scaffolding and skill progression

### Enhancement 3: Mastery Pattern

**File**: `src/stories/patterns/Mastery.mdx`
**Effort**: Single sentence addition

**Suggested addition** in "Accelerators" section, after line 17:
```markdown
Automation through accelerators reduces cognitive load—memorised shortcuts and
gestures become automatic, freeing working memory for domain-level thinking
rather than interface mechanics.
```

**Rationale**: Connects existing accelerators content to cognitive benefit; reinforces why experts can handle higher complexity

### Enhancement 4: Explanation Pattern

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

## Implementation Approach

1. Review Density, Learnability, Mastery, and Explanation files to find natural integration points
2. Draft concise enhancements using current research (3-5 chunks, not 7±2)
3. Get feedback on drafts before committing
4. Implement approved enhancements

## Success Criteria

- Enhancements feel like natural extensions of existing content
- Use current cognitive science research (Cowan's ~4 chunks, not outdated Miller's 7±2)
- No redundancy or overlap with other patterns
- Concise enough for experienced designer audience
- Strengthens pattern documentation without creating new theoretical foundations

## What NOT to Do

- ❌ Create "Cognitive Load" foundation (it's a universal HCI principle, not specific to this practice)
- ❌ Create "Signalling" pattern (Status Feedback already covers this)
- ❌ Reference outdated "7±2" research (current consensus is ~4 chunks)
- ❌ Add obvious spatial/temporal contiguity notes (experienced designers know this)
- ❌ Write extensive theoretical exposition (audience is experienced designers)

## Open Questions

1. **Research attribution**: Should Mayer & Moreno (2003) and Cowan (2001) be cited in Resources sections?
2. **Mastery enhancement**: Is single sentence enough, or would brief paragraph add more value?

## Next Steps

1. ✅ Create research notes and revised plan
2. ✅ Research current working memory capacity findings (Cowan's ~4 chunks)
3. ✅ Update enhancement proposals with current research
4. Review existing Density, Learnability, Mastery, and Explanation files for integration points
5. Draft final enhancement text based on approved proposals
6. Implement enhancements
