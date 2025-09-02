import React from 'react';
import type { ItemObject, ViewScope } from '../types';
import { ItemView } from '../ItemView';
import { ContentAdapterProvider } from '../ContentAdapterRegistry';
import { referenceContentAdapter } from '../../reference/ReferenceContentAdapter';
import { quoteAdapter } from '../adapters/QuoteAdapter';
import { taskAdapter } from '../adapters/TaskAdapter';

export interface ModalContentConfig {
  size: 'small' | 'medium' | 'large' | 'fullscreen';
  placement?: 'center' | 'drawer-right' | 'drawer-left';
  closeOnEscape?: boolean;
}

export const createModalContent = <T extends string>(
  item: ItemObject<T>,
  contentType: T,
  scope: ViewScope
): React.ReactNode => {
  // Pass the original item unchanged to its adapter
  // The adapter knows how to handle its specific object structure
  const adapters = [];
  if (contentType === 'reference') {
    adapters.push(referenceContentAdapter);
  } else if (contentType === 'quote') {
    adapters.push(quoteAdapter);
  } else if (contentType === 'task') {
    adapters.push(taskAdapter);
  }

  console.log('createModalContent - contentType:', contentType, 'item structure:', Object.keys(item));
  
  return (
    <ContentAdapterProvider adapters={adapters}>
      <ItemView
        item={item}
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