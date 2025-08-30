import React from 'react';
import type { ItemViewProps, ItemObject } from './types';
import { useContentAdapter } from './ContentAdapterRegistry';
import { DefaultFallbackRenderer } from './DefaultFallbackRenderer';

/**
 * ItemView - Unified item view component
 * Single component that handles all view scopes with adapter-based rendering
 */
export const ItemView = <T extends string = string>({
  item,
  contentType,
  scope,
  mode = 'preview',
  onEscalate,
  onInteraction,
}: ItemViewProps<T>) => {
  const adapter = useContentAdapter(contentType);

  if (!adapter) {
    return (
      <DefaultFallbackRenderer
        item={item}
        contentType={contentType}
        scope={scope}
        mode={mode}
        onEscalate={onEscalate}
        onInteraction={onInteraction}
      />
    );
  }

  return (
    <div data-content-type={contentType} data-scope={scope}>
      {adapter.render({
        item,
        contentType,
        scope,
        mode,
        onEscalate,
        onInteraction,
      })}
    </div>
  );
};