import React from 'react';
import type { Editor } from '@tiptap/react';
import { useEditorCommenting } from '../../../../services/commenting/hooks/use-editor-commenting';
import { useCommentInitialization } from '../../../../services/commenting/hooks/use-comment-initialization';
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
  // Initialize the comment system first
  const commentInit = useCommentInitialization();

  // Use the universal commenting hook as shown in the plan
  const { activePointer, comments, createComment, clearActivePointer } = useEditorCommenting(editor, {
    documentId: config.documentId,
    currentUser: config.currentUser,
    enableQuoteComments: config.enableQuoteComments,
  });

  // Debug logging
  React.useEffect(() => {
    console.log('CommentingIntegration Debug:', {
      isInitialized: commentInit.isInitialized,
      totalComments: commentInit.totalComments,
      totalEntities: commentInit.totalEntities,
      activePointer,
      currentComments: comments?.length || 0
    });
  }, [commentInit, activePointer, comments]);

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
        console.log('Cleaned up pending quote:', activePointer.id);
      }
    }
    
    // Clear the active pointer when closing
    clearActivePointer();
  };

  const handleCommentAdded = async (content: string) => {
    console.log('CommentingIntegration: handleCommentAdded called with content:', content);
    console.log('CommentingIntegration: activePointer:', activePointer);
    
    await createComment(content);
    console.log('CommentingIntegration: createComment completed');
    
    // After successfully adding the comment, finalize the quote creation
    if (activePointer) {
      console.log('CommentingIntegration: Looking for plugin in editor storage');
      const plugin = editor?.storage?.plugins?.get('editor-commenting') as any;
      console.log('CommentingIntegration: Found plugin:', !!plugin);
      console.log('CommentingIntegration: Plugin has finalizeQuoteCreation:', !!(plugin && plugin.finalizeQuoteCreation));
      
      if (plugin && plugin.finalizeQuoteCreation) {
        console.log('CommentingIntegration: Calling finalizeQuoteCreation with ID:', activePointer.id);
        plugin.finalizeQuoteCreation(activePointer.id);
      } else {
        console.log('CommentingIntegration: Cannot finalize - plugin or method not found');
      }
    } else {
      console.log('CommentingIntegration: Cannot finalize - no activePointer');
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