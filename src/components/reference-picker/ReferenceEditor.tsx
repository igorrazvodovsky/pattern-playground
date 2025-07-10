import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ReferencePicker } from './ReferencePicker';
import { AnimateChangeInHeight } from '../filter/animate-change-in-height';
import type { ReferenceCategory, SelectedReference, ReferencePickerRef } from './reference-picker-types';

export interface ReferenceEditorProps {
  /** Reference data for the picker */
  data: ReferenceCategory[];
  /** Initial content */
  content?: string;
  placeholder?: string;
  className?: string;
  onChange?: (content: string) => void;
  onReferenceSelect?: (reference: SelectedReference) => void;
}

/**
 * TipTap editor with integrated hierarchical reference picker
 * Provides consistent experience with Command Menu and Filtering
 */
export function ReferenceEditor({
  data,
  content = '',
  placeholder = 'Type @ to reference...',
  className = '',
  onChange,
  onReferenceSelect,
}: ReferenceEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
  const pickerRef = useRef<ReferencePickerRef>(null);
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  // Handle reference selection
  const handleReferenceSelect = useCallback((reference: SelectedReference) => {
    onReferenceSelect?.(reference);

    // Insert reference text into editor (simplified approach)
    if (editorRef.current) {
      editorRef.current.commands.insertContent(`@${reference.label} `);
    }

    // Close picker after inserting reference
    setPickerOpen(false);
  }, [onReferenceSelect]);

  // Handle picker close
  const handlePickerClose = useCallback(() => {
    setPickerOpen(false);
  }, []);

  // Create TipTap editor (simplified version without complex extension)
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content,
    editorProps: {
      attributes: {
        class: `tiptap-editor-basic reference-editor ${className}`,
        'data-placeholder': placeholder,
      },
      handleKeyDown: (view, event) => {
        // Handle @ key to open picker
        if (event.key === '@') {
          setTimeout(() => {
            const { state } = view;
            const { selection } = state;
            const coords = view.coordsAtPos(selection.from);

            // Set initial position directly from caret coordinates
            setPickerPosition({ x: coords.left, y: coords.bottom + 8 });
            setPickerOpen(true);
          }, 0);
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  // Store editor reference when it's available
  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
    }
  }, [editor]);

  // Focus picker when it opens
  useEffect(() => {
    if (pickerOpen) {
      setTimeout(() => {
        pickerRef.current?.focus();
      }, 0);
    }
  }, [pickerOpen]);

  return (
    <div className="reference-editor-container">
      <EditorContent editor={editor} />

      {pickerOpen && (
        <div
          style={{
            position: 'fixed',
            left: `${pickerPosition.x}px`,
            top: `${pickerPosition.y}px`,
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            minWidth: '320px',
            maxWidth: '480px',
            maxHeight: '400px',
            overflow: 'hidden'
          }}
        >
          <AnimateChangeInHeight>
            <ReferencePicker
              ref={pickerRef}
              data={data}
              onSelect={handleReferenceSelect}
              onClose={handlePickerClose}
              open={pickerOpen}
            />
          </AnimateChangeInHeight>
        </div>
      )}
    </div>
  );
}