import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import type { RichContent } from '../../../stories/data/index.js';
import { getUserById } from '../../../stories/data/index.js';

interface CommentComposerProps {
  placeholder?: string;
  currentUser: string;
  onSubmit: (content: RichContent) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  autoFocus?: boolean;
}

/**
 * TipTap-powered rich text comment composer
 * Enables rich formatting in comments while maintaining universal commenting integration
 */
export const CommentComposer: React.FC<CommentComposerProps> = ({
  placeholder = "Write a comment...",
  currentUser,
  onSubmit,
  onCancel,
  isSubmitting = false,
  autoFocus = true
}) => {
  const [isEmpty, setIsEmpty] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable some extensions we don't need for comments
        heading: false,
        horizontalRule: false,
        codeBlock: false,
        blockquote: false,
      }),
      Bold,
      Italic,
      BulletList.configure({
        HTMLAttributes: {
          class: 'comment-list',
        },
      }),
      ListItem,
    ],
    content: '',
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: 'comment-editor',
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getText().trim();
      setIsEmpty(content === '');
    },
  });

  const handleSubmit = useCallback(() => {
    if (!editor || isEmpty) return;

    const plainText = editor.getText();
    const richContent = editor.getJSON();

    const commentContent: RichContent = {
      plainText: plainText.trim(),
      richContent
    };

    onSubmit(commentContent);

    // Clear editor after successful submit
    editor.commands.clearContent();
    setIsEmpty(true);
  }, [editor, isEmpty, onSubmit]);


  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  if (!editor) {
    return (
      <div className="comment-composer comment-composer--loading">
        <div className="comment-composer__placeholder">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className="message-composer" onKeyDown={handleKeyDown}>
      <pp-avatar size="small">
        <img
          src={getUserById(currentUser)?.metadata?.photoUrl || `https://i.pravatar.cc/150?seed=${currentUser}`}
          alt={getUserById(currentUser)?.name || currentUser}
        />
      </pp-avatar>
      <div className="message-composer__input" style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
        <EditorContent
          editor={editor}
          className="comment-composer__editor"
          style={{ flex: 1, minHeight: '38px' }}
        />
        <button
          className={`button button--plain ${isEmpty || isSubmitting ? 'button--disabled' : ''}`}
          onClick={handleSubmit}
          disabled={isEmpty || isSubmitting}
          type="button"
        >
          {isSubmitting ? (
            <iconify-icon icon="ph:spinner" />
          ) : (
            <iconify-icon icon="ph:arrow-elbow-down-left" />
          )}
        </button>
      </div>
    </div>
  );
};