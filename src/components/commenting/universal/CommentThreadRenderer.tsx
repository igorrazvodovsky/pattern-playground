import React from 'react';
import type { CommentThread, UniversalComment } from '../../../services/commenting/document-pointer.js';

interface ThreadRendererProps {
  thread: CommentThread;
  comments: UniversalComment[];
  variant: 'drawer' | 'popover' | 'inline';
  onAddComment?: (threadId: string, content: string) => void;
  onResolveThread?: (threadId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  className?: string;
  currentUser?: string;
  showActions?: boolean;
  showTimestamps?: boolean;
}

export const CommentThreadRenderer: React.FC<ThreadRendererProps> = ({
  thread,
  comments,
  variant,
  onAddComment,
  onResolveThread,
  onDeleteComment,
  className = '',
  currentUser,
  showActions = true,
  showTimestamps = true
}) => {
  const [newCommentContent, setNewCommentContent] = React.useState('');
  const [isAddingComment, setIsAddingComment] = React.useState(false);

  const handleAddComment = React.useCallback(() => {
    if (newCommentContent.trim() && onAddComment) {
      onAddComment(thread.id, newCommentContent.trim());
      setNewCommentContent('');
      setIsAddingComment(false);
    }
  }, [newCommentContent, onAddComment, thread.id]);

  const handleResolveThread = React.useCallback(() => {
    if (onResolveThread) {
      onResolveThread(thread.id);
    }
  }, [onResolveThread, thread.id]);

  // Sort comments by timestamp
  const sortedComments = React.useMemo(() => {
    return [...comments].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [comments]);

  const isResolved = thread.status === 'resolved';
  const canResolve = showActions && onResolveThread && !isResolved && currentUser;
  const canAddComment = showActions && onAddComment && !isResolved && currentUser;

  // Variant-specific container classes
  const containerClasses = React.useMemo(() => {
    const base = 'comment-thread';
    const variantClass = `comment-thread--${variant}`;
    const statusClass = isResolved ? 'comment-thread--resolved' : 'comment-thread--active';
    
    return `${base} ${variantClass} ${statusClass} ${className}`.trim();
  }, [variant, isResolved, className]);

  return (
    <div className={containerClasses}>
      {/* Thread header */}
      <div className="comment-thread__header">
        <div className="comment-thread__meta">
          <span className="comment-thread__participant-count">
            {thread.participants.length} participant{thread.participants.length !== 1 ? 's' : ''}
          </span>
          <span className="comment-thread__comment-count">
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </span>
          {isResolved && (
            <span className="comment-thread__status comment-thread__status--resolved">
              Resolved
            </span>
          )}
        </div>
        
        {canResolve && (
          <button 
            className="comment-thread__resolve-btn"
            onClick={handleResolveThread}
            aria-label="Resolve thread"
          >
            ✓ Resolve
          </button>
        )}
      </div>

      {/* Comments list */}
      <div className="comment-thread__comments">
        {sortedComments.length === 0 ? (
          <div className="comment-thread__empty">
            No comments yet
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div key={comment.id} className="comment-thread__comment">
              <div className="comment__header">
                <span className="comment__author">
                  {comment.author}
                </span>
                {showTimestamps && (
                  <span className="comment__timestamp">
                    {comment.timestamp.toLocaleString()}
                  </span>
                )}
                {onDeleteComment && currentUser === comment.author && (
                  <button
                    className="comment__delete-btn"
                    onClick={() => onDeleteComment(comment.id)}
                    aria-label="Delete comment"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="comment__content">
                {comment.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      {canAddComment && (
        <div className="comment-thread__add-comment">
          {!isAddingComment ? (
            <button
              className="comment-thread__add-btn"
              onClick={() => setIsAddingComment(true)}
            >
              Add comment
            </button>
          ) : (
            <div className="comment-thread__compose">
              <textarea
                className="comment-compose__input"
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                autoFocus
              />
              <div className="comment-compose__actions">
                <button
                  className="comment-compose__submit"
                  onClick={handleAddComment}
                  disabled={!newCommentContent.trim()}
                >
                  Post
                </button>
                <button
                  className="comment-compose__cancel"
                  onClick={() => {
                    setIsAddingComment(false);
                    setNewCommentContent('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};