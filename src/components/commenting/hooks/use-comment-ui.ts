import { useCallback, useMemo, useState, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import { useTipTapCommentingIntegration } from '../tiptap/use-tiptap-commenting.js';
import type { CommentThread, UniversalComment } from '../../../services/commenting/document-pointer.js';

interface UseCommentUIOptions {
  documentId: string;
  editorId?: string;
  currentUser: string;
}

interface CommentUIState {
  popoverOpen: boolean;
  drawerOpen: boolean;
  popoverThread: CommentThread | null;
  popoverTriggerElement: HTMLElement | null;
}

export const useCommentUI = (
  editor: Editor | null, 
  options: UseCommentUIOptions
) => {
  const commenting = useTipTapCommentingIntegration(editor, options);
  
  const [uiState, setUIState] = useState<CommentUIState>({
    popoverOpen: false,
    drawerOpen: false,
    popoverThread: null,
    popoverTriggerElement: null
  });

  // Stable reference to service to prevent unnecessary re-renders
  const serviceRef = useRef(commenting.service);
  serviceRef.current = commenting.service;

  // Track comment store state changes more granularly
  const commentsStoreState = commenting.service.getState().comments;
  
  // Group comments by thread ID for efficient rendering
  const commentsMap = useMemo(() => {
    const map = new Map<string, UniversalComment[]>();
    
    commenting.editorThreads.forEach(thread => {
      const threadComments = serviceRef.current.getCommentsForThread(thread.id);
      map.set(thread.id, threadComments);
    });
    
    return map;
  }, [commenting.editorThreads, commentsStoreState]);

  // Handle creating new comment threads (used by BubbleMenu)
  const createCommentThread = useCallback(() => {
    const thread = commenting.createCommentThread();
    if (thread) {
      // Show popover for new thread
      const selection = commenting.pointerAdapter?.getCurrentSelection();
      if (selection && editor) {
        const commentElement = editor.view.dom.querySelector(`[data-comment-id="${thread.id}"]`);
        
        setUIState(prev => ({
          ...prev,
          popoverOpen: true,
          popoverThread: thread,
          popoverTriggerElement: commentElement as HTMLElement
        }));
      }
    }
    return thread;
  }, [commenting, editor]);

  // Handle clicking on commented text
  const handleCommentClick = useCallback((threadId: string, element: HTMLElement) => {
    const thread = commenting.editorThreads.find(t => t.id === threadId);
    if (thread) {
      setUIState(prev => ({
        ...prev,
        popoverOpen: true,
        popoverThread: thread,
        popoverTriggerElement: element
      }));
      commenting.actions.setActiveThread(threadId);
    }
  }, [commenting.editorThreads, commenting.actions]);

  // Handle adding comments to existing threads
  const handleAddComment = useCallback((threadId: string, content: string) => {
    commenting.addCommentToThread(threadId, content);
    // Refresh the popover if it's showing this thread - use functional setState to avoid stale closures
    setUIState(prev => {
      if (prev.popoverThread?.id === threadId) {
        const updatedThread = commenting.editorThreads.find(t => t.id === threadId);
        if (updatedThread) {
          return {
            ...prev,
            popoverThread: updatedThread
          };
        }
      }
      return prev;
    });
  }, [commenting]);

  // Handle resolving threads
  const handleResolveThread = useCallback((threadId: string) => {
    commenting.resolveThread(threadId);
    
    // Close popover if resolving the currently shown thread - use functional setState
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
  }, [commenting]);

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

  // Enhanced click handler that works with the existing TipTap integration
  const enhancedHandleCommentClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const commentElement = target.closest('[data-comment-id]') as HTMLElement;
    
    if (commentElement && commentElement.dataset.commentId) {
      event.preventDefault();
      handleCommentClick(commentElement.dataset.commentId, commentElement);
    }
  }, [handleCommentClick]);

  return {
    // State
    ...commenting,
    uiState,
    commentsMap,
    
    // Actions
    createCommentThread,
    handleAddComment,
    handleResolveThread,
    handleCommentClick: enhancedHandleCommentClick,
    
    // UI controls
    closePopover,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };
};