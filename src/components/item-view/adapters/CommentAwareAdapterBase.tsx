import React from 'react';
import type { CommentAwareAdapter, ItemViewProps, UniversalComment, BaseItem } from '../types';
import { UniversalCommentInterface } from '../../commenting/universal/UniversalCommentInterface';
import { getUserById } from '../../../stories/data/index';

export interface CommentSectionProps {
  entityType: string;
  entityId: string;
  currentUser: string;
  onComment: (content: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ 
  entityType, 
  entityId, 
  currentUser,
  onComment 
}) => {
  const user = getUserById(currentUser);

  if (!user) {
    return <div className="comment-section">Unable to load comments - user not found</div>;
  }

  return (
    <div className="comment-section flow">
      <h3>Comments</h3>
      <UniversalCommentInterface
        entityType={entityType}
        entityId={entityId}
        currentUser={user}
        showHeader={false}
        allowNewComments={true}
        maxHeight="400px"
        onCommentAdded={onComment}
      />
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
    currentUser?: string;
  }): React.ReactNode {
    return (
      <div className="item-with-comments flow">
        <div className="item-content">
          {this.render(props)}
        </div>
        <CommentSection
          entityType={this.contentType}
          entityId={props.item.id}
          currentUser={props.currentUser || 'user-1'}
          onComment={props.onComment}
        />
      </div>
    );
  }
}