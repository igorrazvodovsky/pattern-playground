import React from 'react';
import type { ItemViewProps, BaseItem } from './types';
import { useContentAdapter } from './ContentAdapterRegistry';

/**
 * ItemFullView - Maxi scope item view
 * Used for full pages, dedicated workspaces, comprehensive views
 */
export const ItemFullView = <T extends BaseItem = BaseItem>({
  item,
  contentType,
  mode = 'inspect',
  onEscalate,
  onInteraction,
}: ItemViewProps<T>) => {
  const adapter = useContentAdapter(contentType);

  if (!adapter) {
    return (
      <div className="layer flow" data-content-type={contentType}>
        <header className="inline-flow">

          {onInteraction && (
            <div className="inline-flow">
              <button
                className="button"
                onClick={() => onInteraction('edit', item)}
                type="button"
              >
                Edit
              </button>
              <button
                className="button button--secondary"
                onClick={() => onInteraction('transform', item)}
                type="button"
              >
                Transform
              </button>
            </div>
          )}
        </header>

        <main className="flow">
          <section className="flow">
            <h2>Overview</h2>
            <p>
              This is a {item.type} item with ID {item.id}.
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div data-content-type={contentType}>
      {adapter.render({
        item,
        contentType,
        scope: 'maxi',
        mode,
        onEscalate,
        onInteraction,
      })}
    </div>
  );
};