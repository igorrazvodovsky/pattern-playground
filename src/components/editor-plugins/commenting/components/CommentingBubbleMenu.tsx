import React from 'react';
import type { Editor } from '@tiptap/react';
import type { CommentingPluginConfig } from '../CommentingPlugin';

interface CommentingBubbleMenuProps {
  editor?: Editor;
  config: CommentingPluginConfig;
}

const CommentingBubbleMenu: React.FC<CommentingBubbleMenuProps> = ({ editor, config }) => {
  if (!editor) return null;

  const handleCreateComment = () => {
    // Emit command through the plugin system
    if (editor?.storage?.editorContext?.eventBus) {
      editor.storage.editorContext.eventBus.emit('command:execute', {
        command: 'commenting:create-quote-comment',
        params: {},
      });
    }
  };

  const canCreateComment = () => {
    const { selection } = editor.state;
    return !selection.empty;
  };

  return (
    <button
      className="button button--small button--plain"
      is="pp-button"
      onClick={handleCreateComment}
      title="Add comment"
      disabled={!canCreateComment()}
    >
      <iconify-icon className="icon" icon="ph:chat-circle"></iconify-icon>
      <span className="inclusively-hidden">Comment</span>
    </button>
  );
};

export default CommentingBubbleMenu;