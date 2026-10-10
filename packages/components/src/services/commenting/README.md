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
- **useCommenting**: Universal hook for commenting on any pointer

### 3. UI Components (`components/commenting/`)
The generic parts every commentable surface shares:
- **CommentThread**: Comment list and composer for any pointer; used by the comment popover, the thread list, ItemView, and the quote drawer
- **CommentPopover**: A thread floated beside what it is about
- **ThreadList**: Every thread on a surface, from entries the surface reports; selecting one asks the surface to bring it into view

### 4. Surface integrations
Each surface supplies only what is specific to it, following the Ink & Switch universal-comments model: the pointers it holds, the current selection, highlighting, and bringing a pointer into view.

The text editor's side lives in two places:
- `components/commenting/tiptap/comment-mark.ts`: the `Commenting` extension, which adds the comment and quote marks and the Mod-Shift-M shortcut. The comment mark highlights a commented passage without changing its text, and comments may overlap. The quote mark links a passage to the quote made from it.
- `components/editor-plugins/commenting/`: the commenting plugin, which starts threads on the selection, marks a passage once its thread has a comment, reports the document's threads, and scrolls a passage into view. `CommentingIntegration` shows the popover and opens the thread list in a drawer.

## Key Concepts

### CommentPointer
The foundation of universal commenting. Any object can be made commentable by creating a pointer:

```typescript
// Make a task commentable
const taskPointer = new EntityPointer('task', taskId);

// Make a quote commentable (all quote comments are stored under this pointer)
const quotePointer = new EntityPointer('quote', quoteId);

// A commented passage in a document, found through its comment mark
const passagePointer = new TextRangePointer(documentId, threadId);

// Custom pointer for any object type
class CustomPointer extends BaseCommentPointer {
  // Implementation...
}
```

### Clean Separation of Concerns

1. **Comment System doesn't know about editors**: The core system works with pointers, not specific UI contexts
2. **Editor Plugin doesn't own comments**: It marks passages and reports them, and delegates everything else to the comment service
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

### Editor Commenting
Add the `Commenting` extension to the editor, register the commenting plugin, and wrap the editor in `CommentingIntegration`. The plugin and the integration must sit inside `EditorProvider`. Plugin `getExtensions` is not installed by the editor host, so the extension goes in the editor's own list:

```tsx
const editor = useEditor({ extensions: [StarterKit, Commenting] });
const plugins = useMemo(() => [
  commentingPlugin({ documentId, currentUser, bubbleMenu: true, toolbar: true }),
], [documentId, currentUser]);

<EditorProvider editor={editor} plugins={plugins}>
  <CommentingIntegration config={{ currentUser }}>
    <EditorToolbar />
    <EditorContent />
    <EditorBubbleMenu />
  </CommentingIntegration>
</EditorProvider>
```

The bubble menu's comment button and Mod-Shift-M both send `commenting:create-comment` over the event bus. The plugin opens a pending thread on the selection, under a `TextRangePointer`, and announces it with `commenting:thread-opened`. The document does not change until the first comment, which marks the passage. Closing the popover without commenting leaves the document as it was. If the passage is deleted, or moves somewhere a comment mark cannot go, before the first comment, the plugin announces `commenting:thread-closed` and the popover closes. Clicking a marked passage reopens its thread. The toolbar's Comments button sends `commenting:show-threads`, which opens the thread list in a non-modal drawer.

Quoting is a separate, deliberate step. An open passage thread offers "Turn into quote", which creates a quote object from the passage. The quote is a standalone object other places can refer to. The words stay in the document: the comment highlight becomes a quote marker (`mark[data-quote-id]`), and `CommentService.reanchor` moves the thread to `EntityPointer('quote', id)`. Comment and quote marks stay out of undo history, so undoing a comment or a quote never removes a mark while its thread lives on. Undoing the edit that typed a passage does remove the passage and its mark; redo brings both back. The quote holds only the passage's own words: text later typed or pasted between its pieces is left out. If the thread fails to move, the passage goes back to its comment mark and the quote is deleted. The quote's stored content leaves comment and quote marks behind. Clicking a quoted passage opens the quote's thread.

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
  reanchor(from, to): Promise<Comment[]>   // move a whole thread to another pointer
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