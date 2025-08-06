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
        createThread: (pointer, initialComment, author) => {
          const threadId = generateId('thread');
          const commentId = generateId('comment');
          
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
          const commentId = generateId('comment');
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