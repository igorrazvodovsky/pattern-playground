# Universal Commenting Architecture

## Overview

The Universal Commenting System provides a clean, pointer-based architecture for adding comments to any object in the application.

## Architecture Layers

### 1. Core Universal System (`/core`)
Framework-agnostic TypeScript implementation:
- **CommentPointer**: Interface that makes any object commentable
- **CommentService**: Singleton service managing all comment operations
- **CommentStorage**: Abstraction for persistence (with LocalStorage implementation)
- **EventEmitter**: Pub/sub system for real-time updates

### 2. React Integration (`/hooks`)
React hooks connecting the core system to UI:
- **useCommenting**: Universal hook for commenting on any pointer
- **useEditorCommenting**: Enhanced hook for editor-specific features (quote creation)

### 3. UI Components (`/components`)
React components for rendering comments:
- **TaskComments**: Example of commenting on non-editor entities
- **EditorWithQuoteComments**: Example of quote creation and commenting in editor

## Key Concepts

### CommentPointer
The foundation of universal commenting. Any object can be made commentable by creating a pointer:

```typescript
// Make a task commentable
const taskPointer = new EntityPointer('task', taskId);

// Make a quote commentable
const quotePointer = new QuotePointer(quoteId, quoteObject);

// Custom pointer for any object type
class CustomPointer extends BaseCommentPointer {
  // Implementation...
}
```

### Clean Separation of Concerns

1. **Comment System doesn't know about editors**: The core system works with pointers, not specific UI contexts
2. **Editor Plugin doesn't own comments**: It provides quote creation capabilities but delegates to the comment service
3. **UI connects everything**: React components use hooks to bridge the core system with user interactions

## Usage Examples

### Basic Entity Commenting
```tsx
function ProjectComments({ project }) {
  const pointer = new EntityPointer('project', project.id);
  const { comments, createComment } = useCommenting(pointer);

  return (
    <div>
      {comments.map(c => <Comment key={c.id} {...c} />)}
      <CommentForm onSubmit={createComment} />
    </div>
  );
}
```

### Editor Quote Commenting
```tsx
function Editor({ documentId }) {
  const {
    createQuoteFromSelection,
    activePointer,
    comments
  } = useEditorCommenting(editor, { documentId });

  return (
    <>
      <button onClick={createQuoteFromSelection}>
        Comment on Selection
      </button>
      {activePointer && <CommentPopover comments={comments} />}
    </>
  );
}
```

## Adding New Commentable Types

Adding a new commentable object type requires minimal code:

1. **Create a Pointer Class** (~20 lines):
```typescript
class IssuePointer extends BaseCommentPointer {
  readonly type = 'issue';

  constructor(readonly id: string, private issue: Issue) {
    super();
  }

  serialize(): string {
    return JSON.stringify({ type: this.type, id: this.id });
  }

  async getContext(): Promise<PointerContext> {
    return {
      title: `Issue #${this.issue.number}`,
      excerpt: this.issue.title,
      metadata: { status: this.issue.status }
    };
  }
}
```

2. **Use in Component** (~10 lines):
```tsx
function IssueComments({ issue }) {
  const pointer = new IssuePointer(issue.id, issue);
  const { comments, createComment } = useCommenting(pointer);

  return <CommentInterface comments={comments} onSubmit={createComment} />;
}
```

## Migration from Old System

### What Changed
- **Removed**: CommentSystemProvider, use-comment-ui, pointer adapter registry
- **Replaced**: Context-based state → Singleton service with hooks
- **Simplified**: Complex pointer adapters → Simple pointer classes

### Migration Steps
1. Replace `CommentSystemProvider` with direct hook usage
2. Convert entity-specific adapters to pointer classes
3. Update UI components to use `useCommenting` hook
4. Remove old context dependencies

## API Reference

### Core Classes

#### CommentService
```typescript
class CommentService {
  createComment(pointer, content, authorId, parentId?): Promise<Comment>
  getComments(pointer): Promise<Comment[]>
  updateComment(id, content): Promise<Comment>
  deleteComment(id): Promise<boolean>
  getThread(pointer): Promise<CommentThread>
  resolveThread(pointer): Promise<boolean>
}
```

#### CommentPointer Interface
```typescript
interface CommentPointer {
  readonly id: string
  readonly type: string
  serialize(): string
  equals(other: CommentPointer): boolean
  getContext(): Promise<PointerContext>
}
```

### React Hooks

#### useCommenting
```typescript
function useCommenting(pointer?, options?) {
  return {
    // State
    comments: Comment[]
    thread: CommentThread | null
    loading: boolean
    error: string | null

    // Actions
    createComment(content, parentId?): Promise<Comment>
    updateComment(id, content): Promise<Comment>
    deleteComment(id): Promise<boolean>
    reply(parentId, content): Promise<Comment>
    resolveThread(): Promise<boolean>
    unresolveThread(): Promise<boolean>
  }
}
```

#### useEditorCommenting
```typescript
function useEditorCommenting(editor, options) {
  return {
    // Quote-specific
    createQuoteFromSelection(): { quote, pointer }
    createQuoteWithComment(content): Promise<{ quote, pointer, comment }>

    // Plus all useCommenting returns...
  }
}
```

## Benefits of New Architecture

1. **True Universal Comments**: Work on any object type without modification
2. **Clean Separation**: Each layer has a single responsibility
3. **Developer Ergonomics**: Add new commentable types in <30 lines
4. **Framework Agnostic Core**: Could port to Vue, Angular, or vanilla JS
5. **Type Safety**: Full TypeScript support with proper interfaces
6. **Event-Driven Updates**: Real-time comment updates via EventEmitter
7. **Simplified Mental Model**: Objects → Pointers → Comments

## Future Enhancements

- WebSocket integration for real-time collaborative commenting
- Comment threading with nested replies
- Rich text comments with mentions and formatting
- Comment reactions and voting
- Batch operations for performance
- Server-side persistence adapter