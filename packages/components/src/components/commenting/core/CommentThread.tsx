import React, { useState, useMemo } from 'react';
import { CommentComposer } from './CommentComposer';
import { CommentRenderer } from './CommentRenderer';
import { useCommenting } from '../../../services/commenting/hooks/use-commenting';
import { EntityPointer } from '../../../services/commenting/core/entity-pointer';
import type { CommentPointer } from '../../../services/commenting/core/comment-pointer';
import { isoDateTime } from '@shared/format';
import '../../../jsx-types';
import { getUserById } from '@shared/data';
import type { RichContent, User } from '@shared/data';

// A thread is addressed either by a pointer, for anything a surface defines,
// or by an entity's type and id.
type CommentThreadTarget =
  | { pointer: CommentPointer; entityType?: never; entityId?: never }
  | { pointer?: never; entityType: string; entityId: string };

type CommentThreadProps = CommentThreadTarget & {
  currentUser: Pick<User, 'id'>;
  className?: string;
  allowNewComments?: boolean;
  placeholder?: string;
  onCommentAdded?: (content: string) => void;
};

export const CommentThread: React.FC<CommentThreadProps> = ({
  pointer: givenPointer,
  entityType,
  entityId,
  currentUser,
  className = '',
  allowNewComments = true,
  placeholder,
  onCommentAdded
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pointer = useMemo(
    () => givenPointer ?? new EntityPointer(entityType ?? '', entityId ?? ''),
    [givenPointer, entityType, entityId]
  );

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
          placeholder={placeholder ?? `Comment on this ${entityType ?? 'passage'}...`}
        />
      )}
    </div>
  );
};