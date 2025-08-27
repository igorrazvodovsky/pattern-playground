import React, { useEffect, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import { useTipTapQuoteCommenting } from '../../../commenting/tiptap/use-tiptap-quote-commenting.js';
import { QuoteCommentPopover } from '../../../commenting/quote/QuoteCommentPopover.js';
import type { CommentingPluginConfig } from '../CommentingPlugin';

interface CommentingIntegrationProps {
  editor: Editor;
  config: CommentingPluginConfig;
  children: React.ReactNode;
}

/**
 * Integration component that connects the commenting plugin with the existing quote commenting system.
 * This component handles the bridge between plugin events and the commenting hooks.
 */
export const CommentingIntegration: React.FC<CommentingIntegrationProps> = ({
  editor,
  config,
  children,
}) => {
  // Initialize quote commenting hook
  const quoteCommenting = useTipTapQuoteCommenting(editor, {
    documentId: config.documentId,
    currentUser: config.currentUser,
  });

  // Set up event listeners for plugin communication
  useEffect(() => {
    if (!editor?.storage?.editorContext?.eventBus) return;

    const eventBus = editor.storage.editorContext.eventBus;

    // Handle create quote comment command
    const unsubscribeCreate = eventBus.on('commenting:create-quote-comment', () => {
      quoteCommenting.createQuoteWithComment();
    });

    // Handle quote reference clicks
    const unsubscribeQuoteClick = eventBus.on('commenting:quote-reference-click', ({ quoteId }) => {
      quoteCommenting.handleQuoteReferenceClick(quoteId);
    });

    return () => {
      unsubscribeCreate();
      unsubscribeQuoteClick();
    };
  }, [editor, quoteCommenting]);

  // Store quote commenting instance in editor storage for plugin access
  useEffect(() => {
    if (editor?.storage) {
      editor.storage.quoteCommenting = quoteCommenting;
    }
  }, [editor, quoteCommenting]);

  return (
    <>
      {children}
      
      {/* Quote comment popover */}
      {quoteCommenting.uiState.popoverOpen && quoteCommenting.uiState.commentingQuote && (
        <QuoteCommentPopover
          quote={quoteCommenting.uiState.commentingQuote}
          isOpen={quoteCommenting.uiState.popoverOpen}
          triggerElement={quoteCommenting.uiState.triggerElement}
          currentUser={config.currentUser}
          onClose={quoteCommenting.closePopover}
          onCommentAdded={quoteCommenting.handleCommentAdded}
        />
      )}
    </>
  );
};