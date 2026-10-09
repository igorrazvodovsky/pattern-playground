import React, { useState, useMemo } from 'react';
import { CommentComposer } from './CommentComposer';
import { CommentRenderer } from './CommentRenderer';
import { useCommenting } from '../../../services/commenting/hooks/use-commenting';
import { EntityPointer } from '../../../services/commenting/core/entity-pointer';
import { isoDateTime } from '@shared/format';
import '../../../jsx-types';
import { getUserById } from '@shared/data';
import type { RichContent, User } from '@shared/data';

interface CommentThreadProps {
  entityType: string;
  entityId: string;
  currentUser: Pick<User, 'id'>;
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
            <img
              className="avatar"
              data-size="small"
              src={photoUrl}
              alt={displayName}
            />
            <div className="message__content">
              <div className="message__body">
                <div className="message__author">{displayName}</div>
                <CommentRenderer
                  content={comment.content}
                  author={comment.authorId}
                  timestamp={comment.createdAt}
                />
              </div>
              <small className="message__timestamp">
                <pp-timestamp value={isoDateTime(comment.createdAt)}></pp-timestamp>
                {comment.resolved && ' • Resolved'}
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