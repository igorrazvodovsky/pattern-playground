# TipTap v3 Commenting Implementation Plan

Implementation plan for inline commenting functionality in TipTap v3 editor, based on the universal commenting pattern.

## 🎯 Progress Status

**Phase 1: Core Infrastructure (Universal Layer)** ✅ **COMPLETED**
- Universal commenting state management with Zustand
- App-agnostic commenting service with local persistence
- TipTap-specific pointer adapter for text range handling
- TipTap v3 comment mark extension with visual styling
- React hooks for seamless component integration
- TypeScript-first architecture with proper exports

**Phase 2: App Integration Layer** 🔄 **NEXT**
- BubbleMenu integration with commenting functionality
- Comment indicator system with hover interactions and click handling

**Phase 3: Universal Comment Interface** ⏳ **PENDING**
- Generic comment UI components (thread display, composer, panel)
- TipTap-specific UI integration

**Phase 4: Advanced Features** ⏳ **PENDING**
- Advanced comment interactions (replies, resolution, navigation)
- Server sync features (Tier 2: TanStack Query)
- Real-time collaboration (Tier 3: Yjs)
- Extensibility features

## Overview

This implementation updates the TipTap v3 BubbleMenu functionality to support contextual commenting on selected text ranges. It follows the universal commenting pattern architecture from Ink & Switch, using a pointer-based system that separates app-specific document references from generic commenting functionality.

### Universal Commenting Architecture

Following Ink & Switch's approach, this implementation creates:
- **Pointer system**: TipTap-specific pointers for text ranges
- **Universal commenting layer**: Generic comment storage, threading, and UI
- **Minimal adapter**: TipTap integration that handles selection and highlighting

## Data Structure & State Management

### State Management Strategy

The implementation uses a **progressive enhancement approach** with three tiers:

#### **Tier 1: Local-First Foundation (Zustand Only)**
- **Zustand**: Manages all local state including comments, threads, drafts, and panel visibility
- **Local persistence**: Browser localStorage for data persistence across sessions
- **Benefits**: Minimal complexity, excellent TypeScript support, perfect for MVP
- **Use case**: Single-user commenting with local storage, no server dependency initially

#### **Tier 2: Server Sync (+ TanStack Query)**
- **TanStack Query**: Handles server synchronisation, optimistic updates, and offline/online transitions
- **Integration**: Builds on existing Zustand store for local state
- **Benefits**: Proven server sync patterns, caching, background updates
- **Migration path**: Add when server persistence becomes necessary

#### **Tier 3: Real-Time Collaboration (+ Yjs)**
- **Yjs**: Conflict-free replicated data types (CRDT) for real-time collaboration
- **Integration**: `y-tiptap` for seamless TipTap v3 position tracking
- **Benefits**: Automatic conflict resolution, real-time updates, mature ecosystem
- **Migration path**: Add when multi-user collaboration becomes critical

### Universal Comment Data Model

Aligned with the Comment concept definition and Ink & Switch's pointer-based architecture:

```typescript
// Universal comment structure following Comment concept
interface UniversalComment {
  id: string;
  // User who created the comment
  author: string;
  // What the comment is attached to
  pointers: DocumentPointer[];
  content: string;
  timestamp: Date;
  // For threaded replies (null for top-level)
  parentId?: string;
  status: 'draft' | 'published' | 'flagged' | 'deleted' | 'resolved';
  // Previous versions for transparency
  editHistory?: CommentEdit[];
}

// Edit history for transparency
interface CommentEdit {
  timestamp: Date;
  previousContent: string;
  reason?: string;
}

// TipTap-specific pointer implementation
interface TipTapTextPointer extends DocumentPointer {
  type: 'tiptap-text-range';
  from: number;                                  // Start position
  to: number;                                    // End position
  text: string;                                  // Captured text content
  documentId?: string;                           // Optional document identifier
}

// Generic pointer interface (extensible to other document types)
interface DocumentPointer {
  type: string;                                  // Pointer type identifier
  [key: string]: any;                            // App-specific properties
}

interface CommentThread {
  id: string;                                    // Thread identifier
  rootCommentId: string;                         // Root comment in thread
  pointers: DocumentPointer[];                   // Document references
  participants: string[];                        // Thread participants
  status: 'active' | 'resolved' | 'archived';   // Thread status
}
```

### State Architecture Implementation

#### **Tier 1: Zustand-Only Local Implementation**

```typescript
// Universal commenting state with Zustand only
interface UniversalCommentingState {
  threads: Map<string, CommentThread>;           // Optimised for O(1) lookups
  comments: Map<string, UniversalComment>;       // All comments by ID
  activeThreadId?: string;
  draftComment?: {
    pointer: DocumentPointer;
    content: string;
    tempId: string;
  };
  panelVisible: boolean;

  // Local persistence state
  lastSavedTimestamp: number;
  hasUnsavedChanges: boolean;
}

// Zustand store with local persistence
const useCommentStore = create<UniversalCommentingState & {
  actions: {
    // Thread management
    createThread: (pointer: DocumentPointer, initialComment: string, author: string) => CommentThread;
    addComment: (threadId: string, content: string, author: string) => UniversalComment;
    resolveThread: (threadId: string, resolvedBy: string) => void;
    setActiveThread: (id?: string) => void;

    // Draft management
    setDraftComment: (draft?: { pointer: DocumentPointer; content: string; tempId: string }) => void;

    // UI state
    togglePanel: () => void;

    // Local persistence
    saveToLocalStorage: () => void;
    loadFromLocalStorage: () => void;
    clearLocalStorage: () => void;
  };
}>()(
  persist(
    (set, get) => ({
      threads: new Map(),
      comments: new Map(),
      panelVisible: false,
      lastSavedTimestamp: 0,
      hasUnsavedChanges: false,

      actions: {
        createThread: (pointer, initialComment, author) => {
          const threadId = `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          const comment: UniversalComment = {
            id: commentId,
            author,
            pointers: [pointer],
            content: initialComment,
            timestamp: new Date(),
            status: 'published'
          };

          const thread: CommentThread = {
            id: threadId,
            rootCommentId: commentId,
            pointers: [pointer],
            participants: [author],
            status: 'active'
          };

          set(state => ({
            threads: new Map(state.threads).set(threadId, thread),
            comments: new Map(state.comments).set(commentId, comment),
            hasUnsavedChanges: true
          }));

          get().actions.saveToLocalStorage();
          return thread;
        },

        addComment: (threadId, content, author) => {
          const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const thread = get().threads.get(threadId);

          if (!thread) throw new Error(`Thread ${threadId} not found`);

          const comment: UniversalComment = {
            id: commentId,
            author,
            pointers: thread.pointers,
            content,
            timestamp: new Date(),
            status: 'published'
          };

          const updatedThread = {
            ...thread,
            participants: Array.from(new Set([...thread.participants, author]))
          };

          set(state => ({
            threads: new Map(state.threads).set(threadId, updatedThread),
            comments: new Map(state.comments).set(commentId, comment),
            hasUnsavedChanges: true
          }));

          get().actions.saveToLocalStorage();
          return comment;
        },

        resolveThread: (threadId, resolvedBy) => {
          const thread = get().threads.get(threadId);
          if (!thread) return;

          const updatedThread = { ...thread, status: 'resolved' as const };

          set(state => ({
            threads: new Map(state.threads).set(threadId, updatedThread),
            hasUnsavedChanges: true
          }));

          get().actions.saveToLocalStorage();
        },

        setActiveThread: (id) => set({ activeThreadId: id }),
        setDraftComment: (draft) => set({ draftComment: draft }),
        togglePanel: () => set(state => ({ panelVisible: !state.panelVisible })),

        saveToLocalStorage: () => {
          const state = get();
          const serializable = {
            threads: Array.from(state.threads.entries()),
            comments: Array.from(state.comments.entries()),
            lastSavedTimestamp: Date.now()
          };
          localStorage.setItem('comment-store', JSON.stringify(serializable));
          set({ hasUnsavedChanges: false, lastSavedTimestamp: Date.now() });
        },

        loadFromLocalStorage: () => {
          const stored = localStorage.getItem('comment-store');
          if (!stored) return;

          try {
            const data = JSON.parse(stored);
            set({
              threads: new Map(data.threads),
              comments: new Map(data.comments),
              lastSavedTimestamp: data.lastSavedTimestamp,
              hasUnsavedChanges: false
            });
          } catch (error) {
            console.error('Failed to load comments from localStorage:', error);
          }
        },

        clearLocalStorage: () => {
          localStorage.removeItem('comment-store');
          set({
            threads: new Map(),
            comments: new Map(),
            lastSavedTimestamp: 0,
            hasUnsavedChanges: false
          });
        }
      }
    }),
    {
      name: 'comment-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        threads: Array.from(state.threads.entries()),
        comments: Array.from(state.comments.entries()),
        lastSavedTimestamp: state.lastSavedTimestamp
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert arrays back to Maps
          state.threads = new Map(state.threads as any);
          state.comments = new Map(state.comments as any);
        }
      }
    }
  )
);
```

#### **Tier 2: TanStack Query Integration for Server Sync**

```typescript
// Enhanced state for server synchronisation
interface ServerSyncCommentingState extends UniversalCommentingState {
  // Server sync state
  isSyncing: boolean;
  lastSyncTimestamp: number;
  syncQueue: PendingOperation[];
  conflictResolution?: ConflictState[];
}

// TanStack Query mutation types
type CommentMutations = {
  createThread: UseMutationResult<CommentThread, Error, CreateThreadRequest>;
  addComment: UseMutationResult<UniversalComment, Error, AddCommentRequest>;
  resolveThread: UseMutationResult<void, Error, string>;
  updateComment: UseMutationResult<UniversalComment, Error, UpdateCommentRequest>;
};

// Enhanced store with server sync capabilities
const useServerSyncCommentStore = create<ServerSyncCommentingState & {
  mutations: CommentMutations;
  actions: UniversalCommentingActions & {
    syncToServer: () => void;
    queueOperation: (operation: PendingOperation) => void;
    processServerUpdate: (serverData: any) => void;
  };
}>()(
  persist(
    (set, get) => ({
      ...baseCommentState,
      isSyncing: false,
      lastSyncTimestamp: 0,
      syncQueue: [],

      actions: {
        ...baseCommentActions,

        syncToServer: async () => {
          const state = get();
          if (state.syncQueue.length === 0) return;

          set({ isSyncing: true });

          try {
            for (const operation of state.syncQueue) {
              switch (operation.type) {
                case 'CREATE_THREAD':
                  await get().mutations.createThread.mutateAsync(operation.data);
                  break;
                case 'ADD_COMMENT':
                  await get().mutations.addComment.mutateAsync(operation.data);
                  break;
                case 'RESOLVE_THREAD':
                  await get().mutations.resolveThread.mutateAsync(operation.data.threadId);
                  break;
              }
            }

            set({
              syncQueue: [],
              lastSyncTimestamp: Date.now(),
              isSyncing: false
            });
          } catch (error) {
            set({ isSyncing: false });
            console.error('Sync failed:', error);
          }
        },

        queueOperation: (operation) => {
          set(state => ({
            syncQueue: [...state.syncQueue, operation]
          }));
        },

        processServerUpdate: (serverData) => {
          // Handle incoming server updates
          set(state => ({
            threads: new Map(serverData.threads),
            comments: new Map(serverData.comments),
            lastSyncTimestamp: Date.now()
          }));
        }
      }
    })
  )
);
```

#### **TipTap-Specific Adapter State**

```typescript
// Adapter state remains lightweight and focused
interface TipTapCommentingAdapter {
  editor: Editor;
  currentSelection?: { from: number; to: number };
  highlightedPointers: Set<string>;

  // Performance optimisations
  positionCache: Map<string, { from: number; to: number }>;
  pendingPositionUpdates: Set<string>;
}

// Combined state architecture
interface TipTapCommentingState {
  universal: UniversalCommentingState;           // Zustand (Tier 1)
  adapter: TipTapCommentingAdapter;              // Lightweight TipTap state
  serverSync?: ServerSyncCommentingState;        // Optional server sync (Tier 2)
  collaboration?: CollaborativeCommentingState;  // Optional Yjs layer (Tier 3)
}
```

#### **Event Sourcing Pattern (Optional Enhancement)**

```typescript
// Event-driven updates for audit trail and undo/redo
type CommentOperation =
  | { type: 'COMMENT_CREATED'; payload: { threadId: string; comment: UniversalComment; timestamp: number } }
  | { type: 'COMMENT_EDITED'; payload: { commentId: string; content: string; editReason?: string } }
  | { type: 'THREAD_RESOLVED'; payload: { threadId: string; resolvedBy: string } }
  | { type: 'POINTER_UPDATED'; payload: { threadId: string; newPointer: DocumentPointer } };

const useCommentHistory = () => {
  const [operations, setOperations] = useState<CommentOperation[]>([]);

  const applyOperation = useCallback((operation: CommentOperation) => {
    setOperations(prev => [...prev, operation]);
    // Apply to main store
    commentStore.getState().actions.processOperation(operation);
  }, []);

  const undo = useCallback(() => {
    // Replay operations excluding the last one
    const newOps = operations.slice(0, -1);
    commentStore.getState().actions.replayOperations(newOps);
    setOperations(newOps);
  }, [operations]);

  return { applyOperation, undo, canUndo: operations.length > 0 };
};
```

## TipTap Adapter Implementation (v3)

### TipTap-Specific Pointer Handler

Following Ink & Switch's minimal adapter approach, the TipTap integration focuses only on app-specific concerns:

```typescript
// TipTap pointer adapter
class TipTapPointerAdapter {
  constructor(private editor: Editor) {}

  // Create pointer from current selection
  createPointer(): TipTapTextPointer {
    const { from, to } = this.editor.state.selection;
    const text = this.editor.state.doc.textBetween(from, to, ' ');

    return {
      type: 'tiptap-text-range',
      from,
      to,
      text,
      documentId: this.editor.options.documentId
    };
  }

  // Check if pointer is still valid
  validatePointer(pointer: TipTapTextPointer): boolean {
    const { from, to } = pointer;
    const docSize = this.editor.state.doc.content.size;
    return from >= 0 && to <= docSize && from < to;
  }

  // Highlight commented range
  highlightPointer(pointer: TipTapTextPointer, threadId: string): void {
    this.editor.commands.setComment(threadId, pointer.from, pointer.to);
  }

  // Remove highlighting
  unhighlightPointer(pointer: TipTapTextPointer): void {
    this.editor.commands.unsetComment(pointer.from, pointer.to);
  }

  // Get current user selection
  getCurrentSelection(): { from: number; to: number } | null {
    const { from, to } = this.editor.state.selection;
    return from !== to ? { from, to } : null;
  }
}
```

### Custom Comment Extension

Extends TipTap v3's Mark extension to handle commented text ranges:

```typescript
import { Mark, mergeAttributes } from '@tiptap/core';

const CommentMark = Mark.create({
  name: 'comment',

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => {
          if (!attributes.commentId) {
            return {};
          }
          return {
            'data-comment-id': attributes.commentId
          };
        }
      },
      resolved: {
        default: false,
        parseHTML: element => element.getAttribute('data-resolved') === 'true',
        renderHTML: attributes => {
          return {
            'data-resolved': attributes.resolved
          };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]'
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setComment: (threadId: string, from?: number, to?: number) => ({ commands, state }) => {
        if (from !== undefined && to !== undefined) {
          return commands.setTextSelection({ from, to })
            .setMark(this.name, { commentId: threadId });
        }
        return commands.setMark(this.name, { commentId: threadId });
      },
      unsetComment: (from?: number, to?: number) => ({ commands }) => {
        if (from !== undefined && to !== undefined) {
          return commands.setTextSelection({ from, to })
            .unsetMark(this.name);
        }
        return commands.unsetMark(this.name);
      },
      toggleComment: (threadId: string) => ({ commands }) => {
        return commands.toggleMark(this.name, { commentId: threadId });
      }
    };
  }
});
```

**Key responsibilities:**
- Store comment thread ID in mark attributes
- Handle visual styling for commented ranges
- Manage selection-to-comment mapping
- Support collaborative editing position updates

### Universal Commenting Service with State Management

The core commenting functionality integrates with the chosen state management libraries:

```typescript
// Universal commenting service with Zustand-only integration (Tier 1)
class UniversalCommentingService {
  private commentStore: ReturnType<typeof useCommentStore>;

  constructor(commentStore: ReturnType<typeof useCommentStore>) {
    this.commentStore = commentStore;
  }

  // Create thread (local-only in Tier 1)
  createThread(
    pointer: DocumentPointer,
    initialComment: string,
    author: string
  ): CommentThread {
    return this.commentStore.getState().actions.createThread(pointer, initialComment, author);
  }

  // Add comment (local-only in Tier 1)
  addComment(threadId: string, content: string, author: string): UniversalComment {
    return this.commentStore.getState().actions.addComment(threadId, content, author);
  }

  // Thread resolution (local-only in Tier 1)
  resolveThread(threadId: string, resolvedBy: string): void {
    this.commentStore.getState().actions.resolveThread(threadId, resolvedBy);
  }

  // Get all threads for a document
  getThreadsForDocument(documentId: string): CommentThread[] {
    const state = this.commentStore.getState();
    return Array.from(state.threads.values()).filter(thread =>
      thread.pointers.some(pointer =>
        (pointer as any).documentId === documentId
      )
    );
  }

  // Get comments for a thread
  getCommentsForThread(threadId: string): UniversalComment[] {
    const state = this.commentStore.getState();
    const thread = state.threads.get(threadId);
    if (!thread) return [];

    return Array.from(state.comments.values()).filter(comment =>
      comment.pointers.some(pointer =>
        thread.pointers.some(threadPointer =>
          JSON.stringify(pointer) === JSON.stringify(threadPointer)
        )
      )
    );
  }
}

// React hooks for component integration (Tier 1: Local-only)
export const useUniversalCommenting = (documentId: string) => {
  const commentStore = useCommentStore();

  // Initialize service
  const service = useMemo(
    () => new UniversalCommentingService(commentStore),
    [commentStore]
  );

  // Load from localStorage on mount
  useEffect(() => {
    commentStore.getState().actions.loadFromLocalStorage();
  }, []);

  // Get threads for this document
  const threads = useMemo(
    () => service.getThreadsForDocument(documentId),
    [service, documentId, commentStore((state) => state.threads)]
  );

  return {
    service,
    threads,
    activeThreadId: commentStore((state) => state.activeThreadId),
    panelVisible: commentStore((state) => state.panelVisible),
    hasUnsavedChanges: commentStore((state) => state.hasUnsavedChanges),
    actions: commentStore((state) => state.actions),
  };
};
```

### BubbleMenu Integration (v3)

Update BubbleMenu component with universal commenting approach:

```typescript
import { BubbleMenu } from '@tiptap/react';
import { useCallback } from 'react';

const CommentBubbleMenu = ({ editor, commentingService, pointerAdapter }) => {
  const handleComment = useCallback(() => {
    if (editor) {
      // Use pointer adapter to create TipTap-specific pointer
      const pointer = pointerAdapter.createPointer();

      // Universal commenting service handles the rest
      const thread = commentingService.createThread(
        pointer,
        '', // Will be filled by comment composer
        'current-user' // Should come from app state
      );

      // App-specific: highlight the commented text
      pointerAdapter.highlightPointer(pointer, thread.id);
    }
  }, [editor, commentingService, pointerAdapter]);

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="bubbleMenuComment"
      shouldShow={({ state }) => {
        const { from, to } = state.selection;
        const isEmpty = from === to;
        return !isEmpty; // Show when text is selected
      }}
    >
      <div className="bubble-menu inline-flow">
        <button
          className="button button--small button--plain"
          is="pp-button"
          onClick={handleComment}
          title="Add comment"
        >
          <iconify-icon className="icon" icon="ph:chat-circle" />
          Comment
        </button>
        {/* Other BubbleMenu actions */}
      </div>
    </BubbleMenu>
  );
};
```

## UI Components

### 1. Comment Indicator
Subtle visual marker for commented text:
- Light background highlight or underline
- Hover state showing comment preview
- Click to open comment thread

### 2. Comment Thread Panel
Dedicated panel for comment discussions:
- **Sidebar approach**: Fixed panel alongside editor
- **Floating approach**: Positioned near commented text
- **Modal approach**: Full overlay for focused discussion

### 3. Comment Composer
Rich text input for comment creation:
- Use TipTap setup for consistency
- Support basic formatting (bold, italic, links)
- Author attribution and timestamp

### 4. Comment Thread Display
Thread visualization with replies:
- Flat or nested comment display
- Resolution status indicators
- Reply and resolve actions

## Implementation Steps

*Note: This is a prototype implementation that can be iterated on without backwards compatibility constraints.*

### Phase 1: Core Infrastructure (Universal Layer) ✅ COMPLETED

#### **✅ Completed Tasks:**
1. **✅ Set up state management foundation**
   - ✅ Installed Zustand: `npm install zustand`
   - ✅ Created Zustand store with local persistence (`src/services/commenting/state/comment-store.ts`)
   - ✅ Set up localStorage integration with automatic serialization
   - ✅ Created React hooks for component integration (`src/services/commenting/hooks/use-universal-commenting.ts`)

2. **✅ Created Universal Commenting Service**
   - ✅ Implemented app-agnostic commenting operations with local state (`src/services/commenting/universal-commenting-service.ts`)
   - ✅ Defined pointer-based architecture following Ink & Switch design (`src/services/commenting/document-pointer.ts`)
   - ✅ Built thread and comment management with immediate local persistence
   - ✅ Created React hooks for component integration (includes TipTap-specific and Item View-specific hooks)

3. **✅ Created TipTap Pointer Adapter**
   - ✅ Implemented TipTapTextPointer type and validation (`src/services/commenting/tiptap-pointer-adapter.ts`)
   - ✅ Built pointer creation from editor selections
   - ✅ Handle pointer highlighting and unhighlighting using TipTap v3 command chains
   - ✅ Integrated with TipTap v3's command system

4. **✅ Created comment mark extension for TipTap v3**
   - ✅ Defined TipTap v3 mark extension using data attributes (`src/components/commenting/tiptap/comment-mark.ts`)
   - ✅ Handle mark attributes following CLAUDE.md data-* guidelines (`data-comment-id`, `data-resolved`)
   - ✅ Added custom commands for position-specific operations (setComment, unsetComment, resolveComment)
   - ✅ Integrated with pointer adapter
   - ✅ Added CSS styling for commented text ranges (`src/styles/tiptap.css`)

#### **✅ Additional Completed Work:**
- ✅ Created TipTap integration hook (`src/components/commenting/tiptap/use-tiptap-commenting.ts`)
- ✅ Set up proper TypeScript typing and exports (`src/services/commenting/index.ts`, `src/components/commenting/index.ts`)
- ✅ Implemented visual styling for commented text with hover states and resolved comment indicators
- ✅ Added comprehensive comment management (create, add, resolve, archive threads)
- ✅ Built performance optimizations with Maps for O(1) lookups
- ✅ Created comment statistics and validation methods

#### **✅ Files Created:**
```
✅ src/services/commenting/
   ├── document-pointer.ts              # Universal pointer types
   ├── state/comment-store.ts           # Zustand store with localStorage
   ├── universal-commenting-service.ts  # App-agnostic service layer
   ├── tiptap-pointer-adapter.ts        # TipTap-specific adapter
   ├── hooks/use-universal-commenting.ts # React integration hooks
   └── index.ts                         # Main exports

✅ src/components/commenting/
   ├── tiptap/
   │   ├── comment-mark.ts              # TipTap v3 mark extension
   │   └── use-tiptap-commenting.ts     # TipTap integration hook
   └── index.ts                         # Component exports

✅ src/styles/tiptap.css                # Updated with comment styling
```

#### **✅ Architecture Benefits Achieved:**
- **Universal**: Core commenting works independently of any specific editor ✅
- **Minimal Adapter**: TipTap integration only handles pointer creation and highlighting ✅
- **Progressive Enhancement**: Ready for Tier 2 (server sync) and Tier 3 (real-time collaboration) ✅
- **Type Safe**: Full TypeScript support with proper interfaces ✅
- **Local-First**: Works entirely offline with localStorage persistence ✅

---

### Phase 2: App Integration Layer (NEXT)
5. **Update BubbleMenu with commenting**
   - Integrate universal commenting service into BubbleMenu
   - Use pointer adapter for selection handling
   - Update BubbleMenu patterns

6. **Update comment indicator system**
   - Update visual markers using TipTap mark extension
   - Add hover interactions showing comment previews
   - Update click handling to open comment threads

### Phase 3: Universal Comment Interface
7. **Create universal comment components**
   - Generic comment thread display (app-agnostic)
   - Universal comment composer
   - Reusable comment interaction patterns

8. **Update TipTap-specific UI integration**
   - Update comment panel positioning relative to editor
   - Handle pointer validation and updates
   - Integrate with TipTap's collaboration features

### Phase 4: Advanced Features
9. **Build advanced comment interactions**
   - Reply functionality using universal service
   - Comment resolution with pointer updates
   - Thread navigation and management

10. **Add server sync features (Tier 2)**
    - Install TanStack Query: `npm install @tanstack/react-query`
    - Integrate server synchronisation with existing Zustand store
    - Add background sync and conflict resolution
    - Implement optimistic updates for server operations

11. **Add collaboration features (Tier 3)**
    - Install Yjs: `npm install yjs @hocuspocus/provider y-tiptap`
    - Integrate real-time collaboration with state management
    - Add user awareness and presence indicators
    - Handle conflict resolution automatically

12. **Add extensibility features**
    - UI features (scroll to comment)
    - Future-ready architecture for other pointer types
    - Integration points for external systems

## Key Technical Considerations

### Position Tracking (TipTap v3)
- **Document model**: Uses v3's improved document model with better position stability
- **Transaction system**: Leverages v3's transaction system for consistent position updates
- **Transform handling**: Comment positions automatically transform with document changes
- **Position validation**: Check comment anchors remain valid using v3's position mapping

### Selection Management
- **Range validation**: Ensure selected text exists before creating comments
- **Overlapping comments**: Handle multiple comments on same text range
- **Selection persistence**: Maintain selection context during comment creation

### Performance Optimization
- **Lazy loading**: Load comment threads on demand
- **Virtual scrolling**: For large comment collections
- **Debounced updates**: Optimize frequent position updates

### Accessibility
- **Keyboard navigation**: Tab order through comments and controls
- **Screen reader support**: Proper ARIA labels and descriptions
- **Focus management**: Clear focus states for comment interactions

## Integration with Existing Codebase

### Update Existing Patterns
- **BubbleMenu**: Update BubbleMenu stories and patterns
- **Component architecture**: Update Web Component patterns
- **Styling**: Update CSS architecture and design tokens as needed
- **Services**: Integrate with service layer if needed

### File Structure (State Management + Universal + Adapters)
```
src/
├── services/
│   └── commenting/
│       ├── state/
│       │   ├── comment-store.ts             # Zustand store
│       │   ├── comment-queries.ts           # TanStack Query config
│       │   ├── comment-mutations.ts         # Server mutations
│       │   └── collaboration-store.ts       # Yjs integration (Tier 2)
│       ├── universal-commenting-service.ts  # App-agnostic commenting
│       ├── document-pointer.ts              # Pointer type definitions
│       ├── tiptap-pointer-adapter.ts        # TipTap-specific adapter
│       └── item-view-pointer-adapter.ts     # Item View adapter
├── components/
│   └── commenting/
│       ├── providers/
│       │   ├── commenting-provider.tsx      # Main context provider
│       │   └── collaboration-provider.tsx   # Yjs provider (Tier 2)
│       ├── universal/
│       │   ├── comment-thread.tsx           # Generic thread display
│       │   ├── comment-composer.tsx         # Generic comment input
│       │   ├── comment-panel.tsx            # Generic comment panel
│       │   └── comment-indicators.tsx       # Generic comment markers
│       ├── tiptap/
│       │   ├── comment-mark.ts              # TipTap v3 extension
│       │   ├── tiptap-comment-indicator.tsx # Text markers
│       │   ├── use-tiptap-commenting.ts     # TipTap integration hook
│       │   └── comment-bubble-menu.tsx      # Enhanced bubble menu
│       ├── item-view/
│       │   ├── item-view-comment-indicator.tsx # Section-based markers
│       │   ├── use-item-view-commenting.ts  # Item View integration hook
│       │   └── item-interaction-with-comments.tsx # Enhanced ItemInteraction
│       └── hooks/
│           ├── use-universal-commenting.ts  # Main commenting hook
│           ├── use-optimistic-updates.ts    # Optimistic UI patterns
│           └── use-comment-history.ts       # Undo/redo functionality
├── stories/
│   ├── components/
│   │   └── bubble-menu.stories.tsx          # TipTap commenting examples
│   └── patterns/
│       └── item-view.stories.tsx            # Item View commenting examples
```

### Storybook Documentation
- Update BubbleMenu stories with commenting examples
- Document commenting interaction patterns
- Provide usage guidelines and best practices

## Future Considerations

### Collaborative Features
- Real-time comment synchronization
- Multi-user comment threads
- Notification system for comment activity

### Advanced Functionality
- Comment templates and suggested responses
- Comment analytics and insights
- Integration with external review systems

### Scalability
- Comment archiving and cleanup
- Performance optimization for large documents
- Comment search and filtering

## Testing Reusability: Item View Commenting

To validate the universal commenting architecture, we'll update/create a second implementation for commenting on structured content in Item View components.

### Item View Pointer Type

```typescript
// Item View specific pointer for commenting on structured content
interface ItemViewPointer extends DocumentPointer {
  type: 'item-view-section';
  itemId: string;                               // Which item is being commented on
  sectionPath: string;                          // Dot-notation path to section (e.g., 'metadata.title')
  viewScope: ViewScope;                         // Context: micro, mini, mid, maxi
  interactionMode: InteractionMode;             // Mode: preview, inspect, edit, transform
  contentType: string;                          // Item content type
}

```

### Item View Pointer Adapter

```typescript
class ItemViewPointerAdapter {
  constructor(private contentType: string) {}

  // Create pointer for item section comments
  createItemPointer(
    itemId: string,
    sectionPath: string,
    viewScope: ViewScope,
    mode: InteractionMode
  ): ItemViewPointer {
    return {
      type: 'item-view-section',
      itemId,
      sectionPath,
      viewScope,
      interactionMode: mode,
      contentType: this.contentType
    };
  }

  // Validate item pointer still exists
  validatePointer(pointer: ItemViewPointer): boolean {
    // Check if item exists and section path is valid
    return this.itemExists(pointer.itemId) &&
           this.sectionPathValid(pointer.itemId, pointer.sectionPath);
  }

  // Highlight commented section in Item View
  highlightPointer(pointer: ItemViewPointer, threadId: string): void {
    const element = document.querySelector(
      `[data-item-id="${pointer.itemId}"] [data-section="${pointer.sectionPath}"]`
    );
    if (element) {
      element.setAttribute('data-comment-thread', threadId);
      element.setAttribute('data-commented', 'true');
    }
  }

  // Remove highlighting
  unhighlightPointer(pointer: ItemViewPointer): void {
    const element = document.querySelector(
      `[data-item-id="${pointer.itemId}"] [data-section="${pointer.sectionPath}"]`
    );
    if (element) {
      element.removeAttribute('data-comment-thread');
      element.removeAttribute('data-commented');
    }
  }
}
```

### Integration with Item View Components

```typescript
// Enhanced ItemInteraction component with commenting
export function ItemInteractionWithComments<T extends BaseItem>({
  item,
  contentType,
  children,
  commentingService,
  ...props
}: ItemInteractionProps<T> & {
  commentingService: UniversalCommentingService;
}) {
  const pointerAdapter = useMemo(
    () => new ItemViewPointerAdapter(contentType),
    [contentType]
  );

  const handleSectionComment = useCallback((sectionPath: string) => {
    const pointer = pointerAdapter.createItemPointer(
      item.id,
      sectionPath,
      props.initialScope || 'mid',
      'inspect'
    );

    const thread = commentingService.createThread(
      pointer,
      '',
      'current-user'
    );

    pointerAdapter.highlightPointer(pointer, thread.id);
  }, [item.id, pointerAdapter, commentingService, props.initialScope]);

  return (
    <ItemInteraction {...props} item={item} contentType={contentType}>
      {children}
      {/* Comment indicators for sections */}
      <CommentIndicators
        itemId={item.id}
        onSectionComment={handleSectionComment}
      />
    </ItemInteraction>
  );
}
```

### Implementation Steps for Item View Commenting

#### Phase 2B: Item View Integration
4b. **Create/update Item View pointer adapter**
   - Implement ItemViewPointer type for commenting on Item concept sections
   - Build adapter for structured content commenting (state, actions, operational principles)
   - Handle section-based highlighting and validation

5b. **Update Item View components with commenting**
   - Update ItemInteraction with comment capabilities
   - Add section-level comment indicators
   - Integrate with universal commenting service

6b. **Test cross-adapter compatibility**
   - Verify universal service works with both TipTap and Item View
   - Test comment threading across different pointer types (text ranges vs. Item sections)
   - Validate UI consistency between implementations

### Benefits Demonstrated

1. **True universality**: Same commenting service handles both text ranges and Item concept sections
2. **Minimal adaptation**: Each document type only implements pointer operations
3. **Consistent UX**: Comment threads, resolution, and interactions work identically
4. **Cross-type compatibility**: TipTap and Item View comments can coexist in same interface

### Item Concept Integration

This validates commenting on Item concept aspects:
- **State sections**: Comment on item state definitions and transitions
- **Actions sections**: Discuss available operations and their implications
- **Operational principles**: Review and refine item behavior rules
- **View scope context**: Comments aware of micro/mini/mid/maxi rendering context

## Alignment with Ink & Switch Universal Commenting

This implementation follows the key principles from Ink & Switch's research:

### Minimal API Surface
- **App-specific**: Only TipTap pointer creation, validation, and highlighting
- **Universal**: All comment operations, storage, threading, and UI handled generically
- **Clean separation**: Clear boundaries between document-specific and generic functionality

### Extensibility Benefits
- **Future document types**: The universal service can support other editors and content types
- **Cross-app features**: Potential for unified comment inbox, search, analytics
- **Reduced development overhead**: New content types only need pointer adapters

### Pointer-Based Architecture
- **Flexible targeting**: TipTap text ranges now, but extensible to other granularities
- **Stable references**: Pointers survive document changes through TipTap's position mapping
- **Type safety**: Strong typing ensures pointer compatibility

## Success Criteria

1. **Universal**: Core commenting functionality works independently of TipTap
2. **Minimal adapter**: TipTap integration limited to pointer operations and highlighting
3. **Extensible**: Easy to add support for other document types
4. **Performant**: Smooth interaction without editor lag
5. **Accessible**: Full keyboard and screen reader support
6. **Consistent**: Follows established design system patterns

This implementation plan provides a structured approach to implementing commenting functionality while following Ink & Switch's universal commenting architecture, ensuring maximum reusability and minimal app-specific code.