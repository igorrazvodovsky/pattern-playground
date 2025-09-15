import React from 'react';
import type { ContentAdapter, ItemViewProps } from '../item-view/types';
import type { SelectedReference } from './types';
import { ReferencePreviewAdapter } from './adapters/ReferencePreviewAdapter';
import { ReferenceDetailAdapter } from './adapters/ReferenceDetailAdapter';
import { ReferenceFullViewAdapter } from './adapters/ReferenceFullViewAdapter';

const adapterCache = new WeakMap<SelectedReference, {
  mini?: React.ComponentType<ItemViewProps<'reference'>>;
  mid?: React.ComponentType<ItemViewProps<'reference'>>;
  maxi?: React.ComponentType<ItemViewProps<'reference'>>;
}>();

export const referenceContentAdapter: ContentAdapter<'reference'> = {
  contentType: 'reference',
  render: (props) => {
    const { scope, item } = props;
    
    const AdapterComponent = (() => {
      switch (scope) {
        case 'mini':
          return ReferencePreviewAdapter;
        case 'mid':
          return ReferenceDetailAdapter;
        case 'maxi':
          return ReferenceFullViewAdapter;
        default:
          return null;
      }
    })();

    if (!AdapterComponent) return null;
    
    if (!adapterCache.has(item)) {
      adapterCache.set(item, {});
    }
    
    return <AdapterComponent {...props} />;
  },
};