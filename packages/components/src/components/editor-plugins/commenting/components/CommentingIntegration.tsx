import React from 'react';
import { useEditorContext } from '../../../editor/EditorProvider';
import { useEditorCommenting } from '../../../../services/commenting/hooks/use-editor-commenting';
import { QuoteCommentPopover } from '../../../commenting/quote/QuoteCommentPopover';
import { EditorCommentingPlugin, type CommentingPluginConfig } from '../CommentingPlugin';
import type { VirtualElement } from '../../../popup/popup';

interface CommentingIntegrationProps {
  config: CommentingPluginConfig;
  children: React.ReactNode;
}

// Must render inside EditorProvider, alongside a registered commenting plugin.
export const CommentingIntegration: React.FC<CommentingIntegrationProps> = ({
  config,
  children,
}) => {
  const { editor, eventBus, getPlugin } = useEditorContext();
  const getCommentingPlugin = () => {
    const plugin = getPlugin('editor-commenting');
    return plugin instanceof EditorCommentingPlugin ? plugin : null;
  };

  const { activeQuote, clearActiveQuote } = useEditorCommenting(eventBus);

  // Anchor the popover to the quoted text. Until the first comment it is
  // still the selection; after that it is the quote reference that replaced
  // it. Measured on every reposition, so the switch needs no bookkeeping.
  const anchor = React.useMemo<VirtualElement | null>(() => {
    if (!activeQuote) return null;
    const { view } = editor;
    return {
      contextElement: view.dom,
      getBoundingClientRect: () => {
        const reference = view.dom.querySelector(
          `[data-reference-id="${CSS.escape(activeQuote.id)}"]`
        );
        if (reference) return reference.getBoundingClientRect();

        const size = view.state.doc.content.size;
        const { from, to } = activeQuote.metadata.sourceRange;
        const start = view.coordsAtPos(Math.min(from, size));
        const end = view.coordsAtPos(Math.min(to, size), -1);
        const left = Math.min(start.left, end.left);
        return DOMRect.fromRect({
          x: left,
          y: start.top,
          width: Math.max(start.right, end.right) - left,
          height: end.bottom - start.top,
        });
      },
    };
  }, [editor, activeQuote]);

  const handleClosePopover = () => {
    if (activeQuote) {
      getCommentingPlugin()?.discardPendingQuote(activeQuote.id);
    }
    clearActiveQuote();
  };

  // Escape hands the keyboard back to the document, with the cursor just
  // after the quoted text: its reference once inserted, else the selection.
  const returnFocusToDocument = () => {
    if (!activeQuote) return;
    const { doc } = editor.state;
    let end = Math.min(activeQuote.metadata.sourceRange.to, doc.content.size);
    doc.descendants((node, pos) => {
      if (node.type.name === 'reference' && node.attrs.id === activeQuote.id) {
        end = pos + node.nodeSize;
      }
      return node.type.name !== 'reference';
    });
    editor.chain().focus().setTextSelection(end).run();
  };

  // The popover's thread has already stored the comment; the first one turns
  // the selected text into a quote reference.
  const handleCommentAdded = () => {
    if (activeQuote) {
      getCommentingPlugin()?.finalizeQuoteCreation(activeQuote.id);
    }
  };

  return (
    <>
      {children}

      {activeQuote && (
        <QuoteCommentPopover
          quote={activeQuote}
          anchor={anchor}
          currentUser={config.currentUser}
          onClose={handleClosePopover}
          onEscape={returnFocusToDocument}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </>
  );
};
