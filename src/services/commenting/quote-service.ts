import { Editor } from '@tiptap/core';
import { quotes, getQuoteById, getQuotesByDocument, type Quote } from '../../stories/data/index.js';

/**
 * Rich content structure matching TipTap JSON format
 */
export interface RichContent {
  plainText: string;
  richContent: {
    type: 'doc';
    content: Array<{
      type: string;
      content?: Array<{
        type: string;
        text?: string;
        marks?: Array<{ type: string;[key: string]: any }>;
      }>;
    }>;
  };
}

/**
 * Quote object metadata structure
 */
export interface QuoteMetadata {
  sourceDocument: string;
  sourceRange: { from: number; to: number };
  createdAt: string;
  createdBy: string;
  selectedText: string;
}

/**
 * Complete quote object structure
 */
export interface QuoteObject {
  id: string;
  name: string;
  type: 'quote';
  icon: 'ph:quotes';
  description: string;
  searchableText: string;
  metadata: QuoteMetadata;
  content: RichContent;
}

/**
 * Service for managing quote object lifecycle
 */
export class QuoteService {
  private quotes: Map<string, QuoteObject>;

  constructor() {
    // Initialize with existing quote data
    this.quotes = new Map(quotes.map(quote => [quote.id, quote as QuoteObject]));
  }

  /**
   * Create a quote object from TipTap editor selection
   */
  createFromTipTapSelection(
    editor: Editor,
    userId: string,
    documentId: string
  ): QuoteObject {
    const { from, to } = editor.state.selection;

    if (from === to) {
      throw new Error('Cannot create quote from empty selection');
    }

    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    const richContent = this.extractRichContent(editor, from, to);

    const quote: QuoteObject = {
      id: `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: this.generateName(selectedText),
      type: 'quote',
      icon: 'ph:quotes',
      description: `Quote from ${this.getDocumentName(documentId) || 'document'}`,
      searchableText: this.generateSearchableText(selectedText, documentId),
      metadata: {
        sourceDocument: documentId,
        sourceRange: { from, to },
        createdAt: new Date().toISOString(),
        createdBy: userId,
        selectedText
      },
      content: {
        plainText: selectedText,
        richContent
      }
    };

    // Add to internal collection
    this.quotes.set(quote.id, quote);

    return quote;
  }

  /**
   * Extract rich content from TipTap selection
   */
  private extractRichContent(editor: Editor, from: number, to: number): RichContent['richContent'] {
    const slice = editor.state.doc.slice(from, to);
    const content = slice.toJSON();

    return {
      type: 'doc',
      content: content.content || []
    };
  }

  /**
   * Generate a display name for the quote (first 100 chars)
   */
  private generateName(selectedText: string): string {
    const trimmed = selectedText.trim();
    return trimmed.length > 100 ? `${trimmed.substring(0, 100)}...` : trimmed;
  }

  /**
   * Generate searchable text for the quote
   */
  private generateSearchableText(selectedText: string, documentId: string): string {
    const docName = this.getDocumentName(documentId);
    const baseText = selectedText.toLowerCase();
    const contextText = docName ? ` ${docName.toLowerCase()}` : '';
    return `${baseText} quote excerpt selection${contextText}`;
  }

  /**
   * Get document name for context
   */
  private getDocumentName(documentId: string): string | null {
    // This would typically come from shared data
    // For now, return a simple mapping
    const docNames: Record<string, string> = {
      'doc-climate-change': 'Climate Change Impact Report',
      'doc-1': 'Material Flow Analysis Report',
      'doc-2': 'Life Cycle Assessment (LCA)',
      'doc-3': 'Circular Business Model Canvas',
      'doc-5': 'Waste Reduction Guidelines',
      'doc-6': 'Eco-Design Principles',
      'doc-8': 'Consumer Behavior Study'
    };
    return docNames[documentId] || null;
  }

  /**
   * Validate that quote's source still exists and is valid
   */
  validateSourceIntegrity(quote: QuoteObject): boolean {
    // Check if source document still exists
    if (!this.getDocumentName(quote.metadata.sourceDocument)) {
      return false;
    }

    // Check if range is still valid (basic check)
    const { from, to } = quote.metadata.sourceRange;
    return from >= 0 && to > from;
  }

  /**
   * Get quote by ID
   */
  getQuoteById(id: string): QuoteObject | undefined {
    return this.quotes.get(id) || getQuoteById(id) as QuoteObject;
  }

  /**
   * Get all quotes for a document
   */
  getQuotesByDocument(documentId: string): QuoteObject[] {
    const localQuotes = Array.from(this.quotes.values()).filter(
      quote => quote.metadata.sourceDocument === documentId
    );
    const sharedQuotes = getQuotesByDocument(documentId) as QuoteObject[];

    // Merge and deduplicate
    const allQuotes = new Map<string, QuoteObject>();
    [...sharedQuotes, ...localQuotes].forEach(quote => {
      allQuotes.set(quote.id, quote);
    });

    return Array.from(allQuotes.values());
  }

  /**
   * Get all quotes by a user
   */
  getQuotesByUser(userId: string): QuoteObject[] {
    return Array.from(this.quotes.values()).filter(
      quote => quote.metadata.createdBy === userId
    );
  }

  /**
   * Update quote content (for editing scenarios)
   */
  updateQuote(id: string, updates: Partial<Pick<QuoteObject, 'name' | 'description' | 'searchableText'>>): boolean {
    const quote = this.quotes.get(id);
    if (!quote) return false;

    Object.assign(quote, updates);
    return true;
  }

  /**
   * Delete a quote
   */
  deleteQuote(id: string): boolean {
    return this.quotes.delete(id);
  }

  /**
   * Get all quotes in the service
   */
  getAllQuotes(): QuoteObject[] {
    return Array.from(this.quotes.values());
  }

  /**
   * Search quotes by text content
   */
  searchQuotes(searchText: string): QuoteObject[] {
    const lowerSearch = searchText.toLowerCase();
    return Array.from(this.quotes.values()).filter(quote =>
      quote.searchableText.includes(lowerSearch) ||
      quote.content.plainText.toLowerCase().includes(lowerSearch) ||
      quote.description.toLowerCase().includes(lowerSearch)
    );
  }

  /**
   * Clean up orphaned quotes (quotes whose source documents no longer exist)
   */
  cleanupOrphanedQuotes(): string[] {
    const orphanedIds: string[] = [];

    for (const [id, quote] of this.quotes.entries()) {
      if (!this.validateSourceIntegrity(quote)) {
        this.quotes.delete(id);
        orphanedIds.push(id);
      }
    }

    return orphanedIds;
  }

  /**
   * Export quotes for persistence (if needed)
   */
  exportQuotes(): QuoteObject[] {
    return this.getAllQuotes();
  }

  /**
   * Import quotes from external source
   */
  importQuotes(quotesToImport: QuoteObject[]): void {
    quotesToImport.forEach(quote => {
      this.quotes.set(quote.id, quote);
    });
  }
}

// Singleton instance for global use
let quoteServiceInstance: QuoteService | null = null;

/**
 * Get or create the global quote service instance
 */
export function getQuoteService(): QuoteService {
  if (!quoteServiceInstance) {
    quoteServiceInstance = new QuoteService();
  }
  return quoteServiceInstance;
}

/**
 * Create a new quote service instance (for testing or isolated use)
 */
export function createQuoteService(): QuoteService {
  return new QuoteService();
}