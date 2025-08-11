import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  UniversalComment, 
  CommentThread, 
  DocumentPointer 
} from '../document-pointer.js';

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

interface CommentActions {
  // Thread management
  createThread: (pointer: DocumentPointer) => CommentThread;
  addComment: (threadId: string, content: string, author: string) => UniversalComment;
  resolveThread: (threadId: string, resolvedBy: string) => void;
  setActiveThread: (id?: string) => void;
  
  // Draft management
  setDraftComment: (draft?: { pointer: DocumentPointer; content: string; tempId: string }) => void;
  
  // UI state
  togglePanel: () => void;
  
  // Clear all data
  clearAllData: () => void;
}

// Generate unique IDs
const generateId = (prefix: string): string => 
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const useCommentStore = create<UniversalCommentingState & {
  actions: CommentActions;
}>()(
  persist(
    (set, get) => ({
      threads: new Map(),
      comments: new Map(),
      panelVisible: false,
      lastSavedTimestamp: 0,
      hasUnsavedChanges: false,
      
      actions: {
        createThread: (pointer) => {
          const threadId = generateId('thread');
          
          const thread: CommentThread = {
            id: threadId,
            rootCommentId: '', // No root comment initially
            pointers: [pointer],
            participants: [], // No participants initially
            status: 'draft' // Start as draft
          };
          
          set(state => ({
            threads: new Map(state.threads).set(threadId, thread),
            hasUnsavedChanges: true
          }));
          
          return thread;
        },
        
        addComment: (threadId, content, author) => {
          const thread = get().threads.get(threadId);
          if (!thread) throw new Error(`Thread ${threadId} not found`);

          const commentId = generateId('comment');
          const comment: UniversalComment = {
            id: commentId,
            author,
            pointers: thread.pointers,
            content,
            timestamp: new Date(),
            status: 'published'
          };

          const isFirstComment = thread.rootCommentId === '';
          const updatedThread: CommentThread = {
            ...thread,
            rootCommentId: isFirstComment ? commentId : thread.rootCommentId,
            participants: Array.from(new Set([...thread.participants, author])),
            status: 'active' // Thread is now active
          };

          set(state => ({
            threads: new Map(state.threads).set(threadId, updatedThread),
            comments: new Map(state.comments).set(commentId, comment),
            hasUnsavedChanges: true
          }));

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
        },
        
        setActiveThread: (id) => set({ activeThreadId: id }),
        setDraftComment: (draft) => set({ draftComment: draft }),
        togglePanel: () => set(state => ({ panelVisible: !state.panelVisible })),
        
        clearAllData: () => {
          set({
            threads: new Map(),
            comments: new Map(),
            activeThreadId: undefined,
            draftComment: undefined,
            panelVisible: false,
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
          try {
            // Safely convert arrays back to Maps with validation
            state.threads = new Map(Array.isArray(state.threads) ? state.threads : []);
            state.comments = new Map(Array.isArray(state.comments) ? state.comments : []);
          } catch (error) {
            console.error('Failed to rehydrate comment store:', error);
            // Reset to empty state on corruption
            state.threads = new Map();
            state.comments = new Map();
            state.lastSavedTimestamp = 0;
            state.hasUnsavedChanges = false;
          }
        }
      }
    }
  )
);