import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import { useCommentStore } from '../state/comment-store.js';
import { UniversalCommentingService } from '../universal-commenting-service.js';
import { TipTapPointerAdapter } from '../tiptap-pointer-adapter.js';
import type { CommentThread, UniversalComment, TipTapTextPointer } from '../document-pointer.js';

interface CommentSystemOptions {
  documentId: string;
  editorId?: string;
  currentUser: string;
  context: 'tiptap' | 'item-view' | 'general';
}

interface CommentUIState {
  popoverOpen: boolean;
  drawerOpen: boolean;
  popoverThread: CommentThread | null;
  popoverTriggerElement: HTMLElement | null;
}

export const useCommentSystem = (
  editor: Editor | null,
  options: CommentSystemOptions
) => {
  const { documentId, editorId, currentUser, context } = options;
  const commentStore = useCommentStore();
  
  // Initialize service with a function that returns the current state
  const service = useMemo(
    () => new UniversalCommentingService(() => useCommentStore.getState()),
    []
  );

  // Create pointer adapter for TipTap context
  const pointerAdapter = useMemo(() => {
    if (context !== 'tiptap' || !editor) return null;
    return new TipTapPointerAdapter(editor, documentId, editorId);
  }, [context, editor, documentId, editorId]);

  // UI state for popover/drawer interactions
  const [uiState, setUIState] = useState<CommentUIState>({
    popoverOpen: false,
    drawerOpen: false,
    popoverThread: null,
    popoverTriggerElement: null
  });

  // Stable reference to service to prevent unnecessary re-renders
  const serviceRef = useRef(service);
  serviceRef.current = service;

  // Get threads based on context
  const threads = useMemo(() => {
    if (context === 'tiptap') {
      const tipTapThreads = service.getThreadsByPointerType('tiptap-text-range');
      if (!editorId) return tipTapThreads;
      return tipTapThreads.filter(thread =>
        thread.pointers.some(pointer =>
          pointer.type === 'tiptap-text-range' && 
          (pointer as any).editorId === editorId
        )
      );
    }
    
    if (context === 'item-view') {
      return service.getThreadsByPointerType('item-view-section');
    }
    
    return service.getThreadsForDocument(documentId);
  }, [service, context, editorId, documentId, commentStore.threads]);

  // Get comments for active thread
  const activeThreadComments = useMemo(() => {
    if (!commentStore.activeThreadId) return [];
    return service.getCommentsForThread(commentStore.activeThreadId);
  }, [service, commentStore.activeThreadId, commentStore.comments]);

  // Get active thread details
  const activeThread = useMemo(() => {
    if (!commentStore.activeThreadId) return undefined;
    return service.getThread(commentStore.activeThreadId);
  }, [service, commentStore.activeThreadId, commentStore.threads]);

  // Group comments by thread ID for efficient rendering
  const commentsMap = useMemo(() => {
    const map = new Map<string, UniversalComment[]>();
    
    threads.forEach(thread => {
      const threadComments = serviceRef.current.getCommentsForThread(thread.id);
      map.set(thread.id, threadComments);
    });
    
    return map;
  }, [threads, commentStore.comments]);

  // Highlight existing comments when editor loads (TipTap context only)
  useEffect(() => {
    if (context !== 'tiptap' || !editor || !pointerAdapter) return;

    threads.forEach(thread => {
      thread.pointers.forEach(pointer => {
        if (pointer.type === 'tiptap-text-range') {
          const tipTapPointer = pointer as TipTapTextPointer;
          if (pointerAdapter.validatePointer(tipTapPointer)) {
            pointerAdapter.highlightPointer(tipTapPointer, thread.id);
          }
        }
      });
    });
  }, [context, editor, pointerAdapter, threads]);

  // Create a new comment thread
  const createCommentThread = useCallback(() => {
    if (context === 'tiptap') {
      if (!editor || !pointerAdapter) return null;

      if (!pointerAdapter.hasValidSelection()) {
        console.warn('No valid text selection for creating comment');
        return null;
      }

      const pointer = pointerAdapter.createPointer();
      const thread = service.createThread(pointer);

      // Highlight the commented text
      pointerAdapter.highlightPointer(pointer, thread.id);

      // Show popover for new thread
      const selection = pointerAdapter.getCurrentSelection();
      if (selection && editor) {
        const commentElement = editor.view.dom.querySelector(`[data-comment-id="${thread.id}"]`);
        
        setUIState(prev => ({
          ...prev,
          popoverOpen: true,
          popoverThread: thread,
          popoverTriggerElement: commentElement as HTMLElement
        }));
      }

      return thread;
    }
    
    // For general context, create without pointer validation
    // This would need to be extended for item-view context
    return null;
  }, [context, editor, pointerAdapter, service]);

  // Add comment to existing thread
  const addCommentToThread = useCallback((threadId: string, content: string) => {
    const comment = service.addComment(threadId, content, currentUser);
    
    // Refresh the popover if it's showing this thread
    setUIState(prev => {
      if (prev.popoverThread?.id === threadId) {
        const updatedThread = threads.find(t => t.id === threadId);
        if (updatedThread) {
          return {
            ...prev,
            popoverThread: updatedThread
          };
        }
      }
      return prev;
    });
    
    return comment;
  }, [service, currentUser, threads]);

  // Resolve a thread
  const resolveThread = useCallback((threadId: string) => {
    service.resolveThread(threadId, currentUser);
    
    // Update comment marks to show resolved state (TipTap only)
    if (context === 'tiptap' && editor && pointerAdapter) {
      const thread = service.getThread(threadId);
      if (thread) {
        thread.pointers.forEach(pointer => {
          if (pointer.type === 'tiptap-text-range') {
            const tipTapPointer = pointer as TipTapTextPointer;
            if (pointerAdapter.validatePointer(tipTapPointer)) {
              editor.chain().focus()
                .setTextSelection({
                  from: tipTapPointer.from,
                  to: tipTapPointer.to
                })
                .updateAttributes('comment', { resolved: true })
                .run();
            }
          }
        });
      }
    }
    
    // Close popover if resolving the currently shown thread
    setUIState(prev => {
      if (prev.popoverThread?.id === threadId) {
        return {
          ...prev,
          popoverOpen: false,
          popoverThread: null,
          popoverTriggerElement: null
        };
      }
      return prev;
    });
  }, [context, service, currentUser, editor, pointerAdapter]);

  // Handle clicking on commented text
  const handleCommentClick = useCallback((threadId: string, element?: HTMLElement) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      if (context === 'tiptap' && element) {
        setUIState(prev => ({
          ...prev,
          popoverOpen: true,
          popoverThread: thread,
          popoverTriggerElement: element
        }));
      }
      
      commentStore.actions.setActiveThread(threadId);
      
      if (!commentStore.panelVisible) {
        commentStore.actions.togglePanel();
      }

      // Focus the editor at the comment location (TipTap only)
      if (context === 'tiptap' && editor && pointerAdapter) {
        const pointer = thread.pointers.find(p => p.type === 'tiptap-text-range') as TipTapTextPointer;
        if (pointer && pointerAdapter.validatePointer(pointer)) {
          pointerAdapter.focusAtPointer(pointer);
        }
      }
    }
  }, [context, threads, commentStore.actions, commentStore.panelVisible, editor, pointerAdapter]);

  // Enhanced click handler that works with DOM events
  const enhancedHandleCommentClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const commentElement = target.closest('[data-comment-id]') as HTMLElement;
    
    if (commentElement && commentElement.dataset.commentId) {
      event.preventDefault();
      handleCommentClick(commentElement.dataset.commentId, commentElement);
    }
  }, [handleCommentClick]);

  // UI state management
  const closePopover = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      popoverOpen: false,
      popoverThread: null,
      popoverTriggerElement: null
    }));
  }, []);

  const openDrawer = useCallback(() => {
    setUIState(prev => ({ ...prev, drawerOpen: true }));
  }, []);

  const closeDrawer = useCallback(() => {
    setUIState(prev => ({ ...prev, drawerOpen: false }));
  }, []);

  const toggleDrawer = useCallback(() => {
    setUIState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }));
  }, []);

  // TipTap-specific helpers
  const hasOverlappingComments = useCallback(() => {
    if (context !== 'tiptap' || !editor || !pointerAdapter) return false;
    
    const selection = pointerAdapter.getCurrentSelection();
    if (!selection) return false;
    
    return pointerAdapter.hasOverlappingComments(selection.from, selection.to);
  }, [context, editor, pointerAdapter]);

  const getThreadAtPosition = useCallback((pos: number) => {
    if (context !== 'tiptap' || !editor) return null;
    
    return threads.find(thread => {
      return thread.pointers.some(pointer => {
        if (pointer.type === 'tiptap-text-range') {
          const tipTapPointer = pointer as TipTapTextPointer;
          return pos >= tipTapPointer.from && pos <= tipTapPointer.to;
        }
        return false;
      });
    });
  }, [context, editor, threads]);

  const cleanupInvalidPointers = useCallback(() => {
    if (context !== 'tiptap' || !pointerAdapter) return;

    threads.forEach(thread => {
      thread.pointers.forEach(pointer => {
        if (pointer.type === 'tiptap-text-range') {
          const tipTapPointer = pointer as TipTapTextPointer;
          if (!pointerAdapter.validatePointer(tipTapPointer)) {
            console.warn(`Invalid pointer found for thread ${thread.id}, removing highlight`);
            pointerAdapter.unhighlightPointer(tipTapPointer);
          }
        }
      });
    });
  }, [context, pointerAdapter, threads]);

  return {
    // Core service
    service,
    
    // State
    threads,
    activeThread,
    activeThreadComments,
    activeThreadId: commentStore.activeThreadId,
    panelVisible: commentStore.panelVisible,
    hasUnsavedChanges: commentStore.hasUnsavedChanges,
    draftComment: commentStore.draftComment,
    lastSavedTimestamp: commentStore.lastSavedTimestamp,
    uiState,
    commentsMap,
    
    // Actions
    actions: commentStore.actions,
    createCommentThread,
    addCommentToThread,
    resolveThread,
    handleCommentClick: enhancedHandleCommentClick,
    
    // UI controls
    closePopover,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    
    // Context-specific features
    pointerAdapter,
    hasOverlappingComments,
    getThreadAtPosition,
    cleanupInvalidPointers,
    canCreateComment: context === 'tiptap' ? (pointerAdapter?.hasValidSelection() ?? false) : false,
    
    // Stats
    stats: service.getCommentStats(),
  };
};