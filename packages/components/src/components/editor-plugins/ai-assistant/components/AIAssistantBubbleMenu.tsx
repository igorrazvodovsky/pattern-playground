import { useCallback, useState, useEffect } from 'react';
import { useEditorContext } from '../../../editor/EditorProvider';
import type { AIAssistantPluginOptions } from '../AIAssistantPlugin';

interface AIAssistantBubbleMenuProps {
  options: AIAssistantPluginOptions;
  onAction: (
    action: string,
    selectedText: string,
    range: { from: number; to: number },
  ) => Promise<void>;
}

export function AIAssistantBubbleMenu({ options, onAction }: AIAssistantBubbleMenuProps) {
  const { editor, eventBus } = useEditorContext();
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

  const handleAction = useCallback(
    async (action: string) => {
      if (!hasSelection || !selectedText || isProcessing) return;

      // Get current selection at action time to ensure accuracy
      const { from, to } = editor?.state.selection || { from: 0, to: 0 };
      // Blank lines between blocks, so a selection across paragraphs keeps them apart.
      const currentSelectedText = editor
        ? editor.state.doc.textBetween(from, to, '\n\n')
        : selectedText;
      const currentRange = { from, to };

      if (!currentSelectedText || currentSelectedText.trim().length === 0) {
        return;
      }

      setIsProcessing(true);
      // Use the plugin architecture as designed
      await onAction(action, currentSelectedText, currentRange);
    },
    [hasSelection, selectedText, isProcessing, onAction, editor],
  );

  // Don't render if no selection or plugin is not active
  if (!hasSelection || selectedText.length === 0) {
    return null;
  }

  return (
    <>
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
          title="More detail (zoom in)"
        >
          <iconify-icon icon="ik:zoom-in"></iconify-icon>
          <span className="visually-hidden">More detail</span>
        </button>
      )}
      {options.enableZoomOut && (
        <button
          type="button"
          className="button button--plain"
          onClick={() => handleAction('zoom-out')}
          title="Less detail (zoom out)"
        >
          <iconify-icon icon="ik:zoom-out"></iconify-icon>
          <span className="visually-hidden">Less detail</span>
        </button>
      )}

      {options.revisions?.map((preset) => (
        <button
          key={preset.id}
          type="button"
          className="button button--plain"
          onClick={() => handleAction(`revise:${preset.id}`)}
          disabled={isProcessing}
        >
          {preset.label}
        </button>
      ))}
    </>
  );
}
