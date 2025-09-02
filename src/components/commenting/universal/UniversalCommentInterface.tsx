import React, { useState, useMemo } from 'react';
import { CommentComposer } from './RichCommentComposer.js';
import { CommentRenderer } from './RichCommentRenderer.js';
import { useCommenting } from '../../../services/commenting/hooks/use-commenting.js';
import { EntityPointer } from '../../../services/commenting/core/entity-pointer.js';
import { formatTimestamp } from '../../../utility/time-utils.js';
import { getUserById } from '../../../stories/data/index.js';
import type { User } from '../../../stories/data/index.js';

// RichContent interface to match the shared data structure
export interface RichContent {
  plainText: string;
  richContent: {
    type: 'doc';
    content: unknown[];
  };
}

interface UniversalCommentInterfaceProps {
  entityType: string;
  entityId: string;
  currentUser: User;
  className?: string;
  showHeader?: boolean;
  allowNewComments?: boolean;
  maxHeight?: string;
  onCommentAdded?: (content: string) => void;
}

/**
 * Universal Comment Interface - Entity-agnostic comment component
 * Works with any entity type (quotes, documents, tasks, projects, etc.)
 */
export const UniversalCommentInterface: React.FC<UniversalCommentInterfaceProps> = ({
  entityType,
  entityId,
  currentUser,
  className = '',
  showHeader = true,
  allowNewComments = true,
  maxHeight = '400px',
  onCommentAdded
}) => {
  const [isComposing, setIsComposing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create pointer for the entity (memoized to prevent re-creating on every render)
  const pointer = useMemo(() => new EntityPointer(entityType, entityId), [entityType, entityId]);

  // Get entity-specific commenting functionality
  const {
    comments,
    createComment,
    updateComment,
    loading
  } = useCommenting(pointer, { currentUser: currentUser.id });

  // Debug logging (disabled to prevent console spam)
  // React.useEffect(() => {
  //   console.log(`UniversalCommentInterface Debug - entityType: ${entityType}, entityId: ${entityId}`);
  //   console.log(`Comments found:`, comments);
  // }, [entityType, entityId, comments]);

  const handleAddComment = async (content: RichContent) => {
    setIsSubmitting(true);
    try {
      // Convert RichContent to plain string for now
      // In future, store rich content in comment metadata
      await createComment(content.plainText);
      setIsComposing(false);
      
      // Call the onCommentAdded callback if provided
      if (onCommentAdded) {
        onCommentAdded(content.plainText);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      await updateComment(commentId, { ...comment, resolved: true });
    }
  };

  // Calculate counts from comments
  const activeCommentCount = comments.filter(c => !c.resolved).length;
  const resolvedCommentCount = comments.filter(c => c.resolved).length;


  return (
    <div className={`messages ${className}`}>
      {comments.map((comment) => {
        const user = getUserById(comment.authorId);
        const displayName = user?.name || comment.authorId;
        const photoUrl = user?.metadata?.photoUrl || `https://i.pravatar.cc/150?seed=${comment.authorId}`;

        // Debug logging for each comment (disabled to prevent console spam)
        // console.log('Rendering comment:', {
        //   id: comment.id,
        //   authorId: comment.authorId,
        //   user: user,
        //   displayName,
        //   content: comment.content
        // });

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
          onCancel={() => setIsComposing(false)}
          isSubmitting={isSubmitting}
          placeholder={`Comment on this ${entityType}...`}
        />
      )}
    </div>
  );
};