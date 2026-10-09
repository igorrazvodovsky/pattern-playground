import { BaseCommentPointer, type PointerContext } from './comment-pointer';
import type { QuoteObject } from '../quote-service';

export type { QuoteObject };

export class QuotePointer extends BaseCommentPointer {
  readonly type = 'quote';
  
  constructor(
    readonly id: string,
    private quote: QuoteObject
  ) {
    super();
  }
  
  serialize(): string {
    return JSON.stringify({ type: this.type, id: this.id });
  }
  
  async getContext(): Promise<PointerContext> {
    return {
      title: 'Quote',
      excerpt: this.quote.content.plainText,
      location: this.quote.metadata.sourceDocument,
      metadata: { ...this.quote.metadata }
    };
  }
  
  static deserialize(data: string): QuotePointer | null {
    try {
      const parsed = JSON.parse(data);
      if (parsed.type !== 'quote' || !parsed.id) return null;
      
      // In production, would fetch quote from storage
      // For now, returning a placeholder
      const placeholderQuote: QuoteObject = {
        id: parsed.id,
        name: '',
        type: 'quote',
        icon: 'ph:quotes',
        description: '',
        searchableText: '',
        metadata: {
          sourceDocument: '',
          sourceRange: { from: 0, to: 0 },
          createdAt: new Date().toISOString(),
          createdBy: '',
          selectedText: ''
        },
        content: { plainText: '', richContent: { type: 'doc', content: [] } }
      };
      
      return new QuotePointer(parsed.id, placeholderQuote);
    } catch {
      return null;
    }
  }
}