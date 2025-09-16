import React from 'react';
import type { ItemViewProps, ContentAdapter, BaseItem } from '../types';
import type { QuoteObject } from '../../../services/commenting/core/quote-pointer';
import { CommentThread } from '../../commenting/core/CommentThread';
import { getUserById } from '../../../stories/data';

// Extend QuoteObject to match BaseItem interface
interface QuoteItem extends BaseItem {
  content: QuoteObject['content'];
  metadata: QuoteObject['metadata'];
}

// Helper to convert QuoteObject to QuoteItem
const quoteToBaseItem = (quote: QuoteObject): QuoteItem => {
  if (!quote) {
    throw new Error('Quote object is undefined');
  }
  if (!quote.content) {
    throw new Error(`Quote ${quote.id} is missing content property`);
  }
  if (!quote.content.plainText) {
    throw new Error(`Quote ${quote.id} content is missing plainText property`);
  }

  return {
    id: quote.id,
    label: quote.content.plainText,
    type: 'quote',
    content: quote.content,
    metadata: quote.metadata,
  };
};

const QuotePreview: React.FC<ItemViewProps<QuoteItem>> = ({ item: quote }) => {
  const { content, metadata } = quote;

  return (
    <div className="quote-preview">
      <div className="quote-preview__content">
        <blockquote className="quote-preview__text">
          {content.plainText}
        </blockquote>
        <small className="quote-preview__source dimmed">
          From {metadata.sourceDocument}
        </small>
      </div>
    </div>
  );
};

const QuoteDetail: React.FC<ItemViewProps<QuoteItem>> = ({ item: quote }) => {
  const { metadata } = quote;
  const author = metadata.authorId ? getUserById(metadata.authorId) : null;
  const currentUser = getUserById('user-1'); // TODO: Get from context/auth

  console.log('QuoteDetail rendering for quote:', quote.id);
  console.log('QuoteDetail - currentUser:', currentUser);

  if (!currentUser) {
    return <div>Unable to load user context</div>;
  }

  return (
    <div className="quote-detail">
      <div className="quote-detail__content">
        <div className="quote-detail__metadata">
          <small className="quote-detail__source dimmed">
            From {metadata.sourceDocument}
          </small>
          {author && (
            <small className="quote-detail__author dimmed">
              Created by {author.name}
            </small>
          )}
          {metadata.createdAt && (
            <small className="quote-detail__date dimmed">
              {new Date(metadata.createdAt).toLocaleDateString()}
            </small>
          )}
        </div>
      </div>

      <section className="quote-detail__comments-section">
        <CommentThread
          entityType="quote"
          entityId={quote.id}
          currentUser={currentUser}
          className="quote-comments"
          showHeader={false}
          allowNewComments={true}
          maxHeight="300px"
        />
      </section>
    </div>
  );
};

const QuoteFullView: React.FC<ItemViewProps<QuoteItem>> = ({ item: quote }) => {
  const { content, metadata } = quote;
  const author = metadata.authorId ? getUserById(metadata.authorId) : null;
  const currentUser = getUserById('user-1'); // TODO: Get from context/auth

  if (!currentUser) {
    return <div>Unable to load user context</div>;
  }

  return (
    <div className="quote-full-view">
      <header className="quote-full-view__header">
        <div className="quote-full-view__title-section">
          <h1 className="quote-full-view__title">Quote</h1>
          <div className="quote-full-view__subtitle">
            <span className="quote-full-view__id">#{quote.id}</span>
            <span className="quote-full-view__source">From {metadata.sourceDocument}</span>
          </div>
        </div>
      </header>

      <main className="quote-full-view__content">
        <section className="quote-full-view__quote-section">
          <blockquote className="quote-full-view__text">
            {content.plainText}
          </blockquote>

          {(author || metadata.createdAt) && (
            <div className="quote-full-view__metadata">
              {author && (
                <div className="quote-full-view__metadata-item">
                  <strong>Created by:</strong> {author.name}
                </div>
              )}
              {metadata.createdAt && (
                <div className="quote-full-view__metadata-item">
                  <strong>Created:</strong> {new Date(metadata.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </section>

        <section className="quote-full-view__comments-section">
          <CommentThread
            entityType="quote"
            entityId={quote.id}
            currentUser={currentUser}
            className="quote-comments"
            showHeader={false}
            allowNewComments={true}
            maxHeight="400px"
          />
        </section>
      </main>
    </div>
  );
};

export const quoteAdapter: ContentAdapter<QuoteItem> = {
  contentType: 'quote',
  supportedScopes: ['mini', 'mid', 'maxi'],
  supportsCommenting: true,

  render: ({ item, scope, ...props }) => {
    switch (scope) {
      case 'mini':
        return <QuotePreview item={item} {...props} />;
      case 'mid':
        return <QuoteDetail item={item} {...props} />;
      case 'maxi':
        return <QuoteFullView item={item} {...props} />;
      default:
        return <QuotePreview item={item} {...props} />;
    }
  }
};

export { quoteToBaseItem };