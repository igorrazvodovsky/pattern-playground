import { useEditor as useTiptapEditor } from '@tiptap/react';
import { useState, useCallback } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import type { UseEditorOptions, EditorState } from '../types';

// Import existing extensions from your codebase
import { Reference, createReferenceSuggestion } from '../../reference';
import { CommentMark } from '../../commenting';
import { TemplateField } from '../../template-field';

export const useEditor = (options: UseEditorOptions = {}) => {
  const {
    content = '<p></p>',
    extensions: additionalExtensions = [],
    editable = true,
    placeholder,
    onUpdate,
    onSelectionChange,
    editorProps = {},
    enableCommenting = false,
    enableReferences = false,
    enableTemplateFields = false,
  } = options;

  // Editor state tracking
  const [editorState, setEditorState] = useState<EditorState>({
    content: '',
    wordCount: 0,
    isValid: true,
    selection: { from: 0, to: 0, text: '' },
    mentions: [],
    templateFields: [],
  });

  // Build extensions array based on configuration
  const getExtensions = useCallback(() => {
    const baseExtensions = [
      StarterKit,
      Highlight,
    ];

    // Conditionally add feature extensions
    if (enableReferences) {
      // Use Reference Node extension with empty categories for now
      // In real usage, pass categories through options
      baseExtensions.push(Reference.configure({
        suggestion: createReferenceSuggestion([])
      }));
    }

    if (enableCommenting) {
      baseExtensions.push(CommentMark);
    }

    if (enableTemplateFields) {
      baseExtensions.push(TemplateField);
    }

    // Add any additional extensions passed in
    return [...baseExtensions, ...additionalExtensions];
  }, [additionalExtensions, enableCommenting, enableReferences, enableTemplateFields]);

  // Create editor instance
  const editor = useTiptapEditor({
    extensions: getExtensions(),
    content,
    editable,
    immediatelyRender: false, // Prevent SSR issues
    editorProps: {
      attributes: {
        class: 'rich-editor',
        'data-placeholder': placeholder || '',
      },
      ...editorProps,
    },
    onTransaction: ({ editor }) => {
      // Update editor state
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');
      const content = editor.getHTML();
      const wordCount = editor.state.doc.textContent.split(/\s+/).filter(Boolean).length;

      // Extract mentions
      const mentions: EditorState['mentions'] = [];
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'mention' || node.type.name === 'reference') {
          mentions.push({
            id: node.attrs.id,
            name: node.attrs.label || node.attrs.name,
            type: node.attrs.type || 'mention',
          });
        }
      });

      // Extract template fields
      const templateFields: EditorState['templateFields'] = [];
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'templateField') {
          templateFields.push({
            label: node.attrs.label,
            value: node.attrs.value || '',
            filled: node.attrs.filled || false,
            required: node.attrs.required || false,
          });
        }
      });

      const newState: EditorState = {
        content,
        wordCount,
        isValid: templateFields.every(field => !field.required || field.filled),
        selection: { from, to, text: selectedText },
        mentions,
        templateFields,
      };

      setEditorState(newState);

      // Call user-provided callbacks
      if (onUpdate) {
        onUpdate(editor);
      }

      if (onSelectionChange && (from !== editorState.selection.from || to !== editorState.selection.to)) {
        onSelectionChange(editor);
      }
    },
  });

  // Utility methods
  const fillTemplateFields = useCallback((data: Record<string, string>) => {
    if (!editor) return;

    Object.entries(data).forEach(([label, value]) => {
      if (editor.commands.fillTemplateField) {
        editor.commands.fillTemplateField(label, value);
      }
    });
  }, [editor]);

  const clearTemplateFields = useCallback(() => {
    if (!editor) return;
    if (editor.commands.clearTemplateFields) {
      editor.commands.clearTemplateFields();
    }
  }, [editor]);

  const validateTemplateFields = useCallback(() => {
    if (!editor) return false;
    if (editor.commands.validateTemplateFields) {
      return editor.commands.validateTemplateFields();
    }
    return editorState.isValid;
  }, [editor, editorState.isValid]);

  const getSelectedText = useCallback(() => {
    if (!editor) return '';
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, ' ');
  }, [editor]);

  const hasSelection = useCallback(() => {
    if (!editor) return false;
    const { from, to } = editor.state.selection;
    return from !== to;
  }, [editor]);

  return {
    editor,
    editorState,
    // Template field utilities
    fillTemplateFields,
    clearTemplateFields,
    validateTemplateFields,
    // Selection utilities
    getSelectedText,
    hasSelection,
  };
};