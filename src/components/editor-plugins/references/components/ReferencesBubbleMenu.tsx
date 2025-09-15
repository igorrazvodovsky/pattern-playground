import React, { useCallback, useState, useEffect } from 'react';
import { useEditorContext } from '../../../editor/EditorProvider';
import type { ReferencesPlugin } from '../ReferencesPlugin';
import type { ReferenceCategory, SelectedReference } from '../../../reference/types';

interface ReferencesBubbleMenuProps {
  data: ReferenceCategory[];
  onReferenceSelect?: (reference: SelectedReference) => void;
  enableQuoteReferences?: boolean;
}

export function ReferencesBubbleMenu({
  enableQuoteReferences = true
}: ReferencesBubbleMenuProps) {
  const { editor, eventBus, getPlugin } = useEditorContext();
  const referencesPlugin = getPlugin('references') as ReferencesPlugin;
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // Listen to selection changes
  useEffect(() => {
    const unsubscribe = eventBus.on('references:selection-changed', (payload) => {
      setHasSelection(payload.hasSelection);
      setSelectedText(payload.selectedText);
    });

    return unsubscribe;
  }, [eventBus]);

  const handleCreateQuoteReference = useCallback(() => {
    if (!hasSelection || !selectedText) return;
    
    referencesPlugin?.convertSelectionToQuote(selectedText);
  }, [referencesPlugin, hasSelection, selectedText]);

  const handleInsertReference = useCallback(() => {
    if (!editor) return;
    
    // Insert @ character to trigger reference suggestion
    editor.commands.insertContent('@');
    editor.commands.focus();
  }, [editor]);

  // Don't render if no relevant actions are available
  if (!enableQuoteReferences || (!hasSelection && selectedText.length === 0)) {
    return null;
  }

  return (
    <div className="references-bubble-menu">
      {hasSelection && enableQuoteReferences && (
        <button
          type="button"
          className="bubble-menu-button"
          onClick={handleCreateQuoteReference}
          title="Create quote reference from selection"
        >
          📝 Quote
        </button>
      )}
      
      {!hasSelection && (
        <button
          type="button"
          className="bubble-menu-button"
          onClick={handleInsertReference}
          title="Insert reference"
        >
          @ Reference
        </button>
      )}
    </div>
  );
}