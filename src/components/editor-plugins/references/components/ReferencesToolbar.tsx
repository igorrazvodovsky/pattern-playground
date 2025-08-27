import React, { useCallback } from 'react';
import { useEditorContext } from '../../../editor/EditorProvider';
import type { ReferenceCategory, SelectedReference } from '../../../reference/types';

interface ReferencesToolbarProps {
  data: ReferenceCategory[];
  onReferenceSelect?: (reference: SelectedReference) => void;
}

export function ReferencesToolbar({ data, onReferenceSelect }: ReferencesToolbarProps) {
  const { editor } = useEditorContext();

  const handleInsertReference = useCallback(() => {
    if (!editor) return;
    
    // Insert @ character to trigger reference suggestion
    editor.commands.insertContent('@');
    editor.commands.focus();
  }, [editor]);

  return (
    <div className="references-toolbar">
      <button
        type="button"
        className="toolbar-button"
        onClick={handleInsertReference}
        title="Insert reference (@)"
        disabled={!editor}
      >
        <span className="toolbar-button-icon">@</span>
        <span className="toolbar-button-label">Reference</span>
      </button>
    </div>
  );
}