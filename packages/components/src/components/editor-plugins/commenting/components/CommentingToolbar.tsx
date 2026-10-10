import React from 'react';
import { useEditorContext } from '../../../editor/EditorProvider';

const CommentingToolbar: React.FC = () => {
  const { eventBus } = useEditorContext();

  const handleShowThreads = () => {
    eventBus.emit('command:execute', {
      command: 'commenting:show-threads',
      params: {},
    });
  };

  return (
    <button
      className="button button--small"
      onClick={handleShowThreads}
    >
      <iconify-icon className="icon" icon="ph:chat-dots"></iconify-icon>
      Comments
    </button>
  );
};

export default CommentingToolbar;
