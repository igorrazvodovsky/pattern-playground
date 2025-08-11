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
          <div className="flow-2xs">
            <h2>{item.label}</h2>
            <small className="text-secondary">{item.type}</small>
          </div>
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
          
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <div className="flow-xs">
              <h3>Properties</h3>
              <dl className="flow-2xs">
                {Object.entries(item.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-bold">{key}</dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
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