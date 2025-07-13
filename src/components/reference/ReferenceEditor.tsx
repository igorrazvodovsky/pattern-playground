import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Reference, createReferenceSuggestion } from './Reference';
import type { ReferenceCategory, SelectedReference } from './types';

export interface ReferenceEditorProps {
  /** Reference data for the picker */
  data: ReferenceCategory[];
  /** Initial content - can be HTML string or TipTap JSON */
  content?: string | Record<string, unknown>;
  placeholder?: string;
  className?: string;
  onChange?: (content: string) => void;
  onReferenceSelect?: (reference: SelectedReference) => void;
}

/**
 * Simple TipTap editor with inline reference search
 * Uses floating-ui for positioning and supports typing @query to filter
 */
export function ReferenceEditor({
  data,
  content = '',
  placeholder = 'Type @ to reference...',
  className = '',
  onChange,
  onReferenceSelect,
}: ReferenceEditorProps) {

  const editor = useEditor({
    extensions: [
      StarterKit,
      Reference.configure({
        HTMLAttributes: {
          class: 'reference-mention reference',
        },
        suggestion: createReferenceSuggestion(data, onReferenceSelect),
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `tiptap-editor-basic reference-editor ${className}`,
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  return (
    <div className="reference-editor-container">
      <EditorContent editor={editor} />
    </div>
  );
}