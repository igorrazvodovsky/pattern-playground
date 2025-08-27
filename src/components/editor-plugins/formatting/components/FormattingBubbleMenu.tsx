import React from 'react';
import type { Editor } from '@tiptap/core';

interface FormattingBubbleMenuProps {
  editor?: Editor;
}

const FormattingBubbleMenu: React.FC<FormattingBubbleMenuProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'button button--plain is-active' : 'button button--plain'}
        aria-label="Bold"
      >
        <strong>B</strong>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'button button--plain is-active' : 'button button--plain'}
        aria-label="Italic"
      >
        <em>I</em>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'button button--plain is-active' : 'button button--plain'}
        aria-label="Strikethrough"
      >
        <s>S</s>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        disabled={!editor.can().chain().focus().toggleHighlight().run()}
        className={editor.isActive('highlight') ? 'button button--plain is-active' : 'button button--plain'}
        aria-label="Highlight"
      >
        <mark>H</mark>
      </button>
    </>
  );
};

export default FormattingBubbleMenu;