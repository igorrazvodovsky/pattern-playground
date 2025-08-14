# Universal Commenting State Management Plan

## Objective
Build robust, entity-agnostic commenting infrastructure that can support quotes, documents, tasks, and any future entity types.

## Phase 1: Core State Management

### 1.1 Universal Comment Store
- **File**: `src/services/commenting/state/universal-comment-store.ts`
- **Purpose**: Zustand store for all commenting state
- **Features**:
  - Entity-agnostic comment storage
  - LocalStorage persistence with proper serialization
  - Optimistic updates
  - Comment subscriptions by entity

```typescript
interface UniversalCommentState {
  // Key format: `${entityType}:${entityId}`
  commentsByEntity: Map<string, EntityComment[]>

  // UI state
  activeEntity: { type: string; id: string } | null

  // Actions
  addComment: (entityType: string, entityId: string, comment: Omit<EntityComment, 'id' | 'timestamp'>) => void
  getComments: (entityType: string, entityId: string) => EntityComment[]
  resolveComment: (commentId: string) => void
  deleteComment: (commentId: string) => void
  setActiveEntity: (entityType: string, entityId: string) => void
}

interface EntityComment {
  id: string
  entityType: string // 'quote', 'document', 'task', etc.
  entityId: string
  content: RichContent | string
  authorId: string
  timestamp: Date
  status: 'active' | 'resolved'
  replyTo?: string | null
}
```

### 1.2 Universal Commenting Service
- **File**: `src/services/commenting/universal-commenting-service.ts`
- **Purpose**: Business logic layer on top of the store
- **Features**:
  - Comment CRUD operations
  - Integration with existing `RichContent` types
  - Thread-like grouping per entity
  - Comment validation and error handling

```typescript
class UniversalCommentingService {
  // Core operations
  addComment(entityType: string, entityId: string, content: RichContent | string, authorId: string): EntityComment
  getCommentsForEntity(entityType: string, entityId: string): EntityComment[]
  resolveComment(commentId: string, resolvedBy: string): void
  deleteComment(commentId: string, deletedBy: string): boolean

  // Thread-like operations (comments grouped by entity)
  getCommentThread(entityType: string, entityId: string): EntityCommentThread
  getActiveCommentCount(entityType: string, entityId: string): number
  getResolvedCommentCount(entityType: string, entityId: string): number

  // Search and filtering
  searchComments(query: string, entityType?: string): EntityComment[]
  getCommentsBy Author(authorId: string): EntityComment[]
  getRecentComments(limit?: number): EntityComment[]
}

interface EntityCommentThread {
  entityType: string
  entityId: string
  comments: EntityComment[]
  participants: string[]
  status: 'active' | 'resolved'
  createdAt: Date
  updatedAt: Date
}
```

### 1.3 Universal Comment Hooks
- **File**: `src/services/commenting/hooks/use-universal-commenting.ts`
- **Purpose**: React hooks for commenting functionality
- **Features**:
  - Entity-specific comment subscriptions
  - Optimistic UI updates
  - Error handling and loading states

```typescript
// Get comments for a specific entity
export const useEntityComments = (entityType: string, entityId: string) => {
  const comments = useCommentStore(state => state.getComments(entityType, entityId))
  const isLoading = useCommentStore(state => state.isLoading)

  return { comments, isLoading }
}

// Add comment to entity
export const useAddComment = () => {
  const addComment = useCommentStore(state => state.addComment)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitComment = async (entityType: string, entityId: string, content: RichContent | string, authorId: string) => {
    setIsSubmitting(true)
    try {
      await addComment(entityType, entityId, { content, authorId, status: 'active' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return { submitComment, isSubmitting }
}

// Comment thread operations
export const useCommentThread = (entityType: string, entityId: string) => {
  const service = useCommentingService()
  const thread = service.getCommentThread(entityType, entityId)

  const resolveThread = (resolvedBy: string) => {
    thread.comments.forEach(comment => {
      if (comment.status === 'active') {
        service.resolveComment(comment.id, resolvedBy)
      }
    })
  }

  return { thread, resolveThread }
}
```

## Phase 2: Persistence Integration

### 2.1 Local Storage Adapter
- **File**: `src/services/commenting/storage/local-storage-adapter.ts`
- **Purpose**: Handle localStorage persistence with proper serialization
- **Features**:
  - Serialize/deserialize comment data
  - Merge with existing shared-data comments on load
  - Handle storage quotas and cleanup

### 2.2 Shared Data Integration
- **File**: `src/services/commenting/storage/shared-data-integration.ts`
- **Purpose**: Bridge between universal commenting and existing shared-data
- **Features**:
  - Load existing comments from `comments.json` into universal store
  - Transform existing comment format to universal format
  - Maintain backward compatibility

## Phase 3: Universal UI Components Foundation

### 3.1 Universal Comment Interface
- **File**: `src/components/commenting/universal/UniversalCommentInterface.tsx`
- **Purpose**: Generic comment display + input component
- **Features**:
  - Uses existing `RichCommentComposer` and `RichCommentRenderer`
  - Entity-agnostic interface
  - Handles comment threads, replies, resolution
  - Integrates with universal commenting hooks

### 3.2 Universal Comment Thread Renderer
- **File**: `src/components/commenting/universal/UniversalCommentThreadRenderer.tsx`
- **Purpose**: Display comment threads for any entity type
- **Features**:
  - Reuses existing comment styling patterns
  - Shows participants, timestamps, status
  - Handles empty states and loading states

## Integration Points

### With Existing Systems:
- **`RichCommentComposer`**: Use for comment input (already exists)
- **`RichCommentRenderer`**: Use for comment display (already exists)
- **`comments.json`**: Load existing comments into universal store
- **`EntityCommentInterface`**: Replace with universal version

### State Management Pattern:
```typescript
// Universal store structure
{
  commentsByEntity: {
    "quote:quote-reshaping-ecosystems": [...comments],
    "document:doc-climate-change": [...comments],
    "task:task-123": [...comments]
  },
  activeEntity: { type: "quote", id: "quote-reshaping-ecosystems" }
}
```

## Benefits
- **Entity-agnostic**: Works with any entity type (quotes, documents, tasks, etc.)
- **Consistent state management**: Single source of truth for all comments
- **Reusable components**: Comment UI works everywhere
- **Future-proof**: Easy to add new entity types
- **Proper persistence**: localStorage with merge capabilities

## Success Criteria
- Universal comment store managing all comment state
- Any entity type can have comments via simple API: `addComment(entityType, entityId, content, author)`
- Existing comments from `comments.json` loaded and accessible
- UI components work with any entity type
- LocalStorage persistence working correctly