# Pattern Reorganization Proposal

## Current Structure Analysis

### Current Organization
```
patterns/
├── states/
│   ├── Deletion.mdx (CRUD operation)
│   ├── Saving.mdx (CRUD operation)
│   ├── StateDisabled.mdx (UI state)
│   ├── StateEmpty.mdx (UI state)
│   └── UnavailableActions.mdx (UI state)
├── CommandMenu/
├── FocusAndContext/
├── Prompt/
└── [21 other patterns at root level]
```

### Issues with Current Structure
1. **States folder mixes concerns**: CRUD operations (Deletion, Saving) with UI states (Empty, Disabled)
2. **Inconsistent categorization**: Most patterns are at root level, only states are grouped
3. **Unclear relationships**: Related patterns are scattered (e.g., Undo is separate from Deletion/Saving)
4. **Missing logical groupings**: AI patterns, collaboration patterns, feedback patterns are mixed together

## Alternative Organization Proposals

### Option 1: By User Intent (Recommended)
Organize patterns by what the user is trying to accomplish.

```
patterns/
├── data-operations/
│   ├── Deletion.mdx
│   ├── Saving.mdx
│   ├── Undo.mdx
│   ├── ActionConsequences.mdx
│   └── Collaboration.mdx
├── feedback/
│   ├── StatusFeedback.mdx
│   ├── Notification.mdx
│   ├── StateEmpty.mdx
│   ├── StateDisabled.mdx
│   └── UnavailableActions.mdx
├── ai-assistance/
│   ├── AITuning.mdx
│   ├── Bot.mdx
│   ├── Suggestion.mdx
│   ├── EmbeddedIntelligence.mdx
│   ├── TransparentReasoning.mdx
│   └── GeneratedContent.mdx
├── information-architecture/
│   ├── ProgressiveDisclosure.mdx
│   ├── FocusAndContext/
│   ├── Overview.mdx
│   ├── Explanation.mdx
│   └── Annotation.mdx
├── interaction-models/
│   ├── CommandMenu/
│   ├── Conversation.mdx
│   ├── Prompt/
│   └── TextLense.mdx
└── user-journey/
    ├── Onboarding.mdx
    ├── ActivityLog.mdx
    └── LivingDocument.mdx
```

**Pros:**
- Clear intent-based navigation
- Related patterns are grouped together
- Easier to find patterns for specific use cases
- Aligns with user mental models

**Cons:**
- Some patterns might fit multiple categories
- Requires clear documentation of category definitions

### Option 2: By Temporal Relationship
Organize patterns by when they occur in the user interaction timeline.

```
patterns/
├── before-action/
│   ├── ActionConsequences.mdx
│   ├── StateDisabled.mdx
│   ├── UnavailableActions.mdx
│   ├── Explanation.mdx
│   └── ProgressiveDisclosure.mdx
├── during-action/
│   ├── Saving.mdx
│   ├── Deletion.mdx
│   ├── Collaboration.mdx
│   ├── CommandMenu/
│   ├── Conversation.mdx
│   └── TextLense.mdx
├── after-action/
│   ├── StatusFeedback.mdx
│   ├── Notification.mdx
│   ├── Undo.mdx
│   ├── ActivityLog.mdx
│   └── StateEmpty.mdx
└── continuous/
    ├── AITuning.mdx
    ├── Bot.mdx
    ├── EmbeddedIntelligence.mdx
    ├── LivingDocument.mdx
    └── TransparentReasoning.mdx
```

**Pros:**
- Clear temporal flow
- Helps designers think about interaction sequences
- Natural progression through user journey

**Cons:**
- Some patterns span multiple temporal phases
- Less intuitive for finding specific patterns

### Option 3: By System Responsibility
Organize by what the system is doing for the user.

```
patterns/
├── state-management/
│   ├── Saving.mdx
│   ├── Deletion.mdx
│   ├── Undo.mdx
│   ├── StateEmpty.mdx
│   ├── StateDisabled.mdx
│   └── UnavailableActions.mdx
├── communication/
│   ├── StatusFeedback.mdx
│   ├── Notification.mdx
│   ├── Explanation.mdx
│   ├── TransparentReasoning.mdx
│   └── Annotation.mdx
├── intelligence/
│   ├── AITuning.mdx
│   ├── Bot.mdx
│   ├── Suggestion.mdx
│   ├── EmbeddedIntelligence.mdx
│   └── GeneratedContent.mdx
├── interaction/
│   ├── CommandMenu/
│   ├── Conversation.mdx
│   ├── Prompt/
│   ├── TextLense.mdx
│   └── Collaboration.mdx
└── guidance/
    ├── Onboarding.mdx
    ├── ProgressiveDisclosure.mdx
    ├── ActionConsequences.mdx
    ├── FocusAndContext/
    └── Overview.mdx
```

**Pros:**
- Clear system-centric organization
- Good for implementation teams
- Clear boundaries between categories

**Cons:**
- Less user-centric
- May not align with how designers think

### Option 4: Hybrid - Primary Actions + Supporting Patterns
Two-level hierarchy focusing on core actions vs supporting patterns.

```
patterns/
├── core-actions/
│   ├── crud/
│   │   ├── Deletion.mdx
│   │   ├── Saving.mdx
│   │   └── Undo.mdx
│   ├── navigation/
│   │   ├── CommandMenu/
│   │   ├── FocusAndContext/
│   │   └── Overview.mdx
│   └── collaboration/
│       ├── Collaboration.mdx
│       ├── Conversation.mdx
│       └── ActivityLog.mdx
└── supporting-patterns/
    ├── feedback/
    │   ├── StatusFeedback.mdx
    │   ├── Notification.mdx
    │   └── TransparentReasoning.mdx
    ├── states/
    │   ├── StateEmpty.mdx
    │   ├── StateDisabled.mdx
    │   └── UnavailableActions.mdx
    ├── ai/
    │   ├── AITuning.mdx
    │   ├── Bot.mdx
    │   ├── Suggestion.mdx
    │   └── EmbeddedIntelligence.mdx
    └── guidance/
        ├── Onboarding.mdx
        ├── ProgressiveDisclosure.mdx
        ├── ActionConsequences.mdx
        └── Explanation.mdx
```

**Pros:**
- Clear distinction between primary and supporting patterns
- Easier to navigate for common tasks
- Maintains some logical grouping

**Cons:**
- Subjective distinction between core and supporting
- Two-level hierarchy might be limiting

## Immediate Actions for States Folder

Regardless of the chosen reorganization, the current states folder should be split:

### Quick Fix - Split States
```
patterns/
├── operations/  (or crud/)
│   ├── Deletion.mdx
│   └── Saving.mdx
├── ui-states/
│   ├── Empty.mdx (renamed from StateEmpty)
│   ├── Disabled.mdx (renamed from StateDisabled)
│   └── UnavailableActions.mdx
```

## Cross-Cutting Relationships

Consider adding metadata to each pattern file to indicate relationships:

```mdx
---
category: data-operations
related:
  - precedes: [StatusFeedback, Notification]
  - follows: [ActionConsequences]
  - complementary: [Undo, Saving]
  - alternatives: [SoftDelete]
temporal: during-action
intent: remove-data
---
```

## Migration Strategy

1. **Phase 1**: Add metadata to existing patterns
2. **Phase 2**: Create new folder structure alongside existing
3. **Phase 3**: Generate automatic redirects/aliases
4. **Phase 4**: Move files to new locations
5. **Phase 5**: Update all internal links
6. **Phase 6**: Remove old structure

## Recommendation

**Primary recommendation**: Option 1 (By User Intent) with metadata for cross-cutting concerns

**Reasoning**:
- Most intuitive for designers and developers
- Aligns with how people search for patterns
- Flexible enough to accommodate new patterns
- Can be supplemented with tags/metadata for other organizational views

**Immediate action**: Split the current states folder into operations and ui-states to resolve the immediate organizational conflict.