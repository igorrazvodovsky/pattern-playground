import type { ItemViewProps, BaseItem } from './types';
import { useContentAdapter } from './ContentAdapterRegistry';

/**
 * ItemDetail - Mid scope item view
 * Used for dialogs, drawers, side panels, expandable cards
 */
export const ItemDetail = <T extends BaseItem = BaseItem>({
  item,
  contentType,
  mode = 'inspect',
  onEscalate,
  onInteraction,
}: ItemViewProps<T>) => {
  const adapter = useContentAdapter(contentType);

  if (!adapter) {
    return (
      <div className="flow" data-content-type={contentType}>
        <header className="inline-flow">
          <div className="inline-flow">
            {onEscalate && (
              <button
                className="button button--small button--plain"
                onClick={() => onEscalate('maxi')}
                type="button"
                title="Open full view"
              >
                <iconify-icon className="icon" icon="ph:arrow-square-out"></iconify-icon>
                <span className="inclusively-hidden">Open full view</span>
              </button>
            )}
            {onInteraction && (
              <button
                className="button button--small button--plain"
                onClick={() => onInteraction('edit', item)}
                type="button"
                title="Edit item"
              >
                <iconify-icon className="icon" icon="ph:pencil"></iconify-icon>
                <span className="inclusively-hidden">Edit item</span>
              </button>
            )}
          </div>
        </header>

        <div className="flow">
          <div>
            <strong>ID:</strong> {item.id}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-content-type={contentType}>
      {adapter.render({
        item,
        contentType,
        scope: 'mid',
        mode,
        onEscalate,
        onInteraction,
      })}
    </div>
  );
};