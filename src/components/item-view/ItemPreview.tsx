import React from 'react';
import type { ItemViewProps, BaseItem } from './types';
import { useContentAdapter } from './ContentAdapterRegistry';

/**
 * ItemPreview - Mini scope item view
 * Used for hover cards, tooltips, compact previews
 */
export const ItemPreview = <T extends BaseItem = BaseItem>({
  item,
  contentType,
  mode = 'preview',
  onEscalate,
  onInteraction,
}: ItemViewProps<T>) => {
  const adapter = useContentAdapter(contentType);

  if (!adapter) {
    return (
      <div className="flow" data-content-type={contentType}>
        <header>
          <h4>{item.label}</h4>
          <small className="text-secondary">{item.type}</small>
        </header>
        {item.metadata && Object.keys(item.metadata).length > 0 && (
          <dl className="flow-2xs">
            {Object.entries(item.metadata).slice(0, 3).map(([key, value]) => (
              <div key={key}>
                <dt className="text-bold">{key}:</dt>
                <dd>{String(value)}</dd>
              </div>
            ))}
          </dl>
        )}
        {onEscalate && (
          <footer>
            <button
              className="button button--small"
              onClick={() => onEscalate('mid')}
              type="button"
            >
              View details
            </button>
          </footer>
        )}
      </div>
    );
  }

  return (
    <div data-content-type={contentType}>
      {adapter.render({
        item,
        contentType,
        scope: 'mini',
        mode,
        onEscalate,
        onInteraction,
      })}
    </div>
  );
};