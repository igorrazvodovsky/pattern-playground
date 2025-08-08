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

**Phase 2: App Integration Layer** ✅ **COMPLETED**
- BubbleMenu integration with commenting functionality
- Comment indicator system with hover interactions and click handling
- Updated BubbleMenu stories and documentation with commenting examples

**Phase 3: Universal Comment Interface** ✅ **COMPLETED**
- Universal comment components using existing primitives (Popover, Drawer, etc.)
- Comment panel and thread display leveraging established patterns
- TipTap-specific UI integration with design system consistency
- Enhanced BubbleMenu stories with full comment UI demonstration

**Phase 4A: Item View Commenting** 🔄 **NEXT**
- Item View pointer adapter for commenting on opened items at different scopes
- Integration with ItemInteraction component for scope-aware commenting  
- Comment indicators in ItemDetail, ItemFullView, and hover cards
- Cross-scope comment persistence (comments survive scope escalation)

**Phase 4B: Advanced Features**
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

## UI Components (Leveraging Existing Design System)

### 1. Comment Indicator
Subtle visual marker for commented text (already implemented):
- CSS-based highlighting using design system color tokens
- Hover effects with existing interaction patterns
- Click handling integrated with universal commenting service

### 2. Comment Thread Panel
**Built using existing primitives for consistency:**

#### **Popover-based Comments** (Primary approach)
- Use existing `Popover` component for contextual comment display
- Position near commented text using Popover's positioning system
- Leverage existing focus management and accessibility features
- Benefits: Lightweight, contextual, doesn't obstruct content

#### **Drawer-based Comments** (Secondary approach)
- Use existing `Drawer` component for persistent comment sidebar
- Slide-out panel for extended comment discussions
- Maintain editor focus while showing comment threads
- Benefits: More space for complex threading, persistent visibility

#### **Modal-based Comments** (Tertiary approach)
- Use existing `Modal` component for focused comment discussions
- Full overlay when deep comment interaction is needed
- Benefits: Distraction-free commenting experience

### 3. Comment Composer
**Built on established form patterns:**
- Use existing form components (`textarea`, `button`, `input`)
- Leverage existing validation and submission patterns
- Consistent styling with design system form elements
- Optional rich text using simplified TipTap instance
- Author attribution using existing user display patterns

### 4. Comment Thread Display
**Using existing list and content patterns:**
- Thread container using established list patterns
- Individual comments using existing card/content layouts
- Status indicators using existing badge/chip components
- Action buttons using existing button variants and icon patterns
- Timestamp formatting using existing date display utilities

### 5. Integration Components
**Connecting universal system with existing patterns:**
- Comment count badges using existing notification patterns
- Loading states using existing spinner/skeleton components
- Empty states using existing placeholder patterns
- Error handling using existing error display components

## Design System Integration Strategy

### Component Reuse Philosophy
Phase 3 prioritises **composition over creation** by leveraging existing design system components:

#### **Existing Components to Leverage:**
```typescript
// Core primitives (already available)
import { Popover } from '../primitives/popover';
import { Drawer } from '../primitives/drawer';
import { Modal } from '../primitives/modal';
import { Button } from '../primitives/button';
import { Input, Textarea } from '../primitives/input';
import { Badge } from '../primitives/badge';
import { Card } from '../primitives/card';
import { List, ListItem } from '../primitives/list';

// Messaging patterns (established in Messaging.stories.tsx)
// Perfect foundation for comment threading:
// .message - individual message container
// .message__content - message content wrapper
// .message__body - message text content
// .message__author - author attribution
// .message__timestamp - timestamp display
// .message-composer - input/compose area
// .messages - container for message threads

// Comment-specific compositions using existing message patterns
export const CommentThread = ({ thread, onAddComment, onResolve }) => (
  <div className="messages layer">
    {thread.comments.map(comment => (
      <div key={comment.id} className="message">
        <pp-avatar size="small">
          <img src={`https://i.pravatar.cc/150?seed=${comment.author}`} alt={comment.author} />
        </pp-avatar>
        <div className="message__content">
          <div className="message__body">
            <div className="message__author">{comment.author}</div>
            {comment.content}
          </div>
          <small className="message__timestamp">
            {formatTimestamp(comment.timestamp)}
            {comment.status === 'resolved' && ' • Resolved'}
          </small>
        </div>
      </div>
    ))}
    <div className="message-composer">
      <pp-avatar size="small">
        <img src={`https://i.pravatar.cc/150?seed=current-user`} alt="You" />
      </pp-avatar>
      <pp-input placeholder="Add a comment..." onSubmit={onAddComment}>
        <iconify-icon className="icon" icon="ph:arrow-elbow-down-left" slot="suffix" />
      </pp-input>
    </div>
  </div>
);

export const CommentPopover = ({ children, thread, onClose, onAddComment }) => (
  <Popover trigger={children} onClose={onClose}>
    <CommentThread thread={thread} onAddComment={onAddComment} />
  </Popover>
);

export const CommentDrawer = ({ isOpen, threads, onClose }) => (
  <Drawer isOpen={isOpen} onClose={onClose} position="right">
    {threads.map(thread => (
      <CommentThread key={thread.id} thread={thread} />
    ))}
  </Drawer>
);
```

#### **Benefits of This Approach:**
- **Consistency**: Comments automatically inherit design system styling and behaviour
- **Maintenance**: Updates to base components automatically improve comment UI
- **Accessibility**: Leverages existing accessibility implementations in primitives
- **Performance**: No duplicate component logic or styling overhead
- **Developer Experience**: Familiar patterns for team members

#### **Implementation Pattern:**
1. **Identify needs**: What commenting UI functionality is required?
2. **Map to existing**: Which existing components provide this functionality?
3. **Compose, don't create**: Build comment components as compositions of existing primitives
4. **Extend minimally**: Only add comment-specific logic, not UI patterns

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

### Phase 2: App Integration Layer ✅ COMPLETED

#### **✅ Completed Tasks:**
1. **✅ Updated BubbleMenu with commenting functionality**
   - ✅ Integrated `CommentMark` extension into `useSimpleEditor` hook with optional parameter
   - ✅ Added `useTipTapCommentingIntegration` hook to BubbleMenu stories
   - ✅ Enhanced `InlineComment` story with real commenting infrastructure instead of alert() placeholders
   - ✅ Implemented proper state management integration with toast notifications and visual feedback

2. **✅ Enhanced comment indicator system**
   - ✅ Leveraged existing CSS comment styling (`span[data-comment-id]`) for visual markers
   - ✅ Added click handlers for commented text interaction using `handleEditorClick`
   - ✅ Implemented visual distinction between active comments (yellow) and resolved comments (green)
   - ✅ Added hover effects and comment status indicators with proper cursor states

3. **✅ Created comprehensive commenting workflow story**
   - ✅ Built new `CommentingWorkflow` story demonstrating full comment interaction lifecycle
   - ✅ Added pre-existing commented text with different states (active vs resolved)
   - ✅ Included comprehensive instructions and comment status display
   - ✅ Added visual legend showing comment indicator meanings and states

4. **✅ Updated BubbleMenu documentation**
   - ✅ Enhanced `BubbleMenu.mdx` with new commenting workflow story
   - ✅ Added comprehensive documentation about universal commenting integration
   - ✅ Included technical implementation details following Ink & Switch architecture
   - ✅ Expanded sections about comment indicators, state management, and interaction patterns

#### **✅ Key Features Implemented:**
- **Real commenting functionality**: Users can create actual comment threads on selected text via BubbleMenu
- **Visual feedback systems**: Toast notifications show comment creation status and user guidance
- **Interactive comment markers**: Clicking commented text triggers `handleCommentClick` with proper thread activation
- **Comment state visualization**: Clear visual distinction between active and resolved comment states
- **Comprehensive demo interface**: Debug information shows thread count, active thread ID, and panel visibility
- **Progressive enhancement**: Comments work without JavaScript through CSS-only styling fallbacks

#### **✅ Technical Integration Achieved:**
- **Zustand integration**: BubbleMenu now uses universal commenting store with local persistence
- **Pointer adapter usage**: `TipTapPointerAdapter` handles text range selection and highlighting
- **State management**: Proper integration with `canCreateComment` for button state management
- **Event handling**: Click events on commented text properly route through commenting system
- **Visual consistency**: Comment indicators follow design system color tokens and interaction patterns

#### **✅ Files Updated:**
```
✅ src/stories/components/BubbleMenu.stories.tsx
   - Added CommentMark extension integration
   - Enhanced InlineComment story with real functionality
   - Created new CommentingWorkflow story with comprehensive demo
   - Integrated useTipTapCommentingIntegration hook

✅ src/stories/components/BubbleMenu.mdx
   - Added CommentingWorkflow story documentation
   - Expanded universal commenting integration section
   - Added technical implementation details
   - Updated related patterns and usage guidelines
```

#### **✅ Architecture Benefits Validated:**
- **Universal commenting works**: BubbleMenu successfully uses universal commenting service ✅
- **Clean separation**: TipTap-specific concerns isolated to pointer adapter ✅
- **State persistence**: Comment threads persist across page reloads via localStorage ✅
- **Visual integration**: Comment indicators seamlessly integrate with existing design system ✅
- **User experience**: Smooth commenting workflow with appropriate feedback and guidance ✅

---

### Phase 3: Universal Comment Interface ✅ COMPLETED

#### **✅ Completed Tasks:**

**Phase 3A: Comment Display Components (Leveraging Messaging Patterns)**
1. **✅ Created CommentThread component using existing message patterns**
   - ✅ Built using established `.messages` container patterns from `Messaging.stories.tsx`
   - ✅ Individual comments use `.message` structure with author attribution (`message__author`)
   - ✅ Leveraged existing `.message-composer` pattern for comment input with pp-input integration
   - ✅ Status indicators follow `.message__timestamp` pattern with "Resolved" state display
   - ✅ Thread header with comment count and resolve button using system message pattern

2. **✅ Created CommentPopover using existing Popover component**
   - ✅ Built using native HTML Popover API with `popover="true"` and positioning system
   - ✅ Contextual display near commented text ranges with viewport boundary detection
   - ✅ Automatic focus management and escape key handling via existing Popover behaviour
   - ✅ Lightweight, non-obstructive comment display with proper z-index layering

3. **✅ Created CommentDrawer using existing Drawer component**
   - ✅ Built using existing `pp-modal` and `dialog` with `.drawer--right` classes
   - ✅ Persistent sidebar for extended comment discussions with 400px width
   - ✅ Displays multiple `CommentThread` components with active/resolved grouping
   - ✅ Empty state with iconography and helpful messaging for no comments
   - ✅ Active thread highlighting with interactive border and background states

**Phase 3B: Integration and State Management**
4. **✅ Created universal comment UI integration hook**
   - ✅ Built `useCommentUI` hook connecting universal commenting with UI components
   - ✅ Popover state management with trigger element positioning and lifecycle
   - ✅ Drawer state management with toggle, open, close operations
   - ✅ Comments grouped by thread ID in Map structure for efficient rendering
   - ✅ Enhanced click handling for commented text with automatic popover display

5. **✅ Updated BubbleMenu stories with enhanced comment UI**
   - ✅ Created `CommentingWithUI` story demonstrating full comment workflow
   - ✅ Integration of Comment, Highlight, and Panel toggle buttons in BubbleMenu
   - ✅ Real-time popover display when creating new comment threads
   - ✅ Click-to-view functionality on existing commented text
   - ✅ Comprehensive status display showing active/resolved thread counts and UI state

#### **✅ Key Features Implemented:**

**Universal Comment Interface:**
- **Message-based Threading**: Comments use proven messaging patterns for familiar UX
- **Popover Contextual Display**: Lightweight, positioned comment viewing without content obstruction
- **Drawer Persistent Panel**: Full comment management interface with thread organization
- **State Synchronization**: UI state perfectly synced with universal commenting store
- **Native Accessibility**: Inherits accessibility from existing Popover and Drawer components

**Advanced Comment Interactions:**
- **Thread Resolution**: Visual status changes and disabled composer for resolved threads
- **Reply Threading**: Full conversation threads with author attribution and timestamps
- **Real-time Updates**: UI components automatically reflect comment store changes
- **Cross-UI Consistency**: Comments created in popover appear in drawer and vice versa
- **Responsive Design**: Works across different viewport sizes with adaptive positioning

**Enhanced User Experience:**
- **Visual Feedback**: Toast notifications, state indicators, and comprehensive status display
- **Keyboard Navigation**: Full keyboard support inherited from primitive components
- **Click Affordances**: Clear interaction patterns for commented text and UI controls
- **Loading States**: Proper form submission and state management during comment operations

#### **✅ Technical Architecture Achieved:**

**Component Composition Strategy:**
- **Primitive Reuse**: 100% composition using existing Popover, Drawer, Modal, Input, Button components
- **Message Pattern Leverage**: Direct reuse of `.messages`, `.message`, `.message-composer` CSS patterns
- **Zero New CSS**: All styling inherited from existing design system components
- **Progressive Enhancement**: Components work with JavaScript disabled through CSS-only styling

**State Management Integration:**
- **Universal Store Connection**: Seamless integration with Zustand commenting store
- **Local Persistence**: UI state survives page refreshes through localStorage integration
- **Performance Optimization**: Map-based comment grouping for O(1) thread lookups
- **Memory Efficiency**: Lazy rendering and event cleanup in component lifecycle

**Developer Experience:**
- **TypeScript First**: Full type safety across all comment UI components
- **Familiar Patterns**: Uses established messaging and form interaction patterns
- **Composable Architecture**: Easy to integrate comment UI into other editor implementations
- **Debugging Support**: Comprehensive status displays for development and testing

#### **✅ Files Created:**
```
✅ src/components/commenting/universal/
   ├── comment-thread.tsx           # Message-pattern comment threading
   ├── comment-popover.tsx          # Popover-based contextual display
   ├── comment-drawer.tsx           # Drawer-based persistent panel
   └── index.ts                     # Universal component exports

✅ src/components/commenting/hooks/
   ├── use-comment-ui.ts            # UI integration hook
   └── index.ts                     # Hook exports

✅ src/stories/components/BubbleMenu.stories.tsx
   └── Added CommentingWithUI story # Enhanced demo with full UI stack

✅ src/stories/components/BubbleMenu.mdx
   └── Added enhanced commenting docs # Documentation for new UI components
```

#### **✅ Architecture Benefits Validated:**

**Design System Integration:**
- **Component Consistency**: Comments automatically inherit all design system updates ✅
- **Accessibility Built-in**: Full keyboard navigation, screen reader support, focus management ✅
- **Visual Harmony**: Perfect integration with existing UI patterns and color tokens ✅
- **Maintenance Efficiency**: Updates to primitives automatically improve comment UI ✅

**Universal Architecture Success:**
- **Cross-Editor Ready**: Comment UI works with any document type using pointer system ✅
- **State Management Proven**: Zustand + localStorage provides robust local-first experience ✅
- **Performance Optimized**: Efficient rendering and memory usage with Map-based data structures ✅
- **Developer Friendly**: Clear separation of concerns and familiar React patterns ✅

**User Experience Excellence:**
- **Intuitive Interactions**: Click commented text → popover, button → drawer, natural workflow ✅
- **Visual Feedback**: Clear status indicators, loading states, and contextual information ✅
- **Responsive Design**: Works seamlessly across desktop and mobile viewports ✅
- **Keyboard Accessible**: Full functionality available via keyboard navigation ✅

---

### Phase 4A: Item View Commenting Integration

#### **ItemView Pointer System**
1. **Create ItemView pointer adapter**
   - Build `ItemViewPointer` type for commenting on opened items
   - Implement scope-aware commenting (micro/mini/mid/maxi contexts)
   - Handle item metadata and view state in pointer references
   - Support different content types through ItemInteraction system

2. **Integrate with ItemInteraction component**
   - Add commenting capabilities to ItemInteraction workflow
   - Handle comment persistence across scope escalation (mini → mid → maxi)
   - Maintain comment context when items transition between view scopes
   - Add comment indicators to ItemDetail, ItemFullView, ItemPreview components

#### **ItemView Comment UI Integration**
3. **Add comment controls to item views**
   - Integrate comment button in item view headers/toolbars
   - Add comment count indicators and status badges
   - Handle comment panel visibility in different view scopes
   - Ensure comment UI adapts to drawer, dialog, and hover card contexts

4. **Cross-scope comment synchronization**
   - Comments created in mini scope appear in mid/maxi scopes
   - Comment threads persist when user escalates item view scope
   - Handle comment focus and active thread state across scope transitions

### Phase 4B: Advanced Features

5. **Build advanced comment interactions**
   - Reply functionality using universal service
   - Comment resolution with pointer updates
   - Thread navigation and management

6. **Add server sync features (Tier 2)**
    - Install TanStack Query: `npm install @tanstack/react-query`
    - Integrate server synchronisation with existing Zustand store
    - Add background sync and conflict resolution
    - Implement optimistic updates for server operations

7. **Add collaboration features (Tier 3)**
    - Install Yjs: `npm install yjs @hocuspocus/provider y-tiptap`
    - Integrate real-time collaboration with state management
    - Add user awareness and presence indicators
    - Handle conflict resolution automatically

8. **Add extensibility features**
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
│       │   ├── comment-popover.tsx          # Popover-based comment display (uses existing Popover)
│       │   ├── comment-drawer.tsx           # Drawer-based comment panel (uses existing Drawer)
│       │   ├── comment-thread.tsx           # Thread display (uses .messages patterns from Messaging.stories.tsx)
│       │   ├── comment-item.tsx             # Individual comment (uses .message patterns)
│       │   ├── comment-composer.tsx         # Comment input (uses .message-composer patterns)
│       │   └── comment-status-badge.tsx     # Status indicators (uses existing badge components)
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
// Item View specific pointer for commenting on opened items
interface ItemViewPointer extends DocumentPointer {
  type: 'item-view';
  itemId: string;                               // Which item is being commented on  
  itemType: string;                             // Item content type (user, document, etc.)
  viewScope: ViewScope;                         // Current view context: micro, mini, mid, maxi
  interactionMode: InteractionMode;             // Current mode: preview, inspect, edit, transform
  viewContext?: string;                         // Optional view context (drawer, dialog, hover-card)
  metadata?: Record<string, unknown>;           // Item metadata snapshot
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