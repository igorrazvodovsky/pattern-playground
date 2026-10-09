import React from 'react';
import type { CommentingPluginConfig } from '../CommentingPlugin';
import { useEditorContext } from '../../../editor/EditorProvider';

interface CommentingBubbleMenuProps {
  config: CommentingPluginConfig;
}

const CommentingBubbleMenu: React.FC<CommentingBubbleMenuProps> = () => {
  const { eventBus } = useEditorContext();

  const handleCreateComment = () => {
    eventBus.emit('command:execute', {
      command: 'commenting:create-quote-comment',
      params: {},
    });
  };

  return (
    <button
      className="button button--small button--plain"
      onClick={handleCreateComment}
      title="Add comment"
    >
      <iconify-icon className="icon" icon="ph:chat-circle"></iconify-icon>
      <span className="visually-hidden">Comment</span>
    </button>
  );
};

export default CommentingBubbleMenu;
