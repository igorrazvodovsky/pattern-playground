import React from 'react';
import type { ItemViewProps, BaseItem } from './types';

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

  return (
    <div className="flow" data-content-type={contentType} data-scope={scope}>
      <header className={scope === 'maxi' ? 'inline-flow' : undefined}>
        <div className="flow-2xs">
          <HeaderTag>{item.label}</HeaderTag>
          <small className="text-secondary">
            {item.type}
            {scope === 'maxi' && ` #${item.id}`}
          </small>
        </div>
      </header>
      
      {scope === 'maxi' && (
        <main className="flow">
          <section className="flow">
            <h2>Overview</h2>
            <p>This is a {item.type} item with ID {item.id}.</p>
          </section>
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <section className="flow">
              <h2>Properties</h2>
              {renderMetadata()}
            </section>
          )}
        </main>
      )}
      
      {scope !== 'maxi' && renderMetadata()}
      {renderEscalationButton()}
    </div>
  );
};