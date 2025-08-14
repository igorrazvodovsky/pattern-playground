import { useCallback, useState } from 'react';
import type { Editor } from '@tiptap/react';
import type { QuoteObject } from '../../../services/commenting/quote-service.js';
import { useTipTapQuoteIntegration } from '../tiptap/use-tiptap-quote-integration.js';

interface UseQuoteCommentUIOptions {
  editor: Editor | null;
  documentId: string;
  currentUser: string;
}

interface QuoteCommentUIState {
  popoverOpen: boolean;
  commentingQuote: QuoteObject | null;
  triggerElement: HTMLElement | null;
}

/**
 * Hook for managing quote commenting UI state and flow
 * Bridges quote creation with comment popover workflow
 */
export const useQuoteCommentUI = (options: UseQuoteCommentUIOptions) => {
  const { editor, documentId, currentUser } = options;
  
  const [uiState, setUIState] = useState<QuoteCommentUIState>({
    popoverOpen: false,
    commentingQuote: null,
    triggerElement: null
  });

  // Get base quote integration functionality
  const quoteIntegration = useTipTapQuoteIntegration(editor, {
    documentId,
    currentUser
  });

  // Find the DOM element for a quote reference mark
  const findQuoteReferenceElement = useCallback((quoteId: string): HTMLElement | null => {
    if (!editor) return null;

    const editorElement = editor.view.dom;
    const referenceElement = editorElement.querySelector(`[data-reference-id="${quoteId}"]`) as HTMLElement;
    
    return referenceElement;
  }, [editor]);

  // Main comment flow: create quote + open popover
  const handleComment = useCallback(() => {
    if (!editor) {
      console.warn('Editor not available for quote commenting');
      return;
    }

    // 1. Create quote from current selection
    const quote = quoteIntegration.createQuote();
    if (!quote) {
      console.warn('Failed to create quote from selection');
      return;
    }

    // 2. Find the reference element for positioning (wait a frame for DOM update)
    requestAnimationFrame(() => {
      const triggerElement = findQuoteReferenceElement(quote.id);
      
      if (!triggerElement) {
        console.warn('Could not find reference element for quote positioning');
        return;
      }

      // 3. Open popover for comment input
      setUIState({
        popoverOpen: true,
        commentingQuote: quote,
        triggerElement
      });
    });
  }, [editor, quoteIntegration, findQuoteReferenceElement]);

  // Close popover
  const closePopover = useCallback(() => {
    setUIState(prev => ({ 
      ...prev, 
      popoverOpen: false,
      commentingQuote: null,
      triggerElement: null
    }));
  }, []);

  // Handle comment being added (close popover)
  const handleCommentAdded = useCallback(() => {
    closePopover();
  }, [closePopover]);

  // Check if current selection is valid for quote commenting
  const canCreateQuoteComment = useCallback((): boolean => {
    return quoteIntegration.canCreateQuote();
  }, [quoteIntegration]);

  return {
    // UI state
    uiState,
    
    // Actions
    handleComment,
    closePopover,
    handleCommentAdded,
    canCreateQuoteComment,
    
    // Quote integration passthrough
    ...quoteIntegration
  };
};