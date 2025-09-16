import React from 'react';
import type { Editor } from '@tiptap/react';
import { useEditorCommenting } from '../../../../services/commenting/hooks/use-editor-commenting';
import { QuoteCommentPopover } from '../../../commenting/quote/QuoteCommentPopover';
import { getQuoteService } from '../../../../services/commenting/quote-service';
import type { CommentingPluginConfig } from '../CommentingPlugin';

interface CommentingPluginInstance {
  pendingQuotes: Map<string, { from: number; to: number; text: string }>;
  finalizeQuoteCreation: (quoteId: string) => void;
}

interface CommentingIntegrationProps {
  editor: Editor;
  config: CommentingPluginConfig;
  children: React.ReactNode;
}

export const CommentingIntegration: React.FC<CommentingIntegrationProps> = ({
  editor,
  config,
  children,
}) => {
  const { activePointer, comments, createComment, clearActivePointer } = useEditorCommenting(editor, {
    documentId: config.documentId,
    currentUser: config.currentUser
  });

  const [triggerElement, setTriggerElement] = React.useState<HTMLElement | null>(null);

  // Find the comment button when activePointer changes
  React.useEffect(() => {
    if (activePointer) {
      // Find the comment button in the bubble menu
      const commentButton = document.querySelector('button[title="Add comment"]') as HTMLElement;
      setTriggerElement(commentButton);
    } else {
      setTriggerElement(null);
    }
  }, [activePointer]);

  const handleClosePopover = () => {
    if (activePointer) {
      const plugin = editor?.storage?.plugins?.get('editor-commenting') as CommentingPluginInstance;
      if (plugin && plugin.pendingQuotes) {
        plugin.pendingQuotes.delete(activePointer.id);
      }
    }
    clearActivePointer();
  };

  const handleCommentAdded = async (content: string) => {
    await createComment(content);

    if (activePointer) {
      const plugin = editor?.storage?.plugins?.get('editor-commenting') as CommentingPluginInstance;

      if (plugin && plugin.finalizeQuoteCreation) {
        plugin.finalizeQuoteCreation(activePointer.id);
      }
    }
  };

  return (
    <>
      {children}

      {activePointer && activePointer.type === 'quote' && (() => {
        const quoteService = getQuoteService();
        const fullQuote = quoteService.getQuoteById(activePointer.id);

        if (!fullQuote) {
          console.warn('Quote not found for ID:', activePointer.id);
          return null;
        }

        return (
          <QuoteCommentPopover
            quote={fullQuote}
            isOpen={true}
            triggerElement={triggerElement}
            currentUser={config.currentUser}
            onClose={handleClosePopover}
            onCommentAdded={handleCommentAdded}
          />
        );
      })()}
    </>
  );
};