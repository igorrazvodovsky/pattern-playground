import React from 'react';
import type { CommentingPluginConfig } from '../CommentingPlugin';
import { useEditorContext } from '../../../editor/EditorProvider';

interface CommentingToolbarProps {
  config: CommentingPluginConfig;
}

const CommentingToolbar: React.FC<CommentingToolbarProps> = () => {
  const { editor, eventBus } = useEditorContext();

  const handleCreateComment = () => {
    eventBus.emit('command:execute', {
      command: 'commenting:create-quote-comment',
      params: {},
    });
  };

  const handleShowComments = () => {
    eventBus.emit('command:execute', {
      command: 'commenting:show-comments',
      params: {},
    });
  };

  const canCreateComment = () => {
    const { selection } = editor.state;
    return !selection.empty;
  };

  return (
    <div className="commenting-toolbar inline-flow">
      <button
        className="button button--small"
        onClick={handleCreateComment}
        title="Add comment to selection"
        disabled={!canCreateComment()}
      >
        <iconify-icon className="icon" icon="ph:chat-circle"></iconify-icon>
        Add Comment
      </button>
      
      <button
        className="button button--small button--secondary"
        onClick={handleShowComments}
        title="Show all comments"
      >
        <iconify-icon className="icon" icon="ph:chat-dots"></iconify-icon>
        Comments
      </button>
    </div>
  );
};

export default CommentingToolbar;