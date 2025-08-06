import { useMemo, useEffect } from 'react';
import { useCommentStore } from '../state/comment-store.js';
import { UniversalCommentingService } from '../universal-commenting-service.js';

// React hooks for component integration (Tier 1: Local-only)
export const useUniversalCommenting = (documentId?: string) => {
  const commentStore = useCommentStore();
  
  // Initialize service
  const service = useMemo(
    () => new UniversalCommentingService(commentStore),
    [commentStore]
  );

  // Load from localStorage on mount
  useEffect(() => {
    commentStore.actions.loadFromLocalStorage();
  }, [commentStore.actions]);

  // Get threads for this document (if documentId provided)
  const threads = useMemo(() => {
    if (!documentId) return service.getAllThreads();
    return service.getThreadsForDocument(documentId);
  }, [service, documentId, commentStore.threads]);

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

  return {
    service,
    threads,
    activeThread,
    activeThreadComments,
    activeThreadId: commentStore.activeThreadId,
    panelVisible: commentStore.panelVisible,
    hasUnsavedChanges: commentStore.hasUnsavedChanges,
    draftComment: commentStore.draftComment,
    lastSavedTimestamp: commentStore.lastSavedTimestamp,
    actions: commentStore.actions,
    stats: service.getCommentStats(),
  };
};

// Hook for TipTap-specific commenting
export const useTipTapCommenting = (documentId: string, editorId?: string) => {
  const universalCommenting = useUniversalCommenting(documentId);
  
  // Filter threads to only TipTap text ranges
  const tipTapThreads = useMemo(() => {
    return universalCommenting.service.getThreadsByPointerType('tiptap-text-range');
  }, [universalCommenting.service, universalCommenting.threads]);

  // Filter threads for specific editor instance if provided
  const editorThreads = useMemo(() => {
    if (!editorId) return tipTapThreads;
    return tipTapThreads.filter(thread =>
      thread.pointers.some(pointer =>
        pointer.type === 'tiptap-text-range' && 
        (pointer as any).editorId === editorId
      )
    );
  }, [tipTapThreads, editorId]);

  return {
    ...universalCommenting,
    tipTapThreads,
    editorThreads,
  };
};

// Hook for Item View commenting
export const useItemViewCommenting = (itemId: string, contentType: string) => {
  const universalCommenting = useUniversalCommenting();
  
  // Filter threads to only Item View sections for this item
  const itemThreads = useMemo(() => {
    return universalCommenting.service.getThreadsByPointerType('item-view-section')
      .filter(thread =>
        thread.pointers.some(pointer =>
          pointer.type === 'item-view-section' &&
          (pointer as any).itemId === itemId &&
          (pointer as any).contentType === contentType
        )
      );
  }, [universalCommenting.service, universalCommenting.threads, itemId, contentType]);

  return {
    ...universalCommenting,
    itemThreads,
  };
};