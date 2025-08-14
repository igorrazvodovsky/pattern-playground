import React, { useMemo } from 'react';
import { EditorContent } from '@tiptap/react';
import { useEditor } from './hooks/use-editor';
import { BubbleMenu } from './components/BubbleMenu';
import { FloatingMenu } from './components/FloatingMenu';
import type { TextEditorProps } from './types';

export const TextEditor: React.FC<TextEditorProps> = ({
  content,
  extensions,
  editable = true,
  placeholder,
  onUpdate,
  onSelectionChange,
  className = '',
  bubbleMenu,
  floatingMenu,
  commenting,
  references,
  editorProps,
  children,
}) => {
  // Memoize editor options to prevent unnecessary re-renders
  const editorOptions = useMemo(() => ({
    content,
    extensions,
    editable,
    placeholder,
    onUpdate,
    onSelectionChange,
    editorProps,
    enableCommenting: commenting?.enabled || false,
    enableReferences: references?.enabled || false,
    enableTemplateFields: true, // Always enable for flexibility
  }), [
    content,
    extensions,
    editable,
    placeholder,
    onUpdate,
    onSelectionChange,
    editorProps,
    commenting?.enabled,
    references?.enabled,
  ]);

  const {
    editor,
    editorState,
    fillTemplateFields,
    clearTemplateFields,
    validateTemplateFields,
    getSelectedText,
    hasSelection,
  } = useEditor(editorOptions);

  if (!editor) {
    return (
      <div className={`text-editor ${className}`}>
        <div className="rich-editor-container">
          <div className="rich-editor">Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-editor ${className}`}>
      {bubbleMenu && editor && (
        <BubbleMenu
          editor={editor}
          config={bubbleMenu}
          pluginKey={`bubbleMenu-${editor.id || 'default'}`}
        />
      )}
      
      {floatingMenu && editor && (
        <FloatingMenu
          editor={editor}
          config={floatingMenu}
          pluginKey={`floatingMenu-${editor.id || 'default'}`}
        />
      )}

      <div className="rich-editor-container">
        <EditorContent editor={editor} />
      </div>

      {children}
    </div>
  );
};

// Export utilities for consumers
export { useEditor } from './hooks/use-editor';
export { BubbleMenu, BUBBLE_MENU_PRESETS } from './components/BubbleMenu';
export { FloatingMenu, FLOATING_MENU_PRESETS } from './components/FloatingMenu';
export type {
  TextEditorProps,
  BubbleMenuConfig,
  FloatingMenuConfig,
  BubbleMenuAction,
  FloatingMenuAction,
} from './types';