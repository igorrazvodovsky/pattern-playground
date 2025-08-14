import type { RichContent, Quote } from '../../stories/data/index.js';
import { UniversalCommentingService } from './universal-commenting-service.js';
import type { DocumentPointer, UniversalComment, CommentThread } from './document-pointer.js';

/**
 * Quote-specific pointer type for universal commenting system
 */
interface QuotePointer extends DocumentPointer {
  type: 'quote-object';
  quoteId: string;
  entityType: 'quote';
  entityId: string;
}

/**
 * Enhanced comment interface for quote comments with rich content
 */
interface QuoteComment extends Omit<UniversalComment, 'content'> {
  content: RichContent;
  entityType: 'quote';
  entityId: string;
}

/**
 * Service for managing comments on quote objects
 * Integrates with the universal commenting system
 */
export class QuoteCommentingService {
  private universalService: UniversalCommentingService;

  constructor(universalService: UniversalCommentingService) {
    this.universalService = universalService;
  }

  /**
   * Creates a comment thread for a quote object
   */
  createQuoteThread(quote: Quote): CommentThread {
    const pointer: QuotePointer = {
      type: 'quote-object',
      quoteId: quote.id,
      entityType: 'quote',
      entityId: quote.id,
      // Add source document context for relationship tracking
      documentId: quote.metadata.sourceDocument,
      metadata: {
        sourceDocument: quote.metadata.sourceDocument,
        sourceRange: quote.metadata.sourceRange,
        quoteText: quote.metadata.selectedText
      }
    };

    return this.universalService.createThread(pointer);
  }

  /**
   * Adds a rich text comment to a quote object
   */
  async addQuoteComment(
    quoteId: string,
    content: RichContent,
    authorId: string
  ): Promise<QuoteComment> {
    try {
      // Find existing thread for this quote or create one
      const thread = this.getQuoteThread(quoteId);

      if (!thread) {
        // We need the quote object to create a thread
        // In a real implementation, this would fetch from quote service
        throw new Error(`No thread found for quote ${quoteId}. Create thread first.`);
      }

      // Add comment using universal service
      // Note: We'll need to extend the universal service to support rich content
      const plainTextContent = content.plainText || 'Rich content comment';
      const comment = this.universalService.addComment(
        thread.id,
        plainTextContent,
        authorId
      );

      // Create enhanced quote comment with rich content
      const quoteComment: QuoteComment = {
        ...comment,
        content,
        entityType: 'quote',
        entityId: quoteId
      };

      console.log('Created quote comment:', quoteComment);
      return quoteComment;

    } catch (error) {
      console.error('Failed to add quote comment:', error);
      throw error;
    }
  }

  /**
   * Gets the comment thread for a specific quote
   */
  getQuoteThread(quoteId: string): CommentThread | undefined {
    const allThreads = this.universalService.getAllThreads();

    return allThreads.find(thread =>
      thread.pointers.some(pointer =>
        pointer.type === 'quote-object' &&
        (pointer as QuotePointer).quoteId === quoteId
      )
    );
  }

  /**
   * Gets all comments for a quote object
   */
  getQuoteComments(quoteId: string): UniversalComment[] {
    const thread = this.getQuoteThread(quoteId);
    if (!thread) return [];

    return this.universalService.getCommentsForThread(thread.id);
  }

  /**
   * Gets comments for multiple quotes (batch operation)
   */
  getCommentsForQuotes(quoteIds: string[]): Map<string, UniversalComment[]> {
    const result = new Map<string, UniversalComment[]>();

    quoteIds.forEach(quoteId => {
      const comments = this.getQuoteComments(quoteId);
      result.set(quoteId, comments);
    });

    return result;
  }

  /**
   * Resolves a quote comment thread
   */
  resolveQuoteThread(quoteId: string, resolvedBy: string): boolean {
    const thread = this.getQuoteThread(quoteId);
    if (!thread) return false;

    this.universalService.resolveThread(thread.id, resolvedBy);
    return true;
  }

  /**
   * Creates a comment thread for a quote if it doesn't exist
   */
  ensureQuoteThread(quote: Quote): CommentThread {
    let thread = this.getQuoteThread(quote.id);

    if (!thread) {
      thread = this.createQuoteThread(quote);
      console.log(`Created comment thread for quote: ${quote.id}`);
    }

    return thread;
  }

  /**
   * Gets comment statistics for a quote
   */
  getQuoteCommentStats(quoteId: string): {
    totalComments: number;
    activeComments: number;
    resolvedComments: number;
    lastActivity: string | null;
  } {
    const comments = this.getQuoteComments(quoteId);
    const thread = this.getQuoteThread(quoteId);

    const activeComments = comments.filter(c => c.status === 'active').length;
    const resolvedComments = comments.filter(c => c.status === 'resolved').length;

    // Find most recent comment timestamp
    const lastActivity = comments.length > 0
      ? comments.reduce((latest, comment) => {
        return comment.timestamp > latest ? comment.timestamp : latest;
      }, comments[0].timestamp)
      : null;

    return {
      totalComments: comments.length,
      activeComments,
      resolvedComments,
      lastActivity
    };
  }

  /**
   * Searches quote comments by content
   */
  searchQuoteComments(searchTerm: string, quoteIds?: string[]): UniversalComment[] {
    const allThreads = this.universalService.getAllThreads();
    const quoteThreads = allThreads.filter(thread =>
      thread.pointers.some(pointer => {
        if (pointer.type !== 'quote-object') return false;

        const quotePointer = pointer as QuotePointer;
        return !quoteIds || quoteIds.includes(quotePointer.quoteId);
      })
    );

    const matchingComments: UniversalComment[] = [];

    quoteThreads.forEach(thread => {
      const comments = this.universalService.getCommentsForThread(thread.id);
      const filteredComments = comments.filter(comment =>
        comment.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      matchingComments.push(...filteredComments);
    });

    return matchingComments;
  }
}

/**
 * Factory function to create quote commenting service
 */
export const createQuoteCommentingService = (
  universalService: UniversalCommentingService
): QuoteCommentingService => {
  return new QuoteCommentingService(universalService);
};