import React from 'react';
import { CommentAwareAdapterBase } from '../adapters/CommentAwareAdapterBase';
import type { BaseItem, ItemViewProps } from '../types';

// TipTap editor integration placeholder - to be implemented with actual TipTap components
const TipTapRenderer: React.FC<{ content: unknown; readonly?: boolean }> = ({ content }) => {
  // Placeholder implementation - replace with actual TipTap renderer
  if (typeof content === 'string') {
    return <div className="rich-content">{content}</div>;
  }
  
  // For now, render JSON content as formatted text
  return (
    <div className="rich-content">
      <pre>{JSON.stringify(content, null, 2)}</pre>
    </div>
  );
};

// ItemViewLink placeholder - to be implemented with actual navigation
const ItemViewLink: React.FC<{ itemId: string; children: React.ReactNode }> = ({ itemId, children }) => {
  return (
    <button
      className="button button--link"
      onClick={() => console.log('Navigate to item:', itemId)}
      type="button"
    >
      {children}
    </button>
  );
};

export interface QuoteObject extends BaseItem {
  type: 'quote';
  plainText: string;
  richContent: unknown; // TipTap JSON
  metadata: {
    sourceDocument: string;
    sourceRange: { from: number; to: number };
    createdAt: Date;
    createdBy: string;
    [key: string]: unknown; // Allow additional metadata
  };
}

export abstract class QuoteAdapterBase extends CommentAwareAdapterBase<QuoteObject> {
  contentType = 'quote';
  supportsRichContent = true;
  supportedScopes = ['mini', 'mid', 'maxi'] as const;

  protected renderQuoteContent(quote: QuoteObject, scope: 'mini' | 'mid' | 'maxi' = 'mid'): React.ReactNode {
    const shouldShowRichContent = scope !== 'mini' && quote.richContent;
    
    return (
      <blockquote className="quote-content" data-scope={scope}>
        {shouldShowRichContent ? (
          <TipTapRenderer
            content={quote.richContent}
            readonly
          />
        ) : (
          <p>{quote.plainText}</p>
        )}
      </blockquote>
    );
  }

  protected renderSourceLink(quote: QuoteObject, scope: 'mini' | 'mid' | 'maxi' = 'mid'): React.ReactNode {
    if (scope === 'mini') {
      return null; // Don't show source link in mini scope to save space
    }

    return (
      <footer className="quote-source">
        <ItemViewLink itemId={quote.metadata.sourceDocument}>
          View Source
        </ItemViewLink>
        {scope === 'maxi' && quote.metadata.sourceRange && (
          <small className="text-secondary">
            (Lines {quote.metadata.sourceRange.from}-{quote.metadata.sourceRange.to})
          </small>
        )}
      </footer>
    );
  }

  protected renderQuoteMetadata(quote: QuoteObject, scope: 'mini' | 'mid' | 'maxi' = 'mid'): React.ReactNode {
    if (scope === 'mini') {
      // Minimal metadata for mini scope
      return (
        <small className="quote-metadata text-secondary">
          by {quote.metadata.createdBy}
        </small>
      );
    }

    return (
      <div className="quote-metadata flow-2xs">
        <div className="inline-flow">
          <small className="text-secondary">
            Created by {quote.metadata.createdBy}
          </small>
          <small className="text-secondary">
            {quote.metadata.createdAt.toLocaleDateString()}
          </small>
        </div>
        {scope === 'maxi' && (
          <div className="quote-technical-metadata">
            <dl className="flow-2xs">
              <div>
                <dt className="text-bold">Source Document:</dt>
                <dd>{quote.metadata.sourceDocument}</dd>
              </div>
              {quote.metadata.sourceRange && (
                <div>
                  <dt className="text-bold">Source Range:</dt>
                  <dd>Lines {quote.metadata.sourceRange.from}-{quote.metadata.sourceRange.to}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    );
  }

  // Default implementation - can be overridden by specific quote adapters
  render(props: ItemViewProps<QuoteObject>): React.ReactNode {
    const { item, scope } = props;
    const viewScope = scope as 'mini' | 'mid' | 'maxi';

    return (
      <div className="quote-item flow" data-content-type="quote" data-scope={scope}>
        {this.renderQuoteContent(item, viewScope)}
        {this.renderQuoteMetadata(item, viewScope)}
        {this.renderSourceLink(item, viewScope)}
      </div>
    );
  }
}