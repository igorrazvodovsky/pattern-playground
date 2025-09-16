import { useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import { useQuoteCommentUI } from '../hooks/use-quote-comment-ui';
import { getCommentService } from '../../../services/commenting/core/comment-service-instance';

interface UseTipTapQuoteCommentingOptions {
  documentId: string;
  currentUser: string;
}

/**
 * Main hook for TipTap quote commenting integration
 * Combines quote creation, comment UI, and commenting system
 */
export const useTipTapQuoteCommenting = (
  editor: Editor | null,
  options: UseTipTapQuoteCommentingOptions
) => {
  const { documentId, currentUser } = options;

  // Get comment UI layer with quote integration
  const commentUI = useQuoteCommentUI({
    editor,
    documentId,
    currentUser
  });

  const commentService = getCommentService();

  // Enhanced quote creation that triggers comment flow
  const createQuoteWithComment = useCallback(() => {
    commentUI.handleComment();
  }, [commentUI]);

  // Handle clicking on existing quote references
  const handleQuoteReferenceClick = useCallback((quoteId: string) => {
    const quote = commentUI.getQuote(quoteId);
    if (quote) {
      // Always show quote modal - it will show comments if they exist
      // or provide interface to add first comment
      commentUI.handleQuoteClick(quoteId);
    } else {
      console.warn(`Quote not found: ${quoteId}`);
    }
  }, [commentUI]);

  // Get quote comment count for UI indicators
  const getQuoteCommentCount = useCallback(async (quoteId: string) => {
    const { EntityPointer } = await import('../../../services/commenting/core/entity-pointer');
    const pointer = new EntityPointer('quote', quoteId);
    const comments = await commentService.getComments(pointer);
    return comments.filter(c => !c.resolved).length;
  }, [commentService]);

  // Check if a quote has any comments
  const hasQuoteComments = useCallback(async (quoteId: string) => {
    const count = await getQuoteCommentCount(quoteId);
    return count > 0;
  }, [getQuoteCommentCount]);

  return {
    // Quote + Comment integration
    createQuoteWithComment,
    handleQuoteReferenceClick,

    // Comment utilities
    getQuoteCommentCount,
    hasQuoteComments,

    // UI state from comment UI layer
    uiState: commentUI.uiState,
    closePopover: commentUI.closePopover,
    handleCommentAdded: commentUI.handleCommentAdded,
    canCreateQuoteComment: commentUI.canCreateQuoteComment,

    // Quote integration passthrough (from base quote integration)
    documentQuotes: commentUI.documentQuotes,
    getQuote: commentUI.getQuote,
    handleQuoteClick: commentUI.handleQuoteClick,
    navigateToQuoteSource: commentUI.navigateToQuoteSource,
    deleteQuote: commentUI.deleteQuote,
    getDocumentQuotes: commentUI.getDocumentQuotes,
    searchQuotes: commentUI.searchQuotes,
    validateQuoteIntegrity: commentUI.validateQuoteIntegrity,
    cleanupOrphanedQuotes: commentUI.cleanupOrphanedQuotes,
    exportDocumentQuotes: commentUI.exportDocumentQuotes,

    // Service access for advanced usage
    quoteService: commentUI.quoteService,
    commentService
  };
};