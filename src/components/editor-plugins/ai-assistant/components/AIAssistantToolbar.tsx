import React, { useCallback, useState, useEffect } from 'react';
import { useEditorContext, usePlugin } from '../../../editor/EditorProvider';
import type { AIAssistantPlugin, AIAssistantPluginOptions } from '../AIAssistantPlugin';

interface AIAssistantToolbarProps {
  options: AIAssistantPluginOptions;
  onAction: (action: string, selectedText: string, range: { from: number; to: number }) => Promise<void>;
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

  const handleAction = useCallback(async (action: string) => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    const currentSelectedText = editor.state.doc.textBetween(from, to);
    
    if (!currentSelectedText) {
      // If no selection, show a message or select all content
      const allText = editor.state.doc.textContent;
      if (allText) {
        editor.commands.selectAll();
        await onAction(action, allText, { from: 0, to: editor.state.doc.content.size });
      }
      return;
    }
    
    setIsProcessing(true);
    await onAction(action, currentSelectedText, { from, to });
  }, [editor, onAction]);

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
          {options.enableExplain && (
            <button
              type="button"
              className="toolbar-button"
              onClick={() => handleAction('explain')}
              title="Explain selected text (or all content if none selected)"
              disabled={!editor}
            >
              <span className="toolbar-button-icon">💡</span>
              <span className="toolbar-button-label">Explain</span>
            </button>
          )}
          
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