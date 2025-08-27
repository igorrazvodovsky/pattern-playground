import React from 'react';
import type { Editor } from '@tiptap/react';
import type { CommentingPluginConfig } from '../CommentingPlugin';

interface CommentingToolbarProps {
  editor?: Editor;
  config: CommentingPluginConfig;
}

const CommentingToolbar: React.FC<CommentingToolbarProps> = ({ editor, config }) => {
  if (!editor) return null;

  const handleCreateComment = () => {
    if (editor?.storage?.editorContext?.eventBus) {
      editor.storage.editorContext.eventBus.emit('command:execute', {
        command: 'commenting:create-quote-comment',
        params: {},
      });
    }
  };

  const handleShowComments = () => {
    if (editor?.storage?.editorContext?.eventBus) {
      editor.storage.editorContext.eventBus.emit('command:execute', {
        command: 'commenting:show-comments',
        params: {},
      });
    }
  };

  const canCreateComment = () => {
    const { selection } = editor.state;
    return !selection.empty;
  };

  return (
    <div className="commenting-toolbar inline-flow">
      <button
        className="button button--small"
        is="pp-button"
        onClick={handleCreateComment}
        title="Add comment to selection"
        disabled={!canCreateComment()}
      >
        <iconify-icon className="icon" icon="ph:chat-circle"></iconify-icon>
        Add Comment
      </button>
      
      <button
        className="button button--small button--secondary"
        is="pp-button"
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