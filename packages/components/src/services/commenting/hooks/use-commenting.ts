import { useState, useEffect, useCallback } from 'react';
import type { CommentPointer } from '../core/comment-pointer';
import type { Comment, CommentThread } from '../core/comment-service';
import { getCommentService } from '../core/comment-service-instance';

interface UseCommentingOptions {
  currentUser?: string;
  autoRefresh?: boolean;
}

export function useCommenting(pointer?: CommentPointer, options?: UseCommentingOptions) {
  const commentService = getCommentService();
  const [comments, setComments] = useState<Comment[]>([]);
  const [thread, setThread] = useState<CommentThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentUser = options?.currentUser || 'anonymous';
  const autoRefresh = options?.autoRefresh ?? true;
  
  // Load comments for the pointer
  const loadComments = useCallback(async () => {
    if (!pointer) {
      setComments([]);
      setThread(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const [loadedComments, loadedThread] = await Promise.all([
        commentService.getComments(pointer),
        commentService.getThread(pointer)
      ]);
      
      setComments(loadedComments);
      setThread(loadedThread);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
      setComments([]);
      setThread(null);
    } finally {
      setLoading(false);
    }
  }, [pointer, commentService]);
  
  // Subscribe to comment events
  useEffect(() => {
    if (!pointer || !autoRefresh) return;
    
    const handleCommentCreated = (comment: Comment) => {
      if (pointer.equals(comment.pointer)) {
        setComments(prev => [...prev, comment]);
        // Reload thread to get updated metadata
        commentService.getThread(pointer).then(setThread);
      }
    };
    
    const handleCommentUpdated = (comment: Comment) => {
      if (pointer.equals(comment.pointer)) {
        setComments(prev => prev.map(c => c.id === comment.id ? comment : c));
        commentService.getThread(pointer).then(setThread);
      }
    };
    
    const handleCommentDeleted = ({ id }: { id: string }) => {
      setComments(prev => prev.filter(c => c.id !== id));
      commentService.getThread(pointer).then(setThread);
    };
    
    const handleThreadResolved = ({ pointer: resolvedPointer }: { pointer: CommentPointer }) => {
      if (pointer.equals(resolvedPointer)) {
        // Trigger reload without circular dependency
        setComments([]);
        setThread(null);
        setLoading(true);
        Promise.all([
          commentService.getComments(pointer),
          commentService.getThread(pointer)
        ]).then(([loadedComments, loadedThread]) => {
          setComments(loadedComments);
          setThread(loadedThread);
          setLoading(false);
        }).catch(() => setLoading(false));
      }
    };
    
    const unsubscribers = [
      commentService.on('comment:created', handleCommentCreated),
      commentService.on('comment:updated', handleCommentUpdated),
      commentService.on('comment:deleted', handleCommentDeleted),
      commentService.on('thread:resolved', handleThreadResolved),
      commentService.on('thread:unresolved', handleThreadResolved),
    ];
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [pointer, commentService, autoRefresh]);
  
  // Load comments when pointer changes
  useEffect(() => {
    loadComments();
  }, [loadComments]);
  
  // Create a new comment
  const createComment = useCallback(async (content: string, parentId?: string) => {
    if (!pointer) {
      throw new Error('No pointer specified for comment');
    }
    
    try {
      const comment = await commentService.createComment(
        pointer,
        content,
        currentUser,
        parentId
      );
      return comment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comment');
      throw err;
    }
  }, [pointer, commentService, currentUser]);
  
  // Update a comment
  const updateComment = useCallback(async (id: string, content: string) => {
    try {
      const updated = await commentService.updateComment(id, content);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment');
      throw err;
    }
  }, [commentService]);
  
  // Delete a comment
  const deleteComment = useCallback(async (id: string) => {
    try {
      const success = await commentService.deleteComment(id);
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      throw err;
    }
  }, [commentService]);
  
  // Reply to a comment
  const reply = useCallback(async (parentId: string, content: string) => {
    try {
      const comment = await commentService.reply(parentId, content, currentUser);
      return comment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reply to comment');
      throw err;
    }
  }, [commentService, currentUser]);
  
  // Resolve/unresolve thread
  const resolveThread = useCallback(async () => {
    if (!pointer) return false;
    
    try {
      const success = await commentService.resolveThread(pointer);
      if (success) {
        await loadComments();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve thread');
      throw err;
    }
  }, [pointer, commentService, loadComments]);
  
  const unresolveThread = useCallback(async () => {
    if (!pointer) return false;
    
    try {
      const success = await commentService.unresolveThread(pointer);
      if (success) {
        await loadComments();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unresolve thread');
      throw err;
    }
  }, [pointer, commentService, loadComments]);
  
  return {
    // State
    comments,
    thread,
    loading,
    error,
    
    // Actions
    createComment,
    updateComment,
    deleteComment,
    reply,
    resolveThread,
    unresolveThread,
    refresh: loadComments,
    
    // Computed
    hasComments: comments.length > 0,
    isResolved: thread?.resolved ?? false,
  };
}