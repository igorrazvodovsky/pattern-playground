# Commenting System Refactoring Plan

## Overview
The commenting system currently has multiple overlapping implementations with incompatible types, fragmented state management, and unclear service boundaries. This refactoring plan addresses TypeScript strict mode violations and architectural issues to create a unified, type-safe, and maintainable commenting system.

## Current Issues
- Multiple incompatible comment types (`EntityComment`, `UniversalComment`, `CommentThread`)
- Fragmented state across Zustand, Context API, and local component state
- Overlapping services with unclear responsibilities
- Type mismatches preventing TypeScript strict mode compilation
- Complex hook architecture with duplicate functionality
- Multiple pointer systems for different comment contexts
- Editor plugin system integration complexity
- Quote system integration dependencies
- Item view adapter system coupling
- Cross-document commenting features
- Performance optimization utilities scattered across files

## Refactoring Strategy

### 1. Type System Unification

#### Current Problem
- `EntityComment` lacks author and pointer properties required by `UniversalComment`
- Different pointer systems (entity-based vs document-based)
- Inconsistent type definitions across services

#### Solution
```typescript
// Unified comment type hierarchy
interface BaseComment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface UniversalComment extends BaseComment {
  id: string;
  pointer: CommentPointer; // Single pointer where comment is attached
  parentId?: string; // For nested replies
  resolved?: boolean;
  rootId?: string; // ID of the root comment in a thread (computed or stored)
}

// Simple, unified pointer type - everything is an entity
type CommentPointer = {
  entityType: string; // 'quote', 'task', 'project', etc.
  entityId: string;   // The entity's ID
};

// Thread is a computed view, not a stored entity
interface CommentThreadView {
  rootComment: UniversalComment;
  replies: UniversalComment[];
  participants: string[]; // Computed from all comments
  lastActivity: Date; // Computed from comment timestamps
  resolved: boolean; // From root comment's resolved status
}
```

### 2. Service Layer Consolidation

#### Current Problem
- `UniversalCommentingService`, `QuoteCommentingService`, and `CommentDemoService` overlap
- No clear service boundaries
- Difficult to extend with new comment types

#### Solution: Strategy Pattern
```typescript
// Core service with adapter pattern
interface CommentAdapter<T extends CommentPointer = CommentPointer> {
  type: string;

  // Core operations
  create(pointer: T, content: string, author: string): Promise<UniversalComment>;
  update(commentId: string, content: string): Promise<UniversalComment>;
  delete(commentId: string): Promise<void>;

  // Pointer operations
  serialize(pointer: T): string;
  deserialize(data: string): T;
  resolve(pointer: T): Promise<CommentContext>;

  // UI operations
  highlight(pointer: T): void;
  unhighlight(pointer: T): void;
  canComment(pointer: T): boolean;
}

class UnifiedCommentingService {
  private adapters = new Map<string, CommentAdapter>();
  private storage: CommentStorage;

  registerAdapter(adapter: CommentAdapter) {
    this.adapters.set(adapter.type, adapter);
  }

  async createComment(
    pointer: CommentPointer,
    content: string,
    author: string
  ): Promise<UniversalComment> {
    const adapter = this.adapters.get(pointer.type);
    if (!adapter) throw new Error(`No adapter for pointer type: ${pointer.type}`);

    const comment = await adapter.create(pointer, content, author);
    await this.storage.save(comment);
    return comment;
  }

  // Other unified operations...
}
```

### 3. State Management Architecture

#### Current Problem
- State scattered across multiple stores and contexts
- Unclear data flow
- Excessive re-renders due to poor state structure

#### Solution: Single Zustand Store
```typescript
interface CommentStore {
  // Data (flat structure, normalized)
  comments: Map<string, UniversalComment>;

  // UI State
  activeCommentId: string | null; // Currently selected comment
  highlightedCommentId: string | null;
  panelOpen: boolean;
  draftComment: {
    content: string;
    pointer: CommentPointer;
    parentId?: string; // If replying to existing comment
  } | null;

  // Computed values (with selectors)
  getThreads: () => CommentThreadView[]; // Compute threads from comments
  getThreadByRootId: (rootId: string) => CommentThreadView | null;
  getCommentsByPointer: (pointer: CommentPointer) => UniversalComment[];
  getReplies: (commentId: string) => UniversalComment[];
  getCommentCount: () => number;

  // Actions (properly typed)
  actions: {
    // Comment operations
    createComment: (pointer: CommentPointer, content: string, author: string) => Promise<UniversalComment>;
    replyToComment: (parentId: string, content: string, author: string) => Promise<UniversalComment>;
    updateComment: (commentId: string, content: string) => Promise<UniversalComment>;
    deleteComment: (commentId: string) => Promise<void>;
    resolveComment: (commentId: string, resolved: boolean) => Promise<void>;

    // UI operations
    setActiveComment: (commentId: string | null) => void;
    togglePanel: (open?: boolean) => void;
    setDraftComment: (draft: DraftComment | null) => void;
    highlightComment: (commentId: string | null) => void;
  };
}

const useCommentStore = create<CommentStore>()(
  persist(
    immer((set, get) => ({
      // Implementation...
    })),
    {
      name: 'comment-store',
      partialize: (state) => ({
        threads: Array.from(state.threads.entries()),
        comments: Array.from(state.comments.entries()),
      }),
    }
  )
);
```

### 4. Hook Architecture Simplification

#### Current Problem
- Too many hooks with overlapping responsibilities
- Unclear which hook to use when
- Difficult to test

#### Solution: Layered Hook Architecture
```typescript
// Layer 1: Core data/logic hook
function useComments() {
  const store = useCommentStore();
  const service = useCommentingService();

  return {
    comments: store.comments,
    threads: store.getThreads(), // Computed from comments

    // Core operations
    createComment: useCallback(async (pointer: CommentPointer, content: string) => {
      const comment = await service.createComment(pointer, content, currentUser);
      store.actions.addComment(comment);
      return comment;
    }, [service, store, currentUser]),

    replyToComment: useCallback(async (parentId: string, content: string) => {
      const parent = store.comments.get(parentId);
      if (!parent) throw new Error('Parent comment not found');

      const reply = await service.createComment(parent.pointer, content, currentUser);
      reply.parentId = parentId;
      reply.rootId = parent.rootId || parent.id;
      store.actions.addComment(reply);
      return reply;
    }, [service, store, currentUser]),

    // ... other operations
  };
}

// Layer 2: Unified UI hook (replaces both use-comment-ui.ts and use-quote-comment-ui.ts)
function useCommentUI() {
  const { createComment, comments } = useComments();
  const quoteService = useQuoteService();
  const [uiState, setUIState] = useState({
    popoverOpen: false,
    drawerOpen: false,
    activeEntityType: null as string | null,
    activeEntityId: null as string | null,
    triggerElement: null as HTMLElement | null,
  });

  // Create comment from text selection (creates quote first)
  const createCommentFromSelection = useCallback(async (content: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    // First create a quote entity from the selection
    const quote = await quoteService.createQuote({
      text: selection.toString(),
      from: selection.anchorOffset,
      to: selection.focusOffset,
      documentId: 'current-doc',
    });

    // Then create a comment pointing to that quote
    return createComment({
      entityType: 'quote',
      entityId: quote.id,
    }, content);
  }, [createComment, quoteService]);

  // Create comment on any entity
  const createCommentOnEntity = useCallback(async (
    entityType: string,
    entityId: string,
    content: string
  ) => {
    return createComment({ entityType, entityId }, content);
  }, [createComment]);

  // Get all comments for a specific entity
  const getCommentsForEntity = useCallback((entityType: string, entityId: string) => {
    return Array.from(comments.values()).filter(
      c => c.pointer.entityType === entityType && c.pointer.entityId === entityId
    );
  }, [comments]);

  return {
    uiState,
    createCommentFromSelection,
    createCommentOnEntity,
    getCommentsForEntity,
    // UI state management
    setUIState,
  };
}

// Layer 3: Integration hooks (editor-specific)
function useTiptapComments(editor: Editor) {
  const { comments } = useComments();
  const { createCommentFromSelection } = useCommentUI();
  const quotes = useQuotes(); // Get all quotes

  useEffect(() => {
    if (!editor) return;

    // Add visual marks in editor for quotes that have comments
    quotes
      .filter(quote => {
        // Check if this quote has any comments
        return Array.from(comments.values()).some(
          c => c.pointer.entityType === 'quote' && c.pointer.entityId === quote.id
        );
      })
      .forEach(quote => {
        // Add highlight mark at the quote's original position
        editor.commands.setMark('highlight', {
          class: 'has-comments',
          'data-quote-id': quote.id,
        });
      });
  }, [editor, comments, quotes]);

  return {
    // Create quote + comment from current selection
    addCommentToSelection: async (content: string) => {
      return createCommentFromSelection(content);
    },
  };
}
```

### 5. Provider Simplification

#### Current Problem
- Complex provider with mixed responsibilities
- Tries to bridge incompatible systems
- Difficult to configure

#### Solution: Composed Providers
```typescript
interface CommentConfig {
  adapters: CommentAdapter[];
  storage: CommentStorage;
  currentUser: User;
  permissions?: CommentPermissions;
}

// Root provider that composes everything
function CommentProvider({ children, config }: CommentProviderProps) {
  const service = useMemo(() => {
    const svc = new UnifiedCommentingService(config.storage);
    config.adapters.forEach(adapter => svc.registerAdapter(adapter));
    return svc;
  }, [config]);

  return (
    <CommentServiceProvider service={service}>
      <CommentStoreProvider>
        <CommentUIProvider>
          <CommentPermissionProvider permissions={config.permissions}>
            {children}
          </CommentPermissionProvider>
        </CommentUIProvider>
      </CommentStoreProvider>
    </CommentServiceProvider>
  );
}

// Usage
<CommentProvider
  config={{
    adapters: [
      new EntityCommentAdapter(),
      new TiptapCommentAdapter(),
      new QuoteCommentAdapter(),
    ],
    storage: new LocalStorageAdapter(),
    currentUser: { id: '1', name: 'User' },
  }}
>
  <App />
</CommentProvider>
```

### 6. Pointer System Standardization

#### Current Problem
- Different pointer implementations for different contexts
- No unified way to serialize/deserialize pointers
- Difficult to add new pointer types

#### Solution: Pointer Registry
```typescript
abstract class BasePointerAdapter<T extends CommentPointer> {
  abstract readonly type: string;

  abstract serialize(pointer: T): string;
  abstract deserialize(data: string): T;
  abstract resolve(pointer: T): Promise<CommentContext>;

  // Optional UI operations with default implementations
  highlight(pointer: T): void {
    // Default: no-op
  }

  unhighlight(pointer: T): void {
    // Default: no-op
  }

  canComment(pointer: T): boolean {
    return true;
  }
}

// Single unified adapter for all entities
class EntityPointerAdapter extends BasePointerAdapter<CommentPointer> {
  readonly type = 'entity';
  private entityService: EntityService; // Service that can fetch any entity by type+id

  constructor(entityService: EntityService) {
    super();
    this.entityService = entityService;
  }

  serialize(pointer: CommentPointer): string {
    return JSON.stringify({
      entityType: pointer.entityType,
      entityId: pointer.entityId,
    });
  }

  deserialize(data: string): CommentPointer {
    return JSON.parse(data) as CommentPointer;
  }

  async resolve(pointer: CommentPointer): Promise<CommentContext> {
    const entity = await this.entityService.getEntity(pointer.entityType, pointer.entityId);

    return {
      text: entity.name || entity.title,
      context: entity.description || `${pointer.entityType}: ${entity.name}`,
      metadata: {
        entityType: pointer.entityType,
        entityId: pointer.entityId,
        createdAt: entity.createdAt,
      }
    };
  }

  highlight(pointer: CommentPointer): void {
    // Entity-specific highlighting based on type
    switch (pointer.entityType) {
      case 'quote':
        // Highlight quote in editor
        this.highlightQuote(pointer.entityId);
        break;
      case 'task':
        // Show task has comments
        this.highlightTask(pointer.entityId);
        break;
      // Add other entity types as needed
    }
  }

  private highlightQuote(quoteId: string): void {
    // Emit event or update UI to show this quote has comments
  }

  private highlightTask(taskId: string): void {
    // Update task UI to show it has comments
  }
}

// Registry
class PointerRegistry {
  private adapters = new Map<string, BasePointerAdapter<any>>();

  register<T extends CommentPointer>(adapter: BasePointerAdapter<T>) {
    this.adapters.set(adapter.type, adapter);
  }

  getAdapter<T extends CommentPointer>(type: string): BasePointerAdapter<T> {
    const adapter = this.adapters.get(type);
    if (!adapter) {
      throw new Error(`No adapter registered for pointer type: ${type}`);
    }
    return adapter;
  }
}
```

## Migration Strategy

### Phase 0: Assessment & Preparation (Day 1)
- [ ] Audit editor plugin system dependencies and integration points
- [ ] Map quote system integration requirements and data flows
- [ ] Document item view adapter coupling and interaction patterns
- [ ] Identify cross-document commenting usage and dependencies
- [ ] Create comprehensive file inventory of all affected systems (87+ files)

### Phase 1: Type Foundation & Mock Data (Days 2-3)
- [ ] Create new unified type definitions compatible with all current systems
- [ ] Add adapter interfaces for editor plugins, quotes, and item views
- [ ] Create type guards and validators
- [ ] Add JSDoc documentation
- [ ] Update all mock data files to new format:
  - [ ] Convert `comments.json` to new UniversalComment format (flat structure)
  - [ ] Remove `comment-threads.json` entirely (threads are computed)
  - [ ] Update `quotes.json` to use new pointer system
  - [ ] Remove entity-specific comment data
  - [ ] Ensure all comments have proper parentId/rootId for threading
  - [ ] Update Storybook mock data configurations

### Phase 2: Service Layer & Editor Integration (Days 4-7)
- [ ] Implement `UnifiedCommentingService` with editor plugin compatibility
- [ ] Create unified `EntityAdapter` that handles all entity types:
  - [ ] Quotes (entityType: 'quote') with cross-document support
  - [ ] Tasks (entityType: 'task')
  - [ ] Projects (entityType: 'project')
  - [ ] TipTap text ranges (entityType: 'tiptap-range')
  - [ ] Item view sections (entityType: 'item-section')
- [ ] Replace all existing services with new unified service
- [ ] Update `CommentingPlugin` to work with new service architecture
- [ ] Migrate `TipTapPointerAdapter` to new pointer system
- [ ] Update `CommentMark` extension for new comment IDs and threading
- [ ] Add logging and error handling

### Phase 3: Quote System Integration (Days 8-10)
- [ ] Refactor quote commenting workflow to use unified service
- [ ] Update `QuoteCommentPopover` and related components
- [ ] Migrate `use-tiptap-quote-integration` and quote-specific hooks
- [ ] Update reference system integration for quotes
- [ ] Handle quote-to-comment data flow in new architecture
- [ ] Migrate cross-document quote commenting features
- [ ] Update quote highlighting and selection preservation

### Phase 4: State Consolidation (Days 11-13)
- [ ] Create unified Zustand store compatible with all contexts
- [ ] Implement selectors and computed values for all use cases
- [ ] Remove `CommentSystemProvider` entirely
- [ ] Remove all Context-based comment state
- [ ] Remove duplicate state from components
- [ ] Use localStorage for persistence (prototype only)
- [ ] Ensure editor plugin state integration works correctly
- [ ] Update item view adapter state management

### Phase 5: Hook Simplification & Item View Integration (Days 14-17)
- [ ] Implement new layered hooks (useComments, useCommentUI, useTiptapComments)
- [ ] Create specialized hooks for item view integration
- [ ] Update `CommentAwareAdapterBase` and adapter system
- [ ] Update all components to use new unified hooks
- [ ] Delete old hooks entirely:
  - [ ] Remove `use-comment-ui.ts` (replaced by new useCommentUI)
  - [ ] Remove `use-quote-comment-ui.ts` (functionality merged into useCommentUI)
  - [ ] Remove `use-comment-system.ts`
  - [ ] Remove `use-quote-commenting.ts`
  - [ ] Remove `use-universal-commenting.ts`
  - [ ] Remove all TipTap integration hooks that use old CommentThread
- [ ] Update all Storybook stories with new hooks
- [ ] Update item view content adapter registry

### Phase 6: Provider & Plugin Refactoring (Days 18-20)
- [ ] Implement simple CommentProvider with plugin support
- [ ] Update app configuration to use new provider
- [ ] Update editor plugin registration and lifecycle management
- [ ] Update bubble menu and toolbar components
- [ ] Document configuration options for all integration contexts
- [ ] Update all Storybook decorators and configurations
- [ ] Ensure event bus communication works with new architecture

### Phase 7: Performance & Utilities Integration (Days 21-22)
- [ ] Integrate performance optimization utilities into new architecture
- [ ] Update error handling and validation systems
- [ ] Consolidate utility functions scattered across files
- [ ] Optimize comment rendering and re-render patterns
- [ ] Update cross-document commenting performance patterns

### Phase 8: Cleanup & Documentation (Days 23-25)
- [ ] Delete all legacy code:
  - [ ] Remove old comment services (`UniversalCommentingService`, `QuoteCommentingService`, `CommentDemoService`)
  - [ ] Remove entity-based comment components
  - [ ] Remove old provider implementations (`CommentSystemProvider`)
  - [ ] Remove unused types and interfaces
  - [ ] Remove old utility files and scattered performance optimizations
- [ ] Update all imports to use new paths (87+ files affected)
- [ ] Run TypeScript strict mode check
- [ ] Run linting and formatting
- [ ] Create comprehensive documentation for new architecture
- [ ] Document integration patterns for editor plugins, quotes, and item views
- [ ] Update README and development guides

## Success Metrics
- TypeScript compiles with strict mode enabled
- 100% type coverage (no `any` types)
- Reduced bundle size (removing duplicate code)
- Improved performance (fewer re-renders)
- Easier to add new comment types
- All editor plugins work with new system
- Quote system integration maintains functionality
- Item view adapters work seamlessly
- Cross-document commenting preserved
- Clear documentation for all integration patterns

## Systems Affected (87+ Files)
- **Core Services**: 34 files (commenting services, state management, storage)
- **React Components**: 18 files (UI components, providers, contexts)
- **React Hooks**: 12 files (state and interaction management)
- **TipTap Integration**: 8 files (editor extensions, marks, adapters)
- **Editor Plugins**: 6 files (plugin system, bubble menus, toolbars)
- **Quote System**: 9 files (quote services, integrations, workflows)
- **Item View System**: 5 files (adapters, content registry)
- **Type Definitions**: 6 files (interfaces, types, contracts)
- **Utilities**: 7 files (performance, validation, error handling)
- **Documentation & Examples**: 15+ files (Storybook, mock data, guides)

## Risk Mitigation
1. **Complex Integration Dependencies**: Phase-by-phase approach reduces integration risks
2. **Mock Data Migration**: Update all data files systematically in Phase 1
3. **Editor Plugin Compatibility**: Dedicated phase for plugin system integration
4. **Quote System Coupling**: Separate phase for quote workflow migration
5. **Clean Break Strategy**: Aggressive deletion of old code prevents confusion
6. **Documentation First**: Comprehensive documentation before major changes



## Next Steps
1. Review and approve expanded plan
2. Create feature branch for commenting refactor
3. Set up phase-by-phase tracking system
4. Begin Phase 0 assessment and documentation
5. Daily progress updates with phase completion metrics

## Notes
- Clean break approach - no backward compatibility needed
- Focus on integration completeness over incremental migration
- Delete old code aggressively to reduce maintenance burden
- Prioritize documentation of integration patterns
- Consider this a complete architectural refresh