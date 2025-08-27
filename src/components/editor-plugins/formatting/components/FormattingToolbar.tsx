import React from 'react';
import type { Editor } from '@tiptap/core';

interface FormattingToolbarProps {
  editor?: Editor;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="formatting-toolbar" role="toolbar" aria-label="Formatting options">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        aria-label="Bold"
        title="Bold (Cmd+B)"
      >
        <strong>B</strong>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        aria-label="Italic"
        title="Italic (Cmd+I)"
      >
        <em>I</em>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
        aria-label="Strikethrough"
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      <span className="divider" aria-hidden="true">|</span>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        aria-label="Heading 1"
        title="Heading 1"
      >
        H1
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        aria-label="Heading 2"
        title="Heading 2"
      >
        H2
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        aria-label="Heading 3"
        title="Heading 3"
      >
        H3
      </button>

      <span className="divider" aria-hidden="true">|</span>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        aria-label="Bullet list"
        title="Bullet list"
      >
        •
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        aria-label="Numbered list"
        title="Numbered list"
      >
        1.
      </button>

      <span className="divider" aria-hidden="true">|</span>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}
        aria-label="Blockquote"
        title="Blockquote"
      >
        "
      </button>
    </div>
  );
};

export default FormattingToolbar;