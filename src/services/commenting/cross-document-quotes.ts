import type { Quote } from '../../stories/shared-data/index.js';
import { getQuotesByDocument, searchQuotes } from '../../stories/shared-data/index.js';

/**
 * Cross-document quote referencing system
 * Enables quotes to be referenced and discussed across multiple documents
 */

export interface QuoteReference {
  id: string;
  quoteId: string;
  sourceDocument: string;
  targetDocument: string;
  referenceType: 'mention' | 'citation' | 'discussion' | 'analysis';
  contextText?: string;
  position?: {
    from: number;
    to: number;
  };
  createdAt: string;
  createdBy: string;
}

export interface CrossDocumentQuoteData {
  quote: Quote;
  references: QuoteReference[];
  relatedQuotes: Quote[];
  discussionThreads: string[];
}

/**
 * Service for managing cross-document quote relationships
 */
export class CrossDocumentQuoteService {
  private references: Map<string, QuoteReference> = new Map();
  private quoteToReferences: Map<string, string[]> = new Map();
  private documentToQuotes: Map<string, string[]> = new Map();

  /**
   * Creates a reference to a quote from another document
   */
  createQuoteReference(
    quoteId: string,
    targetDocumentId: string,
    referenceType: QuoteReference['referenceType'],
    userId: string,
    options: {
      contextText?: string;
      position?: { from: number; to: number };
    } = {}
  ): QuoteReference {
    const quote = this.getQuoteById(quoteId);
    if (!quote) {
      throw new Error(`Quote not found: ${quoteId}`);
    }

    const reference: QuoteReference = {
      id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quoteId,
      sourceDocument: quote.metadata.sourceDocument,
      targetDocument: targetDocumentId,
      referenceType,
      contextText: options.contextText,
      position: options.position,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    // Store reference
    this.references.set(reference.id, reference);

    // Update indexes
    this.updateQuoteReferenceIndex(quoteId, reference.id);
    this.updateDocumentQuoteIndex(targetDocumentId, quoteId);

    console.log('Created cross-document quote reference:', reference);
    return reference;
  }

  /**
   * Gets all references for a specific quote
   */
  getQuoteReferences(quoteId: string): QuoteReference[] {
    const referenceIds = this.quoteToReferences.get(quoteId) || [];
    return referenceIds
      .map(id => this.references.get(id))
      .filter((ref): ref is QuoteReference => ref !== undefined);
  }

  /**
   * Gets all quotes referenced in a specific document
   */
  getDocumentQuoteReferences(documentId: string): CrossDocumentQuoteData[] {
    const quoteIds = this.documentToQuotes.get(documentId) || [];
    
    return quoteIds.map(quoteId => {
      const quote = this.getQuoteById(quoteId);
      if (!quote) return null;

      const references = this.getQuoteReferences(quoteId);
      const relatedQuotes = this.findRelatedQuotes(quote);
      const discussionThreads = this.getQuoteDiscussionThreads(quoteId);

      return {
        quote,
        references,
        relatedQuotes,
        discussionThreads,
      };
    }).filter((data): data is CrossDocumentQuoteData => data !== null);
  }

  /**
   * Finds quotes that are semantically related
   */
  findRelatedQuotes(quote: Quote, maxResults: number = 5): Quote[] {
    // Simple implementation based on text similarity
    // In a real system, this would use more sophisticated NLP
    const searchTerms = quote.metadata.selectedText.split(' ').slice(0, 3);
    const relatedQuotes: Quote[] = [];

    searchTerms.forEach(term => {
      if (term.length > 3) {
        const matches = searchQuotes(term).filter(q => q.id !== quote.id);
        relatedQuotes.push(...matches);
      }
    });

    // Remove duplicates and limit results
    const uniqueQuotes = Array.from(new Set(relatedQuotes.map(q => q.id)))
      .map(id => relatedQuotes.find(q => q.id === id))
      .filter((q): q is Quote => q !== undefined)
      .slice(0, maxResults);

    return uniqueQuotes;
  }

  /**
   * Gets discussion thread IDs associated with a quote
   */
  getQuoteDiscussionThreads(quoteId: string): string[] {
    // This would integrate with the universal commenting system
    // For now, return placeholder thread IDs
    return [`thread-quote-${quoteId}`];
  }

  /**
   * Creates a citation reference with proper formatting
   */
  createCitation(
    quoteId: string,
    targetDocumentId: string,
    userId: string,
    citationStyle: 'apa' | 'mla' | 'chicago' = 'apa'
  ): QuoteReference {
    const quote = this.getQuoteById(quoteId);
    if (!quote) {
      throw new Error(`Quote not found: ${quoteId}`);
    }

    const contextText = this.formatCitation(quote, citationStyle);

    return this.createQuoteReference(
      quoteId,
      targetDocumentId,
      'citation',
      userId,
      { contextText }
    );
  }

  /**
   * Formats a quote as a citation
   */
  private formatCitation(quote: Quote, style: 'apa' | 'mla' | 'chicago'): string {
    const author = quote.metadata.createdBy; // Would lookup actual author name
    const date = new Date(quote.metadata.createdAt);
    const text = quote.content.plainText;
    
    switch (style) {
      case 'apa':
        return `"${text}" (${author}, ${date.getFullYear()})`;
      case 'mla':
        return `"${text}" (${author})`;
      case 'chicago':
        return `"${text}" (${author}, ${date.getFullYear()})`;
      default:
        return `"${text}" - ${author}`;
    }
  }

  /**
   * Analyzes quote usage patterns across documents
   */
  analyzeQuoteUsage(quoteId: string): {
    totalReferences: number;
    documentSpread: number;
    referenceTypes: Record<string, number>;
    popularityScore: number;
  } {
    const references = this.getQuoteReferences(quoteId);
    const documents = new Set(references.map(ref => ref.targetDocument));
    
    const referenceTypes: Record<string, number> = {};
    references.forEach(ref => {
      referenceTypes[ref.referenceType] = (referenceTypes[ref.referenceType] || 0) + 1;
    });

    const popularityScore = references.length * 10 + documents.size * 5;

    return {
      totalReferences: references.length,
      documentSpread: documents.size,
      referenceTypes,
      popularityScore,
    };
  }

  /**
   * Gets trending quotes based on cross-document usage
   */
  getTrendingQuotes(limit: number = 10): Quote[] {
    const quoteUsage = Array.from(this.quoteToReferences.keys())
      .map(quoteId => ({
        quoteId,
        usage: this.analyzeQuoteUsage(quoteId)
      }))
      .sort((a, b) => b.usage.popularityScore - a.usage.popularityScore)
      .slice(0, limit);

    return quoteUsage
      .map(item => this.getQuoteById(item.quoteId))
      .filter((quote): quote is Quote => quote !== undefined);
  }

  /**
   * Removes a quote reference
   */
  removeQuoteReference(referenceId: string): boolean {
    const reference = this.references.get(referenceId);
    if (!reference) return false;

    // Remove from main storage
    this.references.delete(referenceId);

    // Update indexes
    const quoteRefs = this.quoteToReferences.get(reference.quoteId) || [];
    this.quoteToReferences.set(
      reference.quoteId,
      quoteRefs.filter(id => id !== referenceId)
    );

    console.log('Removed cross-document quote reference:', referenceId);
    return true;
  }

  /**
   * Helper methods
   */
  private updateQuoteReferenceIndex(quoteId: string, referenceId: string): void {
    const existing = this.quoteToReferences.get(quoteId) || [];
    this.quoteToReferences.set(quoteId, [...existing, referenceId]);
  }

  private updateDocumentQuoteIndex(documentId: string, quoteId: string): void {
    const existing = this.documentToQuotes.get(documentId) || [];
    if (!existing.includes(quoteId)) {
      this.documentToQuotes.set(documentId, [...existing, quoteId]);
    }
  }

  private getQuoteById(quoteId: string): Quote | undefined {
    // This would use the quote service to get the quote
    // For now, we'll use the shared-data function
    return searchQuotes(quoteId).find(q => q.id === quoteId);
  }

  /**
   * Export data for persistence
   */
  exportData(): {
    references: QuoteReference[];
    metadata: {
      exportedAt: string;
      totalReferences: number;
      totalQuotes: number;
    };
  } {
    return {
      references: Array.from(this.references.values()),
      metadata: {
        exportedAt: new Date().toISOString(),
        totalReferences: this.references.size,
        totalQuotes: this.quoteToReferences.size,
      }
    };
  }

  /**
   * Import data from persistence
   */
  importData(data: { references: QuoteReference[] }): void {
    this.references.clear();
    this.quoteToReferences.clear();
    this.documentToQuotes.clear();

    data.references.forEach(reference => {
      this.references.set(reference.id, reference);
      this.updateQuoteReferenceIndex(reference.quoteId, reference.id);
      this.updateDocumentQuoteIndex(reference.targetDocument, reference.quoteId);
    });

    console.log(`Imported ${data.references.length} cross-document quote references`);
  }
}

/**
 * Global cross-document quote service instance
 */
export const crossDocumentQuoteService = new CrossDocumentQuoteService();