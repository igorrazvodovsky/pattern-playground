import React from 'react';
import { useEditorContext } from '../../../editor/EditorProvider';

const CommentingBubbleMenu: React.FC = () => {
  const { eventBus } = useEditorContext();
  // The shortcut comes from the Commenting extension: Mod-Shift-M.
  const shortcut = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘⇧M' : 'Ctrl+Shift+M';

  const handleCreateComment = () => {
    eventBus.emit('command:execute', {
      command: 'commenting:create-comment',
      params: {},
    });
  };

  return (
    <button
      className="button button--small button--plain"
      onClick={handleCreateComment}
      title={`Comment (${shortcut})`}
    >
      <iconify-icon className="icon" icon="ph:chat-circle"></iconify-icon>
      <span className="visually-hidden">Comment</span>
    </button>
  );
};

export default CommentingBubbleMenu;
