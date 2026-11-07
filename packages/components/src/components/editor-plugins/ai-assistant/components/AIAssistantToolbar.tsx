import { useCallback, useState, useEffect } from 'react';
import { Selection } from '@tiptap/pm/state';
import { useEditorContext, usePlugin } from '../../../editor/EditorProvider';
import type { AIAssistantPlugin, AIAssistantPluginOptions } from '../AIAssistantPlugin';

interface AIAssistantToolbarProps {
  options: AIAssistantPluginOptions;
  onAction: (
    action: string,
    selectedText: string,
    range: { from: number; to: number },
  ) => Promise<void>;
}

export function AIAssistantToolbar({ options, onAction }: AIAssistantToolbarProps) {
  const { editor, eventBus } = useEditorContext();
  const aiAssistantPlugin = usePlugin<AIAssistantPlugin>('ai-assistant');
  const [isProcessing, setIsProcessing] = useState(false);

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
      if (!editor) return;

      // With nothing selected the action applies to the whole document, from
      // the start of its first text block to the end of its last.
      const { doc } = editor.state;
      const { from, to } = editor.state.selection.empty
        ? { from: Selection.atStart(doc).from, to: Selection.atEnd(doc).to }
        : editor.state.selection;
      // Blank lines between blocks, so a selection across paragraphs keeps them apart.
      const text = doc.textBetween(from, to, '\n\n');
      if (!text.trim()) return;

      setIsProcessing(true);
      await onAction(action, text, { from, to });
    },
    [editor, onAction],
  );

  const handleCancelOperation = useCallback(() => {
    if (aiAssistantPlugin && aiAssistantPlugin.isStreaming()) {
      aiAssistantPlugin.cancelCurrentOperation();
      setIsProcessing(false);
    }
  }, [aiAssistantPlugin]);

  return (
    <div className="ai-assistant-toolbar">
      {isProcessing ? (
        <button
          type="button"
          className="toolbar-button toolbar-button--cancel"
          onClick={handleCancelOperation}
          title="Cancel AI operation"
        >
          <span className="toolbar-button-icon">⏹️</span>
          <span className="toolbar-button-label">Cancel AI</span>
        </button>
      ) : (
        <>
          {options.enableSummarize && (
            <button
              type="button"
              className="toolbar-button"
              onClick={() => handleAction('summarize')}
              title="Summarize selected text (or all content if none selected)"
              disabled={!editor}
            >
              <span className="toolbar-button-icon">📝</span>
              <span className="toolbar-button-label">Summarize</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
