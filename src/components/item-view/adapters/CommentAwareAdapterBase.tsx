import React from 'react';
import type { CommentAwareAdapter, ItemViewProps, UniversalComment, BaseItem } from '../types';

export interface CommentSectionProps {
  comments: UniversalComment[];
  onComment: (content: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, onComment }) => {
  const [newComment, setNewComment] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="comment-section flow">
      <h3>Comments</h3>
      
      {comments.length === 0 ? (
        <p className="text-secondary">No comments yet.</p>
      ) : (
        <div className="comments-list flow-xs">
          {comments.map((comment) => (
            <div key={comment.id} className="comment flow-2xs">
              <header className="inline-flow">
                <strong>{comment.author}</strong>
                <small className="text-secondary">
                  {comment.timestamp.toLocaleDateString()}
                </small>
              </header>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="comment-form flow-2xs">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="textarea"
        />
        <button 
          type="submit" 
          className="button button--small"
          disabled={!newComment.trim()}
        >
          Add Comment
        </button>
      </form>
    </div>
  );
};

export abstract class CommentAwareAdapterBase<T extends BaseItem = BaseItem>
  implements CommentAwareAdapter<T> {

  abstract contentType: string;
  supportsCommenting = true as const;
  supportsRichContent = false;

  abstract render(props: ItemViewProps<T>): React.ReactNode;

  renderWithComments(props: ItemViewProps<T> & {
    comments: UniversalComment[];
    onComment: (content: string) => void;
  }): React.ReactNode {
    return (
      <div className="item-with-comments flow">
        <div className="item-content">
          {this.render(props)}
        </div>
        <CommentSection
          comments={props.comments}
          onComment={props.onComment}
        />
      </div>
    );
  }
}