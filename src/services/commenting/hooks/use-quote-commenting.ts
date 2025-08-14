import { useMemo, useCallback } from 'react';
import { useUniversalCommenting } from './use-universal-commenting.js';
import { createQuoteCommentingService } from '../quote-commenting-service.js';
import type { Quote, RichContent } from '../../../stories/shared-data/index.js';
import type { UniversalComment } from '../document-pointer.js';

/**
 * React hook for quote commenting functionality
 * Integrates quote objects with the universal commenting system
 */
export const useQuoteCommenting = (quote?: Quote) => {
  const universalCommenting = useUniversalCommenting();
  
  // Create quote commenting service
  const quoteCommentingService = useMemo(() => {
    return createQuoteCommentingService(universalCommenting.service);
  }, [universalCommenting.service]);

  // Get comments for the specific quote
  const quoteComments = useMemo(() => {
    if (!quote) return [];
    return quoteCommentingService.getQuoteComments(quote.id);
  }, [quoteCommentingService, quote, universalCommenting.threads, universalCommenting.activeThreadComments]);

  // Get comment thread for the quote
  const quoteThread = useMemo(() => {
    if (!quote) return undefined;
    return quoteCommentingService.getQuoteThread(quote.id);
  }, [quoteCommentingService, quote, universalCommenting.threads]);

  // Get comment statistics
  const commentStats = useMemo(() => {
    if (!quote) return { totalComments: 0, activeComments: 0, resolvedComments: 0, lastActivity: null };
    return quoteCommentingService.getQuoteCommentStats(quote.id);
  }, [quoteCommentingService, quote, quoteComments]);

  // Add comment to quote
  const addComment = useCallback(async (content: RichContent, authorId: string = 'user-1') => {
    if (!quote) {
      throw new Error('No quote provided for commenting');
    }

    try {
      // Ensure thread exists for the quote
      quoteCommentingService.ensureQuoteThread(quote);
      
      // Add the comment
      const comment = await quoteCommentingService.addQuoteComment(
        quote.id,
        content,
        authorId
      );

      console.log('Comment added to quote:', comment);
      return comment;

    } catch (error) {
      console.error('Failed to add comment to quote:', error);
      throw error;
    }
  }, [quote, quoteCommentingService]);

  // Resolve quote thread
  const resolveThread = useCallback((resolvedBy: string = 'user-1') => {
    if (!quote) return false;
    
    return quoteCommentingService.resolveQuoteThread(quote.id, resolvedBy);
  }, [quote, quoteCommentingService]);

  // Check if quote has comments
  const hasComments = useMemo(() => {
    return quoteComments.length > 0;
  }, [quoteComments]);

  // Check if quote thread is active
  const isThreadActive = useMemo(() => {
    return quoteThread?.status === 'active';
  }, [quoteThread]);

  // Search comments in this quote
  const searchComments = useCallback((searchTerm: string): UniversalComment[] => {
    if (!quote) return [];
    
    return quoteCommentingService.searchQuoteComments(searchTerm, [quote.id]);
  }, [quote, quoteCommentingService]);

  return {
    // Quote-specific data
    quote,
    quoteComments,
    quoteThread,
    commentStats,
    hasComments,
    isThreadActive,

    // Actions
    addComment,
    resolveThread,
    searchComments,

    // Services (for advanced usage)
    quoteCommentingService,
    
    // Inherit universal commenting functionality
    ...universalCommenting,
  };
};

/**
 * Hook for managing comments across multiple quotes
 */
export const useMultiQuoteCommenting = (quotes: Quote[]) => {
  const universalCommenting = useUniversalCommenting();
  
  const quoteCommentingService = useMemo(() => {
    return createQuoteCommentingService(universalCommenting.service);
  }, [universalCommenting.service]);

  // Get comments for all quotes
  const allQuoteComments = useMemo(() => {
    const quoteIds = quotes.map(q => q.id);
    return quoteCommentingService.getCommentsForQuotes(quoteIds);
  }, [quoteCommentingService, quotes, universalCommenting.threads]);

  // Get quotes with comments
  const quotesWithComments = useMemo(() => {
    return quotes.filter(quote => {
      const comments = allQuoteComments.get(quote.id) || [];
      return comments.length > 0;
    });
  }, [quotes, allQuoteComments]);

  // Get total comment count across all quotes
  const totalComments = useMemo(() => {
    let total = 0;
    allQuoteComments.forEach(comments => {
      total += comments.length;
    });
    return total;
  }, [allQuoteComments]);

  // Search across all quote comments
  const searchAllComments = useCallback((searchTerm: string): UniversalComment[] => {
    const quoteIds = quotes.map(q => q.id);
    return quoteCommentingService.searchQuoteComments(searchTerm, quoteIds);
  }, [quotes, quoteCommentingService]);

  // Batch operations
  const ensureAllThreads = useCallback(() => {
    quotes.forEach(quote => {
      quoteCommentingService.ensureQuoteThread(quote);
    });
  }, [quotes, quoteCommentingService]);

  return {
    quotes,
    allQuoteComments,
    quotesWithComments,
    totalComments,
    searchAllComments,
    ensureAllThreads,
    quoteCommentingService,
    ...universalCommenting,
  };
};