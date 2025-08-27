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
}: ItemViewProps<T>) => {
  const renderMetadata = () => {
    if (!item.metadata || Object.keys(item.metadata).length === 0) {
      return null;
    }

    // Filter out description from metadata display (it's shown separately)
    const entries = Object.entries(item.metadata).filter(([key]) => key !== 'description');
    if (entries.length === 0) return null;

    const maxEntries = scope === 'mini' ? 3 : entries.length;
    const displayEntries = entries.slice(0, maxEntries);

    return (
      <dl>
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

  // Extract description from metadata if it exists
  const description = item.metadata?.description as string | undefined;

  // Special handling for quote content
  const renderQuoteContent = () => {
    if (contentType !== 'quote' || !item.metadata?.content) return null;

    const content = item.metadata.content as any;
    const plainText = content.plainText;

    return (
      <section className="quote-content flow">
        <blockquote className="quote-text">
          "{plainText}"
        </blockquote>
      </section>
    );
  };

  return (
    <div className="flow" data-content-type={contentType} data-scope={scope}>
      {/* Header with title and description */}
      <header>
        {description && <p className="text-secondary">{description}</p>}
      </header>

      {/* Render quote content prominently */}
      {renderQuoteContent()}

      {scope === 'maxi' && (
        <main className="flow">
          {!renderQuoteContent() && !description && (
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
              currentUser={getUserById('user-1')!}
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

      {/* Placeholder actions for generic items in drawer view */}
      {scope === 'mid' && (
        <pp-list className='borderless'>
          <pp-list-item>
            <iconify-icon className="icon" slot="prefix" icon="ph:pencil"></iconify-icon>
            Edit
          </pp-list-item>
          <pp-list-item type="checkbox" checked>
            <iconify-icon className="icon" slot="prefix" icon="ph:circle-dashed"></iconify-icon>
            Selected
          </pp-list-item>
          <pp-list-item>
            <iconify-icon className="icon" slot="prefix" icon="ph:copy"></iconify-icon>
            Duplicate
          </pp-list-item>
          <pp-list-item>
            <iconify-icon className="icon" slot="prefix" icon="ph:export"></iconify-icon>
            Export
          </pp-list-item>
          <pp-list-item>
            <iconify-icon className="icon" slot="prefix" icon="ph:trash"></iconify-icon>
            Delete
          </pp-list-item>
        </pp-list>
      )}

      {scope !== 'maxi' && !renderQuoteContent()}
      {renderEscalationButton()}
    </div>
  );
};