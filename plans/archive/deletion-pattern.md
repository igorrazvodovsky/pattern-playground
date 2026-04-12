# Deletion Pattern Implementation Plan

## Overview
Implement deletion as a comprehensive pattern that aligns with existing patterns (Saving, Undo) and can be extended to other CRUD operations. The pattern will focus on confirmation strategies based on action consequences.

## File Structure

### 1. Core Pattern Documentation
- **Location**: `src/stories/patterns/states/Deletion.mdx`
- **Purpose**: Main pattern documentation with variants and decision tree

### 2. Action Consequences Pattern
- **Location**: `src/stories/patterns/ActionConsequences.mdx`
- **Purpose**: Standalone pattern for evaluating action severity and appropriate confirmation methods
- **Rationale**: Can be referenced by other patterns (Saving, Deletion, etc.)

### 3. Component Stories

#### Inline Confirmation Component
- **Location**: `src/stories/components/InlineConfirmation.stories.tsx`
- **Purpose**: Reusable inline confirmation button/action block
- **States**:
  - Default (action button)
  - Confirmation state (confirm/cancel buttons)
  - Processing state
  - Success feedback

#### Toast with Undo Enhancement
- **Enhancement**: Extend existing `src/stories/primitives/Toast.stories.tsx`
- **New story**: `ToastWithUndo` variant showing deletion with undo action

#### Dialog Confirmation
- **Use existing**: Reference `src/stories/components/Dialog.mdx`
- **New story**: Add `ConfirmationDialog` variant in Dialog.stories.tsx

### 4. Composite Examples
- **Location**: `src/stories/compositions/crud/DeletionExamples.stories.tsx`
- **Purpose**: Demonstrate deletion in various contexts:
  - List item deletion (inline)
  - Bulk deletion (dialog)
  - Soft delete with restoration
  - Cascading deletion (with consequences display)

## Implementation Steps

### ✅ Phase 1: Foundation (Action Consequences)
1. ✅ Created `ActionConsequences.mdx` pattern
   - ✅ Defined severity levels (low/medium/high/critical)
   - ✅ Mapped severity to confirmation methods
   - ✅ Included reversibility as a factor
   - ✅ Documented side effects and cascade operations

### ✅ Phase 2: Core Deletion Pattern
1. ✅ Created `Deletion.mdx` with:
   - ✅ Relational definition within CRUD operations
   - ✅ Anatomy (trigger, confirmation, execution, feedback)
   - ✅ Variants by confirmation method
   - ✅ States (pending, confirming, deleting, deleted)
   - ✅ Integration with Saving pattern (save/cancel paradigm)
   - ✅ Enhanced save/cancel as confirmation mechanism

### ✅ Phase 3: Component Implementation
1. ✅ Created `InlineConfirmation.stories.tsx`
   - ✅ Built reusable confirmation component
   - ✅ Supported customisable confirm/cancel labels
   - ✅ Included timeout option for auto-cancel
   - ⚠️ TODO: Add keyboard support (Enter/Escape)

2. ✅ Enhanced Toast stories
   - ✅ Added `ToastWithUndo` variant
   - ⚠️ TODO: Include countdown timer for undo window
   - ✅ Shows restoration feedback

3. ✅ Enhanced Dialog stories
   - ✅ Added `DeletionConfirmation` variant
   - ✅ Added `TypedConfirmation` variant
   - ✅ Included consequence details display
   - ✅ Supported listing affected items

### Phase 4: Composite Examples
1. Create comprehensive examples showing:
   - Single item deletion (all three variants)
   - Bulk operations with selection
   - Trash/restore pattern
   - Parent-child cascading deletion

### ✅ Phase 5: Integration
1. ✅ Updated related patterns:
   - ✅ Added bidirectional links with Saving.mdx
   - ✅ Enhanced Saving.mdx with "Save/Cancel as confirmation mechanism" section
   - ✅ Updated Action Consequences to include save/cancel workflows
   - ✅ Cross-referenced in both patterns' related sections
   - TODO: Reference in Undo.md
   - TODO: Add to StatusFeedback.mdx

## Key Design Decisions

### Confirmation Threshold Model
```
Low consequence (< 2 seconds to recreate):
  → No confirmation OR toast with undo

Medium consequence (minutes to recreate):
  → Inline confirmation

High consequence (hours to recreate or affects others):
  → Modal dialog with explanation

Critical (irreversible or wide impact):
  → Multi-step confirmation with typed confirmation
```

### Save/Cancel Integration
- Deletion can be part of broader form changes
- "Save" commits deletions, "Cancel" reverts them
- Enables batch operations with single confirmation

### Accessibility Considerations
- ARIA live regions for status updates
- Focus management after deletion
- Keyboard navigation for all confirmation methods
- Screen reader announcements for state changes

## Story Hierarchy
```
Patterns/
  ├── Action Consequences (new)
  └── States/
      └── Deletion* (new)

Components/
  ├── Dialog (enhanced)
  └── Inline Confirmation* (new)

Primitives/
  └── Toast (enhanced)

Compositions/
  └── CRUD/
      └── Deletion Examples* (new)
```

## Completed Files

### Pattern Documentation
- ✅ `src/stories/patterns/ActionConsequences.mdx` - Framework for evaluating action severity
- ✅ `src/stories/patterns/states/Deletion.mdx` - Main deletion pattern with variants

### Component Stories  
- ✅ `src/stories/components/InlineConfirmation.stories.tsx` - New inline confirmation component
- ✅ `src/stories/primitives/Toast.stories.tsx` - Enhanced with `ToastWithUndo` variant
- ✅ `src/stories/components/Dialog.stories.tsx` - Enhanced with `DeletionConfirmation` and `TypedConfirmation` variants

## Related Patterns to Reference
- Saving (state management)
- Undo (reversibility)
- Status Feedback (confirmation messages)
- Activity Log (deletion history)
- Notification (deletion alerts)

## Future Considerations
- Extend to other CRUD operations (Create, Update)
- Add permission-based deletion variants
- Include scheduled deletion pattern
- Document bulk operation optimisations
- Add keyboard support to inline confirmation
- Add countdown timer to undo toasts
- Create composite CRUD examples