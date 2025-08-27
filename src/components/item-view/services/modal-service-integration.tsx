import React from 'react';
import type { BaseItem, ViewScope } from '../types';
import { ItemView } from '../ItemView';
import { ContentAdapterProvider } from '../ContentAdapterRegistry';
import { referenceContentAdapter } from '../../reference/ReferenceContentAdapter';

export interface ModalContentConfig {
  size: 'small' | 'medium' | 'large' | 'fullscreen';
  placement?: 'center' | 'drawer-right' | 'drawer-left';
  closeOnEscape?: boolean;
}

export const createModalContent = (
  item: BaseItem,
  contentType: string,
  scope: ViewScope
): React.ReactNode => {
  // Transform Quote objects to be BaseItem compatible
  const transformedItem: BaseItem = {
    id: item.id,
    label: (item as any).name || item.id, // Quote uses 'name' instead of 'label'
    type: item.type,
    metadata: {
      ...item.metadata,
      // Include quote-specific data in metadata for generic rendering
      ...(contentType === 'quote' && {
        content: (item as any).content,
        description: (item as any).description,
        searchableText: (item as any).searchableText,
      })
    }
  };

  // Determine which adapters to use based on content type
  const adapters = contentType === 'reference' ? [referenceContentAdapter] : [];
  
  return (
    <ContentAdapterProvider adapters={adapters}>
      <ItemView
        item={transformedItem}
        contentType={contentType}
        scope={scope}
        mode="inspect"
      />
    </ContentAdapterProvider>
  );
};


export const getSizeForScope = (scope: ViewScope): ModalContentConfig['size'] => {
  switch (scope) {
    case 'mini': return 'small';
    case 'mid': return 'medium';
    case 'maxi': return 'large';
    default: return 'medium';
  }
};

export const getPlacementForScope = (scope: ViewScope): ModalContentConfig['placement'] => {
  switch (scope) {
    case 'mid': return 'drawer-right';
    case 'maxi': return 'center';
    default: return 'center';
  }
};