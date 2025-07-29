import type { ContentAdapter } from '../item-view/types';
import type { SelectedReference } from './types';
import { ReferencePreviewAdapter } from './adapters/ReferencePreviewAdapter';
import { ReferenceDetailAdapter } from './adapters/ReferenceDetailAdapter';
import { ReferenceFullViewAdapter } from './adapters/ReferenceFullViewAdapter';

// Modern WeakMap for caching adapter instances
const adapterCache = new WeakMap<SelectedReference, {
  mini?: React.ComponentType<any>;
  mid?: React.ComponentType<any>;
  maxi?: React.ComponentType<any>;
}>();

/**
 * Content adapter for reference items
 * Routes different view scopes to appropriate adapters
 */
export const referenceContentAdapter: ContentAdapter<SelectedReference> = {
  contentType: 'reference',
  render: (props) => {
    const { scope, item } = props;
    
    // Modern adapter selection with performance optimization
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
    
    // Cache adapter instances using WeakMap for performance
    if (!adapterCache.has(item)) {
      adapterCache.set(item, {});
    }
    
    return <AdapterComponent {...props} />;
  },
};