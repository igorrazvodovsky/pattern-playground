import React, { useState, useMemo } from 'react';
import { CommentComposer } from './CommentComposer';
import { CommentRenderer } from './CommentRenderer';
import { useCommenting } from '../../../services/commenting/hooks/use-commenting';
import { EntityPointer } from '../../../services/commenting/core/entity-pointer';
import { formatTimestamp } from '../../../utility/time-utils';
import { getUserById } from '../../../stories/data/index';
import type { User } from '../../../stories/data/index';

// RichContent interface to match the shared data structure
export interface RichContent {
  plainText: string;
  richContent: {
    type: 'doc';
    content: unknown[];
  };
}

interface CommentThreadProps {
  entityType: string;
  entityId: string;
  currentUser: User;
  className?: string;
  showHeader?: boolean;
  allowNewComments?: boolean;
  maxHeight?: string;
  onCommentAdded?: (content: string) => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  entityType,
  entityId,
  currentUser,
  className = '',
  allowNewComments = true,
  onCommentAdded
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pointer = useMemo(() => new EntityPointer(entityType, entityId), [entityType, entityId]);

  const {
    comments,
    createComment
  } = useCommenting(pointer, { currentUser: currentUser.id });

  const handleAddComment = async (content: RichContent) => {
    setIsSubmitting(true);
    try {
      // TODO: Store rich content in comment metadata
      await createComment(content.plainText);

      if (onCommentAdded) {
        onCommentAdded(content.plainText);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`messages ${className}`}>
      {comments.map((comment) => {
        const user = getUserById(comment.authorId);
        const displayName = user?.name || comment.authorId;
        const photoUrl = user?.metadata?.photoUrl || `https://i.pravatar.cc/150?seed=${comment.authorId}`;

        return (
          <div key={comment.id} className="message">
            <pp-avatar size="small">
              <img
                src={photoUrl}
                alt={displayName}
              />
            </pp-avatar>
            <div className="message__content">
              <div className="message__body">
                <div className="message__author">{displayName}</div>
                <CommentRenderer
                  content={comment.content}
                  author={comment.authorId}
                  timestamp={comment.timestamp}
                />
              </div>
              <small className="message__timestamp">
                {formatTimestamp(comment.timestamp)}
                {comment.status === 'resolved' && ' • Resolved'}
              </small>
            </div>
          </div>
        );
      })}

      {allowNewComments && (
        <CommentComposer
          currentUser={currentUser.id}
          onSubmit={handleAddComment}
          onCancel={() => {}}
          isSubmitting={isSubmitting}
          placeholder={`Comment on this ${entityType}...`}
        />
      )}
    </div>
  );
};