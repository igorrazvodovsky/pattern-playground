import React, { useState } from 'react';
import { CommentComposer } from './RichCommentComposer.js';
import { CommentRenderer } from './RichCommentRenderer.js';
import { useEntityCommenting } from '../../../services/commenting/hooks/use-universal-commenting.js';
import { useCommentInitialization } from '../../../services/commenting/hooks/use-comment-initialization.js';
import { formatTimestamp } from '../../task/time-utils.js';
import { getUserById } from '../../../stories/shared-data/index.js';
import type { User } from '../../../stories/shared-data/index.js';

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
  maxHeight = '400px'
}) => {
  const [isComposing, setIsComposing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the commenting system
  useCommentInitialization();
  
  // Get entity-specific commenting functionality
  const {
    comments,
    addComment,
    resolveComment,
    activeCommentCount,
    resolvedCommentCount
  } = useEntityCommenting(entityType, entityId);

  const handleAddComment = async (content: RichContent) => {
    setIsSubmitting(true);
    try {
      await addComment(content, currentUser.id);
      setIsComposing(false);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveComment = (commentId: string) => {
    resolveComment(commentId, currentUser.id);
  };


  return (
    <div className={`messages layer ${className}`}>
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
              <div className="message__body layer">
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