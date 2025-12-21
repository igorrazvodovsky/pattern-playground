# Cognitive Load Theory Implementation Plan

**Status**: Planning
**Priority**: High
**Related Research**: [Mayer & Moreno (2003) Notes](../resources/papers/mayer-moreno-2003-notes.md)

## Context

After analysing Mayer & Moreno's (2003) "Nine Ways to Reduce Cognitive Load in Multimedia Learning", significant opportunities exist to enhance the pattern playground's foundational principles and patterns with empirically-validated cognitive load reduction techniques.

The nine principles are:
1. **Offloading** — distribute processing across visual/auditory channels
2. **Segmenting** — user-controlled pacing and chunking
3. **Pre-training** — establish prerequisites before complexity
4. **Weeding** — eliminate seductive but irrelevant details
5. **Signalling** — cue attention to essential information
6. **Aligning** — spatial proximity of related content
7. **Eliminating redundancy** — avoid duplicate presentation
8. **Synchronising** — temporal alignment of related content
9. **Individualising** — adapt to user expertise

## Current State Assessment

### Strengths
- **Density foundation** already addresses visual, information, and temporal density
- **Progressive Disclosure pattern** explicitly mentions reducing cognitive load
- **Learnability foundation** discusses training demand and scaffolding
- **Onboarding pattern** includes just-in-time learning and pre-training concepts

### Gaps
- No explicit discussion of dual-channel processing or working memory limits
- Missing guidance on spatial/temporal contiguity principles
- No dedicated pattern for signalling/cueing attention
- Redundancy elimination not explicitly addressed
- Adaptive complexity based on expertise not well-developed
- Multimodal presentation (audio/visual) not discussed

## Implementation Roadmap

### Phase 1: Foundational Enhancements (High Priority)

#### 1.1 Create Cognitive Load Foundation Document
**Effort**: Medium | **Impact**: High | **Blocking**: No

Create `src/stories/foundations/CognitiveLoad.mdx` establishing cognitive load theory as core principle.

**Content structure**:
- Introduction to cognitive load theory
- Three assumptions (dual-channel, limited capacity, active processing)
- Three types of cognitive processing (essential, incidental, representational)
- Working memory limitations (7±2 items)
- The nine load-reduction principles
- Decision framework: which principle to apply when
- Links to all related patterns and foundations

**Dependencies**: None
**Related files**: All foundations and patterns will reference this

#### 1.2 Enhance Density Foundation
**Effort**: Low | **Impact**: High | **Blocking**: No

Enhance `src/stories/foundations/Density.mdx` with explicit cognitive load connections.

**Changes**:
- Add "Cognitive Foundations" section
- Connect visual density → visual channel capacity
- Connect information density → essential vs incidental processing
- Connect temporal density → cognitive pacing and segmentation
- Add warning about cross-modal redundancy
- Reference new CognitiveLoad foundation

**Dependencies**: CognitiveLoad.mdx
**Files to modify**: `src/stories/foundations/Density.mdx`

#### 1.3 Create Signalling & Cueing Pattern
**Effort**: Medium | **Impact**: High | **Blocking**: No

Create `src/stories/patterns/Signalling.mdx` for attention management and essential content highlighting.

**Content structure**:
- Definition and purpose
- Distinction: essential signalling vs decorative highlighting
- Techniques: visual weight, colour, motion, position, size
- Examples: highlighting changes, required fields, critical warnings
- Decision tree: when to signal vs when to reduce visual noise
- Accessibility considerations
- Anti-patterns: over-signalling, competing visual hierarchies

**Dependencies**: CognitiveLoad.mdx
**Related foundations**: Typography, Color, Motion, A11y

### Phase 2: Pattern Enhancements (Medium Priority)

#### 2.1 Enhance Progressive Disclosure Pattern
**Effort**: Medium | **Impact**: Medium | **Blocking**: No

Expand `src/stories/patterns/ProgressiveDisclosure.mdx` with specific cognitive load techniques.

**Additions**:
- Subsection: "Segmenting" (user-controlled pacing)
- Subsection: "Weeding" (removing seductive details)
- Subsection: "Pre-training" (establishing concepts before details)
- Decision tree: which technique for which scenario
- Examples of each technique in practice
- Measurement: how to validate load reduction

**Dependencies**: CognitiveLoad.mdx
**Files to modify**: `src/stories/patterns/ProgressiveDisclosure.mdx`

#### 2.2 Create Contiguity Pattern
**Effort**: Medium | **Impact**: Medium | **Blocking**: No

Create `src/stories/patterns/Contiguity.mdx` for spatial and temporal proximity principles.

**Content structure**:
- **Spatial contiguity**: related content spatially close
  - Tooltip positioning relative to triggers
  - Label placement next to inputs
  - Related content grouping
- **Temporal contiguity**: related content temporally synchronised
  - Animation timing
  - Feedback immediacy
  - Synchronised multi-step processes
- Layout examples and code samples
- Anti-patterns: separated labels, delayed feedback, scattered content

**Dependencies**: CognitiveLoad.mdx
**Related foundations**: Layout, Temporality

#### 2.3 Enhance Learnability Foundation
**Effort**: Medium | **Impact**: Medium | **Blocking**: No

Add cognitive capacity constraints to `src/stories/foundations/Learnability.mdx`.

**Additions**:
- Section: "Cognitive Capacity Constraints"
- Working memory limitations (7±2 items)
- Chunking strategies
- How expertise reduces cognitive load through automation
- Individualising principle (expertise affects capacity)
- Connection to pre-training and scaffolding

**Dependencies**: CognitiveLoad.mdx
**Files to modify**: `src/stories/foundations/Learnability.mdx`

### Phase 3: Advanced Patterns (Lower Priority)

#### 3.1 Create Multimodal Presentation Pattern
**Effort**: High | **Impact**: Low-Medium | **Blocking**: No

Create `src/stories/patterns/MultimodalPresentation.mdx` for cross-channel distribution.

**Content structure**:
- Visual vs auditory channel characteristics
- Offloading principle: when to move information between channels
- Audio guidance: voice UI, screen readers, sonification, audio feedback
- Warning: redundancy from narration + identical text
- Accessibility: multimodal as accommodation vs overload risk
- Examples: when audio helps, when it hinders

**Dependencies**: CognitiveLoad.mdx
**Related foundations**: A11y

#### 3.2 Enhance Adaptation Foundation
**Effort**: High | **Impact**: Medium | **Blocking**: No

Enhance `src/stories/foundations/Adaptation.mdx` with expertise-based complexity adaptation.

**Additions**:
- Individualising principle implementation
- Expertise-based UI adaptation
- Progressive feature revelation based on skill level
- Detection mechanisms: usage analytics, skill settings, progressive assessment
- Examples: novice vs expert views
- Privacy and transparency considerations
- Link to Learnability and Agency

**Dependencies**: CognitiveLoad.mdx
**Files to modify**: `src/stories/foundations/Adaptation.mdx`

### Phase 4: Audit & Validation

#### 4.1 Create Cognitive Load Audit Checklist
**Effort**: Medium | **Impact**: Medium | **Blocking**: No

Create `plans/cognitive-load-audit-checklist.md` for systematic pattern/component review.

**Checklist items**:
- [ ] Is information distributed across appropriate sensory channels? (Offloading)
- [ ] Can users control pacing of complex information? (Segmenting)
- [ ] Are prerequisites established before introducing complexity? (Pre-training)
- [ ] Has all non-essential "interesting" content been removed? (Weeding)
- [ ] Are users guided to essential information through clear cues? (Signalling)
- [ ] Are related elements spatially proximate? (Aligning)
- [ ] Is redundant presentation avoided? (Eliminating redundancy)
- [ ] Are related information streams temporally synchronised? (Synchronising)
- [ ] Does complexity adapt to user expertise? (Individualising)

#### 4.2 Audit Existing Patterns
**Effort**: High | **Impact**: Medium | **Blocking**: Phase 1 complete

Systematically review all patterns and components using audit checklist.

**Areas to review**:
- Tooltips and popovers (spatial contiguity)
- Onboarding flows (segmenting, pre-training)
- Dashboard layouts (information density, signalling)
- Forms (spatial contiguity, redundancy)
- Animations (temporal contiguity, synchronising)
- Help documentation (redundancy, weeding)

**Deliverable**: Report documenting violations and improvement opportunities

#### 4.3 Update CLAUDE.md
**Effort**: Low | **Impact**: Medium | **Blocking**: Phase 1 complete

Add cognitive load principles to `CLAUDE.md` for AI-assisted development.

**Section to add**:
```markdown
### Cognitive load management
- Apply Mayer & Moreno's nine principles (see CognitiveLoad foundation)
- Distribute information across visual and auditory channels when appropriate
- Enable user control over information pacing (segmenting)
- Establish prerequisites before introducing complexity (pre-training)
- Remove seductive but irrelevant details (weeding)
- Guide attention to essential information (signalling)
- Maintain spatial proximity of related elements (aligning)
- Avoid redundant information presentation
- Synchronise related information temporally
- Consider user expertise when determining interface complexity
```

## Success Metrics

### Immediate (Phase 1)
- [ ] CognitiveLoad foundation published
- [ ] Density foundation enhanced with cognitive load connections
- [ ] Signalling pattern created
- [ ] At least 3 existing patterns reference new cognitive load principles

### Medium-term (Phases 2-3)
- [ ] All 8 enhancement proposals implemented
- [ ] 50%+ of existing patterns reference cognitive load principles
- [ ] CLAUDE.md updated with cognitive load guidance

### Long-term (Phase 4)
- [ ] Cognitive load audit completed for all patterns
- [ ] Identified violations remediated
- [ ] New patterns systematically evaluated against cognitive load principles

## Open Questions

1. **Measurement**: How do we measure/validate cognitive load reduction in our patterns? User testing? Heuristic evaluation?
2. **Audio/Voice**: Should we prioritise multimodal presentation given limited current use of audio in web interfaces?
3. **Adaptive UI**: What infrastructure is needed for true adaptive complexity based on user expertise?
4. **Pattern conflicts**: Are there cases where cognitive load reduction conflicts with other principles (e.g., Agency, Shareability)?

## Dependencies & Related Work

- **Related plans**:
  - [Research workflow](./research-workflow.md)
  - Pattern reorganisation may affect where new patterns are placed
- **Related specs**: None currently
- **Blocking issues**: None
- **Blocked by**: None

## Timeline Estimate

- **Phase 1**: 2-3 documentation sessions
- **Phase 2**: 3-4 documentation sessions
- **Phase 3**: 2-3 documentation sessions
- **Phase 4**: 4-5 review/audit sessions

**Total**: ~11-15 focused sessions

## Next Immediate Actions

1. ✅ Create this implementation plan
2. Create `src/stories/foundations/CognitiveLoad.mdx` (Phase 1.1)
3. Enhance `src/stories/foundations/Density.mdx` (Phase 1.2)
4. Create `src/stories/patterns/Signalling.mdx` (Phase 1.3)
5. Review Phase 1 outputs before proceeding to Phase 2
