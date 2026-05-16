import React from 'react';
import type { Editor } from '@tiptap/react';
import type { CommentingPluginConfig } from '../CommentingPlugin';
import type { EditorContext } from '../../../editor/types';

interface EditorCommandsWithComments {
  createQuoteFromSelection: () => boolean;
}

type EditorWithCommentingCommands = Editor & {
  commands: Editor['commands'] & EditorCommandsWithComments;
};

type EditorWithContext = Editor & {
  storage: Editor['storage'] & {
    editorContext?: EditorContext;
  };
}

interface CommentingBubbleMenuProps {
  editor?: Editor;
  config: CommentingPluginConfig;
}

const CommentingBubbleMenu: React.FC<CommentingBubbleMenuProps> = ({ editor }) => {

  if (!editor) return null;

  const handleCreateComment = () => {
    const editorWithComments = editor as EditorWithCommentingCommands;
    const editorWithContext = editor as EditorWithContext;

    // Call the editor command directly since we know it exists from the plugin
    if (editorWithComments.commands.createQuoteFromSelection) {
      const success = editorWithComments.commands.createQuoteFromSelection();
      if (success) return;
    }

    // Also try the event bus approach as fallback
    if (editorWithContext.storage.editorContext?.eventBus) {
      editorWithContext.storage.editorContext.eventBus.emit('command:execute', {
        command: 'commenting:create-quote-comment',
        params: {},
      });
    }
  };

  return (
    <button
      className="button button--small button--plain"
      is="pp-button"
      onClick={handleCreateComment}
      title="Add comment"
    >
      <iconify-icon className="icon" icon="ph:chat-circle"></iconify-icon>
      <span className="inclusively-hidden">Comment</span>
    </button>
  );
};

export default CommentingBubbleMenu;