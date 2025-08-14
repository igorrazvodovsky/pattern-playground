# Reference System Unification Plan

## Current State Analysis

### Architecture Overview
The reference system currently has **two separate implementations**:

1. **`Reference.tsx`** - TipTap **Node** extension for @-mention style references
2. **`ReferenceMark.ts`** - TipTap **Mark** extension for quote annotation

### Current Usage Patterns

#### Reference.tsx (Node-based)
- **Used in**: ReferenceEditor, Stories, BlockBasedEditor, Prompt patterns
- **Trigger**: User types `@` → popup appears → user selects → inserts structured node
- **Purpose**: Interactive mention insertion (@user, @document, @project, @quote)
- **Data flow**: Uses `createReferenceSuggestion()` with category-based picker UI
- **Structure**: Atomic inline nodes with metadata, click handlers, item-view integration

#### ReferenceMark.ts (Mark-based) 
- **Used in**: Quote commenting system (BubbleMenu.stories.tsx)
- **Trigger**: Programmatically applied to selected text
- **Purpose**: Convert existing text spans into clickable quote references
- **Data flow**: Applied via `editor.chain().setMark('reference')` commands
- **Structure**: Text marks with reference attributes (id, type, label)

### Integration Points

#### Existing Reference Categories
```typescript
// From shared-data/index.ts
const referenceCategories = [
  { id: 'users', children: users },
  { id: 'documents', children: documents },  
  { id: 'projects', children: projects },
  { id: 'quotes', children: quotes }  // Already supports quotes!
]
```

#### Quote Integration Points
- **Quote Service**: `src/services/commenting/quote-service.js`
- **Quote Objects**: Stored in `src/stories/shared-data/quotes.json`
- **TipTap Integration**: `src/components/commenting/tiptap/use-tiptap-quote-integration.ts`
- **UI Layer**: `src/components/commenting/hooks/use-quote-comment-ui.ts`

## Migration Strategy

### Phase 1: Enhance Reference Node for Quote Support

#### 1.1 Add Quote-Specific Commands to Reference.tsx
```typescript
// Extend existing Reference Node
addCommands() {
  return {
    ...this.parent?.(),
    
    // NEW: Convert selected text to quote reference
    convertSelectionToQuoteReference: (quoteData: QuoteObject) => ({ commands, state }) => {
      const { from, to } = state.selection;
      if (from === to) return false;
      
      return commands.insertContentAt(
        { from, to },
        {
          type: 'reference',
          attrs: {
            id: quoteData.id,
            label: quoteData.name,
            type: 'quote',
            metadata: quoteData.metadata
          }
        }
      );
    },
    
    // NEW: Create quote reference from text
    createQuoteReference: (attrs: QuoteReferenceAttrs) => ({ commands }) => {
      return commands.insertContent({
        type: 'reference', 
        attrs
      });
    }
  };
}
```

#### 1.2 Update Reference Node Styling
```typescript
// Add quote-specific CSS classes
renderHTML({ node, HTMLAttributes }) {
  const classes = ['reference-mention'];
  
  if (node.attrs.type === 'quote') {
    classes.push('reference-mention--quote');
  }
  
  return ['span', mergeAttributes(HTMLAttributes, { 
    class: classes.join(' '),
    'data-reference-type': node.attrs.type,
    'data-reference-id': node.attrs.id
  }), 0];
}
```

### Phase 2: Update Quote Integration Layer

#### 2.1 Migrate useTipTapQuoteIntegration
```typescript
// FROM: ReferenceMark-based approach
editor.chain().setMark('reference', attrs).run();

// TO: Reference Node-based approach  
editor.commands.convertSelectionToQuoteReference(quoteObject);
```

#### 2.2 Update Quote Service Integration
- Replace ReferenceMark creation with Reference Node creation
- Update existing quote validation to work with Node structure
- Maintain backward compatibility with existing quote data

### Phase 3: Component Migration

#### 3.1 Update BubbleMenu.stories.tsx
```typescript
// BEFORE: Uses ReferenceMark
import { ReferenceMark } from '../../components/reference/index.js';
extensions: [StarterKit, Highlight, ReferenceMark]

// AFTER: Uses enhanced Reference Node
import { Reference, createReferenceSuggestion } from '../../components/reference/index.js';
extensions: [
  StarterKit, 
  Highlight,
  Reference.configure({
    suggestion: createReferenceSuggestion(quoteCategories),
  })
]
```

#### 3.2 Update Quote Commenting Hooks
```typescript
// Update use-tiptap-quote-integration.ts
const createQuote = useCallback(() => {
  // BEFORE: Applied ReferenceMark
  // editor.chain().setMark('reference', attrs).run();
  
  // AFTER: Uses Reference Node commands
  const quote = quoteService.createFromTipTapSelection(editor, currentUser, documentId);
  return editor.commands.convertSelectionToQuoteReference(quote);
}, [editor, quoteService]);
```

### Phase 4: Data Structure Unification

#### 4.1 Standardize Reference Attributes
```typescript
// Unified reference attributes for both mentions and quotes
interface ReferenceAttrs {
  id: string;
  label: string; 
  type: ReferenceType; // 'user' | 'document' | 'project' | 'quote'
  metadata?: {
    // Quote-specific
    sourceDocument?: string;
    sourceRange?: { from: number; to: number };
    selectedText?: string;
    createdBy?: string;
    createdAt?: string;
    
    // User-specific  
    role?: string;
    department?: string;
    
    // Common
    [key: string]: unknown;
  };
}
```

#### 4.2 Update Document Content Structure
```json
// BEFORE: Mixed highlight marks and reference marks
{
  "type": "text",
  "marks": [{"type": "highlight"}], 
  "text": "reshaping ecosystems"
}

// AFTER: Unified Reference nodes
{
  "type": "reference",
  "attrs": {
    "id": "quote-reshaping-ecosystems",
    "type": "quote", 
    "label": "reshaping ecosystems"
  }
}
```

### Phase 5: Cleanup and Optimization

#### 5.1 Remove ReferenceMark
- Delete `src/components/reference/ReferenceMark.ts`
- Update exports in `src/components/reference/index.ts`
- Remove ReferenceMark imports across codebase

#### 5.2 Update CSS
- Consolidate `.reference-mention` styles
- Maintain `.reference-mention--quote` specific styling
- Remove unused mark-specific CSS

#### 5.3 Type System Cleanup
- Remove ReferenceMark-specific types
- Consolidate reference types in `src/components/reference/types.ts`
- Update shared-data type exports

## Benefits of Unified Approach

### 1. Architectural Consistency
- **Single source of truth** for all reference behavior
- **Consistent interaction patterns** across mention types
- **Unified styling system** for all references

### 2. Enhanced Functionality
- **Rich metadata support** for all reference types
- **Interactive click handlers** work uniformly
- **Item-view integration** available for quotes
- **Cross-document referencing** works seamlessly

### 3. Developer Experience
- **Simplified API** - one extension instead of two
- **Consistent commands** for programmatic use
- **Better TypeScript support** with unified types
- **Easier maintenance** with single codebase

### 4. User Experience
- **Consistent visual treatment** across references
- **Uniform interaction patterns** 
- **Progressive disclosure** via item-view adapters
- **Better accessibility** with semantic structure

## Implementation Timeline

### Week 1: Core Node Enhancement
- [ ] Extend Reference Node with quote commands
- [ ] Add quote-specific styling and attributes
- [ ] Update reference types and interfaces

### Week 2: Integration Layer Migration  
- [ ] Migrate useTipTapQuoteIntegration to Node-based
- [ ] Update quote service integration
- [ ] Test quote creation and click handling

### Week 3: Component Updates
- [ ] Update BubbleMenu.stories.tsx
- [ ] Migrate quote commenting hooks
- [ ] Update document content structure

### Week 4: Cleanup and Polish
- [ ] Remove ReferenceMark extension
- [ ] Consolidate CSS and types
- [ ] Update documentation and stories
- [ ] Performance testing and optimization

## Risk Mitigation

### Backward Compatibility
- Maintain existing quote data structure during transition
- Provide migration utilities for existing documents
- Keep both systems working during migration period

### Testing Strategy
- Unit tests for Reference Node commands
- Integration tests for quote workflow
- Visual regression tests for styling
- Performance benchmarks for large documents

### Rollback Plan
- Feature flags for new vs old system
- Database migration reversibility
- Component-level rollback capability

## Success Criteria

- [ ] Single Reference Node handles both mentions and quotes
- [ ] All existing quote functionality preserved
- [ ] Performance equivalent or better
- [ ] No regressions in user experience
- [ ] Simplified codebase with unified architecture
- [ ] Full test coverage maintained