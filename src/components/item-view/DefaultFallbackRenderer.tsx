import React from 'react';
import type { ItemViewProps, BaseItem } from './types';
import { UniversalCommentInterface } from '../commenting/universal/UniversalCommentInterface.js';
import { getUserById } from '../../stories/data/index.js';

/**
 * DefaultFallbackRenderer - Unified fallback rendering for items without adapters
 * Replaces the duplicated fallback logic from ItemPreview, ItemDetail, ItemFullView
 */
export const DefaultFallbackRenderer = <T extends BaseItem = BaseItem>({
  item,
  scope,
  contentType,
  onEscalate,
  onInteraction,
}: ItemViewProps<T>) => {
  const renderMetadata = () => {
    if (!item.metadata || Object.keys(item.metadata).length === 0) {
      return null;
    }

    const entries = Object.entries(item.metadata);
    const maxEntries = scope === 'mini' ? 3 : entries.length;
    const displayEntries = entries.slice(0, maxEntries);

    return (
      <dl className="flow-2xs">
        {displayEntries.map(([key, value]) => (
          <div key={key}>
            <dt className="text-bold">{key}:</dt>
            <dd>{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</dd>
          </div>
        ))}
      </dl>
    );
  };

  const renderEscalationButton = () => {
    if (!onEscalate || scope === 'maxi') {
      return null;
    }

    const nextScope = scope === 'mini' ? 'mid' : 'maxi';
    const buttonText = nextScope === 'mid' ? 'View details' : 'Full view';

    return (
      <footer>
        <button
          className="button button--small"
          onClick={() => onEscalate(nextScope)}
          type="button"
        >
          {buttonText}
        </button>
      </footer>
    );
  };

  const getHeaderLevel = () => {
    switch (scope) {
      case 'maxi': return 'h1';
      case 'mid': return 'h2';
      case 'mini': return 'h4';
      default: return 'h3';
    }
  };

  const HeaderTag = getHeaderLevel() as keyof JSX.IntrinsicElements;

  // Special handling for quote content
  const renderQuoteContent = () => {
    if (contentType !== 'quote' || !item.metadata?.content) return null;

    const content = item.metadata.content as any;
    const plainText = content.plainText;
    const description = item.metadata.description;

    return (
      <section className="quote-content flow">
        {description && <p className="text-secondary">{description}</p>}
        <blockquote className="quote-text">
          "{plainText}"
        </blockquote>
      </section>
    );
  };

  return (
    <div className="flow" data-content-type={contentType} data-scope={scope}>

      {/* Render quote content prominently */}
      {renderQuoteContent()}

      {scope === 'maxi' && (
        <main className="flow">
          {!renderQuoteContent() && (
            <section className="flow">
              <h2>Overview</h2>
              <p>This is a {item.type} item with ID {item.id}.</p>
            </section>
          )}

          {/* Universal commenting interface for quote objects */}
          {contentType === 'quote' && (
            <UniversalCommentInterface
              entityType="quote"
              entityId={item.id}
              currentUser={getUserById('user-1') || { id: 'user-1', name: 'Unknown User' }}
              showHeader={true}
              allowNewComments={true}
            />
          )}

          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <section className="flow">
              {renderMetadata()}
            </section>
          )}
        </main>
      )}

      {scope !== 'maxi' && !renderQuoteContent()}
      {renderEscalationButton()}
    </div>
  );
};