import React from 'react';
import type { Editor } from '@tiptap/react';
import { useEditorCommenting } from '../../../../services/commenting/hooks/use-editor-commenting';
import { QuoteCommentPopover } from '../../../commenting/quote/QuoteCommentPopover';
import { getQuoteService } from '../../../../services/commenting/quote-service';
import type { CommentingPluginConfig } from '../CommentingPlugin';

interface CommentingIntegrationProps {
  editor: Editor;
  config: CommentingPluginConfig;
  children: React.ReactNode;
}

/**
 * Simple integration component following the plan architecture.
 * Shows popover when there's an active quote pointer from the editor.
 */
export const CommentingIntegration: React.FC<CommentingIntegrationProps> = ({
  editor,
  config,
  children,
}) => {
  // Use the universal commenting hook as shown in the plan
  const { activePointer, comments, createComment, clearActiveComment } = useEditorCommenting(editor, {
    documentId: config.documentId,
    currentUser: config.currentUser
  });

  // Debug logging (disabled to prevent console spam)
  // React.useEffect(() => {
  //   console.log('CommentingIntegration Debug:', {
  //     activePointer,
  //     currentComments: comments?.length || 0
  //   });
  // }, [activePointer, comments]);

  // State to track the trigger element for positioning
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
    // Clean up any pending quote when closing without adding comment
    if (activePointer) {
      const plugin = editor?.storage?.plugins?.get('editor-commenting') as any;
      if (plugin && plugin.pendingQuotes) {
        plugin.pendingQuotes.delete(activePointer.id);
      }
    }
    
    // Clear the active pointer when closing
    clearActiveComment();
  };

  const handleCommentAdded = async (content: string) => {
    await createComment(content);
    
    // After successfully adding the comment, finalize the quote creation
    if (activePointer) {
      const plugin = editor?.storage?.plugins?.get('editor-commenting') as any;
      
      if (plugin && plugin.finalizeQuoteCreation) {
        plugin.finalizeQuoteCreation(activePointer.id);
      }
    }
  };

  return (
    <>
      {children}

      {/* QuoteCommentPopover for initial comment creation */}
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