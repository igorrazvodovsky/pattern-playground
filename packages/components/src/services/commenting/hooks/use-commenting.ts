import { useState, useEffect, useCallback } from 'react';
import type { CommentPointer } from '../core/comment-pointer';
import type { Comment, CommentThread } from '../core/comment-service';
import { getCommentService } from '../core/comment-service-instance';

interface UseCommentingOptions {
  currentUser?: string;
}

const NO_COMMENTS: Comment[] = [];

// One pointer's thread, reloaded when the comment service reports a change to it.
export function useCommenting(pointer?: CommentPointer, options?: UseCommentingOptions) {
  const commentService = getCommentService();
  const [thread, setThread] = useState<CommentThread | null>(null);
  const currentUser = options?.currentUser || 'anonymous';

  useEffect(() => {
    if (!pointer) {
      setThread(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      const next = await commentService.getThread(pointer);
      if (!cancelled) setThread(next);
    };

    load();
    const unsubscribe = commentService.onChange(load, pointer);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [pointer, commentService]);

  const createComment = useCallback(async (content: string, parentId?: string) => {
    if (!pointer) {
      throw new Error('No pointer specified for comment');
    }
    return commentService.createComment(pointer, content, currentUser, parentId);
  }, [pointer, commentService, currentUser]);

  const reply = useCallback(
    (parentId: string, content: string) => commentService.reply(parentId, content, currentUser),
    [commentService, currentUser]
  );

  return {
    thread,
    /** Oldest first. */
    comments: thread?.comments ?? NO_COMMENTS,
    createComment,
    reply,
  };
}
