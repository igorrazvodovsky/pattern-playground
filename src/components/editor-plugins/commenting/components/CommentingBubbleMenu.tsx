import React from 'react';
import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import type { CommentingPluginConfig } from '../CommentingPlugin';

interface CommentingBubbleMenuProps {
  editor?: Editor;
  config: CommentingPluginConfig;
}

const CommentingBubbleMenu: React.FC<CommentingBubbleMenuProps> = ({ editor }) => {
  if (!editor) return null;

  // Use useEditorState to properly track selection changes
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      hasSelection: !editor.state.selection.empty,
    }),
  });

  const handleCreateComment = () => {
    console.log('CommentingBubbleMenu: handleCreateComment called');
    console.log('CommentingBubbleMenu: editor:', editor);
    console.log('CommentingBubbleMenu: editor.commands.createQuoteFromSelection:', (editor?.commands as any)?.createQuoteFromSelection);

    // Call the editor command directly since we know it exists from the plugin
    if (editor && (editor.commands as any).createQuoteFromSelection) {
      console.log('CommentingBubbleMenu: Calling createQuoteFromSelection command');
      const result = (editor.commands as any).createQuoteFromSelection();
      console.log('CommentingBubbleMenu: Command result:', result);
    } else {
      console.log('CommentingBubbleMenu: createQuoteFromSelection command not found');
    }

    // Also try the event bus approach as fallback
    if (editor?.storage?.editorContext?.eventBus) {
      console.log('CommentingBubbleMenu: Trying event bus approach');
      editor.storage.editorContext.eventBus.emit('command:execute', {
        command: 'commenting:create-quote-comment',
        params: {},
      });
    } else {
      console.log('CommentingBubbleMenu: Event bus not available');
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