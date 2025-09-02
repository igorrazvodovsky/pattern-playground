# Universal Commenting Architecture Plan

## Executive Summary

This plan addresses the commenting system's evolution from its current hybrid state to a clean, pointer-based architecture. The key insight is that commenting is **universal** (works on any object), while the editor plugin provides **enhanced interactions** (quote creation, rich text composition) but is not the commenting system itself.

## Current State Assessment

### What We Have
- **Plugin architecture** partially implemented (Aug 27, 2025)
- **Entity-based commenting** via Zustand store
- **Quote system** with rich bidirectional integration
- **Multiple UI components** (popover, drawer, bubble menu)
- **Event bus** for plugin communication

### Architectural Remnants to Remove
- `CommentSystemProvider` - old context-based state management
- `use-comment-ui.ts` - superseded by quote-comment-ui
- Unused pointer adapter system in services
- Dead exports in `commenting/index.ts`
- References to undefined hooks in plugin code

### Key Insights
1. The system is trying to be "universal" but gets lost in implementation complexity
2. The vision is simple: **developers define pointers, system handles comments**
3. **Critical realization**: The editor is both a consumer (via references) and provider (quote creation, rich text) for commenting, creating circular dependencies

## Design Principles

1. **Pointer-first architecture** - Everything is a pointer to something commentable
2. **Framework agnostic core** - Comments shouldn't know about React or TipTap
3. **Comments are universal** - Work on any object (task, project, quote, etc.)
4. **Editor provides capabilities** - Quote creation and rich text, but isn't the comment system
5. **Clean separation of concerns** - Data, integration, and UI are distinct layers
6. **Developer ergonomics** - Adding new commentable types should be trivial

## Target Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      UI Layer (React)                    │
│  CommentPopover, CommentThread, ItemView, TaskView, etc. │
└─────────────────────────────────────────────────────────┘
                            ↑ uses
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────────────┐                    ┌───────────────┐
│ Editor Plugin │                    │  Object Views │
│ - Quote       │                    │  - Task View  │
│   creation    │                    │  - Item View  │
│ - Rich text   │                    │  - Project    │
│   composer    │                    │    View       │
│ - References  │                    │               │
└───────────────┘                    └───────────────┘
        │                                       │
        └───────────────────┬───────────────────┘
                            ↓ uses
┌─────────────────────────────────────────────────────────┐
│              Universal Comment System (Pure TS)          │
│   CommentPointer interface, CommentService, Store        │
│   Works with any object type, framework-agnostic        │
└─────────────────────────────────────────────────────────┘
```

### Conceptual Layers

**Layer 3: Enhanced Interactions** (Editor-specific)
- Quote creation from text selection
- Reference insertion (@mentions)
- Rich text editing for comment content

**Layer 2: Universal Comments** (Core system)
- Attach comments to ANY object via pointers
- Thread management
- Storage and retrieval
- Event propagation

**Layer 1: Base Objects** (Data layer)
- Documents, Tasks, Projects, Quotes
- Exist independently of commenting
- Once created, quotes are just objects like any other

## Core Abstractions

### 1. Pointer System

```typescript
// Core pointer abstraction - what makes something commentable
interface CommentPointer {
  // Unique identifier for this pointer
  readonly id: string;

  // Type discrimination for pointer handling
  readonly type: string;

  // Serialize for storage/transmission
  serialize(): string;

  // Check equality with another pointer
  equals(other: CommentPointer): boolean;

  // Get human-readable context for this pointer
  getContext(): Promise<PointerContext>;
}

interface PointerContext {
  title: string;        // What is being commented on
  excerpt?: string;     // Preview of the content
  location?: string;    // Where in the document/app
  metadata?: Record<string, unknown>;
}

// Concrete pointer implementations
class QuotePointer implements CommentPointer {
  readonly type = 'quote';

  constructor(
    readonly id: string,
    private quote: QuoteObject
  ) {}

  serialize(): string {
    return JSON.stringify({ type: this.type, id: this.id });
  }

  equals(other: CommentPointer): boolean {
    return other.type === this.type && other.id === this.id;
  }

  async getContext(): Promise<PointerContext> {
    return {
      title: 'Quote',
      excerpt: this.quote.content.plainText,
      location: this.quote.metadata.sourceDocument,
      metadata: this.quote.metadata
    };
  }
}

class EntityPointer implements CommentPointer {
  readonly type = 'entity';

  constructor(
    readonly id: string,
    private entityType: string,
    private entityId: string
  ) {}

  serialize(): string {
    return JSON.stringify({
      type: this.type,
      entityType: this.entityType,
      entityId: this.entityId
    });
  }

  equals(other: CommentPointer): boolean {
    if (other.type !== this.type) return false;
    const otherEntity = other as EntityPointer;
    return otherEntity.entityType === this.entityType &&
           otherEntity.entityId === this.entityId;
  }

  async getContext(): Promise<PointerContext> {
    // Fetch entity details
    const entity = await entityService.get(this.entityType, this.entityId);
    return {
      title: `${this.entityType}: ${entity.name}`,
      excerpt: entity.description,
      metadata: { entityType: this.entityType, ...entity }
    };
  }
}
```

### 2. Comment Service (Framework Agnostic)

```typescript
interface Comment {
  id: string;
  pointer: CommentPointer;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string;  // For threading
  resolved?: boolean;
}

class CommentService {
  constructor(
    private storage: CommentStorage,
    private pointerRegistry: PointerRegistry
  ) {}

  // Core operations
  async createComment(
    pointer: CommentPointer,
    content: string,
    authorId: string
  ): Promise<Comment> {
    const comment: Comment = {
      id: generateId(),
      pointer,
      content,
      authorId,
      createdAt: new Date()
    };

    await this.storage.save(comment);
    this.emit('comment:created', comment);
    return comment;
  }

  async getComments(pointer: CommentPointer): Promise<Comment[]> {
    return this.storage.findByPointer(pointer);
  }

  // Thread operations
  async reply(parentId: string, content: string, authorId: string): Promise<Comment> {
    const parent = await this.storage.findById(parentId);
    if (!parent) throw new Error('Parent comment not found');

    return this.createComment(parent.pointer, content, authorId, parentId);
  }

  // Batch operations
  async getCommentsByPointers(pointers: CommentPointer[]): Promise<Map<string, Comment[]>> {
    const results = new Map<string, Comment[]>();
    for (const pointer of pointers) {
      const comments = await this.getComments(pointer);
      results.set(pointer.serialize(), comments);
    }
    return results;
  }
}
```

### 3. Editor Plugin (Enhanced Interactions)

The editor plugin is **not the comment system** - it's an integration layer that provides enhanced commenting capabilities specific to text editing contexts.

```typescript
class EditorCommentingPlugin extends BasePlugin {
  private quoteService: QuoteService;

  constructor(
    private commentService: CommentService // Injected, not owned
  ) {
    super();
  }

  onActivate(context: EditorContext): void {
    this.quoteService = new QuoteService();

    // Editor-specific command: Create quote from selection
    context.editor.commands.createQuoteFromSelection = () => {
      const { from, to } = context.editor.state.selection;
      if (from === to) return false;

      // Create quote object from selection
      const quote = this.quoteService.createFromSelection(
        context.editor,
        from,
        to,
        this.currentUser
      );

      // Quote is now just an object that can be commented on
      const pointer = new QuotePointer(quote.id, quote);

      // Emit event for UI to show comment interface
      this.emit('quote:created', { quote, pointer });
      return true;
    };

    // Editor-specific: Insert reference to any object
    context.editor.commands.insertReference = (object: any) => {
      // Implementation for @mentions
    };
  }

  // Provide rich text editor for comment composition
  createCommentComposer(): Editor {
    return new Editor({
      extensions: [StarterKit, Mention],
      // Minimal editor just for writing comments
    });
  }
}
```

### 4. React UI Layer (Connects Everything)

```typescript
// Global comment service (singleton)
const commentService = new CommentService(
  new LocalCommentStorage(),
  new PointerRegistry()
);

// Hook for universal commenting (works anywhere)
function useCommenting(pointer?: CommentPointer) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!pointer) return;
    commentService.getComments(pointer).then(setComments);

    const unsubscribe = commentService.on('comment:created', (comment) => {
      if (pointer.equals(comment.pointer)) {
        setComments(prev => [...prev, comment]);
      }
    });
    return unsubscribe;
  }, [pointer]);

  const createComment = useCallback(async (content: string) => {
    if (!pointer) return;
    return commentService.createComment(pointer, content, currentUser);
  }, [pointer]);

  return { comments, createComment };
}

// Hook for editor-enhanced commenting
function useEditorCommenting(editor: Editor) {
  const plugin = editor.storage.plugins.get('editor-commenting') as EditorCommentingPlugin;
  const [activePointer, setActivePointer] = useState<CommentPointer | null>(null);
  const { comments, createComment } = useCommenting(activePointer);

  // Listen for quote creation from editor
  useEffect(() => {
    const unsubscribe = plugin.on('quote:created', ({ quote, pointer }) => {
      setActivePointer(pointer);
      // Show comment UI for the new quote
    });
    return unsubscribe;
  }, [plugin]);

  const createQuoteComment = useCallback(() => {
    editor.commands.createQuoteFromSelection();
  }, [editor]);

  return {
    comments,
    createComment,
    createQuoteComment,
    activePointer
  };
}

// Example: Comments on a Task (no editor needed)
function TaskComments({ task }: { task: Task }) {
  const pointer = new EntityPointer(`task-${task.id}`, 'task', task.id);
  const { comments, createComment } = useCommenting(pointer);

  return (
    <div>
      {comments.map(c => <Comment key={c.id} {...c} />)}
      <CommentComposer onSubmit={createComment} />
    </div>
  );
}

// Example: Quote creation in editor
function EditorWithQuoteComments({ editor }: { editor: Editor }) {
  const { createQuoteComment, activePointer, comments } = useEditorCommenting(editor);

  return (
    <>
      <button onClick={createQuoteComment}>Comment on Selection</button>
      {activePointer && (
        <CommentPopover pointer={activePointer} comments={comments} />
      )}
    </>
  );
}
```

## Migration Phases

### Phase 1: Clean House (2 days)
**Goal**: Remove all architectural remnants and dead code

- [ ] Delete unused components and providers
  - `CommentSystemProvider`
  - `CommentThreadRenderer`
  - Old hooks in `commenting/hooks/`
- [ ] Remove dead exports from index files
- [ ] Delete unused pointer adapter system
- [ ] Remove references to undefined hooks in plugin
- [ ] Clean up mock data to single format

### Phase 2: Build Universal Comment System (3 days)
**Goal**: Create the core commenting system that works everywhere

- [ ] Create `CommentPointer` interface and base implementations
- [ ] Implement `QuotePointer` for existing quote system
- [ ] Implement `EntityPointer` for generic entities (tasks, projects, etc.)
- [ ] Build framework-agnostic `CommentService` as singleton
- [ ] Create storage abstraction with local implementation
- [ ] Add event emitter for service notifications
- [ ] Ensure service works independently of any UI framework

### Phase 3: Refactor Editor Plugin (2 days)
**Goal**: Transform plugin into enhanced interaction provider, not comment owner

- [ ] Rename to `EditorCommentingPlugin` to clarify role
- [ ] Remove comment service ownership - inject instead
- [ ] Focus on editor-specific capabilities:
  - Quote creation from selection
  - Reference insertion
  - Rich text composer factory
- [ ] Emit events for UI consumption
- [ ] Remove React dependencies entirely

### Phase 4: Create UI Integration Layer (3 days)
**Goal**: Build clean hooks and components that connect everything

- [ ] Create `useCommenting` hook for universal use
- [ ] Create `useEditorCommenting` for editor-enhanced features
- [ ] Update `QuoteCommentPopover` to work with pointers
- [ ] Create `CommentComposer` with rich text support
- [ ] Build `TaskComments`, `ProjectComments` components
- [ ] Remove all intermediate hook layers

### Phase 5: Migrate Existing Features (2 days)
**Goal**: Ensure all current functionality works in new architecture

- [ ] Migrate quote commenting flow
- [ ] Update bubble menu integration
- [ ] Ensure task/project commenting works
- [ ] Update ItemView to use new system
- [ ] Verify cross-document quotes still work
- [ ] Test persistence and loading

### Phase 6: Documentation & Cleanup (1 day)
**Goal**: Document the new architecture and remove old code

- [ ] Architecture overview with clear separation of concerns
- [ ] How to add new commentable object types
- [ ] API documentation for each layer
- [ ] Migration guide from old system
- [ ] Delete all old service implementations
- [ ] Update all imports and exports

## Success Criteria

1. **Developer can add new commentable type in < 30 lines of code**
   - Define pointer class
   - Create UI component using `useCommenting` hook
   - Done

2. **Comments work outside editor context**
   - Can comment on tasks, projects, any object
   - Editor not required for basic commenting
   - Editor only needed for quote creation and rich text

3. **Clean separation of concerns**
   - Comment system doesn't know about editor
   - Editor plugin doesn't own comments
   - UI connects everything but doesn't contain business logic

4. **Reduced complexity**
   - No circular dependencies
   - Clear data flow: Objects → Pointers → Comments
   - Single source of truth for comments

5. **Maintains existing functionality**
   - Quote commenting works
   - Entity commenting works
   - References still function
   - Cross-document quotes preserved

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Incremental migration with tests at each phase |
| Singleton service issues | Use dependency injection pattern for testing |
| Editor/comment coupling hard to break | Clear boundaries: editor creates quotes, comments use pointers |
| Performance with many comments | Implement pagination and lazy loading |
| Storage migration complexity | Keep old data, transform on read initially |

## Key Architectural Decisions

1. **Comment service as singleton**: Ensures single source of truth across all contexts
2. **Editor plugin doesn't own comments**: Just provides capabilities (quote creation, rich text)
3. **Pointers are immutable value objects**: Once created, they don't change
4. **Quotes are just objects**: After creation, they're no different from tasks or projects

## Alternative Considered

**Keep plugin as comment owner**: Rejected because it would limit commenting to editor contexts only, preventing comments on tasks, projects, and other objects outside the editor.

## Next Steps

1. Review and approve this plan
2. Create feature branch `feature/universal-commenting`
3. Begin Phase 1: Clean House
4. Daily updates on phase progress

## Notes

- The "snake eating its tail" problem is resolved by clear boundaries
- Editor creates quotes (objects), comments attach to objects (via pointers)
- This is a **simplification**, not just a refactor
- We're building toward the vision of truly universal comments