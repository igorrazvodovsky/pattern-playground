import { useMemo, useState } from 'react';
import { useCommentStore } from '../state/comment-store.js';
import { UniversalCommentingService } from '../universal-commenting-service.js';
import type { RichContent } from '../state/comment-store.js';

// React hooks for entity-agnostic commenting
export const useUniversalCommenting = () => {
  const commentStore = useCommentStore();
  
  // Initialize service with a function that returns the current state
  const service = useMemo(
    () => new UniversalCommentingService(() => useCommentStore.getState()),
    []  // No dependencies since we use getState() directly
  );

  return {
    service,
    activeEntity: commentStore.activeEntity,
    panelVisible: commentStore.panelVisible,
    hasUnsavedChanges: commentStore.hasUnsavedChanges,
    draftComment: commentStore.draftComment,
    lastSavedTimestamp: commentStore.lastSavedTimestamp,
    actions: commentStore.actions,
    stats: service.getCommentStats(),
  };
};

// Get comments for a specific entity
export const useEntityComments = (entityType: string, entityId: string) => {
  const commentStore = useCommentStore();
  const isLoading = false; // For now, we're fully local

  const comments = useMemo(() => {
    return commentStore.actions.getComments(entityType, entityId);
  }, [commentStore.commentsByEntity, entityType, entityId]);

  return { comments, isLoading };
};

// Add comment to entity
export const useAddComment = () => {
  const commentStore = useCommentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitComment = async (entityType: string, entityId: string, content: RichContent | string, authorId: string) => {
    setIsSubmitting(true);
    try {
      const comment = commentStore.actions.addComment(entityType, entityId, {
        content,
        authorId,
        status: 'active'
      });
      return comment;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitComment, isSubmitting };
};

// Comment thread operations
export const useCommentThread = (entityType: string, entityId: string) => {
  const service = useMemo(
    () => new UniversalCommentingService(() => useCommentStore.getState()),
    []
  );
  
  const thread = useMemo(() => {
    return service.getCommentThread(entityType, entityId);
  }, [service, entityType, entityId]);

  const resolveThread = () => {
    if (thread) {
      thread.comments.forEach(comment => {
        if (comment.status === 'active') {
          service.resolveComment(comment.id);
        }
      });
    }
  };

  return { thread, resolveThread };
};

// Generic hook for any entity type
// Replaces entity-specific hooks like useQuoteCommenting, useDocumentCommenting, etc.
// Usage: useEntityCommenting('quote', quoteId) instead of useQuoteCommenting(quoteId)
export const useEntityCommenting = (entityType: string, entityId: string) => {
  const universalCommenting = useUniversalCommenting();
  const entityComments = useEntityComments(entityType, entityId);
  
  const addComment = async (content: RichContent | string, authorId: string) => {
    return universalCommenting.service.addComment(entityType, entityId, content, authorId);
  };

  const resolveComment = (commentId: string) => {
    universalCommenting.service.resolveComment(commentId);
  };

  return {
    ...entityComments,
    addComment,
    resolveComment,
    activeCommentCount: universalCommenting.service.getActiveCommentCount(entityType, entityId),
    resolvedCommentCount: universalCommenting.service.getResolvedCommentCount(entityType, entityId),
  };
};

