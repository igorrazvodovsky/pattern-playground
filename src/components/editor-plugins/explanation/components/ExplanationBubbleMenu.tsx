import React, { useCallback, useState, useEffect } from 'react';
import { useEditorContext } from '../../../editor/EditorProvider';
import { useModalService } from '../../../../hooks/useModalService';
import { ExplanationDrawerContainer } from './ExplanationDrawerContainer';
import type { ExplanationPluginOptions } from '../ExplanationPlugin';
// Type guard for safe event payload handling
function isSelectionPayload(payload: unknown): payload is { hasSelection: boolean; selectedText: string; range: { from: number; to: number } } {
  return typeof payload === 'object' && payload !== null &&
    'hasSelection' in payload && typeof (payload as Record<string, unknown>).hasSelection === 'boolean' &&
    'selectedText' in payload && typeof (payload as Record<string, unknown>).selectedText === 'string' &&
    'range' in payload && typeof (payload as Record<string, unknown>).range === 'object';
}

interface ExplanationBubbleMenuProps {
  options: ExplanationPluginOptions;
  onExplain: (selectedText: string, range: { from: number; to: number }) => Promise<void>;
  isExplaining: boolean;
}

export function ExplanationBubbleMenu({ options, onExplain, isExplaining }: ExplanationBubbleMenuProps) {
  const { editor, eventBus } = useEditorContext();
  const { openDrawer } = useModalService();
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [, setSelectionRange] = useState({ from: 0, to: 0 });

  // Listen to selection changes
  useEffect(() => {
    const unsubscribe = eventBus.on('explanation:selection-changed', (payload: unknown) => {
      if (!isSelectionPayload(payload)) {
        console.warn('Invalid selection payload received');
        return;
      }
      setHasSelection(payload.hasSelection);
      setSelectedText(payload.selectedText);
      setSelectionRange(payload.range);
    });

    return unsubscribe;
  }, [eventBus]);


  const handleExplain = useCallback(async () => {
    if (!hasSelection || !selectedText || isExplaining) return;

    // Get current selection at action time to ensure accuracy
    const { from, to } = editor?.state.selection || { from: 0, to: 0 };
    const currentSelectedText = editor ? editor.state.doc.textBetween(from, to) : selectedText;
    const currentRange = { from, to };

    if (!currentSelectedText || currentSelectedText.trim().length === 0) {
      console.warn('No text selected at action time');
      return;
    }

    // Open drawer with container that manages streaming state
    openDrawer(
      <ExplanationDrawerContainer
        initialText={currentSelectedText}
        initialReferences={[]}
        eventBus={eventBus}
      />,
      {
        title: 'Explanation',
        position: 'right',
        size: 'medium',
        closable: true
      }
    );

    // Start explanation
    await onExplain(currentSelectedText, currentRange);
  }, [hasSelection, selectedText, isExplaining, onExplain, editor, openDrawer, eventBus]);

  // Don't render if no selection or explanation is disabled
  if (!hasSelection || selectedText.length === 0 || !options.enableExplain) {
    return null;
  }

  return (
    <button
      type="button"
      className="button button--plain"
      onClick={handleExplain}
      disabled={isExplaining}
      title="Explain selected text"
      aria-describedby="explanation-status"
      aria-pressed={isExplaining}
      aria-label={isExplaining ? 'Explanation in progress' : 'Explain selected text'}
    >
      {isExplaining ? 'Explaining...' : 'Explain this'}
      <span id="explanation-status" className="sr-only">
        {isExplaining ? 'Explanation in progress' : 'Click to explain selected text'}
      </span>
    </button>
  );
}