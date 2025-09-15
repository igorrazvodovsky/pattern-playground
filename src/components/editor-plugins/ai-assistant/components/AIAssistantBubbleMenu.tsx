import React, { useCallback, useState, useEffect } from 'react';
import { useEditorContext, usePlugin } from '../../../editor/EditorProvider';
import type { AIAssistantPlugin, AIAssistantPluginOptions } from '../AIAssistantPlugin';

interface AIAssistantBubbleMenuProps {
  options: AIAssistantPluginOptions;
  onAction: (action: string, selectedText: string, range: { from: number; to: number }) => Promise<void>;
}

export function AIAssistantBubbleMenu({ options, onAction }: AIAssistantBubbleMenuProps) {
  const { editor, eventBus } = useEditorContext();
  const aiAssistantPlugin = usePlugin<AIAssistantPlugin>('ai-assistant');
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [, setSelectionRange] = useState({ from: 0, to: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // Listen to selection changes
  useEffect(() => {
    const unsubscribe = eventBus.on('ai-assistant:selection-changed', (payload) => {
      setHasSelection(payload.hasSelection);
      setSelectedText(payload.selectedText);
      setSelectionRange(payload.range);
    });

    return unsubscribe;
  }, [eventBus]);

  // Listen to processing events
  useEffect(() => {
    const unsubscribeComplete = eventBus.on('ai-assistant:action-complete', () => {
      setIsProcessing(false);
    });

    const unsubscribeError = eventBus.on('ai-assistant:action-error', () => {
      setIsProcessing(false);
    });

    return () => {
      unsubscribeComplete();
      unsubscribeError();
    };
  }, [eventBus]);

  const handleAction = useCallback(async (action: string) => {
    console.log('AIAssistantBubbleMenu.handleAction called:', { action, hasSelection, selectedText, isProcessing });
    if (!hasSelection || !selectedText || isProcessing) return;

    // Get current selection at action time to ensure accuracy
    const { from, to } = editor?.state.selection || { from: 0, to: 0 };
    const currentSelectedText = editor ? editor.state.doc.textBetween(from, to) : selectedText;
    const currentRange = { from, to };

    if (process.env.NODE_ENV === 'development') {
      console.log('Current selection at action time:', {
        from,
        to,
        length: to - from,
        text: `"${currentSelectedText}"`,
        text_length: currentSelectedText.length,
        cached_text: `"${selectedText}"`,
        cached_length: selectedText.length,
        matches_cache: currentSelectedText === selectedText
      });
    }

    if (!currentSelectedText || currentSelectedText.trim().length === 0) {
      console.warn('No text selected at action time');
      return;
    }

    setIsProcessing(true);
    // Use the plugin architecture as designed
    await onAction(action, currentSelectedText, currentRange);
  }, [hasSelection, selectedText, isProcessing, onAction, editor]);


  // Don't render if no selection or plugin is not active
  if (!hasSelection || selectedText.length === 0) {
    return null;
  }

  return (
    <>
      {options.enableExplain && (
        <button
          type="button"
          className="button button--plain"
          onClick={() => handleAction('explain')}
          title="Explain selected text"
        >
          💡 Explain
        </button>
      )}

      {options.enableSummarize && (
        <button
          type="button"
          className="button button--plain"
          onClick={() => handleAction('summarize')}
          title="Summarize selected text"
        >
          📝 Summarize
        </button>
      )}

      {options.enableZoomIn && (
        <button
          type="button"
          className="button button--plain"
          onClick={() => handleAction('zoom-in')}
          title="Condense selected text (zoom in)"
        >
          <iconify-icon icon="ph:magnifying-glass-plus"></iconify-icon>
        </button>
      )}
      {options.enableZoomOut && (
        <button
          type="button"
          className="button button--plain"
          onClick={() => handleAction('zoom-out')}
          title="Expand selected text (zoom out)"
        >
          <iconify-icon icon="ph:magnifying-glass-minus"></iconify-icon>
          <span className="inclusively-hidden">Expand</span>
        </button>
      )}
    </>
  );
}