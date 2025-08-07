import React, { useCallback, useRef } from 'react';
import type { CommentThread as CommentThreadType, UniversalComment } from '../../../services/commenting/document-pointer.js';
import type { PpInput } from '../../input/input.js';
import { getUserById } from '../../../stories/shared-data/index.js';

interface CommentThreadProps {
  thread: CommentThreadType;
  comments: UniversalComment[];
  currentUser: string;
  onAddComment?: (threadId: string, content: string) => void;
  onResolveThread?: (threadId: string) => void;
  showComposer?: boolean;
}

const formatTimestamp = (timestamp: Date | string | number): string => {
  const now = new Date();
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  });
};

export const CommentThread: React.FC<CommentThreadProps> = ({
  thread,
  comments,
  currentUser,
  onAddComment,
  onResolveThread,
  showComposer = true
}) => {
  const inputRef = useRef<PpInput>(null);

  const submitComment = useCallback(() => {
    const content = inputRef.current?.value;

    if (content?.trim() && onAddComment) {
      onAddComment(thread.id, content.trim());
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [thread.id, onAddComment]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitComment();
  }, [submitComment]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<PpInput>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitComment();
    }
  }, [submitComment]);

  const handleResolve = useCallback(() => {
    if (onResolveThread) {
      onResolveThread(thread.id);
    }
  }, [thread.id, onResolveThread]);

  return (
    <div className="messages">

      {/* Comments list */}
      {comments.map(comment => {
        const user = getUserById(comment.author);
        const displayName = user?.name || comment.author;
        const photoUrl = user?.metadata?.photoUrl || `https://i.pravatar.cc/150?seed=${comment.author}`;

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
                {comment.content}
              </div>
              <small className="message__timestamp">
                {formatTimestamp(comment.timestamp)}
                {comment.status === 'resolved' && ' • Resolved'}
              </small>
            </div>
          </div>
        );
      })}

      {/* Comment composer */}
      {showComposer && thread.status !== 'resolved' && (
        <form className="message-composer" onSubmit={handleSubmit}>
          <pp-avatar size="small">
            <img
              src={getUserById(currentUser)?.metadata?.photoUrl || `https://i.pravatar.cc/150?seed=${currentUser}`}
              alt={getUserById(currentUser)?.name || currentUser}
            />
          </pp-avatar>
          <pp-input
            ref={inputRef}
            name="comment"
            placeholder="Add a comment..."
            onKeyDown={handleKeyDown}
            autocomplete="off"
          >
            <button
              type="submit"
              className="button"
              slot="suffix"
            >
              <iconify-icon icon="ph:arrow-elbow-down-left"></iconify-icon>
              <span className="inclusively-hidden">Add comment</span>
            </button>
          </pp-input>
        </form>
      )}
    </div>
  );
};